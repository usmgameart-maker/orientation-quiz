/* Геометрия схем и условных знаков. Все подписи — отдельный векторный текст. */
(function(){
 const S={clock:'<path d="M0 20V55M-10 55h20"/><circle cy="0" r="24" fill="#fff9e7"/><path d="M0-15V0L12 7"/>',bench:'<path d="M-32-15h64v24h-64z" fill="#3b85c4"/><path d="M-35 15h70v9h-70z" fill="#3b85c4"/><path d="M-25 24v13M25 24v13M-30-4h60"/>',pavilion:'<path d="M-36-10 0-37 36-10Z" fill="#249f98"/><path d="M-27-10v43h54v-43M-12-10v43M12-10v43M-30 33h60" fill="#f4d598"/>',school:'<path d="M-40-17H40V35H-40Z" fill="#f4cd88"/><path d="M-48-17 0-41 48-17Z" fill="#318a81"/><path d="M-8 35V10H8v25M-29-2h12v12h-12ZM17-2H29v12H17Z" fill="#fffdf2"/>',entrance:'<path d="M-34 35v-60M34 35v-60M-34-25H34M-27 35v-42M27 35v-42M-40 35h80"/><path d="M-27-7 0-20 27-7"/>',fork:'<path d="M0 37V0M0 0-30-25M0 0 30-25M0 0v-36" stroke-width="12"/>',compass:'<circle r="35" fill="#fff5d5"/><path d="M0-29 10 7 0 0-10 7Z" fill="#c75b47"/><path d="M0 29 10-7 0 0-10-7Z" fill="#37577a"/>',watch:'<path d="M-14-37h28v74h-28Z" fill="#c69a6a"/><circle r="26" fill="#fff7df"/><path d="M0-15V0l12 7"/>',thermometer:'<path d="M-9 16v-45a9 9 0 0 1 18 0v45a18 18 0 1 1-18 0Z" fill="#fff5dd"/><path d="M0-18v43" stroke="#c75b47" stroke-width="7"/><circle cy="30" r="8" fill="#c75b47"/>'};
 const symbol=(key,size=64)=>`<svg viewBox="-52 -56 104 116" width="${size}" height="${size}" aria-hidden="true"><g fill="none" stroke="#294a50" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${S[key]||S.fork}</g></svg>`;
 const points={school:[160,416],entrance:[450,347],fork:[450,238],bench:[175,190],clock:[700,205],pavilion:[450,88]};
 const labels={school:'Школа',entrance:'Вход',fork:'Развилка',bench:'Скамейка',clock:'Часы',pavilion:'Павильон'};
 function plan({active=[],selected=[],route=false,closed=false,bypass=false,interactive=false,paths=false,old=false,inspect=false}={}){
 // Исходный план: три направления без замкнутого обхода. Связь часов с павильоном добавляется после проверки пути.
 const knownBypass=bypass&&!old,showClosure=closed&&!old;
 const mainPath='M160 416H450V347V238M450 238 175 190M450 238V88M450 238Q700 300 700 205';
 const bypassPath='M700 205Q700 88 450 88';
 let out='<svg class="plan-svg" viewBox="0 0 900 500" role="group" aria-label="План квартала"><rect width="900" height="500" rx="14" fill="#fff9e9"/><rect x="85" y="30" width="730" height="330" rx="65" fill="#dce9bd"/><path d="M60 385H840" stroke="#b6b3a7" stroke-width="38"/><path d="M60 385H840" stroke="#fff8df" stroke-dasharray="18 14" stroke-width="3"/><path d="'+mainPath+'" fill="none" stroke="#dccba0" stroke-width="27" stroke-linecap="round" stroke-linejoin="round"/>';
 if(knownBypass)out+='<path data-plan-layer="bypass" d="'+bypassPath+'" fill="none" stroke="#dccba0" stroke-width="27" stroke-linecap="round"/>';
 out+='<path d="M430 370h40m-40 9h40m-40 9h40m-40 9h40" stroke="white" stroke-width="6"/>';
 if(route){const d=route==='original'?'M160 416H450V347V88':'M160 416H450V347V238Q700 300 700 205Q700 88 450 88';out+='<path data-plan-layer="'+(route==='original'?'original-route':'detour-route')+'" d="'+d+'" fill="none" stroke="#167469" stroke-width="8" stroke-dasharray="13 7"/>';}
 if(showClosure)out+='<g data-plan-layer="barrier" stroke="#ac4f3e" stroke-width="8"><path d="M426 150 474 180M474 150 426 180"/></g><text x="485" y="169" font-family="Segoe UI,Arial" font-size="16" fill="#8e493a">Ремонт</text>';
 if(paths){const lines={straight:'M450 238V88',right:'M450 238Q700 300 700 205Q700 88 450 88',left:'M450 238 175 190'};for(const [key,d]of Object.entries(lines))out+='<g role="button" tabindex="0" data-action="answer" data-id="'+key+'" aria-label="'+({straight:'Линия по прямой аллее',right:'Линия через часы',left:'Линия к скамейке'})[key]+'" class="map-path"><path d="'+d+'" stroke="transparent" stroke-width="45" fill="none"/><path d="'+d+'" fill="none" stroke="#4c80a0" stroke-width="9" stroke-dasharray="12 6"/></g>';}
 for(const [key,[x,y]]of Object.entries(points)){
  const answer=interactive&&active.includes(key),click=answer||inspect,chosen=selected.includes(key),disabled=answer&&chosen;
  out+='<g transform="translate('+x+' '+y+')" '+(click?'role="button" tabindex="'+(disabled?-1:0)+'" data-action="'+(answer?'answer':'inspect-map')+'" data-id="'+key+'" aria-label="'+labels[key]+'" class="map-point" aria-pressed="'+chosen+'" '+(disabled?'aria-disabled="true"':''):'')+'><circle r="'+(key==='fork'?32:39)+'" fill="'+(chosen?'#c1dfb0':'#fff9e7')+'" stroke="'+(chosen?'#197566':'#9eab8a')+'" stroke-width="2"/><g transform="scale(.63)" fill="none" stroke="#294a50" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">'+S[key]+'</g><text y="'+(key==='school'?55:52)+'" text-anchor="middle" font-family="Segoe UI,Arial" font-size="17" fill="#294a50">'+labels[key]+'</text>'+(chosen?'<circle cx="30" cy="-26" r="13" fill="#197566"/><path d="m24-26 4 4 8-9" stroke="white" fill="none" stroke-width="3"/>':'')+'</g>';
 }
 out+='<g transform="translate(843 77)" fill="#294a50" font-family="Segoe UI,Arial" text-anchor="middle" font-size="18"><path d="M0 40V-25m0 0-9 16m9-16 9 16" stroke="#294a50" stroke-width="3"/><text y="-35">С</text><text x="-26" y="18">З</text><text x="26" y="18">В</text><text y="64">Ю</text></g><text x="847" y="472" text-anchor="end" font-family="Segoe UI,Arial" font-size="17" fill="#66765e">Схематический план • вид сверху</text></svg>';
 return out;
 }
 function compass(task,resolved=false){const turn=task.visual==='turn',labels={north:'С',south:'Ю',west:'З',east:'В'},coords={north:[450,64],south:[450,440],west:[260,250],east:[640,250]};let html='<div class="compass-board"><svg viewBox="0 0 900 500" aria-hidden="true"><rect width="900" height="500" fill="#fff9e9"/><circle cx="450" cy="250" r="150" fill="#f1e8cc" stroke="#bda877" stroke-width="5"/><circle cx="450" cy="250" r="130" fill="#fffaf0" stroke="#d6c8a6"/><path d="M450 107V393M307 250H593" stroke="#c7bea5" stroke-width="2" stroke-dasharray="7 7"/>'+(turn?'':'<path d="m450 117 24 141-24-15-24 15Z" fill="#c15b47"/><path d="m450 383 24-141-24 15-24-15Z" fill="#3f6382"/><circle cx="450" cy="250" r="10" fill="#d4bc75"/>')+'</svg>';
 if(turn)html+='<span class="back-lev" role="img" aria-label="Лев со спины, лицом к северу"></span>';
 // Названия направлений раскрываются только после верного ответа текущего задания.
 const positions={north:'Верхняя отметка',south:'Нижняя отметка',west:'Левая отметка',east:'Правая отметка'};
 const directions={north:'север',south:'юг',west:'запад',east:'восток'};
 for(const [key,[x,y]]of Object.entries(coords)){
  const text=resolved?labels[key]:'•';
  const accessibleLabel=positions[key]+(resolved?' — '+directions[key]:'');
  html+=`<button class="compass-point ${resolved&&key===task.target?'correct':''}" style="left:${x/9}%;top:${y/5}%" data-action="answer" data-id="${key}" aria-label="${accessibleLabel}" ${resolved||!task.options.some(o=>o.id===key)?'disabled':''}>${text}</button>`;
 }
 return html+'</div>';
 }
 const region=()=>'<svg viewBox="0 0 360 210" aria-hidden="true"><rect width="360" height="210" fill="#dce7c6"/><path d="M0 140Q100 5 180 120T360 55" fill="none" stroke="#82bdd0" stroke-width="15"/><path d="M45 0 90 210M0 65 360 140M200 0 160 210M320 0 255 210" stroke="#fff6d9" stroke-width="7"/><g fill="#4f7d73"><circle cx="80" cy="80" r="10"/><circle cx="210" cy="120" r="10"/><circle cx="280" cy="55" r="10"/></g><g font-family="Segoe UI,Arial" font-size="15" fill="#294a50"><text x="95" y="70">Северный</text><text x="225" y="145">Лесной</text><text x="225" y="35">Озёрный</text></g></svg>';
 window.SceneArt={symbol,plan,compass,region};
})();


