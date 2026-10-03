const $ = (q) => document.querySelector(q);
const $$ = (q) => [...document.querySelectorAll(q)];
const state = { step: 0, running: false, timer: null, view: 'logic' };
const steps = ['IDLE','TRIGGER','ECHO','CALCULATE','READ IR','DECIDE','LED OUTPUT','BUZZER OUTPUT','SERIAL REPORT'];

function values(){
  const distance = Number($('#distance').value);
  const ir = $('#irDetected').checked;
  const echoFault = $('#faultEcho').checked;
  const groundFault = $('#faultGround').checked;
  const pinFault = $('#faultPin').checked;
  const validDistance = echoFault ? null : distance;
  const alarm = validDistance !== null && validDistance <= 10 && ir && !groundFault;
  return {distance,ir,echoFault,groundFault,pinFault,validDistance,alarm};
}

function updateReadings(){
  const v=values();
  $('#distanceLabel').textContent=`${v.distance} cm`;
  $('#distanceOut').textContent=v.echoFault?'TIMEOUT':v.distance;
  $('#irOut').textContent=v.ir?'HIGH':'LOW';
  $('#decisionOut').textContent=v.echoFault?'INVALID':(v.alarm?'ALERT':'SAFE');
  const ledOn=v.alarm&&!v.pinFault;
  $('#actuatorOut').textContent=v.groundFault?'NO COMMON GND':(v.alarm?(v.pinFault?'BUZZER ONLY':'LED + BUZZER ON'):'OFF');
  $('#ledComp').classList.toggle('on',ledOn);
  $('#buzzerComp').classList.toggle('on',v.alarm);
  $('#virtualObject').style.left=`${Math.min(180,15+(v.distance-3)*4.4)}px`;
}

function log(text,kind='normal'){
  const p=document.createElement('p'); p.textContent=`> ${text}`;
  if(kind==='error')p.style.color='#ff8491'; if(kind==='alert')p.style.color='#ffd36b';
  $('#console').appendChild(p); $('#console').scrollTop=$('#console').scrollHeight;
}

function clearParticles(){ $('#particles').innerHTML=''; }
function particle(path,type='data',bit='1',duration=950){
  const p=document.createElement('i'); p.className=`packet ${type}`; p.dataset.bit=bit; $('#particles').appendChild(p);
  const paths={sensor:[[160,170],[340,190],[520,235]],ir:[[160,405],[350,370],[520,285]],led:[[550,245],[700,195],[850,140]],buzz:[[550,275],[710,315],[850,370]],power:[[105,80],[500,70],[890,80]],ground:[[890,470],[500,500],[105,475]]};
  const pts=paths[path]; p.style.left=pts[0][0]+'px';p.style.top=pts[0][1]+'px';
  const frames=pts.map((pt,i)=>({left:pt[0]+'px',top:pt[1]+'px',offset:i/(pts.length-1)}));
  const a=p.animate(frames,{duration,easing:'ease-in-out',fill:'forwards'}); a.onfinish=()=>p.remove();
}

function animateStep(step){
  clearParticles(); const v=values();
  if(state.view==='power'){
    if(v.groundFault){log('OPEN CIRCUIT: common ground is missing.', 'error');return;}
    particle('power','current','+',1100); setTimeout(()=>particle('ground','current','−',1100),180); return;
  }
  if(step===1)particle('sensor','command','1');
  if(step===2&&!v.echoFault)particle('sensor','data','1');
  if(step===4)particle('ir',v.ir?'high':'low',v.ir?'1':'0');
  if(step===6)particle('led','command',v.alarm?'1':'0');
  if(step===7)particle('buzz','command',v.alarm?'1':'0');
}

function executeStep(){
  state.step=state.step>=8?1:state.step+1;
  const v=values();
  $$('#code span, #journey li').forEach(el=>el.classList.toggle('active',Number(el.dataset.step)===state.step));
  $('#stepCounter').textContent=`Step ${state.step} of 8`; $('#phaseBadge').textContent=steps[state.step];
  animateStep(state.step);
  if(state.step===2&&v.echoFault)log('ECHO timeout after 30000 µs.', 'error');
  if(state.step===3&&!v.echoFault)log(`Distance calculated: ${v.distance} cm`);
  if(state.step===4)log(`IR input: ${v.ir?'HIGH':'LOW'}`);
  if(state.step===5)log(`Decision: ${v.alarm?'ALERT':'SAFE'}`,v.alarm?'alert':'normal');
  if(state.step===6&&v.pinFault)log('LED did not respond: output assigned to wrong pin.', 'error');
  if(state.step===8)log(`distance=${v.echoFault?'TIMEOUT':v.distance+'cm'}, IR=${v.ir?'HIGH':'LOW'}, output=${v.alarm?'ON':'OFF'}`);
  updateReadings();
}

function toggleRun(){
  state.running=!state.running; $('#runBtn').textContent=state.running?'Pause':'Run';
  $('#statusDot').classList.toggle('running',state.running); $('#simulationStatus').textContent=state.running?'Running':'Paused';
  if(state.running){executeStep();state.timer=setInterval(executeStep,1250)}else clearInterval(state.timer);
}
function reset(){clearInterval(state.timer);state.running=false;state.step=0;$('#runBtn').textContent='Run';$('#statusDot').classList.remove('running');$('#simulationStatus').textContent='Ready';$('#stepCounter').textContent='Step 0 of 8';$('#phaseBadge').textContent='IDLE';$$('#code span,#journey li').forEach(e=>e.classList.remove('active'));clearParticles();log('Simulation reset.');updateReadings()}

$('#runBtn').addEventListener('click',toggleRun); $('#stepBtn').addEventListener('click',executeStep); $('#resetBtn').addEventListener('click',reset);
$('#clearBtn').addEventListener('click',()=>$('#console').innerHTML='');
['distance','irDetected','faultEcho','faultGround','faultPin'].forEach(id=>$('#'+id).addEventListener('input',updateReadings));
$('#viewMode').addEventListener('change',e=>{state.view=e.target.value;$('#modeLabel').textContent=state.view==='logic'?'LOGIC VIEW':'ELECTRICAL VIEW';log(state.view==='logic'?'Logic and data flow selected.':'Electrical current view selected.');});
$('#angle').addEventListener('input',e=>$('#board').style.transform=`translate(-50%,-50%) rotateX(${e.target.value}deg) rotateZ(-1deg)`);
updateReadings();
