const fs=require('fs');
const p='index.html';
let s=fs.readFileSync(p,'utf8');
if(s.includes('hypothesisSafeAddonV1')){console.log('already patched');process.exit(0)}
const addon=String.raw`
/* hypothesisSafeAddonV1 */
;(()=>{
 const P='workReport:', q=id=>document.getElementById(id), dateEl=q('targetDate');
 const key=()=>P+'hypothesisGuide:'+((dateEl&&dateEl.value)||'');
 const prevDate=()=>{const d=new Date(dateEl.value+'T00:00:00');d.setDate(d.getDate()-1);return d.toISOString().slice(0,10)};
 function load(){let x={prev:'',percent:'',memo:''};try{x={...x,...JSON.parse(localStorage.getItem(key())||'{}')}}catch{}if(!String(x.memo||'').trim()){try{const y=JSON.parse(localStorage.getItem(P+'hypothesisGuide:'+prevDate())||'{}');if(String(y.memo||'').trim())x.memo=y.memo}catch{}}return x}
 function guide(x=load()){if(x.prev===''||x.percent==='')return'';const a=Number(x.prev),pc=Math.max(0,Math.min(100,Number(x.percent)));if(!Number.isFinite(a)||!Number.isFinite(pc))return'';const v=a*(1-pc/100),m=String(x.memo||'').trim();return '部門販買目安'+(Number.isInteger(v)?v:v.toFixed(1))+'万'+(m?'('+m+')':'')}
 function install(){const ta=q('dailyHypothesis');if(!ta||q('hypothesisGuideBox'))return;const box=document.createElement('div');box.id='hypothesisGuideBox';box.className='saved';box.style.marginTop='10px';box.innerHTML='<div class="twoCol"><div><label>前年部門実績（万円）</label><input id="prevDeptSales" type="number" step="0.1" inputmode="decimal"></div><div><label>除外する割合（%）</label><input id="prevDeptPercent" type="number" min="0" max="100" step="1" inputmode="decimal" placeholder="例：60"></div></div><div style="margin-top:9px"><label>補足メモ</label><input id="deptGuideMemo" type="text" placeholder="例：サプライ除く"></div><div id="deptGuidePreview" class="small" style="margin-top:8px"></div>';
 ta.insertAdjacentElement('afterend',box);const x=load(),a=q('prevDeptSales'),pc=q('prevDeptPercent'),m=q('deptGuideMemo'),r=q('deptGuidePreview');a.value=x.prev||'';pc.value=x.percent||'';m.value=x.memo||'';
 const save=()=>{const z={prev:a.value,percent:pc.value,memo:m.value};localStorage.setItem(key(),JSON.stringify(z));r.textContent=guide(z)||'前年実績から指定％を除いた金額を計算します';const line=guide(z);if(line){const cur=ta.value||'';const re=/^部門販買目安.*$/m;ta.value=re.test(cur)?cur.replace(re,line):(cur.trim()?cur.trimEnd()+'\n'+line:line);ta.dispatchEvent(new Event('input',{bubbles:true}))}};a.oninput=save;pc.oninput=save;m.oninput=save;r.textContent=guide(x)||'前年実績から指定％を除いた金額を計算します';
 }
 function codeToWord(c){c=Number(c);if(c===0||c===1)return'晴れ';if(c===2||c===3||c===45||c===48)return'曇り';return'雨'}
 async function weatherFor(lat,lon,ds){const today=new Date(),d=new Date(ds+'T00:00:00'),diff=(d-today)/86400000;const base=(diff>=-90&&diff<=16)?'https://api.open-meteo.com/v1/forecast':'https://archive-api.open-meteo.com/v1/archive';const u=base+'?latitude='+lat+'&longitude='+lon+'&start_date='+ds+'&end_date='+ds+'&daily=weather_code&timezone=Asia%2FTokyo';const j=await fetch(u).then(r=>r.json());return codeToWord(j.daily.weather_code[0])}
 async function fillWeatherIfBlank(){const ta=q('dailyHypothesis');if(!ta||ta.value.trim()||!dateEl||!dateEl.value)return;let loc=(q('weatherLocation')&&q('weatherLocation').value.trim())||localStorage.getItem(P+'weatherLocation')||'東京都';try{const g=await fetch('https://geocoding-api.open-meteo.com/v1/search?name='+encodeURIComponent(loc)+'&count=1&language=ja&format=json').then(r=>r.json());const z=g.results&&g.results[0];if(!z)return;const ds=dateEl.value,py=String(Number(ds.slice(0,4))-1)+ds.slice(4);const [now,prev]=await Promise.all([weatherFor(z.latitude,z.longitude,ds),weatherFor(z.latitude,z.longitude,py)]);const d=new Date(ds+'T00:00:00');ta.value=(d.getMonth()+1)+'月'+d.getDate()+'日\n本日 '+now+'\n前年 '+prev;ta.dispatchEvent(new Event('input',{bubbles:true}))}catch(e){console.warn('weather fill skipped',e)}}
 function defaultTokyo(){const w=q('weatherLocation');if(w&&!w.value.trim()){w.value='東京都';try{localStorage.setItem(P+'weatherLocation','東京都')}catch{}}}
 const ed=q('editMode');if(ed)new MutationObserver(()=>{install();setTimeout(fillWeatherIfBlank,50)}).observe(ed,{childList:true,subtree:true});
 setTimeout(()=>{defaultTokyo();install();fillWeatherIfBlank()},100);
 if(dateEl)dateEl.addEventListener('change',()=>setTimeout(()=>{defaultTokyo();install();fillWeatherIfBlank()},100));
})();
`;
const marker='</script>';
const i=s.lastIndexOf(marker);if(i<0)throw new Error('script end not found');s=s.slice(0,i)+addon+'\n'+s.slice(i);fs.writeFileSync(p,s);console.log('patched index.html');
