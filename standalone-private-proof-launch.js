'use strict';
(()=>{
const $=id=>document.getElementById(id),key='tribune-preview-standalone-private-proof';
$('standalone-private-proof').addEventListener('click',()=>{
const headline=$('headline').value.trim(),story=$('story').value.trim();
if(!headline||!story){$('stage-status').textContent='Add a headline and full story before opening the standalone proof.';return;}
const data={headline,story,summary:$('summary').value,author:$('author').value,categories:[...document.querySelectorAll('#categories input:checked')].map(x=>x.value),placement:$('placement').value,createdAt:new Date().toISOString()};
try{sessionStorage.setItem(key,JSON.stringify(data));window.open('standalone-private-proof.html','_blank','noopener');$('stage-status').textContent='Private standalone proof opened. No content published or saved.';}catch(e){$('stage-status').textContent='Could not prepare proof in this browser: '+e.message;}
});
})();
