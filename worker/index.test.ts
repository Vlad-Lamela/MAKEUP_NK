import { describe,it,expect,vi,afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import worker,{type Env} from './index';
const content=JSON.parse(readFileSync(new URL('../public/content/site.json',import.meta.url),'utf8').replace(/^\uFEFF/,''));
const sha='a'.repeat(40),head='b'.repeat(40),blobSha='c'.repeat(40),commitSha='d'.repeat(40);
function env():Env{return {GITHUB_TOKEN:'test-only-github-token',SESSION_SECRET:'test-only-signing-key-at-least-32-characters',ADMIN_USERNAME:'editor',ADMIN_PASSWORD:'test-only-password-20-chars',GITHUB_REPO:'owner/site',GITHUB_BRANCH:'main',ALLOWED_ORIGINS:'https://makeup-nk.ru',LOGIN_LIMITER:{limit:async()=>({success:true})}};}
function req(path:string,method='GET',body?:unknown,token='',origin='https://makeup-nk.ru'){
 return new Request('https://admin.example'+path,{method,headers:{Origin:origin,Authorization:token?'Bearer '+token:'','Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
}
async function session(e=env()){const res=await worker.fetch(req('/session','POST',{username:e.ADMIN_USERNAME,password:e.ADMIN_PASSWORD}),e);return (await res.json() as any).token;}
afterEach(()=>vi.unstubAllGlobals());
describe('admin access and publication',()=>{
 it('rejects unauthenticated reads and writes without contacting GitHub',async()=>{
  const mock=vi.fn();vi.stubGlobal('fetch',mock);
  for(const [path,method] of [['/content','GET'],['/content','PUT'],['/media','POST']])expect((await worker.fetch(req(path,method),env())).status).toBe(401);
  expect(mock).not.toHaveBeenCalled();
 });
 it('rejects foreign origins and wrong credentials',async()=>{
  expect((await worker.fetch(req('/session','POST',{},'','https://other.example'),env())).status).toBe(403);
  expect((await worker.fetch(req('/session','POST',{username:'editor',password:'wrong'}),env())).status).toBe(401);
 });
 it('enforces login rate limits and fails closed without configured secrets',async()=>{
  const e=env();e.LOGIN_LIMITER.limit=async()=>({success:false});
  expect((await worker.fetch(req('/session','POST',{}),e)).status).toBe(429);
  e.ADMIN_PASSWORD='';expect((await worker.fetch(req('/content'),e)).status).toBe(503);
 });
 it('invalidates sessions after a password change and rejects modified tokens',async()=>{
  const e=env(),token=await session(e);e.ADMIN_PASSWORD+='changed';
  expect((await worker.fetch(req('/content','GET',undefined,token),e)).status).toBe(401);
  expect((await worker.fetch(req('/content','GET',undefined,'tampered.'+token),env())).status).toBe(401);
 });
 it('rejects executable and oversized uploads',async()=>{
  const e=env(),token=await session(e);
  for(const [body,type] of [['<svg onload="alert(1)"/>','image/svg+xml'],['x'.repeat(1000001),'image/webp']]){
   const response=await worker.fetch(new Request('https://admin.example/media',{method:'POST',headers:{Origin:'https://makeup-nk.ru',Authorization:'Bearer '+token,'Content-Type':type},body}),e);
   expect([400,413]).toContain(response.status);
  }
 });
 it('stages uploads as blobs without changing the live branch',async()=>{
  const e=env(),token=await session(e),mock=vi.fn(async(_url:string)=>Response.json({sha:blobSha}));vi.stubGlobal('fetch',mock);
  const response=await worker.fetch(new Request('https://admin.example/media',{method:'POST',headers:{Origin:'https://makeup-nk.ru',Authorization:'Bearer '+token,'Content-Type':'image/webp'},body:'RIFF0000WEBPtest'}),e);
  expect(response.status).toBe(200);const result=await response.json() as any;expect(result.path).toMatch(/^\/media\/.+\.webp$/);expect(result.ticket).toContain('.');
  expect(mock).toHaveBeenCalledTimes(1);expect(mock.mock.calls[0][0]).toContain('/git/blobs');
 });
 it('commits validated content atomically and never force-pushes',async()=>{
  const e=env(),token=await session(e),calls:any[]=[];
  vi.stubGlobal('fetch',vi.fn(async(url:string,options:any)=>{
   calls.push({url,options});const path=new URL(url).pathname;
   if(path.endsWith('/git/ref/heads/main'))return Response.json({object:{sha:head}});
   if(path.includes('/contents/'))return Response.json({sha,content:Buffer.from(JSON.stringify(content)).toString('base64')});
   if(path.endsWith('/git/commits/'+head))return Response.json({tree:{sha:head}});
   if(path.endsWith('/git/trees'))return Response.json({sha:blobSha,tree:[{path:'public/content/site.json',sha:blobSha}]});
   if(path.endsWith('/git/commits'))return Response.json({sha:commitSha});
   if(path.endsWith('/git/refs/heads/main'))return Response.json({object:{sha:commitSha}});
   throw Error('Unexpected request');
  }));
  const changed=structuredClone(content);changed.services[0].price=2300;
  const response=await worker.fetch(req('/content','PUT',{content:changed,baseSha:sha,uploads:[]},token),e);
  expect(response.status).toBe(200);const saved=await response.json() as any;expect(saved.content.services[0].price).toBe(2300);expect(saved.content.publishedId).not.toBe(content.publishedId);
  const update=calls.find(c=>c.options.method==='PATCH');expect(JSON.parse(update.options.body)).toEqual({sha:commitSha,force:false});
  const tree=calls.find(c=>c.url.endsWith('/git/trees'));expect(JSON.parse(tree.options.body).base_tree).toBe(head);
 });
 it('rejects stale edits before creating a commit',async()=>{
  const e=env(),token=await session(e),mock=vi.fn(async(url:string)=>url.includes('/contents/')?Response.json({sha:blobSha,content:Buffer.from(JSON.stringify(content)).toString('base64')}):Response.json({object:{sha:head}}));vi.stubGlobal('fetch',mock);
  expect((await worker.fetch(req('/content','PUT',{content,baseSha:sha,uploads:[]},token),e)).status).toBe(409);
  expect(mock).toHaveBeenCalledTimes(2);
 });
 it('rejects negative prices and unsafe links before accessing GitHub',async()=>{
  const e=env(),token=await session(e),mock=vi.fn();vi.stubGlobal('fetch',mock);
  const bad=structuredClone(content);bad.services[0].price=-10;
  expect((await worker.fetch(req('/content','PUT',{content:bad,baseSha:sha,uploads:[]},token),e)).status).toBe(400);
  bad.services[0].price=10;bad.contacts.booking='javascript:alert(1)';
  expect((await worker.fetch(req('/content','PUT',{content:bad,baseSha:sha,uploads:[]},token),e)).status).toBe(400);
  expect(mock).not.toHaveBeenCalled();
 });
});

