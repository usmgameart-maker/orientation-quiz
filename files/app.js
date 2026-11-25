(function(){
 'use strict';
 const D=window.GAME_DATA,scenes=D.scenes,E=window.GameEngine,A=window.SceneArt,main=document.querySelector('#main'),dialog=document.querySelector('#dialog'),dc=document.querySelector('#dialog-content');
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const image=n=>'files/images/'+n+'.png';
 let progress=E.fresh(scenes.length),storageOK=true,view='home',mapPage=0,notePage=0,memoryCard=0;
 try{progress=E.normalize(JSON.parse(localStorage.getItem(E.KEY)),scenes);}catch(e){storageOK=false;}
 let session={scene:progress.current,cursor:0,intro:true,panel:'scene',feedback:null,wrong:null,seq:[],picks:[],hint:false,showPlan:false};
 const done=i=>E.complete(progress,scenes,i),unlocked=i=>E.unlocked(progress,scenes,i),doneCount=()=>scenes.filter((s,i)=>unlocked(i)&&done(i)).length;
 const compact=()=>innerWidth<1100||innerHeight<740;
 function save(){try{localStorage.setItem(E.KEY,JSON.stringify(progress));storageOK=true;}catch(e){storageOK=false;}status();}
 function status(){document.querySelector('#note-count').textContent=doneCount()+'/'+scenes.length;document.querySelector('#save-status').textContent=storageOK?'Прогресс сохраняется в этом браузере':'Прогресс — только пока игра открыта';}
 function focusMain(){main.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
 function setView(v){view=v;render();focusMain();}
 function openScene(i,replay=false){if(!unlocked(i))return;progress.current=i;let cursor=replay?0:progress.steps[i];session={scene:i,cursor,intro:cursor===0,panel:'scene',feedback:null,wrong:null,seq:[],picks:[],hint:false,showPlan:false};save();setView('game');}
 function sprite(name,mode='normal',speaking=false){const full=name==='mira'?'Мира':name==='lev'?'Лев':'Анна Сергеевна';let src=name==='mira'?'mira-plan':name==='lev'?'lev-compass':'anna-plan';return `<span class="character ${name}" role="img" aria-label="${full}"><img src="${image(src)}" alt="" draggable="false">${speaking?'<span class="talk-bubble" aria-hidden="true"><i></i><i></i><i></i></span>':''}</span>`;}
 function cast(i,speaker='',home=false){return `<div class="cast cast-${scenes[i].id} ${home?'home-cast':''}">${['mira','lev','anna'].map(n=>sprite(n,'normal',speaker===({mira:'Мира',lev:'Лев',anna:'Анна Сергеевна'}[n]))).join('')}</div>`;}
 const hotspot=(id,label,x,y,w=12,h=24)=>`<button class="object-hit ${session.hint?'hinted':''} ${session.feedback&&session.answer===id?'selected':''}" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%" data-action="answer" data-id="${id}" aria-label="${label}"><span>${label}</span></button>`;
 function photo(i,task=null,home=false){const s=scenes[i],v=task?.visual,speaker=home?'':session.intro?'Анна Сергеевна':session.feedback?(task?.replySpeaker||''):task?.visual==='helper'&&!session.staffChat?'Лев':task?.speaker||'';let bg=v==='sunrise'?'sunrise':v==='sunset'?'sunset':s.image;
 let out=`<div class="scene scene-${s.id}"><img class="backdrop" src="${image(bg)}" alt="${esc(({school:'Школа за оградой, открытые ворота и тротуар',entrance:'Вход в сквер за улицей с пешеходным переходом',fork:'Подход к развилке: скамейка слева, часы справа, крыша павильона видна за кустами; дальняя аллея скрыта поворотом',detour:'Прямая аллея закрыта ограждением, справа открытый обход к павильону',where:'Площадка у часов на обходе; ограждение на закрытой прямой аллее остаётся видно позади',pavilion:'Павильон с выставкой рисунков и стендом для нового плана'})[s.id])}" draggable="false">`;
 if(v==='sunrise'||v==='sunset')out+='<span class="scene-tag">Учебный рисунок • смотрим на север</span>';
 else out+=cast(i,speaker,home);
 if(i===4&&!home){out+=staffHTML(speaker,task)+'<span class="scene-tag">Учебная ситуация • команда остаётся вместе</span>';}
 if(task&&!session.intro&&!session.feedback){
 if(v==='landmark')out+=hotspot('clock','Часы',82,22,10,33)+hotspot('bench','Скамейка',10,43,13,13)+hotspot('pavilion','Павильон',47,23,11,14);
 if(v==='barrier')out+=hotspot('clock','Часы',83,10,10,53)+hotspot('bench','Скамейка',6,45,21,24)+hotspot('barrier','Ограждение',40,49,24,18);
 if(task.id==='describe')out+=hotspot('clock','Большие часы',81,23,10,17)+hotspot('trees','Деревья',55,8,21,26)+hotspot('path','Дорожка',3,72,20,18);
 if(v==='crossing')out+=hotspot('crossing','Переход',49,66,33,14)+hotspot('road','Без перехода',14,67,27,12)+hotspot('gate','Ворота',47,34,35,24);
 if(v==='detour-path')out+=hotspot('straight','Закрытая аллея',40,49,24,18)+hotspot('right','Обход справа',68,52,14,11)+hotspot('left','К скамейке',26,54,15,11);
 }
 if(i===5&&(v==='publish'||home&&doneCount()===scenes.length))out+='<div class="notice-plan">'+A.plan({closed:true,bypass:true,route:'detour'})+'</div>';
 return out+'</div>';
 }
 function staffHTML(speaker,task){
  const speaking=speaker==='Сергей Павлович',inviting=task?.visual==='helper'&&!session.intro&&!session.feedback&&!session.staffChat;
  return '<button class="help-desk '+(inviting?'inviting':'')+'" data-action="staff" aria-label="'+(inviting?'Обратиться к Сергею Павловичу, сотруднику сквера':'Познакомиться с Сергеем Павловичем, сотрудником сквера')+'"><span class="staff-figure"><img src="'+image('park-staff')+'" alt="Сергей Павлович, сотрудник сквера">'+(speaking?'<span class="talk-bubble" aria-hidden="true"><i></i><i></i><i></i></span>':'')+'</span><span class="staff-sign"><b>Пункт помощи</b><small>Сотрудник сквера</small></span></button>';
 }
 // Состояние плана зависит от текущего шага истории, а не от прежних прохождений.
 function planState(i,task){
  if(i<3)return {closed:false,bypass:false};
  if(i>3)return {closed:true,bypass:true};
  const marked=session.cursor>0||task?.id==='barrier'&&!!session.feedback;
  const updated=!task||task.id==='update'&&!!session.feedback;
  return {closed:marked,bypass:updated};
 }
 function planVisual(task){
  const v=task.visual,stage=planState(session.scene,task),selected=v==='sequence'?session.seq:task.pickKeys?(session.feedback?task.pickKeys:session.picks):session.feedback?[session.answer]:[];
  return '<div class="scene schematic">'+A.plan({...stage,active:task.pickKeys||task.options.map(o=>o.id),interactive:!session.feedback,inspect:true,selected,route:v==='plan-route'?'original':stage.bypass&&(v==='sequence'&&session.feedback||v==='plan-detour'&&session.feedback)?'detour':false,paths:v==='plan-detour'&&!session.feedback})+(v==='sequence'?'<span class="sequence-count">Отмечено '+session.seq.length+' из '+task.sequence.length+'</span>':task.pickKeys?'<span class="sequence-count">Ориентиры: '+selected.length+' из '+task.pickKeys.length+'</span>':'')+'</div>';
 }
 function visual(i,task){
  const v=task?.visual;
  if(session.showPlan){const stage=planState(i,task);return '<div class="scene schematic">'+A.plan({...stage,inspect:true,route:stage.bypass?'detour':false})+'<span class="scene-tag">'+(stage.bypass?'Исправленный план • обход проверен':stage.closed?'Отмечено препятствие • обход ещё не нанесён':'Исходный план • до проверки дорожек')+'</span></div>';}
  if(!task||session.intro)return photo(i,task);
  if(['plan-start','plan-route','plan-landmarks','plan-detour','sequence'].includes(v))return planVisual(task);
  if(v==='compass'||v==='turn')return '<div class="scene schematic">'+A.compass(task,!!session.feedback)+'</div>';
  if(v==='tools')return '<div class="scene tools-scene"><div class="tool-cards">'+task.options.map(o=>'<button class="tool-card" data-action="answer" data-id="'+o.id+'" '+(session.feedback?'disabled':'')+'>'+A.symbol(o.id,110)+'<span>'+o.text+'</span></button>').join('')+'</div></div>';
  if(v==='map-choice')return '<div class="scene map-choice"><div class="picture-cards">'+task.options.map(o=>'<button class="picture-card" data-action="answer" data-id="'+o.id+'" '+(session.feedback?'disabled':'')+'>'+(o.id==='region'?A.region():o.id==='plan'?A.plan():'<img src="'+image(scenes[2].image)+'" alt="Рисунок сквера">')+'<span>'+o.text+'</span></button>').join('')+'</div></div>';
  return photo(i,task);
 }
 function sceneCaption(task){
  if(session.showPlan)return 'Нажимай на значки, чтобы рассмотреть план. Кнопка ниже вернёт к сцене.';
  if(session.intro)return 'Рассмотри место новой остановки.';
  if(!task)return 'Наблюдение сохранено.';
  if(session.feedback)return '✓ Решение проверено. Можно переходить дальше.';
  if(task.pickKeys)return 'Отметь часы и скамейку на плане или выбери ответ в панели.';
  if(task.sequence)return 'Отмечай места на плане по порядку.';
  if(task.visual==='helper')return session.staffChat?'Выбери просьбу о помощи в панели.':'Нажми на сотрудника или табличку, чтобы начать разговор.';
  if(task.id==='describe')return 'Нажми на подходящий ориентир или выбери описание в панели.';
  if(['landmark','barrier','crossing','detour-path','plan-start','plan-detour','tools','map-choice','compass','turn'].includes(task.visual))return 'Нажми на отмеченный объект, линию или кнопку либо выбери ответ в панели.';
  if(task.visual==='plan-route')return 'Рассмотри путь на плане. Ответ выбери в панели.';
  return 'Рассмотри иллюстрацию. Ответ выбери в панели.';
 }
 const button=(text,action,extra='',primary=false)=>`<button class="button ${primary?'primary':''}" data-action="${action}" ${extra}>${text}</button>`;
 function home(){const complete=doneCount()===scenes.length,started=progress.steps.some(Boolean);return `<section class="home-layout"><div class="home-copy"><p class="eyebrow">Think & Grow · Академия безопасности · Выпуск 2</p><h1>Безопасное<br>ориентирование</h1><p class="episode">План с поправкой</p><p class="lead">До выставки в сквере — несколько поворотов. Но на старом плане не отмечен ремонт. Помоги Мире и Льву проверить путь и найти открытый обход.</p><p class="home-meta">2 класс <span>·</span> 6 остановок <span>·</span> Без спешки</p><div class="hero-actions">${button(complete?'Открыть маршрут':started?'Продолжить путь':'Отправиться в сквер','start','',true)}${button('Маршрут','map')}</div><p class="small muted">Рассматривай рисунки, отмечай ориентиры и проверяй свои решения. Ошибку всегда можно исправить.</p>${started?'<button class="text-button" data-action="reset">Начать заново</button>':''}</div><div class="home-picture"><div class="scene home-cover" style="aspect-ratio:1682/935"><img class="backdrop" src="${image('cover-adventure')}" alt="Мира с планом, Лев с компасом и Анна Сергеевна перед открытой аркой осеннего сквера" draggable="false"></div><div class="picture-foot"><span>Мира, Лев и Анна Сергеевна</span><span>Путешествие начинается</span></div><div class="mission-strip">${A.symbol('compass',42)}<p><b>Наша задача</b><br>Дойти до павильона и составить безопасный план маршрута.</p></div></div></section>`;}
 function tabs(){return `<div class="view-tabs" role="group" aria-label="Вид задания"><button data-action="panel" data-panel="scene" aria-pressed="${session.panel==='scene'}">1. Рассмотреть</button><button data-action="panel" data-panel="question" aria-pressed="${session.panel==='question'}">2. Ответить</button></div>`;}
 function speakerLine(task){
 const name=task.speaker,key=({'Мира':'mira','Лев':'lev','Анна Сергеевна':'anna','Сергей Павлович':'staff'})[name];
 const diagram=['map-choice','tools','compass','turn','plan-start','plan-route','plan-landmarks','plan-detour','sequence'].includes(task.visual)||session.showPlan;
 return `<p class="speaker">${diagram&&!session.feedback?`<span class="speaker-portrait"><img src="${image(key==='mira'?'mira-plan':key==='lev'?'lev-compass':key==='staff'?'park-staff':'anna-plan')}" alt="${name}"><span class="talk-bubble" aria-hidden="true"><i></i><i></i><i></i></span></span>`:''}${esc(name)}</p>`;
}
function question(s,task){if(session.intro)return `<p class="speaker">Анна Сергеевна</p><h2>${s.title}</h2><p class="intro-copy">${esc(s.intro)}</p>${button('Начать наблюдение','begin','',true)}`;
 if(!task)return `<p class="eyebrow">Остановка пройдена</p><h2>Наблюдение в блокноте</h2><p class="summary-copy">${esc(s.note)}</p><div class="panel-actions">${button(session.scene===scenes.length-1?'Завершить маршрут':'Следующая остановка','next-scene','',true)}${button('Пройти ещё раз','replay')}</div>`;
 if(task.visual==='helper'&&!session.staffChat&&!session.feedback)return '<p class="speaker">Лев</p><h2>Телефона нет. К кому обратиться за помощью?</h2><p class="intro-copy">У часов работает Сергей Павлович. Он сотрудник сквера, с которым нас познакомила учительница. Нажми на него или на табличку «Пункт помощи», чтобы начать разговор.</p>'+button('Обратиться к сотруднику','staff','',true);
 const pickText=task.pickKeys?'<p class="sequence-progress">Ориентиры отмечены: '+(session.feedback?task.pickKeys.length:session.picks.length)+' из '+task.pickKeys.length+'</p>':'';
 const seqText=task.sequence?`<p class="sequence-progress">${session.seq.length?session.seq.map(id=>task.options.find(o=>o.id===id).text).join(' → '):'Начни со школьных ворот.'}</p>`:'';
 return `${speakerLine(session.feedback&&task.replySpeaker?{...task,speaker:task.replySpeaker}:task)}<h2 id="question-title">${esc(task.prompt)}</h2>${task.symbol?'<div class="legend-chip">'+A.symbol(task.symbol,45)+'<span>Условный знак из легенды</span></div>':''}${seqText}${pickText}<div class="options">${task.options.map((o,k)=>`<button class="option ${session.wrong===o.id?'wrong':''} ${session.feedback&&session.answer===o.id?'correct':''} ${session.seq.includes(o.id)?'checked':''}" data-action="answer" data-id="${o.id}" ${session.feedback||session.seq.includes(o.id)?'disabled':''}><span class="option-marker">${session.seq.includes(o.id)?'✓':String.fromCharCode(1040+k)}</span><span>${esc(o.text)}</span></button>`).join('')}</div>${session.feedback?`<div class="feedback good" role="status"><b>Верно. Проверим, почему.</b><p>${esc(task.success)}</p>${task.reply?`<div class="staff-reply"><b>${esc(task.replySpeaker)}</b><p>«${esc(task.reply)}»</p></div>`:''}</div>${button('Дальше','next','',true)}`:session.wrong?`<div class="feedback retry" role="status"><b>Посмотри ещё раз</b><p>${esc(task.sequence?'Проверь порядок: '+task.hint:task.options.find(o=>o.id===session.wrong)?.why||task.hint)}</p></div>`:''}${session.hint&&!session.feedback?`<div class="hint-copy" role="status">${esc(task.hint)}</div>`:''}`;
 }
 function game(){const i=session.scene,s=scenes[i],task=s.tasks[session.cursor],summary=!session.intro&&!task;return `<section class="game-shell ${compact()?'compact':''}" data-panel="${session.panel}"><div class="game-head"><span class="eyebrow">Остановка ${i+1} из ${scenes.length}</span><div class="scene-dots" aria-label="Остановки">${scenes.map((s,k)=>`<button data-action="scene" data-index="${k}" class="${k===i?'active':''} ${unlocked(k)&&done(k)?'done':''}" aria-label="${unlocked(k)?esc(s.title):'Остановка '+(k+1)+' — ещё закрыта'}" ${!unlocked(k)?'disabled':''} ${k===i?'aria-current="step"':''}>${unlocked(k)&&done(k)?'✓':k+1}</button>`).join('')}</div></div><div class="scene-topline"><h1>${s.title}</h1><span>${session.intro?'История':summary?'Готово':`Наблюдение ${session.cursor+1} из ${s.tasks.length}`}</span></div>${tabs()}<p class="scene-brief">${esc(session.intro?s.intro:task?.visual==='helper'&&!session.staffChat&&!session.feedback?'Телефона нет. Нажми на сотрудника у таблички «Пункт помощи», чтобы обратиться за помощью.':task?.prompt||s.note)}</p><div class="game-layout"><div class="scene-column"><div class="scene-frame">${visual(i,task)}<p class="scene-caption">${sceneCaption(task)}</p></div><div class="scene-tools">${task&&!session.intro?button(session.hint?'Скрыть подсказку':'Подсказка','hint'):''}${button(session.showPlan?'Вернуться к заданию':'План квартала','toggle-plan')}${button('История остановки','story')}${i===4?button('Памятка «Если потерялся»','memory'):''}</div></div><div class="question-panel" aria-label="Задание и объяснение">${question(s,task)}</div></div></section>`;}
 function pager(action,page,pages){return pages<=1?'':`<div class="pager">${button('← Назад',action,`data-page="${page-1}" ${page===0?'disabled':''}`)}<span>${page+1} / ${pages}</span>${button('Дальше →',action,`data-page="${page+1}" ${page===pages-1?'disabled':''}`)}</div>`;}
 function cards(type){
 const note=type==='notebook',page=note?notePage:mapPage,limit=innerWidth<600?2:6,pages=Math.ceil(scenes.length/limit),safePage=Math.min(page,pages-1),start=safePage*limit;if(note)notePage=safePage;else mapPage=safePage;
 const placeholder='<div class="locked-preview" aria-hidden="true"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 28v-9a12 12 0 0 1 24 0v9"/><rect x="13" y="28" width="38" height="29" rx="7"/><circle cx="32" cy="41" r="3"/><path d="M32 44v6"/></svg><span>Ещё впереди</span></div>';
 const cards=scenes.slice(start,start+limit).map((s,k)=>{
  const i=start+k,closed=!unlocked(i),waitingForNote=note&&!done(i);
  const title=closed?'Остановка '+(i+1):s.title;
  const description=closed?'Откроется после завершения предыдущей остановки.':note?(waitingForNote?'Пройди остановку, чтобы сохранить свой вывод.':s.note):s.short;
  const preview=closed?placeholder:'<img src="'+image(s.image)+'" alt="'+esc(s.title)+'">';
  const action=closed?'<button class="button" disabled>Пока закрыта</button>':button(note?(waitingForNote?'Перейти к остановке':'Рассмотреть заметку'):'Открыть остановку',note&&!waitingForNote?'note':'scene','data-index="'+i+'"');
  return '<article class="route-card'+(closed?' locked':'')+'">'+preview+'<div class="card-body"><span class="eyebrow">'+(i+1)+'. '+(closed?'Ещё закрыта':done(i)?'Пройдено':'Доступно')+'</span><h2>'+esc(title)+'</h2><p>'+esc(description)+'</p>'+action+'</div></article>';
 }).join('');
 return '<section class="collection"><div class="collection-head"><p class="eyebrow">'+(note?'Собранные наблюдения':'Шесть остановок одной истории')+'</p><h1>'+(note?'Блокнот исследователя':'Маршрут в сквер')+'</h1><p>'+(note?'Открывай заметки после каждой пройденной остановки.':'Остановки открываются по порядку. Любую открытую остановку можно посетить и пройти ещё раз.')+'</p></div><div class="cards '+(note?'notes':'')+'">'+cards+'</div>'+pager(note?'note-page':'map-page',safePage,pages)+(note?'<div class="notebook-extra">'+A.symbol('compass',42)+'<p><b>Солнце и стороны горизонта</b><br>Два учебных рисунка одного сквера: восход и закат.</p>'+button('Открыть рисунки','solar')+'</div><div class="memory-entry"><span aria-hidden="true">5</span><p><b>Если потерялся</b><br>Пять иллюстрированных карточек: прочитать, сохранить или распечатать.</p>'+button('Открыть памятку','memory')+'</div>':'')+'</section>';
 }
 function ending(){return `<section class="ending"><div><p class="eyebrow">Маршрут завершён · ${doneCount()} / ${scenes.length}</p><h1>План с поправкой<br>готов к прогулке</h1><p class="lead">Мира и Лев дошли до выставки вместе с Анной Сергеевной. Исправленный план теперь висит у павильона: на нём отмечены ремонт, открытый обход и заметные ориентиры.</p><div class="hero-actions">${button('Открыть блокнот','notebook','',true)}${button('Пройти другой участок','map')}</div></div><div class="scene-frame">${photo(5,null,true)}</div></section>`;}
 function render(){main.innerHTML=view==='home'?home():view==='game'?game():view==='map'||view==='notebook'?cards(view):view==='memory'?window.SafetyCards.render(memoryCard):ending();status();document.querySelectorAll('nav [data-action]').forEach(el=>el.setAttribute('aria-current',el.dataset.action===view?'page':'false'));}
 let returnFocus=null;
 function showDialog(title,body){returnFocus=document.activeElement;dc.innerHTML=`<h2 id="dialog-title">${title}</h2>${body}`;dialog.showModal();}
 function closeDialog(){dialog.close();if(returnFocus?.isConnected)returnFocus.focus();}
 function showNote(i){if(!unlocked(i)||!done(i))return;const s=scenes[i];showDialog(s.title,`<img class="dialog-image" src="${image(s.image)}" alt="${esc(s.title)}"><p class="note-text">${esc(s.note)}</p>${button('Вернуться к остановке','dialog-scene',`data-index="${i}"`)}`);}
 function answer(id){if(view!=='game'||session.intro||session.feedback )return;const s=scenes[session.scene],task=s.tasks[session.cursor];if(!task||task.visual==='helper'&&!session.staffChat)return;
 if(task.pickKeys&&task.pickKeys.includes(id)){
  if(session.picks.includes(id))return;
  session.picks.push(id);session.wrong=null;
  if(session.picks.length<task.pickKeys.length){render();focusAfterAnswer(false);return;}
  id=task.pickAnswer;
 }
 const option=task.options.find(o=>o.id===id);if(!option)return;
 if(option.correct&&task.pickKeys)session.picks=[...task.pickKeys];
 let correct=!!option.correct;if(task.sequence){if(session.seq.includes(id))return;correct=id===task.sequence[session.seq.length];if(correct){session.seq.push(id);session.wrong=null;if(session.seq.length<task.sequence.length){render();focusAfterAnswer(false);return;}}}
 session.wrong=correct?null:id;session.answer=id;session.hint=false;
 if(correct){session.feedback=true;progress=E.mark(progress,scenes,session.scene,session.cursor);save();session.panel='question';}
 else if(compact())session.panel='question';render();focusAfterAnswer(correct);
 }
 function focusAfterAnswer(correct){const target=correct?main.querySelector('[data-action="next"]'):main.querySelector('.feedback')||main.querySelector('.map-point[aria-pressed=' + String.fromCharCode(34) + 'false' + String.fromCharCode(34) + ']');if(target){target.setAttribute('tabindex','-1');target.focus({preventScroll:true});if(compact())target.scrollIntoView({block:'nearest'});}}
 document.addEventListener('click',e=>{const el=e.target.closest('[data-action]');if(!el||el.disabled)return;const act=el.dataset.action,i=Number(el.dataset.index);switch(act){
 case'home':setView('home');break;
 case'memory':if(dialog.open)closeDialog();memoryCard=0;setView('memory');break;
 case'memory-card':if(view==='memory'&&Number.isInteger(i)&&i>=0&&i<window.SafetyCards.cards.length){memoryCard=i;render();focusMain();}break;case'map':setView('map');break;case'notebook':setView('notebook');break;
 case'start':if(doneCount()===scenes.length)setView('map');else{let i=progress.current;if(done(i)){i=scenes.findIndex((s,k)=>!done(k));}openScene(i);}break;
 case'scene':openScene(i);break;case'replay':openScene(session.scene,true);break;
 case'begin':session.intro=false;session.panel='scene';render();focusMain();break;
 case'answer':answer(el.dataset.id);break;
 case'inspect-map':{
  if(view!=='game')break;
  const info={school:['Школьные ворота','Отсюда началась прогулка. На плане школа находится ниже входа в сквер.'],entrance:['Вход в сквер','К нему ведут тротуар и пешеходный переход. Здесь начинается дорожка к развилке.'],fork:['Развилка','Здесь дорожки расходятся: к скамейке, часам и павильону.'],bench:['Синяя скамейка','Постоянный заметный ориентир у развилки.'],clock:['Большие часы','Заметный ориентир справа от развилки. По часам можно узнать своё место на плане.'],pavilion:['Павильон','Наша цель — выставка рисунков. Путь к ней проверяем на месте.']};
  const item=info[el.dataset.id];if(item)showDialog(item[0],'<p>'+item[1]+'</p>');break;
 }
 case'staff':{
  if(view!=='game'||scenes[session.scene].id!=='where')break;
  const task=scenes[session.scene].tasks[session.cursor];
  if(task?.visual==='helper'&&!session.intro&&!session.feedback){session.staffChat=true;session.showPlan=false;session.panel='question';render();focusMain();}
  else showDialog('Сергей Павлович — сотрудник сквера','<p>«Здравствуйте! Я помогаю посетителям: подсказываю дорогу и помогаю связаться с близкими. Табличка “Пункт помощи” показывает, где меня найти».</p><p>Ребята вместе с учительницей разыгрывают учебную ситуацию. В нашей истории никто не потерялся.</p>');
  break;
 }
 case'next':if(!session.feedback)return;session.cursor++;session.staffChat=false;session.feedback=null;session.wrong=null;session.answer=null;session.seq=[];session.picks=[];session.hint=false;session.showPlan=false;session.panel=session.cursor>=scenes[session.scene].tasks.length?'question':'scene';render();focusMain();break;
 case'next-scene':if(session.scene===scenes.length-1){if(doneCount()===scenes.length)setView('ending');else setView('map');}else openScene(session.scene+1);break;
 case'panel':session.panel=el.dataset.panel;render();break;
 case'hint':session.hint=!session.hint;session.panel='question';render();break;
 case'toggle-plan':session.showPlan=!session.showPlan;session.panel='scene';render();break;
 case'story':showDialog(scenes[session.scene].title,`<p>${esc(scenes[session.scene].intro)}</p>`);break;
 case'about':showDialog('Об игре','<p>Академия безопасности. Выпуск 2 — «Безопасное ориентирование». История «План с поправкой» для 2 класса.</p><p>Рассматривай рисунок и выбирай действие на нём или в панели ответов. В компактном окне переключай «Рассмотреть / Ответить». Подсказки и повторные попытки свободные.</p><p>Остановки открываются по порядку после завершения предыдущей. К любой открытой остановке можно вернуться через маршрут. Прогресс сохраняется только в этом браузере. Игра работает без интернета; она помогает обсудить прогулку со взрослым.</p>');break;
 case'note':showNote(i);break;case'dialog-scene':closeDialog();openScene(i);break;
 case'map-page':mapPage=Number(el.dataset.page);render();focusMain();break;case'note-page':notePage=Number(el.dataset.page);render();focusMain();break;
 case'solar':showDialog('Восход и закат','<div class="solar-pair"><figure><img src="'+image('sunrise')+'" alt="Солнце восходит справа, на востоке"><figcaption>Восход — примерно на востоке</figcaption></figure><figure><img src="'+image('sunset')+'" alt="Солнце заходит слева, на западе"><figcaption>Закат — примерно на западе</figcaption></figure></div><p>В обоих рисунках мы смотрим на север: восток справа, запад слева. Место восхода и захода меняется в течение года. В игре направления проверяем по компасу.</p>');break;
 case'reset':showDialog('Начать заново?','<p>Удалятся только наблюдения и прогресс игры «Безопасное ориентирование» в этом браузере.</p><div class="hero-actions">'+button('Сохранить прогресс','close-dialog','',true)+button('Начать заново','confirm-reset')+'</div>');break;
 case'confirm-reset':progress=E.fresh(scenes.length);save();closeDialog();setView('home');break;
 case'close-dialog':closeDialog();break;
 }});
 document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('svg [data-action][role="button"]')){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog();}});
 let lastCompact=compact(),lastNarrow=innerWidth<600;addEventListener('resize',()=>{const c=compact(),n=innerWidth<600;if(c!==lastCompact||n!==lastNarrow){lastCompact=c;lastNarrow=n;render();}});
 render();
})();

