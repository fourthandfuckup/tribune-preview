'use strict';
(()=>{
const $=id=>document.getElementById(id),key='tribune-preview-standalone-private-proof';
$('standalone-private-proof').addEventListener('click',async()=>{
const headline=$('headline').value.trim(),story=$('story').value.trim();
if(!headline||!story){$('stage-status').textContent='Add a headline and full story before opening the standalone proof.';return;}
const data={headline,story,summary:$('summary').value,author:$('author').value,categories:[...document.querySelectorAll('#categories input:checked')].map(x=>x.value),placement:$('placement').value,createdAt:new Date().toISOString()};
const image=$('preview-photo');
if(!image.hidden&&image.src){
try{
const response=await fetch(image.src);const blob=await response.blob();
if(blob.size>900000){$('stage-status').textContent='The image is too large for the browser-session proof (900 KB maximum). Your article remains unchanged. Resize the image or review the image in the Article Editor.';return;}
if(!['image/png','image/jpeg','image/webp'].includes(blob.type))throw Error('Unsupported image type');
data.image=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('Image could not be read'));reader.readAsDataURL(blob);});
}catch(e){$('stage-status').textContent='Image could not be prepared: '+e.message;return;}
}
try{sessionStorage.setItem(key,JSON.stringify(data));window.location.assign('standalone-private-proof.html');}catch(e){$('stage-status').textContent='Could not prepare proof in this browser: '+e.message;}
});
})();
