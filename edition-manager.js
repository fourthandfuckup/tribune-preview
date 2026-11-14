import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
const db=createClient('https://nlckcelwfcoszbvqyeyr.supabase.co','sb_publishable_CrRNQGAZoc6TtT3wFe3sUg_hoYuupy8');
const $=id=>document.getElementById(id);let user=null,current=null,articles=[],editions=[],comics=[];
function roman(n){let s='';for(const [v,t] of [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']])while(n>=v){s+=t;n-=v;}return s;}
function proof(){let d=$('date').value;let date=d?new Date(d+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}).toUpperCase():'CHOOSE PUBLICATION DATE';$('masthead-proof').textContent='VOL. '+roman(Number($('volume').value)||1)+' · NO. '+String(Number($('issue').value)||1).padStart(3,'0')+' — '+date;}
function msg(t){$('status').textContent=t;}
async function articlesLoad(){let {data,error}=await db.from('tribune_article_drafts').select('id,headline').order('updated_at',{ascending:false});if(error){msg('Could not load articles: '+error.message);return;}articles=data||[];for(let key of ['main','left','right']){let select=$(key),previous=select.value;select.replaceChildren(new Option('— None —',''));for(let a of articles)select.add(new Option(a.headline||'Untitled article',a.id));select.value=articles.some(a=>a.id===previous)?previous:'';}}
function clear(){current=null;$('title').value='New Edition';$('volume').value=1;$('issue').value=2;$('date').value='';$('comics').value='';$('crossword').value='';for(let k of ['main','left','right'])$(k).value='';document.querySelectorAll('.comic-check').forEach(c=>c.checked=false);proof();msg('New unsaved edition.');}
async function openEdition(e){current=e.id;$('title').value=e.title;$('volume').value=e.volume_number;$('issue').value=e.issue_number;$('date').value=e.edition_date;$('main').value=e.main_article_id||'';$('left').value=e.bulletin_left_id||'';$('right').value=e.bulletin_right_id||'';$('comics').value=e.comics_notes||'';$('crossword').value=e.crossword_notes||'';await loadEditionComics(e.id);proof();msg('Opened saved edition.');scrollTo({top:0,behavior:'smooth'});}
async function editionsLoad(){let {data,error}=await db.from('tribune_editions').select('*').order('updated_at',{ascending:false});if(error){msg('Could not load editions: '+error.message);return;}editions=data||[];let root=$('saved');root.replaceChildren();if(!editions.length){root.textContent='No saved editions yet.';return;}for(let e of editions){let wrap=document.createElement('div');wrap.className='saved';let title=document.createElement('strong');title.textContent='VOL. '+roman(e.volume_number)+' · NO. '+String(e.issue_number).padStart(3,'0')+' — '+e.title;let info=document.createElement('p');info.textContent=e.edition_date+' · PRIVATE DRAFT';let open=document.createElement('button');open.textContent='OPEN';open.onclick=()=>openEdition(e);let del=document.createElement('button');del.textContent='DELETE';del.onclick=async()=>{if(!confirm('Delete this private edition draft?'))return;let {error}=await db.from('tribune_editions').delete().eq('id',e.id).eq('editor_id',user.id);if(error)return msg(error.message);if(current===e.id)clear();await editionsLoad();msg('Edition deleted.');};wrap.append(title,info,open,del);root.append(wrap);}}
async function save(){if(!user)return msg('Sign in first.');if(!$('date').value)return msg('Choose a publication date.');let ids=['main','left','right'].map(k=>$(k).value).filter(Boolean);if(new Set(ids).size!==ids.length)return msg('Choose a different article for each front-page position.');let v=Number($('volume').value),n=Number($('issue').value);if(!Number.isInteger(v)||v<1||v>999||!Number.isInteger(n)||n<1||n>9999)return msg('Enter a valid volume and issue number.');let row={editor_id:user.id,title:$('title').value.trim(),edition_date:$('date').value,volume_number:v,issue_number:n,main_article_id:$('main').value||null,bulletin_left_id:$('left').value||null,bulletin_right_id:$('right').value||null,comics_notes:$('comics').value,crossword_notes:$('crossword').value,updated_at:new Date().toISOString()};$('save').disabled=true;let result=current?await db.from('tribune_editions').update(row).eq('id',current).eq('editor_id',user.id).select().single():await db.from('tribune_editions').insert(row).select().single();$('save').disabled=false;if(result.error)return msg('Save failed: '+result.error.message);current=result.data.id;const assignmentError=await saveEditionComics(current);await editionsLoad();msg(assignmentError?'Edition saved, but comic assignment failed: '+assignmentError:'Edition and selected comics saved privately. Nothing has been published.');}
async function auth(){const {data:{user:u},error}=await db.auth.getUser();user=error?null:u;if(user){let {data:editor,error:ee}=await db.from('tribune_editors').select('user_id').eq('user_id',user.id).maybeSingle();if(ee||!editor){await db.auth.signOut();user=null;}}$('workspace').hidden=!user;$('auth-form').hidden=!!user;$('signout').hidden=!user;$('auth-message').textContent=user?'Signed in as '+user.email:'Sign in with your authorised Tribune email.';if(user){await articlesLoad();await editionsLoad();await loadComics();}}
$('signin').onclick=async()=>{let email=$('email').value.trim();if(!email)return;$('auth-message').textContent='Sending link…';let {error}=await db.auth.signInWithOtp({email,options:{shouldCreateUser:false,emailRedirectTo:location.origin+location.pathname}});$('auth-message').textContent=error?'Sign-in failed: '+error.message:'Check your email for the secure sign-in link.';};
$('signout').onclick=async()=>{await db.auth.signOut();user=null;await auth();};
$('save').onclick=save;$('new').onclick=clear;$('refresh-articles').onclick=articlesLoad;for(let id of ['volume','issue','date'])$(id).addEventListener('input',proof);proof();auth();
const comicBucket='tribune-comic-drafts';
async function loadComics(){
 const {data,error}=await db.from('tribune_comic_drafts').select('id,series,title,image_path').order('created_at',{ascending:false});
 if(error){$('comic-status').textContent='Could not load comics: '+error.message;return;}
 comics=data||[];const root=$('comic-library');root.replaceChildren();
 if(!comics.length){root.textContent='No uploaded comics yet.';return;}
 for(const c of comics){
  const row=document.createElement('div');row.style.cssText='border-bottom:1px solid #8b7c63;padding:8px 0';
  const label=document.createElement('label');label.style.cssText='display:flex;align-items:center;gap:8px';
  const cb=document.createElement('input');cb.type='checkbox';cb.className='comic-check';cb.value=c.id;cb.style.width='auto';
  const name=document.createElement('span');name.textContent=c.title+' · '+c.series.replaceAll('-',' ');
  label.append(cb,name);
  const view=document.createElement('button');view.textContent='VIEW';view.type='button';
  view.onclick=async()=>{const {data,error}=await db.storage.from(comicBucket).createSignedUrl(c.image_path,60);if(error)$('comic-status').textContent=error.message;else window.open(data.signedUrl,'_blank','noopener');};
  row.append(label,view);root.append(row);
 }
 if(current)await loadEditionComics(current);
}
async function loadEditionComics(id){
 document.querySelectorAll('.comic-check').forEach(c=>c.checked=false);
 const {data,error}=await db.from('tribune_edition_comics').select('comic_id').eq('edition_id',id);
 if(error){$('comic-status').textContent=error.message;return;}
 const ids=new Set((data||[]).map(c=>c.comic_id));
 document.querySelectorAll('.comic-check').forEach(c=>c.checked=ids.has(c.value));
}
async function saveEditionComics(id){
 const {error}=await db.from('tribune_edition_comics').delete().eq('edition_id',id).eq('editor_id',user.id);
 if(error)return error.message;
 const ids=[...document.querySelectorAll('.comic-check:checked')].map(c=>c.value);
 if(!ids.length)return null;
 const result=await db.from('tribune_edition_comics').insert(ids.map(comic_id=>({edition_id:id,comic_id,editor_id:user.id})));
 return result.error?.message||null;
}
$('upload-comic').onclick=async()=>{
 if(!user)return;
 const file=$('comic-file').files[0],title=$('comic-title').value.trim(),series=$('comic-series').value;
 if(!title||!file){$('comic-status').textContent='Enter a title and select an image.';return;}
 if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>10485760){$('comic-status').textContent='Choose a PNG, JPEG or WebP under 10 MB.';return;}
 const button=$('upload-comic');button.disabled=true;$('comic-status').textContent='Uploading…';
 const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
 const path=user.id+'/'+crypto.randomUUID()+'.'+ext;
 const {error:uploadError}=await db.storage.from(comicBucket).upload(path,file,{contentType:file.type,upsert:false});
 if(uploadError){button.disabled=false;$('comic-status').textContent=uploadError.message;return;}
 const {error}=await db.from('tribune_comic_drafts').insert({editor_id:user.id,series,title,image_path:path});
 if(error){await db.storage.from(comicBucket).remove([path]);button.disabled=false;$('comic-status').textContent=error.message;return;}
 $('comic-title').value='';$('comic-file').value='';await loadComics();button.disabled=false;$('comic-status').textContent='Comic uploaded privately. Tick it for this edition and save the edition.';
};
