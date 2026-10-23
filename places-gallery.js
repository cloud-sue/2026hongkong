/* Public saved places snapshot; no API key or live connector required on GitHub Pages. */
(() => {
 const places=window.TRAVEL_PLACES||[];
 const category=document.querySelector('#place-category');
 const grid=document.querySelector('#place-grid');
 const count=document.querySelector('#place-count');
 const labels=['관광지','맛집','카페·차찬탱','베이커리·간식','기념품·쇼핑','숙소·교통'];
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 labels.forEach(label=>{const option=document.createElement('option');option.value=label;option.textContent=`${label} (${places.filter(p=>p.category===label).length})`;category.append(option);});
 function render(){
  const filtered=places.filter(p=>category.value==='all'||p.category===category.value);
  count.textContent=`${filtered.length}곳 / 전체 ${places.length}곳`;
  grid.innerHTML=filtered.map(p=>`<article class="moment place-card"><a class="moment-photo" href="${escape(p.url)}" target="_blank" rel="noopener noreferrer" aria-label="${escape(p.name)} 구글지도 열기"><img src="${escape(p.photo)}" alt="${escape(p.name)} 대표 사진" loading="lazy" decoding="async" width="640" height="420"><span class="photo-fallback" hidden>사진을 불러올 수 없어요<br><small>구글지도에서 사진 보기 ↗</small></span></a><span class="moment-tag">${escape(p.category)} · ${escape(p.region)}</span><h3><a href="${escape(p.url)}" target="_blank" rel="noopener noreferrer">${escape(p.name)} ↗</a></h3><p>${escape(p.note||({관광지:'우리 지도에 저장한 둘러볼 곳.','맛집':'함께 맛보려고 저장한 식당.','카페·차찬탱':'차 한 잔과 함께 쉬어갈 곳.','베이커리·간식':'여행 중 달콤한 한 입.','기념품·쇼핑':'마음에 드는 여행 기념품 찾기.','숙소·교통':'여행에 필요한 숙소와 이동 거점.'}[p.category]))}</p>${p.reviews?.length?`<div class="place-review-links">${p.reviews.map(r=>`<a href="${escape(r.url)}" target="_blank" rel="noopener noreferrer">${escape(r.name)} ↗</a>`).join('')}</div>`:''}<div class="place-card-links"><a href="${escape(p.url)}" target="_blank" rel="noopener noreferrer">지도 보기 ↗</a>${p.photoSource?`<a class="photo-credit" href="${escape(p.photoSource)}" target="_blank" rel="noopener noreferrer">사진 출처 ↗</a>`:''}</div></article>`).join('');
  grid.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{img.hidden=true;img.nextElementSibling.hidden=false;},{once:true}));
 }
 category.addEventListener('change',render);render();
})();
