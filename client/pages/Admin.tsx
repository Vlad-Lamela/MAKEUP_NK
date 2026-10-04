import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ImagePlus, Tags, FileText, Eye, LogOut, Plus, ChevronUp, ChevronDown, Trash2, Check, LoaderCircle, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { categories, serviceGroups, siteSchema, type SiteContent } from '@shared/site-content';
import { configureAdmin, api, login, getContent, compressImage, ApiError } from '@/lib/admin-api';
import { loadContent } from '@/lib/content';
import { Landing, Photo } from './Index';
import './admin.css';

type Upload = { path: string; ticket: string; preview: string };
function Field({label,children}: {label: string; children: ReactNode}) { return <label className="admin-field"><span>{label}</span>{children}</label>; }
function move<T>(items:T[], index:number, delta:number) { const next=[...items]; const to=index+delta; if(to<0||to>=next.length)return items; [next[index],next[to]]=[next[to],next[index]]; return next; }
export default function Admin() {
  const demo = import.meta.env.DEV && new URLSearchParams(location.search).has('demo');
  const [ready,setReady]=useState(demo), [setupError,setSetupError]=useState('');
  const [token,setToken]=useState(''), [username,setUsername]=useState(''), [password,setPassword]=useState('');
  const [content,setContent]=useState<SiteContent>(), [sha,setSha]=useState(''), [dirty,setDirty]=useState(false);
  const [tab,setTab]=useState('services'), [busy,setBusy]=useState(''), [error,setError]=useState(''), [notice,setNotice]=useState('');
  const [uploads,setUploads]=useState<Upload[]>([]), [preview,setPreview]=useState(false);
  const [remove,setRemove]=useState<{kind:'services'|'gallery';id:string}|null>(null);
  const [pending,setPending]=useState<{id:string;commit:string;started:number}|null>(null);
  const urls=useRef<string[]>([]);
  useEffect(() => {
    const robots=document.createElement('meta');robots.name='robots';robots.content='noindex,nofollow';document.head.append(robots);
    document.title='Управление сайтом · Makeup NK';
    if(demo) loadContent().then(setContent).catch(()=>setSetupError('Не удалось открыть пример.'));
    else configureAdmin().then(()=>setReady(true)).catch(e=>setSetupError(e.message));
    return ()=>{robots.remove();urls.current.forEach(URL.revokeObjectURL);};
  },[]);
  useEffect(()=>{const guard=(e:BeforeUnloadEvent)=>{if(dirty||pending){e.preventDefault();e.returnValue='';}};addEventListener('beforeunload',guard);return()=>removeEventListener('beforeunload',guard);},[dirty,pending]);
  useEffect(()=>{
    if(!pending||!token)return;
    let cancelled=false;
    const check=async()=>{
      try {
        const publicContent=await fetch('/content/site.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.json());
        if(publicContent.publishedId===pending.id){if(!cancelled){setNotice('Готово! Изменения появились на сайте.');setPending(null);}return;}
        const result=await api('/publication/'+pending.commit,token);
        if(cancelled)return;
        if(result.status==='failed'){setError('Изменения сохранены, но обновить сайт не удалось. Сообщите владельцу сайта.');setPending(null);}
        else if(Date.now()-pending.started>300000){setNotice('Изменения сохранены. Публикация занимает больше времени — проверьте сайт немного позже.');setPending(null);}
      } catch { if(!cancelled&&Date.now()-pending.started>300000){setNotice('Изменения сохранены, но проверить публикацию пока не удалось.');setPending(null);} }
    };
    const interval=setInterval(check,7000);check();return()=>{cancelled=true;clearInterval(interval);};
  },[pending,token]);
  function edit(fn:(c:SiteContent)=>SiteContent){setContent(c=>c?fn(c):c);setDirty(true);setNotice('');setError('');}
  function handleError(e:unknown){const err=e as Error;setError(err.message||'Проверьте соединение и повторите попытку.');if(e instanceof ApiError&&e.status===401)setToken('');}
  async function signIn(e:React.FormEvent){e.preventDefault();setError('');setBusy('Входим…');try{const session=await login(username,password);setToken(session.token);setPassword('');if(!content){const result=await getContent(session.token);setContent(result.content);setSha(result.sha);}}catch(e){setToken('');handleError(e);}finally{setBusy('');}}
  async function upload(file:File, apply:(path:string)=>void){
    setError('');setBusy('Подготавливаем фотографию…');
    try{
      const blob=await compressImage(file);
      let result:{path:string;ticket:string};
      if(demo)result={path:'/media/'+crypto.randomUUID()+'.webp',ticket:'demo'};
      else result=await api('/media',token,{method:'POST',headers:{'Content-Type':blob.type},body:blob});
      const preview=URL.createObjectURL(blob);urls.current.push(preview);setUploads(u=>[...u,{...result,preview}]);apply(result.path);
    }catch(e){handleError(e);}finally{setBusy('');}
  }
  function imageInput(label:string, path:string, apply:(path:string)=>void,tile?:number){return <div className="image-editor"><Photo src={uploads.find(u=>u.path===path)?.preview||path} tile={tile} alt="Выбранная фотография"/><label className="admin-button secondary upload-button"><ImagePlus size={17}/>{label}<input disabled={!!busy||!!pending} type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{const f=e.target.files?.[0];if(f)upload(f,apply);e.target.value='';}}/></label></div>;}
  async function publish(){
    if(!content||demo)return;setError('');setBusy('Сохраняем изменения…');
    try{
      const parsed=siteSchema.safeParse(content);
      if(!parsed.success)throw new Error(parsed.error.issues[0].message+' ('+parsed.error.issues[0].path.join(' · ')+')');
      const result=await api('/content',token,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:parsed.data,baseSha:sha,uploads:uploads.map(u=>u.ticket).filter(Boolean)})});
      setSha(result.sha);setContent(result.content);setUploads(u=>u.map(x=>({...x,ticket:""})));setDirty(false);setPending({id:result.content.publishedId,commit:result.commit,started:Date.now()});setNotice('Сохранено. Публикуем изменения на сайте…');
    }catch(e){handleError(e);}finally{setBusy('');}
  }
  const loggedIn=demo||!!token;
  const previewContent=content?JSON.parse(JSON.stringify(content).replace(/\/media\/[a-zA-Z0-9._-]+/g,p=>uploads.find(u=>u.path===p)?.preview||p)) as SiteContent:undefined;
  return <div className="admin-app">
    {!loggedIn ? <main className="admin-login"><div className="admin-login-brand"><span className="monogram">NK</span><span>MAKEUP NK</span></div><h1>Ваш сайт.<br/>Всё под рукой.</h1><p>Фотографии, услуги и цены —<br/>обновляйте, когда удобно.</p><form onSubmit={signIn}><Field label="Логин"><input autoComplete="username" required value={username} onChange={e=>setUsername(e.target.value)}/></Field><Field label="Пароль"><input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></Field><button className="admin-button" disabled={!ready||!!busy}>{busy||'Войти'}</button></form>{(setupError||error)&&<p className="admin-error" role="alert">{setupError||error}</p>}<a href="/">Вернуться на сайт</a></main> :
    !content ? <div className="admin-loading" role="status">Загружаем ваши материалы…{(error||setupError)&&<p role="alert">{error||setupError}</p>}</div> :
    <>
      <aside className="admin-sidebar"><a href="/" className="admin-logo"><span className="monogram">NK</span><span>MAKEUP NK<small>Управление сайтом</small></span></a><nav aria-label="Разделы админки">{[['services','Услуги и цены',Tags],['gallery','Фотографии',ImagePlus],['text','Тексты и контакты',FileText]].map(([key,label,Icon])=><button key={key as string} className={tab===key?'active':''} onClick={()=>setTab(key as string)}>{typeof Icon!=='string'&&<Icon size={19}/>}<span>{label as string}</span></button>)}</nav><div className="admin-sidebar-bottom"><a href="/" target="_blank" rel="noopener noreferrer"><Eye size={17}/>Открыть сайт</a><button onClick={()=>{if(!dirty||confirm('Есть неопубликованные изменения. Выйти и потерять их?')){setToken('');setContent(undefined);setDirty(false);}}} disabled={demo||!!pending}><LogOut size={17}/>Выйти</button></div></aside>
      <main className="admin-main"><header className="admin-topbar"><span>Личный кабинет</span><span className="admin-site-label">makeup-nk.ru</span></header>
        {demo&&<div className="admin-demo">Демонстрация админки: можно попробовать редактирование. Изменения остаются в этой вкладке и не публикуются.</div>}
        <div className="admin-title"><div><p className="admin-eyebrow">MAKEUP NK</p><h1>{tab==='services'?'Услуги и цены':tab==='gallery'?'Ваши фотографии':'Тексты и контакты'}</h1><p>{tab==='services'?'Измените стоимость или расскажите об услуге подробнее.':tab==='gallery'?'Добавляйте работы и выбирайте, в каком разделе их показать.':'Главные слова о вас и способы связаться.'}</p></div>{tab==='services'&&<button className="admin-button secondary" disabled={!!busy||!!pending||content.services.length>=30} onClick={()=>edit(c=>({...c,services:[...c.services,{id:crypto.randomUUID(),title:'Новая услуга',description:'',price:null,group:'makeup',visible:false,image:c.hero.image}]}))}><Plus size={18}/>Добавить услугу</button>}</div>
        {(error||notice||busy)&&<div aria-live="polite" className={error?'admin-error':'admin-notice'}>{error||busy||notice}</div>}
        <fieldset disabled={!!busy||!!pending} className="admin-edit-area">
        {tab==='services'&&<div className="admin-services">{content.services.map((s,i)=><article className="admin-card" key={s.id}>
          {imageInput('Заменить фото',s.image,image=>edit(c=>({...c,services:c.services.map(x=>x.id===s.id?{...x,image}:x)})))}
          <div className="admin-service-fields"><div className="admin-card-heading"><span className="admin-card-number">{String(i+1).padStart(2,'0')}</span><label className="admin-check"><input type="checkbox" checked={s.visible} onChange={e=>edit(c=>({...c,services:c.services.map(x=>x.id===s.id?{...x,visible:e.target.checked}:x)}))}/>Показать на сайте</label></div>
          <div className="admin-field-row"><Field label="Название услуги"><input maxLength={100} value={s.title} onChange={e=>edit(c=>({...c,services:c.services.map(x=>x.id===s.id?{...x,title:e.target.value}:x)}))}/></Field><Field label="Стоимость, ₽"><input type="number" min="0" max="1000000" step="1" value={s.price??""} onChange={e=>edit(c=>({...c,services:c.services.map(x=>x.id===s.id?{...x,price:e.target.value===""?null:Number(e.target.value)}:x)}))}/></Field></div>
          <Field label="Раздел"><select value={s.group} onChange={e=>edit(c=>({...c,services:c.services.map(x=>x.id===s.id?{...x,group:e.target.value as typeof s.group}:x)}))}>{Object.entries(serviceGroups).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></Field><Field label="Описание"><textarea rows={3} maxLength={700} value={s.description} onChange={e=>edit(c=>({...c,services:c.services.map(x=>x.id===s.id?{...x,description:e.target.value}:x)}))}/></Field>
          <div className="admin-card-actions"><button aria-label={'Поднять '+s.title} disabled={!i} onClick={()=>edit(c=>({...c,services:move(c.services,i,-1)}))}><ChevronUp size={17}/>Выше</button><button aria-label={'Опустить '+s.title} disabled={i===content.services.length-1} onClick={()=>edit(c=>({...c,services:move(c.services,i,1)}))}><ChevronDown size={17}/>Ниже</button><button className="delete" onClick={()=>setRemove({kind:'services',id:s.id})}><Trash2 size={16}/>Удалить</button></div></div>
        </article>)}</div>}
        {tab==='gallery'&&<><details className="admin-panel section-covers"><summary>Обложки разделов сайта</summary><div className="admin-photo-grid">{content.offerings.map(o=><div key={o.id}><h2>{o.title}</h2>{imageInput('Заменить обложку',o.image,image=>edit(c=>({...c,offerings:c.offerings.map(x=>x.id===o.id?{...x,image,tile:undefined}:x)})),o.tile)}</div>)}</div></details><label className="admin-upload-zone"><ImagePlus size={32}/><strong>Добавить фотографии</strong><span>Нажмите и выберите снимки · JPG, PNG, WebP</span><small>Размер и качество подготовим автоматически</small><input type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={!!busy||!!pending||content.gallery.length>=100} onChange={async e=>{const files=Array.from(e.target.files||[]);e.target.value='';for(const file of files.slice(0,100-content.gallery.length))await upload(file,image=>edit(c=>({...c,gallery:[...c.gallery,{id:crypto.randomUUID(),image,caption:'',category:'makeup',visible:true}]})));}}/></label>
          <div className="admin-photo-grid">{content.gallery.map((p,i)=><article className="admin-photo-card" key={p.id}>
            {imageInput('Заменить',p.image,image=>edit(c=>({...c,gallery:c.gallery.map(x=>x.id===p.id?{...x,image,tile:undefined}:x)})),p.tile)}
            <div className="admin-photo-fields"><Field label="Раздел"><select value={p.category} onChange={e=>edit(c=>({...c,gallery:c.gallery.map(x=>x.id===p.id?{...x,category:e.target.value as typeof p.category}:x)}))}>{Object.entries(categories).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></Field><Field label="Подпись"><input maxLength={160} value={p.caption} placeholder="Например, образ на выпускной" onChange={e=>edit(c=>({...c,gallery:c.gallery.map(x=>x.id===p.id?{...x,caption:e.target.value}:x)}))}/></Field><label className="admin-check"><input type="checkbox" checked={p.visible} onChange={e=>edit(c=>({...c,gallery:c.gallery.map(x=>x.id===p.id?{...x,visible:e.target.checked}:x)}))}/>Показать на сайте</label><div className="admin-card-actions"><button disabled={!i} aria-label="Поднять фото" onClick={()=>edit(c=>({...c,gallery:move(c.gallery,i,-1)}))}><ChevronUp size={18}/></button><button disabled={i===content.gallery.length-1} aria-label="Опустить фото" onClick={()=>edit(c=>({...c,gallery:move(c.gallery,i,1)}))}><ChevronDown size={18}/></button><button className="delete" aria-label="Удалить фото" onClick={()=>setRemove({kind:'gallery',id:p.id})}><Trash2 size={17}/></button></div></div>
          </article>)}</div></>}
        {tab==='text'&&<div className="admin-text-sections"><section className="admin-panel"><h2>Первый экран</h2>{imageInput('Заменить главное фото',content.hero.image,image=>edit(c=>({...c,hero:{...c.hero,image}})))}<Field label="Заголовок"><textarea rows={2} maxLength={100} value={content.hero.title} onChange={e=>edit(c=>({...c,hero:{...c.hero,title:e.target.value}}))}/></Field><Field label="Короткое описание"><textarea rows={3} maxLength={240} value={content.hero.subtitle} onChange={e=>edit(c=>({...c,hero:{...c.hero,subtitle:e.target.value}}))}/></Field><Field label="Описание главного фото"><input maxLength={160} value={content.hero.imageAlt} onChange={e=>edit(c=>({...c,hero:{...c.hero,imageAlt:e.target.value}}))}/></Field></section>
          <section className="admin-panel"><h2>Обо мне</h2>{imageInput("Заменить портрет",content.about.image,image=>edit(c=>({...c,about:{...c.about,image}})))}<Field label="Заголовок"><input maxLength={100} value={content.about.title} onChange={e=>edit(c=>({...c,about:{...c.about,title:e.target.value}}))}/></Field><Field label="Текст"><textarea rows={7} maxLength={1600} value={content.about.text} onChange={e=>edit(c=>({...c,about:{...c.about,text:e.target.value}}))}/></Field></section>
          <section className="admin-panel"><h2>Подписи разделов</h2>{content.offerings.map(o=><div key={o.id}><Field label={"Название: "+o.title}><input maxLength={80} value={o.title} onChange={e=>edit(c=>({...c,offerings:c.offerings.map(x=>x.id===o.id?{...x,title:e.target.value}:x)}))}/></Field><Field label="Краткое описание"><textarea maxLength={240} value={o.description} onChange={e=>edit(c=>({...c,offerings:c.offerings.map(x=>x.id===o.id?{...x,description:e.target.value}:x)}))}/></Field></div>)}<Field label="Цитата в блоке обо мне"><textarea maxLength={240} value={content.about.quote} onChange={e=>edit(c=>({...c,about:{...c.about,quote:e.target.value}}))}/></Field></section><section className="admin-panel"><h2>Где и как вас найти</h2>{Object.entries({phone:'Телефон',city:'Город',address:'Адрес студии',booking:'Ссылка для кнопки «Записаться»',telegram:'Telegram',vk:'ВКонтакте — сообщения',max:'MAX',instagram:'Instagram',portfolio:'Портфолио ВКонтакте'}).map(([key,label])=><Field key={key} label={label}><input type={['phone','city','address'].includes(key)?'text':'url'} value={content.contacts[key as keyof typeof content.contacts]} onChange={e=>edit(c=>({...c,contacts:{...c.contacts,[key]:e.target.value}}))}/></Field>)}</section></div>}
        </fieldset>
        <footer className="admin-publish-bar"><div>{busy||pending?<LoaderCircle className="spin" size={18}/>:<Check size={18}/>}<span>{pending?'Публикуем на сайте…':dirty?'Есть неопубликованные изменения':'Все изменения сохранены'}</span></div><button className="admin-button secondary" onClick={()=>setPreview(true)}><Eye size={17}/>Предпросмотр</button><button className="admin-button" onClick={publish} disabled={demo||!dirty||!!busy||!!pending}>Опубликовать изменения</button></footer>
      </main>
      <Dialog open={!!remove} onOpenChange={o=>!o&&setRemove(null)}><DialogContent><DialogTitle>Удалить {remove?.kind==='services'?'услугу':'фотографию'}?</DialogTitle><DialogDescription>Карточка исчезнет с сайта после публикации изменений.</DialogDescription><div className="admin-dialog-actions"><button className="admin-button secondary" onClick={()=>setRemove(null)}>Отмена</button><button className="admin-button" onClick={()=>{if(remove)edit(c=>({...c,[remove.kind]:c[remove.kind].filter(x=>x.id!==remove.id)}));setRemove(null);}}>Удалить</button></div></DialogContent></Dialog>
      <Dialog open={preview} onOpenChange={setPreview}><DialogContent className="admin-preview-dialog"><DialogTitle className="sr-only">Предпросмотр сайта</DialogTitle><DialogDescription className="sr-only">Ваши изменения до публикации</DialogDescription>{previewContent&&<Landing content={previewContent} preview/>}</DialogContent></Dialog>
    </>}
  </div>;
}

