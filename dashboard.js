'use strict';
const CFG=window.APP_CONFIG||{};
const LIVE=!!(CFG.supabaseUrl&&CFG.supabasePublishableKey&&window.supabase);
const db=LIVE?window.supabase.createClient(CFG.supabaseUrl,CFG.supabasePublishableKey):null;
const $=id=>document.getElementById(id);
const ages=[['menor_18','Menos de 18'],['18_24','18–24'],['25_34','25–34'],['35_44','35–44'],['45_54','45–54'],['55_mas','55+'],['sin_respuesta','Prefiere no responder']];
const genders=[['mujer','Mujer'],['hombre','Hombre'],['otra_identidad','Otra identidad'],['prefiero_no_responder','Prefiere no responder'],['no_binario','No binario (dato histórico)']];
const reasons=[['aprendices','Programa Aprendices'],['practicas_collahuasi','Prácticas o memorias en Collahuasi'],['informacion_fundacion','Conocer la Fundación'],['otro','Otro motivo'],['sin_registro','No registrado (encuestas antiguas)']];
const knows=[['1','No sabía que existía'],['2','Solo conocía el nombre'],['3','Sabía a qué se dedica'],['4','Conocía iniciativas o programas'],['5','Conocía bien su trabajo'],['0','No recuerda']];
const clarity=[['1','Nada clara'],['2','Poco clara'],['3','Medianamente clara'],['4','Bastante clara'],['5','Completamente clara'],['0','No recibió orientación']];
const imageScale=[['1','Muy negativa'],['2','Más negativa que positiva'],['3','Ni positiva ni negativa'],['4','Más positiva que negativa'],['5','Muy positiva'],['0','No tiene suficiente información']];
const labels={age:Object.fromEntries(ages),gender:Object.fromEntries(genders),reason:Object.fromEntries(reasons),familiarity:Object.fromEntries(knows),clarity:Object.fromEntries(clarity),image:Object.fromEntries(imageScale)};
let data=[],contacts=[],rows=[];
function demoData(){
  const out=[]; const events=['FERIA-DEMO-01','FERIA-DEMO-02'];
  const texts=['Me gustaría conocer requisitos de postulación.','Información útil, pero faltó un enlace directo.','Sería ideal un calendario de próximas actividades.','Excelente explicación de los programas.','¿Dónde puedo conocer capacitaciones disponibles?'];
  for(let i=0;i<82;i++){
    const d=new Date(Date.UTC(2026,9,7+(i%7),11+(i%8),i%60));
    out.push({
      id:'DEMO-'+i,created_at:d.toISOString(),event_code:events[i%2],
      familiarity:(i%13===0?0:1+(i*7%5)),clarity:(i%17===0?0:1+(i*3%5)),image_perception:(i%11===0?0:1+(i*5%5)),
      age_years:i%11===0?null:18+(i%7),age_range:i%11===0?'sin_respuesta':'18_24',gender:genders[i%4][0],
      visit_reason:reasons[i%4][0],visit_reason_other:i%4===3?'Consulta por otras oportunidades':null,comment:i%8===0?texts[(i/8|0)%texts.length]:null
    });
  }
  return out;
}
const fmtPct=(n,d)=>d?`${(100*n/d).toFixed(1).replace('.',',')} %`:'—';
const fmtNum=n=>new Intl.NumberFormat('es-CL').format(n);
function setText(id,s){$(id).textContent=s;}
function localDate(iso){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Santiago',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(iso));const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));return `${p.year}-${p.month}-${p.day}`;}
function localStamp(iso){return new Date(iso).toLocaleString('es-CL',{timeZone:'America/Santiago',dateStyle:'short',timeStyle:'short'});}
function optionSelect(select,values,keep){select.replaceChildren();if(keep){const o=document.createElement('option');o.value='';o.textContent=keep;select.append(o);}for(const [v,l] of values){const o=document.createElement('option');o.value=v;o.textContent=l;select.append(o);}}
function initFilters(){const e=[...new Set(data.map(x=>x.event_code))].sort().map(x=>[x,x]);optionSelect($('filter-event'),e,'Todos los eventos');optionSelect($('filter-age'),ages,'Todas');optionSelect($('filter-gender'),genders,'Todos');optionSelect($('filter-reason'),reasons,'Todos');}
function filterRows(){const e=$('filter-event').value,a=$('filter-age').value,g=$('filter-gender').value,v=$('filter-reason').value,from=$('filter-from').value,to=$('filter-to').value;
 return data.filter(x=>(!e||x.event_code===e)&&(!a||x.age_range===a)&&(!g||x.gender===g)&&(!v||(x.visit_reason||'sin_registro')===v)&&(!from||localDate(x.created_at)>=from)&&(!to||localDate(x.created_at)<=to));}
function drawBars(id,opts,values,denom){const root=$(id);root.replaceChildren();const max=denom||1;
 for(const [key,label] of opts){const count=values.filter(v=>String(v)===String(key)).length;const row=document.createElement('div');row.className='bar-row';const top=document.createElement('div');top.className='bar-top';const text=document.createElement('span');text.textContent=label;const v=document.createElement('span');v.className='bar-value';v.textContent=`${fmtNum(count)} · ${fmtPct(count,denom)}`;top.append(text,v);
 const track=document.createElement('div');track.className='track';const fill=document.createElement('div');fill.style.width=`${Math.max(0,Math.min(100,100*count/max))}%`;track.append(fill);row.append(top,track);root.append(row);}
 if(!values.length){const p=document.createElement('p');p.className='empty';p.textContent='No hay respuestas para estos filtros.';root.append(p);}
}
function compute(){
  rows=filterRows();
  const validK=rows.filter(r=>r.familiarity>=1&&r.familiarity<=5);const lowK=validK.filter(r=>r.familiarity<=2).length;
  const validC=rows.filter(r=>r.clarity>=1&&r.clarity<=5);const highC=validC.filter(r=>r.clarity>=4).length;const noC=rows.filter(r=>r.clarity===0).length;
  const validI=rows.filter(r=>r.image_perception>=1&&r.image_perception<=5);const positiveI=validI.filter(r=>r.image_perception>=4).length;
  const validR=rows.filter(r=>!!r.visit_reason);const numApr=validR.filter(r=>r.visit_reason==='aprendices').length;

  setText('kpi-responses',fmtNum(rows.length));
  setText('kpi-aprendices',fmtPct(numApr,validR.length));setText('kpi-aprendices-detail',`${numApr} de ${validR.length} motivos válidos`);
  setText('kpi-awareness',fmtPct(lowK,validK.length));setText('kpi-awareness-detail',`${lowK} de ${validK.length} respuestas válidas`);
  setText('kpi-clarity',fmtPct(highC,validC.length));setText('kpi-clarity-detail',`${highC} de ${validC.length} respuestas válidas`);
  setText('kpi-image',fmtPct(positiveI,validI.length));setText('kpi-image-detail',`${positiveI} de ${validI.length} respuestas válidas`);
  setText('kpi-no-attention',fmtPct(noC,rows.length));setText('kpi-no-attention-detail',`${noC} de ${rows.length} respuestas`);

  drawBars('reason-bars',reasons,rows.map(r=>r.visit_reason||'sin_registro'),rows.length);
  const young=rows.filter(r=>r.age_range==='18_24');drawBars('reason-young-bars',reasons,young.map(r=>r.visit_reason||'sin_registro'),young.length);
  const precise=rows.filter(r=>Number.isInteger(r.age_years));
  setText('age-detail',precise.length?`Edades exactas registradas: ${precise.length}. De 18 a 24 años: ${precise.filter(r=>r.age_years>=18&&r.age_years<=24).length}.`:'Sin edades exactas en esta selección.');
  drawBars('knowledge-bars',knows,rows.map(r=>r.familiarity),rows.length);
  drawBars('clarity-bars',clarity,rows.map(r=>r.clarity),rows.length);
  drawBars('image-bars',imageScale,rows.map(r=>r.image_perception),rows.length);
  drawBars('age-bars',ages,rows.map(r=>r.age_range),rows.length);
  drawBars('gender-bars',genders,rows.map(r=>r.gender),rows.length);

  const cross=$('cross-bars');cross.replaceChildren();
  for(const [age,label] of ages){const x=rows.filter(r=>r.age_range===age && r.clarity>=1 && r.clarity<=5);const positive=x.filter(r=>r.clarity>=4).length;const div=document.createElement('div');div.className='bar-row';
    const top=document.createElement('div');top.className='bar-top';const text=document.createElement('span');text.textContent=label;const result=document.createElement('span');result.className='bar-value';result.textContent=x.length>=5?`${fmtPct(positive,x.length)} · n=${x.length}`:`n=${x.length} · muestra pequeña`;top.append(text,result);div.append(top);
    if(x.length>=5){const track=document.createElement('div');track.className='track';const fill=document.createElement('div');fill.style.width=`${100*positive/x.length}%`;track.append(fill);div.append(track);}cross.append(div);
  }
  const comments=rows.filter(r=>r.comment&&r.comment.trim());setText('comments-total',`${comments.length} comentarios`);const cl=$('comments-list');cl.replaceChildren();
  for(const r of comments.slice().reverse().slice(0,50)){const block=document.createElement('article');block.className='comment-item';const p=document.createElement('p');p.textContent=r.comment;const small=document.createElement('small');small.textContent=`${localStamp(r.created_at)} · ${r.event_code}`;block.append(p,small);cl.append(block);}if(!comments.length){const p=document.createElement('p');p.className='empty';p.textContent='Sin comentarios en esta selección.';cl.append(p);}

  let msg='';
  if(rows.length<20)msg='Muestra inicial reducida (n < 20). Úsala para describir patrones y ajustar el stand, no para sacar conclusiones estables.';
  else if(validC.length&&highC/validC.length<.55)msg='La proporción de orientaciones calificadas como bastante o completamente claras es baja para el prototipo. Conviene revisar mensajes frecuentes, material visual y claridad del discurso del equipo.';
  else if(validK.length&&lowK/validK.length>=.50)msg='Al menos la mitad de las respuestas válidas indican familiaridad institucional baja. Prioridad exploratoria: reforzar qué hace Fundación Collahuasi y diferenciar su rol frente a la empresa minera.';
  else if(validI.length&&positiveI/validI.length<.50)msg='La imagen general aún no aparece mayoritariamente positiva entre quienes sí tienen base para evaluarla. Revisa consistencia del mensaje institucional, visuales y atributos comunicados en el stand.';
  else msg='Los indicadores principales no activan señales exploratorias del prototipo. Revisa igualmente comentarios y diferencias entre ferias o segmentos.';
  setText('insight-text',msg);

  const selected=$('filter-event').value;const leads=contacts.filter(c=>!selected||c.event_code===selected);setText('contacts-count',fmtNum(leads.length));
  setText('last-updated',`Actualizado: ${new Date().toLocaleTimeString('es-CL',{timeZone:'America/Santiago'})} (Chile)`);
}
async function fetchAll(table){const result=[];let from=0;const page=750;while(true){const {data:chunk,error}=await db.from(table).select('*').order('created_at',{ascending:true}).range(from,from+page-1);if(error)throw error;result.push(...chunk);if(chunk.length<page)break;from+=page;if(from>=30000){throw new Error('El volumen excede el límite de 30.000 filas del prototipo. Implementar exportación paginada en servidor.');}}return result;}
async function refresh(){if(!LIVE)return;const b=$('refresh');b.disabled=true;b.textContent='Actualizando…';try{const [r,c]=await Promise.all([fetchAll('survey_responses'),fetchAll('contact_optins')]);const prev=$('filter-event').value;data=r;contacts=c;initFilters();if([...$('filter-event').options].some(o=>o.value===prev))$('filter-event').value=prev;compute();}catch(e){console.error(e);alert('No fue posible cargar datos. Revisa la conexión y los permisos de acceso.');}finally{b.disabled=false;b.textContent='↻ Actualizar datos';}}
function safeName(x){return String(x||'todos').replace(/[^a-zA-Z0-9_-]/g,'_').slice(0,45);}
async function downloadBook(kind){if(!window.ExcelJS){alert('No se pudo cargar el módulo XLSX. Verifica la conexión a Internet.');return;}const book=new window.ExcelJS.Workbook();book.creator='Panel ferias · Fundación Collahuasi';book.created=new Date();
 const sheet=(name,heads,items)=>{const sh=book.addWorksheet(name);sh.addRow(heads);sh.getRow(1).font={bold:true,color:{argb:'FF052332'}};sh.getRow(1).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFADEDE2'}};sh.views=[{state:'frozen',ySplit:1}];for(const r of items)sh.addRow(r);sh.columns=heads.map(v=>({width:Math.min(45,Math.max(15,String(v).length+6))}));sh.autoFilter={from:{row:1,column:1},to:{row:sh.rowCount,column:heads.length}};return sh;};
 let filename='';
 if(kind==='contacts'){
   if(!window.confirm('Este archivo incluirá correos electrónicos (datos personales). Descárgalo solo para la finalidad autorizada y custódialo conforme a los procedimientos institucionales. ¿Continuar?'))return;
   const selected=$('filter-event').value;const arr=contacts.filter(c=>!selected||c.event_code===selected);sheet('Contactos',['ID','Fecha Chile','Evento','Correo','Versión consentimiento'],arr.map(x=>[x.id,localStamp(x.created_at),x.event_code,x.email,x.consent_version]));filename=`Contactos_${safeName(selected)}_${localDate(new Date().toISOString())}.xlsx`;
 }else{
   const validK=rows.filter(r=>r.familiarity>=1),validC=rows.filter(r=>r.clarity>=1),validI=rows.filter(r=>r.image_perception>=1);const low=validK.filter(r=>r.familiarity<=2).length;const high=validC.filter(r=>r.clarity>=4).length;const posI=validI.filter(r=>r.image_perception>=4).length;
   sheet('Resumen',['Indicador','Valor','Numerador','Denominador','Nota'],[
    ['Respuestas',rows.length,rows.length,rows.length,'Participación voluntaria'],
    ['Interés Programa Aprendices',fmtPct(rows.filter(r=>r.visit_reason==='aprendices').length,rows.filter(r=>r.visit_reason).length),rows.filter(r=>r.visit_reason==='aprendices').length,rows.filter(r=>r.visit_reason).length,'Entre encuestas con motivo registrado'],
    ['Familiaridad previa baja',fmtPct(low,validK.length),low,validK.length,'Códigos 1 y 2, excluye «No recuerdo»'],
    ['Claridad alta',fmtPct(high,validC.length),high,validC.length,'Códigos 4 y 5, excluye «No recibió orientación»'],
    ['Imagen positiva',fmtPct(posI,validI.length),posI,validI.length,'Códigos 4 y 5, excluye «No tiene suficiente información»'],
    ['Sin orientación',fmtPct(rows.filter(r=>r.clarity===0).length,rows.length),rows.filter(r=>r.clarity===0).length,rows.length,'No medir como mala claridad'],
    ['Comentario abierto',rows.filter(r=>r.comment).length,rows.filter(r=>r.comment).length,rows.length,'Comentarios no equivalen a quejas']
   ]);
   sheet('Respuestas',['ID','Fecha Chile','Evento','Familiaridad código','Familiaridad','Claridad código','Claridad','Imagen código','Imagen general','Edad exacta (años)','Rango de edad','Motivo de visita','Otro motivo especificado','Género','Comentario'],rows.map(x=>[x.id,localStamp(x.created_at),x.event_code,x.familiarity,labels.familiarity[x.familiarity]||'',x.clarity,labels.clarity[x.clarity]||'',x.image_perception,labels.image[x.image_perception]||'',x.age_years??'',labels.age[x.age_range]||'',labels.reason[x.visit_reason||'sin_registro']||'',x.visit_reason_other||'',labels.gender[x.gender]||'',x.comment||'']));
   sheet('Comentarios',['Fecha Chile','Evento','Edad exacta','Rango de edad','Motivo','Otro motivo','Género','Comentario'],rows.filter(x=>x.comment).map(x=>[localStamp(x.created_at),x.event_code,x.age_years??'',labels.age[x.age_range]||'',labels.reason[x.visit_reason||'sin_registro']||'',x.visit_reason_other||'',labels.gender[x.gender]||'',x.comment]));
   filename=`Encuesta_Fundacion_Collahuasi_${safeName($('filter-event').value)}_${localDate(new Date().toISOString())}.xlsx`;
 }
 const buffer=await book.xlsx.writeBuffer();const blob=new Blob([buffer],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
}
$('login-form').addEventListener('submit',async e=>{e.preventDefault();if(!LIVE)return;const b=$('login-button');b.disabled=true;try{const {error}=await db.auth.signInWithPassword({email:$('login-email').value,password:$('login-password').value});if(error)throw error;await verifyStaff();}catch(err){$('login-error').textContent='Acceso denegado. Revisa credenciales y autorización del equipo.';$('login-error').classList.remove('hidden');}finally{b.disabled=false;}});
async function verifyStaff(){const {data:u,error}=await db.auth.getUser();if(error||!u?.user){$('login-screen').classList.remove('hidden');return;}
 const {data:staff,error:staffErr}=await db.from('staff_users').select('user_id').eq('user_id',u.user.id).maybeSingle();if(staffErr||!staff){await db.auth.signOut({scope:'local'});$('login-screen').classList.remove('hidden');$('login-error').textContent='Cuenta válida, pero no está autorizada como personal del panel.';$('login-error').classList.remove('hidden');return;}
 $('login-screen').classList.add('hidden');$('dashboard-screen').classList.remove('hidden');$('logout').classList.remove('hidden');$('mode-pill').textContent='SEGURO · PERSONAL';await refresh();}
$('logout').addEventListener('click',async()=>{if(LIVE)await db.auth.signOut({scope:'local'});window.location.reload();});
$('refresh').addEventListener('click',refresh);
for(const id of ['filter-event','filter-age','filter-gender','filter-reason','filter-from','filter-to'])$(id).addEventListener('change',compute);
$('clear-filters').addEventListener('click',()=>{for(const id of ['filter-event','filter-age','filter-gender','filter-reason','filter-from','filter-to'])$(id).value='';compute();});
$('xlsx-responses').addEventListener('click',()=>downloadBook('responses').catch(e=>{console.error(e);alert('No se pudo crear el Excel.');}));
$('xlsx-contacts').addEventListener('click',()=>downloadBook('contacts').catch(e=>{console.error(e);alert('No se pudo crear el Excel de contactos.');}));
if(!LIVE){data=demoData();contacts=[];initFilters();$('dashboard-screen').classList.remove('hidden');$('dash-demo').classList.remove('hidden');$('mode-pill').textContent='SIMULACIÓN';compute();}
else verifyStaff().catch(e=>{console.error(e);$('login-screen').classList.remove('hidden');});
setInterval(()=>{if(LIVE&&!document.hidden&&!$('dashboard-screen').classList.contains('hidden'))refresh();},30000);
