'use strict';
(()=>{
const $=id=>document.getElementById(id),key='tribune-preview-standalone-simulated-publications';
$('standalone-simulated-publish').addEventListener('click',()=>{
const headline=$('headline').value.trim(),story=$('story').value.trim(),department=[...document.querySelectorAll('#categories input:checked')].map(x=>x.value);
if(!headline||!story||!department.length){$('stage-status').textContent='A headline, full story, and at least one category are required for the publication rehearsal.';return;}
if(!confirm('STEP 1 OF 2 — Review standalone story: '+headline+' | Departments: '+department.join(', ')+'. This is a BROWSER-ONLY SIMULATION and will not publish anything. Continue?'))return;
if(!confirm('STEP 2 OF 2 — FINAL APPROVAL: Add this story to your local SIMULATED PUBLICATION archive? No public site, database, or live newspaper will change.'))return;
const item={id:'simulation-'+Date.now(),headline,story,summary:$('summary').value,author:$('author').value,categories:department,placement:$('placement').value,simulatedAt:new Date().toISOString()};
try{const list=JSON.parse(localStorage.getItem(key)||'[]');list.unshift(item);localStorage.setItem(key,JSON.stringify(list.slice(0,30)));$('stage-status').textContent='SIMULATED publication completed in this browser only. View it in the test archive. Nothing went public.';window.open('standalone-simulated-archive.html','_blank','noopener');}catch(e){$('stage-status').textContent='Simulation could not be saved locally: '+e.message;}
});
})();
