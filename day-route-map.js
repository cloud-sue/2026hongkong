/* Day route overview. Lines connect visits in order; they are not routed roads. */
(() => {
 let map=null,activeIndex=null,tileFailures=0;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function routeLinks(groups){
  const points=[];
  groups.filter(g=>!g.alternatives).forEach(g=>g.points.forEach(p=>{const prev=points.at(-1);if(!prev||prev.lat!==p.lat||prev.lng!==p.lng)points.push(p);}));
  const links=[];
  for(let i=0;i<points.length-1;i+=4){const part=points.slice(i,i+5);const query=new URLSearchParams({api:'1',origin:`${part[0].lat},${part[0].lng}`,destination:`${part.at(-1).lat},${part.at(-1).lng}`});if(part.length>2)query.set('waypoints',part.slice(1,-1).map(p=>`${p.lat},${p.lng}`).join('|'));links.push(`https://www.google.com/maps/dir/?${query}`);}
  return links;
 }
 window.getDayRouteMarkup=function(index){
  const route=window.DAY_ROUTES?.[index];if(!route)return '';
  const links=routeLinks(route.groups);
  return `<section class="day-route" aria-label="${esc(route.date)} 동선 지도"><div class="day-route-heading"><h4>📍 오늘의 동선</h4><button type="button" data-map-fit="all">전체 동선 보기</button></div><div id="day-route-map" class="day-route-canvas" role="region" aria-label="확대와 이동이 가능한 일자별 지도"><p class="route-loading">동선 지도를 불러오는 중이에요.</p></div><p id="day-route-status" class="route-map-status" role="status"></p><div class="route-legend"><span><i></i>방문 순서</span><span><i class="optional"></i>선택 일정</span><span><i class="candidate"></i>식당 후보</span></div><p class="route-explanation">${esc(route.note)}</p><div class="route-points">${route.groups.map((g,i)=>`<button type="button" data-route-group="${i}"><b>${g.number}</b><span>${esc(g.time)} · ${esc(g.title)}</span></button>`).join('')}</div><div class="route-google-links">${links.map((url,i)=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">구글지도 ${links.length>1?`구간 ${i+1}`:'동선'} ↗</a>`).join('')}</div></section>`;
 };
 window.renderDayRouteMap=function(index){
  if(map){map.remove();map=null;}
  activeIndex=index;tileFailures=0;
  const canvas=document.querySelector('#day-route-map'),route=window.DAY_ROUTES?.[index];
  if(!canvas||!route)return;
  const status=document.querySelector('#day-route-status');
  if(!window.L){canvas.innerHTML='<p class="route-loading">지도를 불러오지 못했어요. 아래 구글지도 링크를 이용해 주세요.</p>';return;}
  canvas.innerHTML='';
  map=L.map(canvas,{scrollWheelZoom:false,zoomControl:true});
  const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'}).addTo(map);
  tiles.on('tileerror',()=>{tileFailures++;if(tileFailures>=3)status.textContent='배경 지도를 불러오지 못했어요. 위치 번호와 구글지도 링크는 이용할 수 있어요.';});
  const all=route.groups.flatMap(g=>g.points.map(p=>[p.lat,p.lng]));
  const bounds=L.latLngBounds(all);
  function fit(){map.invalidateSize();map.fitBounds(bounds,{padding:[28,28],maxZoom:15});}
  // Main route excludes alternative restaurants; optional stops use dotted segments.
  let previous=null;
  route.groups.filter(g=>!g.alternatives).forEach(g=>g.points.forEach(p=>{
   if(previous&&(previous.point.lat!==p.lat||previous.point.lng!==p.lng))L.polyline([[previous.point.lat,previous.point.lng],[p.lat,p.lng]],{color:g.optional||previous.optional?'#527c65':'#b62c24',weight:3,opacity:.8,dashArray:g.optional||previous.optional?'5 7':null}).addTo(map);
   previous={point:p,optional:g.optional};
  }));
  const grouped=new Map();
  route.groups.forEach((g,groupIndex)=>g.points.forEach(p=>{const key=`${p.lat},${p.lng}`;if(!grouped.has(key))grouped.set(key,{point:p,visits:[]});grouped.get(key).visits.push({g,groupIndex,name:p.name,url:p.url});}));
  const groupMarkers=new Map();
  for(const {point,visits} of grouped.values()){
   const first=visits[0].g,numbers=[...new Set(visits.map(v=>v.g.number))];
   const marker=L.marker([point.lat,point.lng],{icon:L.divIcon({className:'route-pin-wrap',html:`<span class="route-pin ${first.alternatives?'candidate':first.optional?'optional':''}">${numbers.join('·')}</span>`,iconSize:[36,36],iconAnchor:[18,18]}),keyboard:true,title:visits.map(v=>`${v.g.number}. ${v.name}`).join(' / ')}).addTo(map);
   marker.bindPopup(visits.map(v=>`<div class="route-popup"><b>${v.g.number}. ${esc(v.name)}</b><p>${esc(v.g.time)}${v.g.alternatives?' · 후보':v.g.optional?' · 선택':''}</p><a href="${esc(v.url)}" target="_blank" rel="noopener noreferrer">구글지도 ↗</a> · <a href="#day-stop-${index}-${v.g.stopIndex}">일정 보기 ↓</a></div>`).join('<hr>'));
   for(const v of visits){if(!groupMarkers.has(v.groupIndex))groupMarkers.set(v.groupIndex,[]);groupMarkers.get(v.groupIndex).push(marker);}
  }
  document.querySelector('.day-route').addEventListener('click',event=>{
   if(event.target.closest('[data-map-fit]'))fit();
   const button=event.target.closest('[data-route-group]');if(!button)return;
   const markers=groupMarkers.get(Number(button.dataset.routeGroup));if(!markers?.length)return;
   map.fitBounds(L.latLngBounds(markers.map(m=>m.getLatLng())),{padding:[45,45],maxZoom:16});markers[0].openPopup();
  });
  requestAnimationFrame(()=>{if(map&&activeIndex===index)fit();});
 };
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&map)map.invalidateSize();});
 if('ResizeObserver' in window)new ResizeObserver(()=>{if(map)map.invalidateSize();}).observe(document.querySelector('#trip-schedule'));
})();
