/* ================= PORTAL ADMINISTRATIVO v3 · Mateo Herrera Seguros ================= */
(function(){
  var root=document.getElementById('mxAdmin'); if(!root) return;

  /* ===================== CONFIGURACIÓN ===================== */
  var SB_URL='https://ppzegmemytxcfallivez.supabase.co';
  var SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwemVnbWVteXR4Y2ZhbGxpdmV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxOTUyNjUsImV4cCI6MjEwNTc3MTI2NX0.itD8mTsB3athrMnHrOmZIt8p2_m2aAJULjI7NaTK6s8';
  var EMAIL_DOM='mateoherrera.com.co'; // usuario en Supabase Auth = <cédula>@mateoherrera.com.co
  var NEGOCIO={nombre:'Mateo Herrera Seguros',wa:'3108646019',waTxt:'310 864 6019',dir:'C.C. La Quinta, Piso 1, Local 128 · Ibagué',correo:'mateoherrerap@gmail.com'};

  /* ===================== UTILIDADES ===================== */
  function $(s,c){return (c||root).querySelector(s);}
  function $$(s,c){return Array.prototype.slice.call((c||root).querySelectorAll(s));}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function cop(n){return '$'+Math.round(+n||0).toLocaleString('es-CO');}
  function copM(n){n=+n||0;if(n>=1e6)return '$'+(n/1e6).toLocaleString('es-CO',{maximumFractionDigits:1})+' M';if(n>=1e3)return '$'+Math.round(n/1e3).toLocaleString('es-CO')+' mil';return cop(n);}
  function nf(n){return Math.round(+n||0).toLocaleString('es-CO');}
  function pct(a,b){return b?(a/b*100).toLocaleString('es-CO',{maximumFractionDigits:1})+'%':'—';}
  function uid(){return (window.crypto&&crypto.randomUUID)?crypto.randomUUID():'id-'+Date.now().toString(36)+Math.random().toString(36).slice(2,10);}
  function pad(n){return (n<10?'0':'')+n;}
  function hoy(){var d=new Date();d.setHours(0,0,0,0);return d;}
  function ymd(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
  function pd(s){if(!s)return null;if(s instanceof Date)return s;if(/T\d/.test(String(s))){var t=new Date(s);if(!isNaN(t)){t.setHours(0,0,0,0);return t;}}var m=String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);if(!m)return null;return new Date(+m[1],+m[2]-1,+m[3]);}
  function addDays(d,n){var x=new Date(d);x.setDate(x.getDate()+n);return x;}
  function addMonths(d,n){var x=new Date(d);var day=x.getDate();x.setDate(1);x.setMonth(x.getMonth()+n);var last=new Date(x.getFullYear(),x.getMonth()+1,0).getDate();x.setDate(Math.min(day,last));return x;}
  function diffDays(a,b){return Math.round((pd(a)-pd(b))/864e5);}
  function fch(d){d=pd(d);return d?d.toLocaleDateString('es-CO',{day:'2-digit',month:'short'}).replace('.',''):'—';}
  function fchL(d){d=pd(d);return d?d.toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'}).replace('.',''):'—';}
  function fchHora(ts){var d=new Date(ts);if(isNaN(d))return '—';return d.toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'}).replace('.','')+' · '+d.toLocaleTimeString('es-CO',{hour:'numeric',minute:'2-digit'});}
  function hora12(h){if(!h)return '';var p=h.split(':'),H=+p[0],M=p[1]||'00';return ((H%12)||12)+':'+M+(H<12?' a. m.':' p. m.');}
  function diasDesde(ts){if(!ts)return 0;return Math.max(0,Math.floor((Date.now()-new Date(ts).getTime())/864e5));}
  function digits(s){return String(s||'').replace(/\D/g,'');}
  function waNum(t){var d=digits(t);if(d.length===10&&d[0]==='3')return '57'+d;return d;}
  function telFmt(t){var d=digits(t);if(d.length===12&&d.indexOf('57')===0)d=d.slice(2);if(d.length===10)return d.slice(0,3)+' '+d.slice(3,6)+' '+d.slice(6);return t||'';}
  function waLink(tel,msg){return 'https://wa.me/'+waNum(tel)+'?text='+encodeURIComponent(msg);}
  function primerNombre(n){return String(n||'').trim().split(/\s+/)[0]||'';}
  function inic(n){return String(n||'?').trim().split(/\s+/).map(function(w){return w[0];}).slice(0,2).join('').toUpperCase();}
  function norm(s){return String(s==null?'':s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim();}
  function titleCase(s){return String(s||'').toLowerCase().replace(/(^|[\s\-\/("'«“])([a-záéíóúñü])/g,function(m,a,b){return a+b.toUpperCase();}).replace(/(\s)(De|Del|La|Las|Los|Y|Al|En|Por|Para|Con)(?=\s)/g,function(w,sp,x){return sp+x.toLowerCase();});}
  function toast(t,kind){var el=$('#mxToast');el.textContent=t;el.className='mx-toast on'+(kind?' '+kind:'');clearTimeout(el._t);el._t=setTimeout(function(){el.classList.remove('on');},2600);}
  function proxCumple(nac){var n=pd(nac);if(!n)return null;var h=hoy();var c=new Date(h.getFullYear(),n.getMonth(),n.getDate());if(c<h)c=new Date(h.getFullYear()+1,n.getMonth(),n.getDate());return {fecha:c,dias:diffDays(c,h),edad:c.getFullYear()-n.getFullYear()};}
  function debounce(fn,ms){var t;return function(){var a=arguments,s=this;clearTimeout(t);t=setTimeout(function(){fn.apply(s,a);},ms);};}
  function byId(list,id){for(var i=0;i<list.length;i++)if(list[i].id===id)return list[i];return null;}
  function download(name,blob){var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},4000);}
  function slug(s){return norm(s).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,50)||'archivo';}
  function bytesFmt(n){n=+n||0;if(n>1048576)return (n/1048576).toFixed(1)+' MB';if(n>1024)return Math.round(n/1024)+' KB';return n+' B';}

  /* ===================== ÍCONOS ===================== */
  var P='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
  var IC={
    grid:P+'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
    flow:P+'<path d="M3 6h5l3 6-3 6H3l3-6z"/><path d="M13 6h5l3 6-3 6h-5l3-6z"/></svg>',
    users:P+'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 010 6.8M18.5 14.8c1.6.8 2.6 2.6 3 5.2"/></svg>',
    user:P+'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.2-6 8-6s7 2 8 6"/></svg>',
    doc:P+'<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
    refresh:P+'<path d="M20 11a8 8 0 00-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0014.3 4.9L20 16M20 20v-4h-4"/></svg>',
    mega:P+'<path d="M3 11v2a1 1 0 001 1h2l5 4V6L6 10H4a1 1 0 00-1 1z"/><path d="M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13"/></svg>',
    gear:P+'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>',
    logout:P+'<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>',
    menu:P+'<path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    moon:P+'<path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>',
    sun:P+'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    globe:P+'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></svg>',
    x:P+'<path d="M18 6L6 18M6 6l12 12"/></svg>',
    arrowL:P+'<path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
    money:P+'<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/></svg>',
    shield:P+'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    target:P+'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>',
    chat:P+'<path d="M21 11.5a8.4 8.4 0 01-12.2 7.5L3 21l2-5.6A8.4 8.4 0 1121 11.5z"/></svg>',
    alert:P+'<path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
    clock:P+'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    trend:P+'<path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>',
    wa:'<svg viewBox="0 0 32 32" fill="currentColor"><path d="M16 3C9 3 3.3 8.7 3.3 15.7c0 2.5.7 4.8 1.9 6.8L3 29l6.7-2.1c1.9 1 4 1.6 6.3 1.6 7 0 12.7-5.7 12.7-12.7S23 3 16 3zm0 23.1c-2 0-3.9-.5-5.5-1.5l-.4-.2-4 1.2 1.3-3.9-.3-.4a10.3 10.3 0 01-1.6-5.6c0-5.7 4.7-10.4 10.4-10.4S26.4 10 26.4 15.7 21.7 26.1 16 26.1zm5.7-7.8c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.3-.7.1a8.4 8.4 0 01-2.5-1.5 9.4 9.4 0 01-1.7-2.1c-.2-.3 0-.5.1-.7l.5-.6.4-.6c.1-.2.1-.4 0-.6s-.7-1.7-1-2.3c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.2 1.1-1.2 2.8 1.2 3.3 1.4 3.5 2.4 3.6 5.8 5.1c.8.3 1.4.5 1.9.7.8.3 1.5.2 2.1.1.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z"/></svg>',
    plus:P+'<path d="M12 5v14M5 12h14"/></svg>',
    next:P+'<path d="M5 12h14M13 5l7 7-7 7"/></svg>',
    chevL:P+'<path d="M15 18l-6-6 6-6"/></svg>',
    chevR:P+'<path d="M9 18l6-6-6-6"/></svg>',
    chevD:P+'<path d="M6 9l6 6 6-6"/></svg>',
    cal:P+'<rect x="3" y="4.5" width="18" height="16.5" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/></svg>',
    db:P+'<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/></svg>',
    upload:P+'<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3"/></svg>',
    download:P+'<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3"/></svg>',
    trash:P+'<path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>',
    edit:P+'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>',
    search:P+'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
    phone:P+'<path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1L8 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.5c.9.3 1.8.6 2.8.7a2 2 0 011.7 2z"/></svg>',
    mail:P+'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    pin:P+'<path d="M12 22s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    building:P+'<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M10 21v-3h4v3"/></svg>',
    tag:P+'<path d="M20.6 13.4L13.4 20.6a2 2 0 01-2.8 0L3 13V3h10l7.6 7.6a2 2 0 010 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>',
    table:P+'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16"/></svg>',
    cards:P+'<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>',
    layers:P+'<path d="M12 2l10 5-10 5L2 7z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
    eye:P+'<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    check:P+'<path d="M20 6L9 17l-5-5"/></svg>',
    note:P+'<path d="M4 4h16v12l-4 4H4z"/><path d="M16 20v-4h4M8 9h8M8 13h5"/></svg>',
    file:P+'<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5"/></svg>',
    image:P+'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
    gift:P+'<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M5 12v9h14v-9M12 8H7.5a2.5 2.5 0 010-5C11 3 12 8 12 8zM12 8h4.5a2.5 2.5 0 000-5C13 3 12 8 12 8z"/></svg>',
    lock:P+'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>'
  };
  function ico(n){return IC[n]||'';}
  function paintIcons(scope){$$('[data-ico]',scope).forEach(function(e){if(!e.dataset.done){e.innerHTML=ico(e.dataset.ico);e.style.display='inline-flex';e.dataset.done='1';}});}

  /* ===================== CATÁLOGO ===================== */
  var RAMOS={
    ATR:['Auto Todo Riesgo','#2563EB'],SOAT:['SOAT','#16A34A'],HOG:['Hogar','#D97706'],
    VI:['Vida Individual','#1A57E0'],VD:['Vida Deudor Individual','#3B82F6'],API:['AP Individual','#F59E0B'],
    PCF:['Plan Capital Futuro','#10B981'],EXE:['Exequial','#64748B'],VIA:['Viaje','#A855F7'],EDU:['Educativo','#EC4899'],
    MV:['Millón Vida','#0EA5E9'],PYME:['PYME','#1E3A8A'],VG:['Vida Colectivo','#06B6D4'],APG:['AP Colectivo','#F97316'],
    VDG:['Vida Grupo Deudor','#4F46E5'],VDA:['Vida Grupo Aportes','#7C3AED'],COPR:['Copropiedad Residencial','#14B8A6'],
    COPC:['Copropiedad Comercial','#0891B2'],DEC:['Decenal','#92400E'],AC:['Autos Colectivo','#DC2626'],
    CUM:['Cumplimiento','#7C3AED'],ARL:['ARL','#EA580C'],SC:['Salud Colectiva','#059669'],
    TRC:['Todo Riesgo Construcción','#B45309'],TRM:['Todo Riesgo Montaje','#78716C'],VAI:['Vida Ahorro e Inversión','#8B5CF6'],
    TRCA:['Transporte de Carga','#0369A1'],TRME:['Transporte de Mercancías','#155E75'],RCCE:['RCC/RCE Pasajeros','#4338CA'],
    SALUD:['Salud','#E11D48'],MP:['Medicina Prepagada','#BE185D'],RCM:['RC Médica','#0D9488'],
    JUD:['Judicial','#475569'],APE:['AP Escolar','#DB2777']
  };
  function code(c){if(!c)return '<span class="mx-code" style="background:#94A3B8">—</span>';var r=RAMOS[c]||['Varios','#475569'];return '<span class="mx-code" style="background:'+r[1]+'">'+esc(c)+'</span>';}
  function ramoN(c){return c?(RAMOS[c]||[c])[0]:'Sin ramo';}
  function ramoOpts(sel,vacio){return (vacio?'<option value="">'+vacio+'</option>':'')+Object.keys(RAMOS).map(function(r){return '<option value="'+r+'"'+(sel===r?' selected':'')+'>'+r+' · '+RAMOS[r][0]+'</option>';}).join('');}

  var ETAPAS=['Nuevo cliente','Cliente potencial','Seguimiento','Acuerdo consensual','Firma de solicitud','Expedición de la póliza','Póliza recaudada','Proceso completado','Venta cruzada'];
  var ET_DESC=['Llegó el contacto; aún no se ha hablado','Mostró interés real y tiene la necesidad','Se envió información y se hace seguimiento','Cliente y asesor acordaron el producto','El cliente firmó la solicitud','La aseguradora expide la póliza','El cliente pagó la prima o primera cuota','Póliza entregada y cliente activo','Se ofrece un segundo ramo al cliente'];
  var ET_COL=['#0A1650','#0C2266','#0E307D','#0F3E8C','#0B55A6','#0869B8','#0580C9','#0395D6','#00A7E8'];
  var ORIG={meta:['Meta Ads','#246BFD'],wa:['WhatsApp directo','#1FAF5A'],ref:['Referido','#F59E0B'],ig:['Instagram orgánico','#C026D3'],web:['Sitio web','#0EA5E9'],tel:['Llamada','#64748B'],bd:['Base de datos','#0F766E'],otro:['Otro','#94A3B8']};
  var ASEG=['Mapfre','HDI','Confianza','Seguros del Estado','Positiva','Seguros Mundial','Equidad','Solidaria','AXA Colpatria','Qualitas','SMI','Sura','Bolívar','Allianz','Liberty','Previsora'];
  var COT_ET=['Cotización generada','Aprobada','Rechazada'];var COT_KEY=['generada','aprobada','rechazada'];
  var REN_ET=['Aviso enviado','Cliente contactado','Recotización','Renovación aceptada','Renovada'];
  var SEG_TIPOS={nota:['Nota','note','#64748B'],llamada:['Llamada','phone','#0B6FB0'],whatsapp:['WhatsApp','chat','#1FAF5A'],reunion:['Reunión','users','#7C3AED'],correo:['Correo','mail','#0EA5E9'],visita:['Visita','pin','#D97706'],etapa:['Cambio de etapa','flow','#0F3E8C'],cita:['Cita','cal','#00A7E8'],sistema:['Sistema','gear','#94A3B8']};
  var CITA_TIPOS=['Asesoría','Cotización','Firma de solicitud','Entrega de póliza','Renovación','Visita a empresa','Llamada','Cobro / cartera','Otro'];
  var CITA_EST={'Programada':'info','Confirmada':'ok','Realizada':'mute','Cancelada':'dan','No asistió':'warn'};
  var CITA_COL={'Asesoría':'#0F3E8C','Cotización':'#0B6FB0','Firma de solicitud':'#7C3AED','Entrega de póliza':'#059669','Renovación':'#D97706','Visita a empresa':'#0891B2','Llamada':'#64748B','Cobro / cartera':'#C4372B','Otro':'#475569'};
  var LUGARES=['Oficina · C.C. La Quinta, Local 128','Videollamada','Llamada telefónica','En la casa del cliente','En la empresa del cliente'];
  var H_INI=7,H_FIN=20; // agenda lunes a viernes 7:00 a. m. – 8:00 p. m.
