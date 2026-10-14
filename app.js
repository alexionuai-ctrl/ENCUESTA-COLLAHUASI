'use strict';
const CFG = window.APP_CONFIG || {};
const IS_LIVE = !!(CFG.supabaseUrl && CFG.supabasePublishableKey && window.supabase);
const db = IS_LIVE ? window.supabase.createClient(CFG.supabaseUrl, CFG.supabasePublishableKey) : null;
const $ = id => document.getElementById(id);
const definitions = {
  reason: [
    {v:'aprendices',t:'Programa Aprendices'},
    {v:'practicas_collahuasi',t:'Prácticas profesionales o memorias en Collahuasi'},
    {v:'informacion_fundacion',t:'Conocer la Fundación y sus iniciativas'},
    {v:'otro',t:'Otro motivo (especificar)'}
  ],
  familiarity: [
    {v:'1',t:'No sabía que existía'},
    {v:'2',t:'Solo conocía su nombre'},
    {v:'3',t:'Sabía, en general, a qué se dedica'},
    {v:'4',t:'Conocía algunas iniciativas o programas'},
    {v:'5',t:'Conocía bien su trabajo'},
    {v:'0',t:'No recuerdo'}
  ],
  clarity: [
    {v:'1',t:'Nada clara'},
    {v:'2',t:'Poco clara'},
    {v:'3',t:'Medianamente clara'},
    {v:'4',t:'Bastante clara'},
    {v:'5',t:'Completamente clara'},
    {v:'0',t:'No recibí orientación'}
  ],
  image: [
    {v:'1',t:'Muy negativa'},
    {v:'2',t:'Más negativa que positiva'},
    {v:'3',t:'Ni positiva ni negativa'},
    {v:'4',t:'Más positiva que negativa'},
    {v:'5',t:'Muy positiva'},
    {v:'0',t:'No tengo suficiente información para evaluarla'}
  ],
  gender: [
    {v:'mujer',t:'Mujer'},
    {v:'hombre',t:'Hombre'},
    {v:'otra_identidad',t:'Otra identidad'},
    {v:'prefiero_no_responder',t:'Prefiero no responder'}
  ]
};
const mount = {reason:'reason-options',familiarity:'knowledge-options',clarity:'clarity-options',image:'image-options',gender:'gender-options'};
function el(tag,cls,text){const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x;}
for (const [name, opts] of Object.entries(definitions)) {
  const root=$(mount[name]);
  for (const op of opts) {
    const l=el('label','choice');
    const r=el('input');
    r.type='radio';r.name=name;r.value=op.v;r.required=true;
    const dot=el('span','radio-visual');dot.setAttribute('aria-hidden','true');
    l.append(r,dot,el('span','choice-text',op.t));
    root.append(l);
  }
}
function getValue(name){return document.querySelector(`input[name="${name}"]:checked`)?.value || '';}
function numericAge(){const x=$('age-years');if(x.value.trim()==='')return null;const n=Number(x.value);return Number.isInteger(n)&&n>=14&&n<=100?n:NaN;}
function ageBracket(n){if(n===null)return 'sin_respuesta';if(n<18)return 'menor_18';if(n<=24)return '18_24';if(n<=34)return '25_34';if(n<=44)return '35_44';if(n<=54)return '45_54';return '55_mas';}
function ageComplete(){return $('age-optout').checked||($('age-years').value.trim()!==''&&Number.isInteger(numericAge()));}
function progress(){
  const reasonOk=getValue('reason') && (getValue('reason')!=='otro'||$('reason-other').value.trim().length>=3);
  const n=['familiarity','clarity','image','gender'].filter(getValue).length + Number(!!reasonOk) + Number(ageComplete());
  $('progress-fill').style.width=`${(n/6)*100}%`;
  $('form-panel').querySelector('.section-number').textContent=`${String(n).padStart(2,'0')} / 06`;
}
function conditionalReason(){const show=getValue('reason')==='otro';$('reason-other-wrap').classList.toggle('hidden',!show);$('reason-other').required=show;if(!show)$('reason-other').value='';}
document.querySelectorAll('input[type="radio"]').forEach(input=>input.addEventListener('change',()=>{conditionalReason();progress();}));
$('reason-other').addEventListener('input',progress);
$('age-years').addEventListener('input',()=>{if($('age-years').value!=='')$('age-optout').checked=false;progress();});
$('age-optout').addEventListener('change',()=>{$('age-years').disabled=$('age-optout').checked;if($('age-optout').checked)$('age-years').value='';progress();});
function notice(id,msg){const a=$(id);a.textContent=msg;a.classList.remove('hidden');}
function hideNotice(id){$(id).classList.add('hidden');}
if(!IS_LIVE) $('demo-banner').classList.remove('hidden');
if(CFG.privacyUrl){
  const link=el('a','','Aviso de privacidad');link.href=CFG.privacyUrl;link.target='_blank';link.rel='noopener noreferrer';
  $('privacy-footer').append(link);
  $('privacy-note').append(' Consulta el ', link.cloneNode(true), '.');
}else $('privacy-note').textContent='Antes del uso real se debe publicar y vincular un aviso de privacidad institucional aprobado.';
if(CFG.privacyContact){const mail=document.createElement('a');mail.href='mailto:'+encodeURIComponent(CFG.privacyContact).replace('%40','@');mail.textContent=CFG.privacyContact;$('privacy-note').append(' Contacto para privacidad: ',mail,'.');}
$('survey-form').addEventListener('submit',async ev=>{
  ev.preventDefault();hideNotice('form-error');
  const required=['reason','familiarity','clarity','image','gender'];
  const missing=required.find(f=>!getValue(f));
  if(missing){notice('form-error','Responde las preguntas obligatorias. En género puedes seleccionar «Prefiero no responder».');$(mount[missing]).scrollIntoView({behavior:'smooth',block:'center'});return;}
  const other=getValue('reason')==='otro' ? $('reason-other').value.trim().replace(/\s+/g,' ') : null;
  if(getValue('reason')==='otro' && (!other||other.length<3||other.length>120)) {notice('form-error','Especifica otro motivo con 3 a 120 caracteres.');$('reason-other').focus();return;}
  if(!ageComplete()){notice('form-error','Ingresa tu edad en años cumplidos o selecciona «Prefiero no responder».');$('age-years').focus();return;}
  if(!$('age-optout').checked&&!Number.isInteger(numericAge())){notice('form-error','La edad debe ser un número entero entre 14 y 100.');$('age-years').focus();return;}
  if(IS_LIVE && (!CFG.privacyUrl || !CFG.privacyContact)){notice('form-error','Configuración incompleta: se requiere aviso de privacidad y contacto institucional antes de captar respuestas.');return;}
  const age=$('age-optout').checked?null:numericAge();
  const payload={
    event_code:CFG.eventCode,
    visit_reason:getValue('reason'),
    visit_reason_other:other,
    familiarity:Number(getValue('familiarity')),
    clarity:Number(getValue('clarity')),
    image_perception:Number(getValue('image')),
    age_years:age,
    age_range:ageBracket(age),
    gender:getValue('gender'),
    comment:$('comment').value.trim()||null
  };
  const btn=$('send-button');btn.disabled=true;btn.textContent='Registrando respuesta…';
  try{
    if(IS_LIVE){const {error}=await db.from('survey_responses').insert(payload);if(error)throw error;}
    $('form-panel').classList.add('hidden');$('success-panel').classList.remove('hidden');
    $('success-copy').textContent=IS_LIVE?'Tu respuesta quedó registrada. Gracias por participar.':'Modo demostración: tu respuesta NO fue guardada en ninguna base de datos.';
    if(IS_LIVE && CFG.enableContactCapture && CFG.privacyUrl && CFG.privacyContact){$('contact-panel').classList.remove('hidden');$('lead-privacy-link').href=CFG.privacyUrl;}
    window.scrollTo({top:0,behavior:'smooth'});
  }catch(e){console.error(e);notice('form-error','No se pudo registrar tu respuesta. Comprueba la conexión e inténtalo nuevamente.');}
  finally{btn.disabled=false;btn.innerHTML='Enviar respuestas <span aria-hidden="true">↗</span>';}
});
$('contact-form').addEventListener('submit',async ev=>{
  ev.preventDefault();hideNotice('lead-error');
  if(!IS_LIVE || !CFG.enableContactCapture)return;
  const email=$('lead-email').value.trim().toLowerCase();
  if(!$('lead-email').checkValidity() || !$('lead-consent').checked){notice('lead-error','Introduce un correo válido y marca la autorización voluntaria.');return;}
  const b=$('lead-button');b.disabled=true;b.textContent='Registrando…';
  try{const {error}=await db.from('contact_optins').insert({event_code:CFG.eventCode,email,consent_version:CFG.consentVersion});if(error)throw error;
    $('contact-panel').replaceChildren(el('p','success-line','Solicitud registrada. Gracias por tu interés.'));
  }catch(e){console.error(e);notice('lead-error','No se pudo registrar el correo. Inténtalo de nuevo.');}
  finally{b.disabled=false;b.textContent='Quiero recibir información ↗';}
});
$('restart-button').addEventListener('click',()=>{
  if(IS_LIVE)window.location.reload();
  else{
    $('survey-form').reset();$('comment').value='';$('age-years').disabled=false;
    conditionalReason();progress();$('success-panel').classList.add('hidden');$('form-panel').classList.remove('hidden');window.scrollTo({top:0,behavior:'smooth'});
  }
});
progress();
