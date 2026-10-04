import { siteSchema } from '../shared/site-content';
type RateLimit = { limit(input:{key:string}):Promise<{success:boolean}> };
export type Env = { GITHUB_TOKEN:string; SESSION_SECRET:string; ADMIN_USERNAME:string; ADMIN_PASSWORD:string; GITHUB_REPO:string; GITHUB_BRANCH:string; ALLOWED_ORIGINS:string; LOGIN_LIMITER:RateLimit };
const encoder=new TextEncoder(), decoder=new TextDecoder();
const contentPath='public/content/site.json';
class HttpError extends Error { constructor(public status:number,message:string){super(message);} }
function b64(bytes:Uint8Array){let result='';for(let i=0;i<bytes.length;i+=8192)result+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(result);}
function unb64(value:string){return Uint8Array.from(atob(value),c=>c.charCodeAt(0));}
function url64(bytes:Uint8Array){return b64(bytes).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');}
function from64(value:string){return unb64(value.replace(/-/g,'+').replace(/_/g,'/'));}
async function key(env:Env){return crypto.subtle.importKey('raw',encoder.encode(env.SESSION_SECRET+':'+env.ADMIN_PASSWORD),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
async function sign(payload:object,env:Env){const data=url64(encoder.encode(JSON.stringify(payload)));const signature=await crypto.subtle.sign('HMAC',await key(env),encoder.encode(data));return data+'.'+url64(new Uint8Array(signature));}
async function verify(token:string,env:Env,kind:string){
  try{if(token.length>4000)throw 0;const parts=token.split('.');if(parts.length!==2)throw 0;
    if(!await crypto.subtle.verify('HMAC',await key(env),from64(parts[1]),encoder.encode(parts[0])))throw 0;
    const payload=JSON.parse(decoder.decode(from64(parts[0])));
    if(payload.kind!==kind||typeof payload.exp!=='number'||payload.exp<Date.now()||payload.user!==env.ADMIN_USERNAME)throw 0;
    return payload;
  }catch{throw new HttpError(401,'Время входа истекло. Войдите снова — ваши изменения пока остаются в этой вкладке.');}
}
async function readBytes(request:Request,max:number){
  if(Number(request.headers.get('content-length'))>max)throw new HttpError(413,'Файл слишком большой.');
  const reader=request.body?.getReader();if(!reader)return new Uint8Array();
  let size=0;const chunks:Uint8Array[]=[];
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();throw new HttpError(413,'Файл слишком большой.');}chunks.push(value);}
  const all=new Uint8Array(size);let offset=0;for(const chunk of chunks){all.set(chunk,offset);offset+=chunk.length;}return all;
}
async function jsonBody(request:Request,max=200000){try{return JSON.parse(decoder.decode(await readBytes(request,max)));}catch(e){if(e instanceof HttpError)throw e;throw new HttpError(400,'Не удалось прочитать изменения.');}}
async function github(env:Env,path:string,method='GET',body?:unknown){
  const response=await fetch('https://api.github.com/repos/'+env.GITHUB_REPO+path,{method,headers:{Authorization:'Bearer '+env.GITHUB_TOKEN,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'Makeup-NK-Admin','Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
  if(!response.ok){
    if(response.status===409||response.status===422)throw new HttpError(409,'Сайт уже изменён в другой вкладке. Скопируйте свои правки и перезагрузите страницу, чтобы не затереть чужие изменения.');
    throw new HttpError(502,'Хранилище временно недоступно. Ваши правки остаются в этой вкладке. Повторите попытку позже.');
  }
  return response.json() as Promise<any>;
}
async function readContent(env:Env,ref:string){
  const file=await github(env,'/contents/'+contentPath+'?ref='+encodeURIComponent(ref));
  return {sha:file.sha,content:siteSchema.parse(JSON.parse(decoder.decode(unb64(file.content.replace(/\s/g,'')))))};
}
function images(content:any){return new Set<string>([content.hero.image,content.about.image,...content.offerings.map((o:any)=>o.image),...content.services.map((s:any)=>s.image),...content.gallery.map((p:any)=>p.image)]);}
function extension(bytes:Uint8Array,type:string){
  if(type==='image/webp'&&decoder.decode(bytes.subarray(0,4))==='RIFF'&&decoder.decode(bytes.subarray(8,12))==='WEBP')return 'webp';
  if(type==='image/jpeg'&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'jpg';
  if(type==='image/png'&&bytes.subarray(0,8).join(',')==='137,80,78,71,13,10,26,10')return 'png';
  throw new HttpError(400,'Поддерживаются фотографии JPG, PNG и WebP.');
}
export default {
  async fetch(request:Request,env:Env):Promise<Response>{
    const origin=request.headers.get('Origin')||'';
    const allowed=(env.ALLOWED_ORIGINS||'').split(',').map(s=>s.trim());
    const headers=new Headers({'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Vary':'Origin'});
    const reply=(body:unknown,status=200)=>new Response(body===null?null:JSON.stringify(body),{status,headers});
    if(!origin||!allowed.includes(origin))return reply({error:'Доступ запрещён.'},403);
    headers.set('Access-Control-Allow-Origin',origin);headers.set('Access-Control-Allow-Methods','GET,POST,PUT,OPTIONS');headers.set('Access-Control-Allow-Headers','Authorization,Content-Type');
    if(request.method==='OPTIONS')return reply(null,204);
    try{
      if(!env.GITHUB_TOKEN||(!env.SESSION_SECRET||env.SESSION_SECRET.length<32)||!env.ADMIN_USERNAME||(!env.ADMIN_PASSWORD||env.ADMIN_PASSWORD.length<16)||!env.LOGIN_LIMITER||!/^[-\w]+\/[-.\w]+$/.test(env.GITHUB_REPO||'')||!env.GITHUB_BRANCH)throw new HttpError(503,'Админка ещё не подключена. Обратитесь к владельцу сайта.');
      const path=new URL(request.url).pathname;
      if(path==='/session'&&request.method==='POST'){
        if(!(await env.LOGIN_LIMITER.limit({key:'makeup-admin-login'})).success)throw new HttpError(429,'Слишком много попыток. Подождите минуту и попробуйте снова.');
        const body=await jsonBody(request,4096);
        if(typeof body.username!=='string'||typeof body.password!=='string')throw new HttpError(400,'Введите логин и пароль.');
        // Native HMAC verification compares credentials without a string timing leak.
        const expected=await crypto.subtle.sign('HMAC',await key(env),encoder.encode(env.ADMIN_USERNAME+'\0'+env.ADMIN_PASSWORD));
        const matches=await crypto.subtle.verify('HMAC',await key(env),expected,encoder.encode(body.username+'\0'+body.password));
        if(!matches)throw new HttpError(401,'Неверный логин или пароль.');
        return reply({token:await sign({kind:'session',user:env.ADMIN_USERNAME,exp:Date.now()+2*60*60*1000},env)});
      }
      await verify((request.headers.get('Authorization')||'').replace(/^Bearer /,''),env,'session');
      if(path==='/content'&&request.method==='GET')return reply(await readContent(env,env.GITHUB_BRANCH));
      if(path==='/media'&&request.method==='POST'){
        const bytes=await readBytes(request,1000000);
        const ext=extension(bytes,request.headers.get('Content-Type')||'');
        const blob=await github(env,'/git/blobs','POST',{content:b64(bytes),encoding:'base64'});
        const filePath='public/media/'+crypto.randomUUID()+'.'+ext;
        return reply({path:filePath.replace(/^public/,''),ticket:await sign({kind:'upload',user:env.ADMIN_USERNAME,path:filePath,sha:blob.sha,exp:Date.now()+2*60*60*1000},env)});
      }
      if(path==='/content'&&request.method==='PUT'){
        const body=await jsonBody(request);
        const parsed=siteSchema.safeParse(body.content);
        if(!parsed.success)throw new HttpError(400,'Проверьте названия, стоимость и ссылки. '+parsed.error.issues[0].message);
        if(!/^[a-f0-9]{40}$/.test(body.baseSha||'')||!Array.isArray(body.uploads)||body.uploads.length>150)throw new HttpError(400,'Некорректная версия страницы.');
        const reference=await github(env,'/git/ref/heads/'+encodeURIComponent(env.GITHUB_BRANCH));
        const head=reference.object.sha;
        const current=await readContent(env,head);
        if(current.sha!==body.baseSha)throw new HttpError(409,'Сайт уже изменён в другой вкладке. Скопируйте правки и перезагрузите страницу.');
        const newContent={...parsed.data,publishedId:crypto.randomUUID()};
        const used=images(newContent),known=images(current.content);
        const uploadEntries:any[]=[];
        for(const ticket of body.uploads){
          if(typeof ticket!=='string')throw new HttpError(400,'Не удалось проверить фотографию.');
          const upload=await verify(ticket,env,'upload');
          if(!/^public\/media\/[a-f0-9-]+\.(webp|jpg|png)$/.test(upload.path)||!/^[a-f0-9]{40}$/.test(upload.sha))throw new HttpError(400,'Неверный файл.');
          const publicPath=upload.path.replace(/^public/,'');
          if(used.has(publicPath)&&!known.has(publicPath)){uploadEntries.push({path:upload.path,mode:'100644',type:'blob',sha:upload.sha});known.add(publicPath);}
        }
        for(const image of used)if(image.startsWith('/media/')&&!known.has(image))throw new HttpError(400,'Загрузите новые фотографии ещё раз.');
        const parent=await github(env,'/git/commits/'+head);
        const tree=await github(env,'/git/trees','POST',{base_tree:parent.tree.sha,tree:[...uploadEntries,{path:contentPath,mode:'100644',type:'blob',content:JSON.stringify(newContent,null,2)+'\n'}]});
        const commit=await github(env,'/git/commits','POST',{message:'Обновить материалы Makeup NK',tree:tree.sha,parents:[head]});
        await github(env,'/git/refs/heads/'+encodeURIComponent(env.GITHUB_BRANCH),'PATCH',{sha:commit.sha,force:false});
        const file=tree.tree.find((f:any)=>f.path===contentPath);
        if(!file)throw new HttpError(502,'Изменения отправлены. Обновите страницу, чтобы проверить результат.');
        return reply({content:newContent,commit:commit.sha,sha:file.sha});
      }
      if(/^\/publication\/[a-f0-9]{40}$/.test(path)&&request.method==='GET'){
        const commit=path.split('/')[2];
        const runs=await github(env,'/actions/runs?head_sha='+commit+'&per_page=10');
        const run=runs.workflow_runs.find((r:any)=>r.path==='.github/workflows/pages.yml'&&r.head_branch===env.GITHUB_BRANCH);
        const failed=run?.status==='completed'&&run.conclusion!=='success';
        return reply({status:failed?'failed':run?.conclusion==='success'?'built':'pending'});
      }
      return reply({error:'Страница не найдена.'},404);
    }catch(e){
      if(e instanceof HttpError)return reply({error:e.message},e.status);
      return reply({error:'Не удалось выполнить действие. Попробуйте ещё раз.'},500);
    }
  }
};

