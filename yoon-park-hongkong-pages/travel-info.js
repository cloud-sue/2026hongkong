/* Flight details transcribed from the eight supplied e-tickets, issued 2026-10-20.
   Booking references and original PDFs are intentionally excluded. */
const travelers = [
 {name:'노홍미',english:'NOH/HONGMI 여',ticketNumber:'1804826204801'},
 {name:'박경진',english:'PARK/GYEONGJIN 남',ticketNumber:'1804826204799'},
 {name:'박관재',english:'PARK/KWANJAE 남',ticketNumber:'1804826195546'},
 {name:'박수현',english:'PARK/SUHYEON 여',ticketNumber:'1804826195544'},
 {name:'박시현',english:'PARK/SIHYEON 여',ticketNumber:'1804826195545'},
 {name:'윤정숙',english:'YUN/JEONGSUK 여',ticketNumber:'1804826195547'},
 {name:'윤홍근',english:'YOUN/HONGGEUN 남',ticketNumber:'1804826204800'},
 {name:'윤홍영',english:'YUN/HONGYEONG 남',ticketNumber:'1804826195548'}
];
const flights = [
 {label:'가는 편 / 2026.12.17 목요일',number:'KE2001',from:'ICN',fromName:'인천',departure:'08:10',to:'HKG',toName:'홍콩',arrival:'11:20',terminal:'인천 제2터미널 → 홍콩 제1터미널',duration:'4시간 10분',cabin:'일반석 (T)'},
 {label:'오는 편 / 2026.12.20 일요일',number:'KE2016',from:'MFM',fromName:'마카오',departure:'14:55',to:'ICN',toName:'인천',arrival:'19:40',terminal:'마카오 터미널 미기재 → 인천 제2터미널',duration:'3시간 45분',cabin:'일반석 (S)'}
];
const meta=(label,value)=>`<div><dt>${label}</dt><dd>${value}</dd></div>`;
document.querySelector('#shared-flights').innerHTML=flights.map(f=>`<article class="flight-card"><div class="eyebrow">${f.label}</div><h3>대한항공 ${f.number}</h3><div class="flight-route"><div><strong>${f.from}</strong><small>${f.fromName} 출발</small><time>${f.departure}</time></div><span class="route-line" aria-hidden="true">✈ →</span><div><strong>${f.to}</strong><small>${f.toName} 도착</small><time>${f.arrival}</time></div></div><dl class="info-meta">${meta('출발 · 도착 터미널',f.terminal)}${meta('비행시간',f.duration)}${meta('예약등급',f.cabin)}${meta('무료 수하물','1인 1개 · 무게는 항공권에 미기재')}</dl></article>`).join('');
const people=document.querySelector('.people');
people.innerHTML=travelers.map((p,i)=>`<button type="button" data-person="${i}" aria-pressed="false" aria-controls="passenger-detail">${p.name}</button>`).join('');
function selectTraveler(i){const p=travelers[i];if(!p)return;people.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.person)===i)));document.querySelector('#passenger-detail').innerHTML=`<h3>${p.name}님의 항공권</h3><dl class="info-meta">${meta('항공권 영문 이름',p.english)}${meta('항공권 번호',p.ticketNumber)}${meta('개인별 확인','여권 영문 이름과 일치하는지 확인해 주세요.')}</dl><p class="info-intro">비행 일정·수하물·예약등급은 위 공통 정보를 참고해 주세요. 예약번호는 원본 전자항공권에서 확인할 수 있어요.</p>`;}
people.addEventListener('click',e=>{const b=e.target.closest('[data-person]');if(b)selectTraveler(Number(b.dataset.person));});
const tripTabs=[...document.querySelectorAll('[data-trip-tab]')];
const tabKeys=tripTabs.map(b=>b.dataset.tripTab);
const hashToTab={'#trip-tab-flights':'flights','#trip-tab-stays':'stays','#itinerary':'schedule','#moments':'places','#places':'places','#trip-tab-places':'places','#travel-note':'schedule','#schedule':'schedule','#pledge':'pledge','#flights':'flights','#stays':'stays'};
function activateTripTab(key,focus=false){if(!tabKeys.includes(key))key='schedule';tripTabs.forEach(b=>{const selected=b.dataset.tripTab===key;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;document.querySelector(`#trip-${b.dataset.tripTab}`).hidden=!selected;});if(focus)tripTabs.find(b=>b.dataset.tripTab===key).focus();}
const tabBar=document.querySelector('.trip-tabs');
tabBar.addEventListener('click',e=>{const b=e.target.closest('[data-trip-tab]');if(!b)return;const key=b.dataset.tripTab;activateTripTab(key);history.replaceState(null,'',key==='schedule'?'#itinerary':`#${key}`);});
tabBar.addEventListener('keydown',e=>{const b=e.target.closest('[data-trip-tab]');if(!b)return;const i=tabKeys.indexOf(b.dataset.tripTab);const next={ArrowRight:(i+1)%tabKeys.length,ArrowLeft:(i+tabKeys.length-1)%tabKeys.length,Home:0,End:tabKeys.length-1}[e.key];if(next!==undefined){e.preventDefault();activateTripTab(tabKeys[next],true);history.replaceState(null,'',next===0?'#itinerary':`#${tabKeys[next]}`);}});
document.querySelectorAll('[data-open-tab]').forEach(a=>a.addEventListener('click',()=>{activateTripTab(a.dataset.openTab);tabBar.scrollIntoView({block:'start'});}));
document.querySelector('.ticket a').addEventListener('click',()=>activateTripTab('schedule'));
function restoreTab(){activateTripTab(hashToTab[location.hash]||'schedule');}
window.addEventListener('hashchange',restoreTab);restoreTab();
