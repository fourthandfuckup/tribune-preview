import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
const db=createClient('https://nlckcelwfcoszbvqyeyr.supabase.co','sb_publishable_CrRNQGAZoc6TtT3wFe3sUg_hoYuupy8');
const $=id=>document.getElementById(id),names=['Sleeping Giant League','Westfort Dynasty','Benchwarmer Bulletin',"Frank's Desk",'Wall of Shame'],slots={main:'MAIN HEADLINE','bulletin-left':'BENCHWARMER BULLETIN — LEFT','bulletin-right':'BENCHWARMER BULLETIN — RIGHT',sleeping:'SLEEPING GIANT — LEAGUE DESK',westfort:'WESTFORT DYNASTY — LEAGUE DESK',shame:'WALL OF SHAME',none:'CATEGORY PAGES ONLY'};
let sourceArticleId=null;let previousPlacement=null;let user=null,current=null,drafts=[],photoUrl=null,savedImagePath=null,pendingImage=null; const bucket='tribune-draft-images';
for(const name of names){const label=document.createElement('label');label.className='check';const input=document.createElement('input');input.type='checkbox';input.value=name;label.append(input,document.createTextNode(name));$('categories').append(label);}
function notice(s){$('status').textContent=s;if(/sav|sign in|headline|image upload|JPG|PNG|WebP/i.test(s)){const feedback=$('draft-save-feedback');if(feedback)feedback.textContent=/^Draft and image saved/i.test(s)?'Saved! Article draft and image stored securely.':s;}}
function values(){return {headline:$('headline').value,author:$('author').value,summary:$('summary').value,story:$('story').value,categories:[...$('categories').querySelectorAll('input:checked')].map(x=>x.value),placement:$('placement').value};}
function preview(){const d=values();$('preview-headline').textContent=d.headline||'Your headline appears here';$('preview-byline').textContent='By '+(d.author||'Tribune Staff');$('preview-summary').textContent=d.summary;$('preview-story').textContent=d.story||'Your article appears here as you type.';$('preview-categories').textContent=d.categories.join(' • ');$('preview-place').textContent=slots[d.placement]||'CATEGORY PAGES ONLY';updateNewspaperPreview();}
async function showSavedImage(path){if(photoUrl)URL.revokeObjectURL(photoUrl);photoUrl=null;pendingImage=null;$('photo').value='';savedImagePath=path||null;$('preview-photo').hidden=true;if(!path)return;const {data,error}=await db.storage.from(bucket).download(path);if(error){notice('Article loaded, but image could not be downloaded: '+error.message);return;}photoUrl=URL.createObjectURL(data);$('preview-photo').src=photoUrl;$('preview-photo').hidden=false;updateNewspaperPreview();}
async function load(d){document.dispatchEvent(new CustomEvent('tribune:article-draft-selected',{detail:{id:d.id}}));sourceArticleId=d.source_article_id||null;current=d.id;for(const f of ['headline','author','summary','story','placement'])$(f).value=d[f]||'';for(const c of $('categories').querySelectorAll('input'))c.checked=(d.categories||[]).includes(c.value);await showSavedImage(d.image_path);preview();notice('Cloud draft loaded with its saved image.');}
function clearPhoto(){if(photoUrl)URL.revokeObjectURL(photoUrl);photoUrl=null;pendingImage=null;savedImagePath=null;$('photo').value='';$('preview-photo').hidden=true;}
function render(){const root=$('drafts');root.replaceChildren();if(!drafts.length){root.textContent='No cloud drafts saved yet.';return;}for(const d of drafts){const item=document.createElement('div');item.style.marginBottom='12px';const title=document.createElement('strong');title.textContent=d.headline||'Untitled article';const actions=document.createElement('div');const open=document.createElement('button');open.type='button';open.textContent='EDIT';open.addEventListener('click',()=>load(d));const del=document.createElement('button');del.type='button';del.textContent='DELETE';del.addEventListener('click',async()=>{if(!confirm('Permanently delete this cloud draft?'))return;const {error}=await db.from('tribune_article_drafts').delete().eq('id',d.id);if(error){notice('Delete failed: '+error.message);return;}if(d.image_path)await db.storage.from(bucket).remove([d.image_path]);if(current===d.id){current=null;clearPhoto();}await refresh();notice('Cloud draft deleted.');});actions.append(open,del);item.append(title,actions);root.append(item);}}
async function refresh(){if(!user)return;const {data,error}=await db.from('tribune_article_drafts').select('id,headline,author,summary,story,categories,placement,image_path,source_article_id,updated_at').order('updated_at',{ascending:false});if(error){notice('Could not load drafts: '+error.message);return;}drafts=data||[];render();}
async function signedIn(){const {data:{user:u},error}=await db.auth.getUser();user=error?null:u;let authorized=false;if(user){const {data:member,error:memberError}=await db.from('tribune_editors').select('user_id').eq('user_id',user.id).maybeSingle();authorized=!memberError&&!!member;}if(user&&!authorized){await db.auth.signOut();user=null;}$('editor-workspace').hidden=!user;$('editor-logout').hidden=!user;$('editor-login').hidden=!!user;$('editor-email').hidden=!!user;document.querySelector('label[for="editor-email"]').hidden=!!user;$('editor-auth-intro').hidden=!!user;$('editor-auth-status').textContent=user?'Signed in as '+user.email:authorized===false&&u?'This account is not authorized for the newsroom.':'Sign in with your authorized editor email. No password required.';if(user)await refresh();else{drafts=[];current=null;render();}updateNewspaperPreview();}
$('editor-login').addEventListener('click',async()=>{const email=$('editor-email').value.trim();if(!email)return $('editor-auth-status').textContent='Enter your editor email first.';$('editor-auth-status').textContent='Sending secure sign-in link...';const {error}=await db.auth.signInWithOtp({email,options:{shouldCreateUser:false,emailRedirectTo:location.origin+location.pathname}});$('editor-auth-status').textContent=error?'Sign-in request failed: '+error.message:'Check your email for a secure sign-in link. No password needed.';});
$('editor-logout').addEventListener('click',async()=>{await db.auth.signOut();await signedIn();});
document.querySelectorAll('#editor-workspace input,#editor-workspace textarea,#editor-workspace select').forEach(x=>x.addEventListener('input',preview));
$('photo').addEventListener('change',()=>{if(photoUrl)URL.revokeObjectURL(photoUrl);const f=$('photo').files[0];pendingImage=f||null;photoUrl=f?URL.createObjectURL(f):null;$('preview-photo').hidden=!photoUrl;if(photoUrl)$('preview-photo').src=photoUrl;updateNewspaperPreview();});
$('save').addEventListener('click',async()=>{if(!user)return notice('Please sign in first.');if(!$('headline').value.trim()||!$('story').value.trim())return notice('Add a headline and full article before saving.');const d={...values(),editor_id:user.id,image_path:savedImagePath,source_article_id:sourceArticleId,updated_at:new Date().toISOString()};if(current)d.id=current;notice('Saving cloud draft...');if(pendingImage){if(!['image/jpeg','image/png','image/webp'].includes(pendingImage.type)||pendingImage.size>5242880){notice('Choose a JPG, PNG, or WebP image under 5 MB.');return;}const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[pendingImage.type];const path=user.id+'/'+crypto.randomUUID()+'.'+ext;const {error:uploadError}=await db.storage.from(bucket).upload(path,pendingImage,{contentType:pendingImage.type,upsert:false});if(uploadError){notice('Image upload failed: '+uploadError.message);return;}d.image_path=path;}const {data,error}=await db.from('tribune_article_drafts').upsert(d).select('id').single();if(error){if(pendingImage&&d.image_path!==savedImagePath)await db.storage.from(bucket).remove([d.image_path]);notice('Cloud save failed: '+error.message);return;}const previous=savedImagePath;savedImagePath=d.image_path;pendingImage=null;if(previous&&previous!==savedImagePath)await db.storage.from(bucket).remove([previous]);current=data.id;document.dispatchEvent(new CustomEvent('tribune:article-draft-selected',{detail:{id:current}}));await refresh();notice('Draft and image saved securely to the newsroom cloud. Nothing published.');});
$('new').addEventListener('click',()=>{document.dispatchEvent(new CustomEvent('tribune:article-draft-selected',{detail:{id:null}}));current=null;sourceArticleId=null;for(const f of ['headline','summary','story'])$(f).value='';$('author').value='Frank “The Hammer” Haggerty';$('placement').value='main';for(const c of $('categories').querySelectorAll('input'))c.checked=false;clearPhoto();preview();notice('New blank article.');});
$('export').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(values(),null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='tribune-article-draft.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notice('Draft exported as JSON.');});
window.__tribuneEditorReady=true;preview();try{await signedIn();}catch(e){notice('Sign-in initialization failed: '+(e?.message||e));$('editor-auth-status').textContent='Sign-in initialization failed: '+(e?.message||e);}

// Read-only front-page placement mock-up. All modifications are confined to this iframe.
function updateNewspaperPreview(){const panel=$('page-preview-panel'),frame=$('newspaper-frame'),d=values();panel.hidden=!user;if(!user)return;const doc=frame.contentDocument;if(!doc||!doc.querySelector('.front-layout'))return;if(previousPlacement!==d.placement){previousPlacement=d.placement;frame.contentWindow.location.reload();return;}doc.querySelectorAll('.editor-preview-marker').forEach(el=>el.classList.remove('editor-preview-marker'));const text=(el,value)=>{if(el)el.textContent=value;};const marker=el=>{if(el){el.classList.add('editor-preview-marker');el.style.outline='3px dashed #8b3426';el.style.outlineOffset='4px';}};const title=d.headline||'YOUR HEADLINE WILL APPEAR HERE',summary=d.summary||'Your short teaser will appear here.';const img=photoUrl;
if(d.placement==='main'){const root=doc.querySelector('.front-layout > section');text(root?.querySelector('.lead-headline'),title);text(root?.querySelector('.deck'),summary);text(root?.querySelector('.byline'),'BY '+(d.author||'TRIBUNE STAFF')+' · UNPUBLISHED DRAFT');text(root?.querySelector('.article-tease'),(d.story||'Your story will appear here.').slice(0,350));const art=root?.querySelector('.lead-graphic');if(art&&img){const photo=doc.createElement('img');photo.src=img;photo.alt='Draft article image';photo.style.cssText='width:100%;height:100%;object-fit:contain;filter:grayscale(1) sepia(.2)';art.replaceChildren(photo);}marker(root?.querySelector('.lead-headline'));$('page-preview-note').textContent='Main headline preview — fixed advertisement and other sections unchanged.';
}else if(d.placement==='bulletin-left'||d.placement==='bulletin-right'){const cards=doc.querySelectorAll('.front-investigations .front-case'),card=cards[d.placement==='bulletin-left'?0:1];if(card){text(card.querySelector('h3'),title);text(card.querySelector('p'),summary);text(card.querySelector('.kicker'),(d.categories[0]||'BENCHWARMER BULLETIN').toUpperCase()+' · UNPUBLISHED DRAFT');card.removeAttribute('href');marker(card);} $('page-preview-note').textContent='Benchwarmer Bulletin '+(d.placement==='bulletin-left'?'left':'right')+' preview — the opposite investigation stays unchanged.';
}else{$('page-preview-note').textContent='This selection belongs on a category page, not a replaceable front-page feature. The permanent league navigation blocks remain unchanged.';}
}
$('newspaper-frame').addEventListener('load',updateNewspaperPreview);

// One-time import of the existing front-page investigation. Never changes published files.
const importButton=$('import-74');
importButton.addEventListener('click',async()=>{
  if(!user){notice('Please sign in before importing.');return;}
  if((current||$('headline').value.trim()||$('story').value.trim())&&!confirm('Open the existing $74 investigation? Unsaved changes in the editor will be replaced.'))return;
  importButton.disabled=true;
  const oldLabel=importButton.textContent;
  importButton.textContent='IMPORTING...';
  try{
    notice('Checking for an existing imported copy...');
    const {data:existing,error:findError}=await db.from('tribune_article_drafts').select('*').eq('source_article_id','seventy-four-dollar-man').maybeSingle();
    if(findError)throw new Error('Draft lookup failed: '+findError.message);
    if(existing){
      await load(existing);
      notice('Existing $74 draft opened. No duplicate created; nothing published.');
      return;
    }
    notice('Loading the existing $74 article...');
    const response=await fetch('imports/seventy-four-dollar-man.json?v=2',{cache:'no-store'});
    if(!response.ok)throw new Error('Article file unavailable (HTTP '+response.status+').');
    const a=await response.json();
    if(a.id!=='seventy-four-dollar-man'||!Array.isArray(a.body)||!a.body.length||!a.title)throw new Error('Article file is incomplete.');
    current=null;sourceArticleId=a.id;clearPhoto();
    $('headline').value=a.title;
    $('author').value=a.author||'Frank “The Hammer” Haggerty';
    $('summary').value=a.deck||'';
    $('story').value=a.body.join('\n\n');
    $('placement').value='main';
    for(const c of $('categories').querySelectorAll('input'))c.checked=c.value==='Sleeping Giant League';
    preview();
    notice('Imported the existing $74 article into the editor. Review it, then click SAVE DRAFT. Nothing published.');
    $('headline').scrollIntoView({behavior:'smooth',block:'center'});
  }catch(e){
    notice('Import failed: '+(e?.message||String(e)));
  }finally{
    importButton.disabled=false;
    importButton.textContent=oldLabel;
  }
});
