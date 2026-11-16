'use strict';
(()=>{
const select=document.getElementById('edition-lead-comic'),status=document.getElementById('edition-lead-comic-status');
if(!select)return;
const key='tribune-preview-featured-comic';
document.getElementById('edition-save-lead-comic').addEventListener('click',()=>{localStorage.setItem(key,select.value);status.textContent='Saved to this browser only. Reload The Obituaries to see the lead comic.';});
(async()=>{
try{
const response=await fetch('https://nlckcelwfcoszbvqyeyr.supabase.co/rest/v1/tribune_published_editions?select=content,published_at&order=published_at.desc&limit=1',{headers:{apikey:'sb_publishable_CrRNQGAZoc6TtT3wFe3sUg_hoYuupy8'}});
if(!response.ok)throw Error('Unable to read preview comics');
const editions=await response.json();
for(const comic of editions[0]?.content?.comics||[])select.add(new Option(comic.title||comic.series||'Untitled comic',comic.id));
select.value=localStorage.getItem(key)||'';
}catch(e){status.textContent='Current published comics unavailable; please try again later.';}
})();
})();
