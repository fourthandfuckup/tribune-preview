'use strict';
(()=>{
const $=id=>document.getElementById(id);
const select=$('edition-lead-comic'),status=$('edition-lead-comic-status'),root=$('edition-comic-order');
if(!select||!root)return;
const leadKey='tribune-preview-featured-comic',orderKey='tribune-preview-comic-order';
let current=[],ordered=[];
function readOrder(){try{const ids=JSON.parse(localStorage.getItem(orderKey)||'[]');return Array.isArray(ids)?ids:[]}catch{return []}}
function render(){
root.replaceChildren();
if(!ordered.length){root.textContent='No comics in the current published preview edition.';return;}
ordered.forEach((comic,i)=>{
const row=document.createElement('div');row.style.cssText='display:flex;gap:8px;align-items:center;flex-wrap:wrap;border-bottom:1px solid #8a7655;padding:8px 0';
const label=document.createElement('strong');label.textContent=(i===0?'LEAD · ':'')+(i+1)+'. '+(comic.title||comic.series||'Untitled');row.append(label);
for(const [text,delta] of [['UP',-1],['DOWN',1]]){const button=document.createElement('button');button.type='button';button.textContent=text;button.disabled=i+delta<0||i+delta>=ordered.length;button.onclick=()=>{[ordered[i],ordered[i+delta]]=[ordered[i+delta],ordered[i]];render();};row.append(button);}
root.append(row);
});
}
$('edition-save-lead-comic').addEventListener('click',()=>{localStorage.setItem(leadKey,select.value);if(select.value){ordered.sort((a,b)=>Number(b.id===select.value)-Number(a.id===select.value));localStorage.setItem(orderKey,JSON.stringify(ordered.map(c=>c.id)));}status.textContent='Lead comic saved in this browser. No publication occurred.';render();});
$('edition-save-comic-order').addEventListener('click',()=>{localStorage.setItem(orderKey,JSON.stringify(ordered.map(c=>c.id)));localStorage.setItem(leadKey,ordered[0]?.id||'');select.value=ordered[0]?.id||'';status.textContent='Full comic order saved in this browser. Reload The Obituaries to see it. No live changes.';});
$('edition-reset-comic-order').addEventListener('click',()=>{localStorage.removeItem(orderKey);localStorage.removeItem(leadKey);ordered=[...current];select.value='';render();status.textContent='Preview comic ordering reset. Published data unchanged.';});
(async()=>{
try{
const response=await fetch('https://nlckcelwfcoszbvqyeyr.supabase.co/rest/v1/tribune_published_editions?select=content,published_at&order=published_at.desc&limit=1',{headers:{apikey:'sb_publishable_CrRNQGAZoc6TtT3wFe3sUg_hoYuupy8'}});
if(!response.ok)throw Error('Unable to read preview comics');
const editions=await response.json();current=editions[0]?.content?.comics||[];
for(const comic of current)select.add(new Option(comic.title||comic.series||'Untitled comic',comic.id));
const ids=readOrder(),lead=localStorage.getItem(leadKey)||'';
ordered=[...current].sort((a,b)=>{const ia=ids.indexOf(a.id),ib=ids.indexOf(b.id);return (ia<0?9999:ia)-(ib<0?9999:ib);});
if(!ids.length&&lead)ordered.sort((a,b)=>Number(b.id===lead)-Number(a.id===lead));
select.value=lead;render();
}catch(e){status.textContent='Current published comics unavailable; please try again later.';}
})();
})();
