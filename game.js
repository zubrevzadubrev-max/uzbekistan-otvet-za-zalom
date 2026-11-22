"use strict";
const questions = [
  ["Какие три государственных символа Республики Узбекистан вы знаете?", "Государственный флаг, Государственный герб и Государственный гимн.", "hero"],
  ["Как называется официальный музыкально-поэтический символ государства?", "Государственный гимн Республики Узбекистан.", "dome"],
  ["Какие образы можно увидеть на Государственном гербе?", "Птицу Хумо с раскрытыми крыльями, солнце, горы, реки, колосья пшеницы и ветви хлопчатника.", "arch"],
  ["Почему изображение Государственного флага нельзя произвольно изменять в учебном проекте?", "Вид флага установлен законом. Чтобы изобразить его точно, нужно сохранить цвета, пропорции и расположение полумесяца и звёзд.", "flag"],
  ["Какие источники помогут проверить официальную информацию?", "Конституция Республики Узбекистан, тексты законов в базе LexUZ и правительственный портал gov.uz.", "hero"]
];
const el = id => document.getElementById(id);
let position = -1, revealed = false, ctx, interval, beat = 0;
function syncMusic() {
  clearInterval(interval);
  if (position < 0 || position >= questions.length || el("menu").open || !el("music").checked) {
    if (ctx) ctx.suspend();
    return;
  }
  if (!window.AudioContext) return;
  ctx ||= new AudioContext();
  ctx.resume().catch(()=>{});
  function note() {
    const osc=ctx.createOscillator(), gain=ctx.createGain(), t=ctx.currentTime;
    osc.frequency.value=[293.66,440,369.99,493.88,329.63,392,440,369.99][beat++ % 8];
    gain.gain.setValueAtTime(.0001,t);
    gain.gain.exponentialRampToValueAtTime(.034,t+.09);
    gain.gain.exponentialRampToValueAtTime(.0001,t+1.45);
    osc.connect(gain);gain.connect(ctx.destination);osc.start(t);osc.stop(t+1.5);
    osc.onended=()=>{osc.disconnect();gain.disconnect()};
  }
  note();interval=setInterval(note,1050);
}
function render() {
  const playing=position>=0 && position<questions.length;
  let copy,photo="hero",action;
  if (playing) {
    const [question,answer,image]=questions[position];
    photo=image;
    copy='<div class="eyebrow">Вопрос '+(position+1)+' / 5</div><h2>'+question+'</h2>';
    if(revealed) copy+='<div class="answer"><b>Правильный ответ</b>'+answer+'</div>';
    action=revealed?(position===4?"Завершить":"Дальше"):"Проверить ответ";
  } else if(position<0) {
    copy='<div class="eyebrow">Устная викторина</div><h1>Узбекистан<br><em>вслух</em></h1><p class="lead">Пять вопросов о символах страны. Обсудите каждый с залом, затем откройте ответ.</p>';
    action="Начать игру";
  } else {
    copy='<div class="eyebrow">5 вопросов пройдено</div><h1>Спасибо<br><em>за игру!</em></h1>';
    action="Сыграть ещё раз";
  }
  el("stage").innerHTML='<section class="layout '+(playing?'play':'')+'"><div class="panel">'+copy+'<div class="actions"><button class="primary" id="action">'+action+'</button></div></div><figure><img src="photos/'+photo+'.jpg" alt=""></figure></section>';
  el("status").textContent=playing?(revealed?"Ответ открыт":"Обсудите ответ вслух"):"Государственные символы";
  el("track").innerHTML=questions.map((_,i)=>'<i class="'+(i<=position?'on':'')+'"></i>').join("");
  el("action").onclick=advance;
}
function advance(){
  if(el("menu").open)return;
  if(position<0 || position===questions.length){position=0;revealed=false;syncMusic()}
  else if(!revealed){revealed=true}
  else {position++;revealed=false;if(position===questions.length)syncMusic()}
  render();el("action").focus({preventScroll:true});
}
el("pause").onclick=()=>{el("menu").showModal();syncMusic()};
el("resume").onclick=()=>el("menu").close();
el("menu").onclose=syncMusic;
el("screen").onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{el("screen").textContent="Для полного экрана нажмите F11"}};
document.onfullscreenchange=()=>{el("screen").textContent=document.fullscreenElement?"Выйти из полного экрана":"На весь экран"};
document.addEventListener("keydown",e=>{if(e.repeat && (e.key==="Enter" || e.key===" ")){e.preventDefault();return}if(e.key==="Escape" && !el("menu").open){e.preventDefault();el("pause").click()}});
render();
