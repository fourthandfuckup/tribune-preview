'use strict';
(()=>{
const $=id=>document.getElementById(id);
let selectedId=null;
const status=$('stage-status'),dept=$('stage-department'),position=$('stage-position');
const headKey='tribune-preview-department-headlines',idsKey='tribune-preview-department-draft-ids',supportKey='tribune-preview-department-supporting';
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'{}')}catch{return {}}};
document.addEventListener('tribune:article-draft-selected',e=>{selectedId=e.detail.id;status.textContent=selectedId?'Saved draft selected. Ready to stage privately.':'Save your new draft before staging it.';});
$('stage-department-preview').addEventListener('click',()=>{
if(!selectedId){status.textContent='Save or open an existing cloud draft before staging.';return;}
const headline=$('headline').value.trim();
if(!headline){status.textContent='Enter a headline first.';return;}
const dep=dept.value,heads=read(headKey),ids=read(idsKey),support=read(supportKey);
if(position.value==='lead'){
heads[dep]=headline;ids[dep]=selectedId;support[dep]=(support[dep]||[]).filter(x=>x.id!==selectedId);
}else{
if(ids[dep]===selectedId){status.textContent='This draft is already the featured article in this department.';return;}
const list=support[dep]||[];
if(list.some(x=>x.id===selectedId)){status.textContent='This article is already staged in this department.';return;}
list.push({id:selectedId,headline});support[dep]=list;
}
localStorage.setItem(headKey,JSON.stringify(heads));localStorage.setItem(idsKey,JSON.stringify(ids));localStorage.setItem(supportKey,JSON.stringify(support));
status.textContent='Staged privately for '+dept.selectedOptions[0].textContent+'. Open the department preview to review. Nothing was published.';
});
$('open-department-preview').addEventListener('click',()=>window.open('index.html?section='+encodeURIComponent(dept.value),'_blank','noopener'));
})();
