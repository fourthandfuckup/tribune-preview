'use strict';
// Preview-only edition layout planning. Never writes to Supabase or alters an edition.
(()=>{
const $=id=>document.getElementById(id);
const key='tribune-preview-department-headlines';
const idsKey='tribune-preview-department-draft-ids';
const dept=$('department-plan'),draft=$('department-lead-draft'),status=$('department-plan-status');
function read(key){try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}}
function sync(){const source=$('main');if(!source)return;const prev=draft.value;draft.replaceChildren(new Option('— No featured article —',''));for(const o of source.options){if(!o.value)continue;draft.add(new Option(o.textContent,o.value));}const selected=read(idsKey)[dept.value]||prev;draft.value=[...draft.options].some(o=>o.value===selected)?selected:'';}
function choose(){sync();draft.value=read(idsKey)[dept.value]||'';status.textContent='Select a saved draft and set the test feature.';}
dept.addEventListener('change',choose);
$('department-save-plan').addEventListener('click',()=>{
const id=draft.value,selected=draft.selectedOptions[0],name=selected?.textContent||'';
const headlines=read(key),ids=read(idsKey);
if(id){headlines[dept.value]=name;ids[dept.value]=id;}else{delete headlines[dept.value];delete ids[dept.value];}
localStorage.setItem(key,JSON.stringify(headlines));localStorage.setItem(idsKey,JSON.stringify(ids));
status.textContent=id?'Test placement saved for this browser. Draft remains private and unpublished.':'Test featured placement cleared.';
});
$('department-open-preview').addEventListener('click',()=>window.open('index.html?section='+encodeURIComponent(dept.value),'_blank','noopener'));
const source=$('main');if(source){new MutationObserver(()=>sync()).observe(source,{childList:true});sync();}
})();
