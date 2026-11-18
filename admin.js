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

  /* ===================== DATOS Y SESIÓN ===================== */
  var TABLES=['clientes','polizas','seguimientos','documentos','citas','cotizaciones','campanas','bases','base_registros'];
  var DB={};TABLES.forEach(function(t){DB[t]=[];});
  var ME=null;          // perfil del asesor que inició sesión
  var MODE='sb';        // 'sb' = Supabase · 'local' = pruebas en este navegador
  var sb=null;
  var LOCAL_OK=/^(localhost|127\.0\.0\.1|)$/.test(location.hostname)||location.protocol==='file:'||/[?&]local=1/.test(location.search);
  var LOCAL_USERS=[
    {id:'local-mateo',cedula:'93412108',clave:'93412108',nombre:'Mateo Herrera',iniciales:'MH',rol:'Asesor',color:'#0F3E8C'},
    {id:'local-andrea',cedula:'1000000000',clave:'1000000000',nombre:'Andrea',iniciales:'AN',rol:'Asesora',color:'#7C3AED'}
  ];
  try{if(window.supabase&&window.supabase.createClient){sb=window.supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true,storageKey:'mh-admin-auth'}});}}catch(e){console.warn('[MH] Supabase no inició',e);}
  if(!sb)MODE='local';

  function lsGet(k){try{return JSON.parse(localStorage.getItem(k)||'null');}catch(e){return null;}}
  function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true;}catch(e){return false;}}
  function localKey(id){return 'mh_local_'+(id||ME.id);}
  function saveLocal(){if(MODE!=='local'||!ME)return;if(!lsSet(localKey(),DB))toast('El navegador no tiene más espacio para guardar. Elimina documentos grandes.','err');}

  async function fetchAll(table){
    var out=[],from=0,step=1000;
    for(;;){var r=await sb.from(table).select('*').order('created_at',{ascending:true}).range(from,from+step-1);
      if(r.error)throw r.error;out=out.concat(r.data||[]);if(!r.data||r.data.length<step)break;from+=step;}
    return out;
  }
  async function cargarTodo(){
    if(MODE==='local'){var d=lsGet(localKey())||{};TABLES.forEach(function(t){DB[t]=d[t]||[];});return;}
    var res=await Promise.all(TABLES.map(function(t){return fetchAll(t).catch(function(e){console.warn('[MH] '+t,e);return null;});}));
    var fallo=[];TABLES.forEach(function(t,i){if(res[i]===null){fallo.push(t);DB[t]=[];}else DB[t]=res[i];});
    if(fallo.length)toast('No se pudieron cargar: '+fallo.join(', ')+'. ¿Ya ejecutaste el SQL v2 en Supabase?','err');
  }

  function errMsg(e){var m=(e&&(e.message||e.error_description||e.msg))||String(e||'');if(/row-level security|permission/i.test(m))return 'Supabase rechazó el cambio por permisos. Revisa que ejecutaste el SQL v2.';if(/Failed to fetch|NetworkError/i.test(m))return 'Sin conexión con la base de datos. Revisa tu internet.';return m;}
  function limpiarFila(t,row){var r={};for(var k in row){if(k.charAt(0)==='_')continue;var v=row[k];if(v==='')v=null;r[k]=v;}return r;}

  async function dbInsert(t,row){
    row.id=row.id||uid();row.owner=ME.id;row.created_at=row.created_at||new Date().toISOString();
    DB[t].push(row);
    if(MODE==='local'){saveLocal();return row;}
    var r=await sb.from(t).insert(limpiarFila(t,row));
    if(r.error){DB[t]=DB[t].filter(function(x){return x!==row;});toast(errMsg(r.error),'err');throw r.error;}
    return row;
  }
  async function dbInsertMany(t,rows,onProg){
    rows.forEach(function(row){row.id=row.id||uid();row.owner=ME.id;row.created_at=row.created_at||new Date().toISOString();});
    if(MODE==='local'){DB[t]=DB[t].concat(rows);saveLocal();if(onProg)onProg(rows.length,rows.length);return rows;}
    var hechos=0;
    for(var i=0;i<rows.length;i+=400){var lote=rows.slice(i,i+400);
      var r=await sb.from(t).insert(lote.map(function(x){return limpiarFila(t,x);}));
      if(r.error){toast(errMsg(r.error),'err');throw r.error;}
      DB[t]=DB[t].concat(lote);hechos+=lote.length;if(onProg)onProg(hechos,rows.length);}
    return rows;
  }
  async function dbUpdate(t,id,fields){
    var row=byId(DB[t],id);if(!row)return null;var antes={};for(var k in fields){antes[k]=row[k];row[k]=fields[k];}
    if(MODE==='local'){saveLocal();return row;}
    var r=await sb.from(t).update(limpiarFila(t,fields)).eq('id',id);
    if(r.error){for(var j in antes)row[j]=antes[j];toast(errMsg(r.error),'err');throw r.error;}
    return row;
  }
  async function dbDelete(t,id){
    var row=byId(DB[t],id);if(!row)return;DB[t]=DB[t].filter(function(x){return x.id!==id;});
    if(MODE==='local'){saveLocal();return;}
    var r=await sb.from(t).delete().eq('id',id);
    if(r.error){DB[t].push(row);toast(errMsg(r.error),'err');throw r.error;}
  }
  async function dbDeleteWhere(t,col,val){
    var quitar=DB[t].filter(function(x){return x[col]===val;});DB[t]=DB[t].filter(function(x){return x[col]!==val;});
    if(MODE==='local'){saveLocal();return;}
    var r=await sb.from(t).delete().eq(col,val);
    if(r.error){DB[t]=DB[t].concat(quitar);toast(errMsg(r.error),'err');throw r.error;}
  }

  /* ---- archivos (documentos del cliente, imágenes de campañas) ---- */
  function fileToDataURL(file){return new Promise(function(res,rej){var fr=new FileReader();fr.onload=function(){res(fr.result);};fr.onerror=rej;fr.readAsDataURL(file);});}
  async function subirArchivo(bucket,carpeta,file){
    var limpio=file.name.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^\w.\-]+/g,'_');
    var ruta=ME.id+'/'+carpeta+'/'+Date.now()+'-'+limpio;
    if(MODE==='local'){if(file.size>1.5*1048576)throw new Error('En modo local solo se guardan archivos de hasta 1,5 MB.');return {ruta:ruta,data:await fileToDataURL(file)};}
    var r=await sb.storage.from(bucket).upload(ruta,file,{upsert:false,contentType:file.type||undefined});
    if(r.error)throw r.error;return {ruta:ruta};
  }
  async function urlArchivo(bucket,doc){
    if(doc.data)return doc.data;
    var r=await sb.storage.from(bucket).createSignedUrl(doc.ruta,600);
    if(r.error)throw r.error;return r.data.signedUrl;
  }
  async function borrarArchivo(bucket,ruta){if(MODE==='local'||!ruta)return;try{await sb.storage.from(bucket).remove([ruta]);}catch(e){}}

  /* ---- sesión ---- */
  async function cargarPerfil(user){
    var p=null;
    if(MODE==='sb'){var r=await sb.from('perfiles').select('*').eq('id',user.id).maybeSingle();if(!r.error)p=r.data;
      if(!p){var ced=(user.email||'').split('@')[0];p={id:user.id,nombre:'Asesor',iniciales:'AS',cedula:ced,rol:'Asesor',color:'#0F3E8C'};await sb.from('perfiles').insert(p);}}
    else p=user;
    return p;
  }
  async function login(cedula,clave){
    cedula=digits(cedula);
    if(MODE==='local'){
      if(!LOCAL_OK)throw new Error('No hay conexión con la base de datos. Revisa tu internet y recarga la página.');
      var u=LOCAL_USERS.filter(function(x){return x.cedula===cedula&&x.clave===clave;})[0];
      if(!u)throw new Error('Cédula o contraseña incorrecta.');
      try{sessionStorage.setItem('mxLocalUser',u.id);}catch(e){}
      ME=await cargarPerfil(u);return ME;
    }
    var r=await sb.auth.signInWithPassword({email:cedula+'@'+EMAIL_DOM,password:clave});
    if(r.error){if(/invalid login|invalid credentials/i.test(r.error.message))throw new Error('Cédula o contraseña incorrecta.');if(/not confirmed/i.test(r.error.message))throw new Error('El usuario no está confirmado. En Supabase marca «Auto Confirm User».');throw new Error(errMsg(r.error));}
    ME=await cargarPerfil(r.data.user);return ME;
  }
  async function sesionGuardada(){
    if(MODE==='local'){var id=null;try{id=sessionStorage.getItem('mxLocalUser');}catch(e){}var u=LOCAL_OK&&id?LOCAL_USERS.filter(function(x){return x.id===id;})[0]:null;if(u){ME=await cargarPerfil(u);return ME;}return null;}
    try{var r=await sb.auth.getSession();var s=r&&r.data&&r.data.session;if(s&&s.user){ME=await cargarPerfil(s.user);return ME;}}catch(e){}
    return null;
  }
  async function logout(){if(MODE==='sb'){try{await sb.auth.signOut();}catch(e){}}try{sessionStorage.removeItem('mxLocalUser');}catch(e){}ME=null;TABLES.forEach(function(t){DB[t]=[];});}
  async function guardarPerfil(f){for(var k in f)ME[k]=f[k];
    if(MODE==='sb'){var r=await sb.from('perfiles').update(f).eq('id',ME.id);if(r.error){toast(errMsg(r.error),'err');throw r.error;}}
    else{var u=LOCAL_USERS.filter(function(x){return x.id===ME.id;})[0];if(u)for(var j in f)u[j]=f[j];}}

  /* ---- métricas ---- */
  function metricasDe(d,perfil){
    var h=hoy(),mes0=new Date(h.getFullYear(),h.getMonth(),1);
    var cl=d.clientes||[],po=d.polizas||[],co=d.cotizaciones||[],ci=d.citas||[];
    var lun=addDays(h,-((h.getDay()+6)%7)),dom=addDays(lun,6);
    var prod=[];for(var i=5;i>=0;i--){var m0=new Date(h.getFullYear(),h.getMonth()-i,1),m1=new Date(h.getFullYear(),h.getMonth()-i+1,1);
      prod.push(po.filter(function(p){var x=pd(p.inicio);return x&&x>=m0&&x<m1;}).reduce(function(a,p){return a+(+p.prima||0);},0));}
    return {id:perfil.id,nombre:perfil.nombre,iniciales:perfil.iniciales,color:perfil.color,
      clientes:cl.length,abiertos:cl.filter(function(c){return c.etapa<6;}).length,
      valor_pipeline:cl.filter(function(c){return c.etapa<6;}).reduce(function(a,c){return a+(+c.valor_prima||0);},0),
      cerrados:cl.filter(function(c){return c.etapa>=6;}).length,
      por_etapa:ETAPAS.map(function(e,i){return cl.filter(function(c){return c.etapa===i;}).length;}),
      polizas_activas:po.filter(function(p){return p.estado==='Activa'&&(!p.vence||pd(p.vence)>=h);}).length,
      primas_mes:po.filter(function(p){var x=pd(p.inicio);return x&&x>=mes0;}).reduce(function(a,p){return a+(+p.prima||0);},0),
      produccion:prod,cotizaciones:co.length,aprobadas:co.filter(function(c){return c.estado==='aprobada';}).length,
      citas_semana:ci.filter(function(c){var x=pd(c.fecha);return x&&x>=lun&&x<=dom;}).length,
      registros_bd:(d.base_registros||[]).length};
  }
  async function metricasGlobales(){
    if(MODE==='local'){return LOCAL_USERS.map(function(u){var d=u.id===ME.id?DB:(lsGet(localKey(u.id))||{});return metricasDe(d,u.id===ME.id?ME:u);});}
    var r=await sb.rpc('metricas_globales');if(r.error)throw r.error;return r.data||[];
  }

  /* ===================== COMPONENTES ===================== */
  function kpi(l,v,s,icn,hero){return '<div class="mx-kpi'+(hero?' hero':'')+'"><div class="l">'+ico(icn)+l+'</div><div class="v">'+v+'</div><div class="s">'+s+'</div></div>';}
  function rail(etapas,counts,sub,sel,cum){
    var h='<div class="mx-railwrap" style="--rail-min:'+(etapas.length*112)+'px"><div class="mx-rail">';
    etapas.forEach(function(e,i){h+='<button class="mx-stage'+(sel===i?' sel':'')+'" data-i="'+i+'" style="--st-bg:'+ET_COL[Math.round(i*(ET_COL.length-1)/Math.max(1,etapas.length-1))]+'"><span class="n">Etapa '+(i+1)+'</span><span class="t">'+e+'</span><span><span class="c">'+counts[i]+'</span>'+(sub?'<span class="m">'+sub[i]+'</span>':'')+'</span></button>';});
    h+='</div>';
    if(cum){var reach=counts.map(function(c,i){return counts.slice(i).reduce(function(a,b){return a+b;},0);});
      h+='<div class="mx-conv">'+etapas.map(function(e,i){return '<span>'+(i<etapas.length-1&&reach[i]?'avanza '+Math.round(reach[i+1]/reach[i]*100)+'% →':'')+'</span>';}).join('')+'</div>';}
    return h+'</div>';
  }
  function steps(total,cur){var h='<div class="mx-steps">';for(var i=0;i<total;i++)h+='<i class="'+(i<cur?'done':(i===cur?'cur':''))+'"></i>';return h+'</div>';}
  function vsteps(list,cur){return '<ol class="mx-vsteps">'+list.map(function(s,i){return '<li class="'+(i<cur?'done':(i===cur?'cur':''))+'"><i>'+(i<cur?'✓':i+1)+'</i><span>'+s+'</span></li>';}).join('')+'</ol>';}
  function badgeDias(d){var c=d>=7?'dan':(d>=4?'warn':'ok');return '<span class="d" style="color:var(--mx-'+c+')">'+d+' d</span>';}
  function src(o){var x=ORIG[o]||ORIG.otro;return '<span class="mx-src"><i style="background:'+x[1]+'"></i>'+x[0]+'</span>';}
  function badge(t,k){return '<span class="mx-badge b-'+(k||'mute')+'"><i></i>'+esc(t)+'</span>';}
  function avatar(p,size){p=p||ME||{};return '<span class="mx-av" style="background:'+(p.color||'#0F3E8C')+(size?';width:'+size+'px;height:'+size+'px;font-size:'+Math.round(size*.36)+'px':'')+'">'+esc(p.iniciales||inic(p.nombre))+'</span>';}
  function empty(icn,t,s,btn){return '<div class="mx-blank"><span class="ic">'+ico(icn)+'</span><b>'+t+'</b><p>'+s+'</p>'+(btn||'')+'</div>';}

  /* ---- panel lateral (ficha) ---- */
  function openDrawer(t,s,body,foot,wide){$('#mxDrT').textContent=t;$('#mxDrS').innerHTML=s||'';$('#mxDrB').innerHTML=body;$('#mxDrF').innerHTML=foot||'';$('#mxDrF').style.display=foot?'':'none';var d=$('#mxDrawer');d.classList.toggle('wide',!!wide);d.classList.add('on');$('#mxScrim').classList.add('on');d.setAttribute('aria-hidden','false');$('#mxDrB').scrollTop=0;paintIcons(d);}
  function closeDrawer(){$('#mxDrawer').classList.remove('on');$('#mxDrawer').setAttribute('aria-hidden','true');if(!$('#mxSide').classList.contains('open'))$('#mxScrim').classList.remove('on');drawerCtx=null;}
  var drawerCtx=null;

  /* ---- ventana modal ---- */
  var modalStack=[];
  function openModal(o){ // {t, s, body, foot, size, onMount}
    var el=document.createElement('div');el.className='mx-modal-wrap';
    el.innerHTML='<div class="mx-modal '+(o.size||'')+'" role="dialog" aria-modal="true"><div class="mx-md-h"><div><h3>'+esc(o.t)+'</h3>'+(o.s?'<p>'+o.s+'</p>':'')+'</div><button class="mx-ico" data-close aria-label="Cerrar">'+ico('x')+'</button></div><div class="mx-md-b">'+o.body+'</div>'+(o.foot?'<div class="mx-md-f">'+o.foot+'</div>':'')+'</div>';
    root.appendChild(el);modalStack.push(el);requestAnimationFrame(function(){el.classList.add('on');});
    el.addEventListener('mousedown',function(e){if(e.target===el)closeModal(el);});
    $$('[data-close]',el).forEach(function(b){b.addEventListener('click',function(){closeModal(el);});});
    paintIcons(el);if(o.onMount)o.onMount(el);
    var f=el.querySelector('input:not([type=hidden]):not([type=file]),select,textarea');if(f&&!o.noFocus)setTimeout(function(){try{f.focus();}catch(e){}},60);
    return el;
  }
  function closeModal(el){el=el||modalStack[modalStack.length-1];if(!el)return;modalStack=modalStack.filter(function(x){return x!==el;});el.classList.remove('on');setTimeout(function(){el.remove();},180);}
  function confirmar(t,s,okTxt,danger){return new Promise(function(res){var done=false;var m=openModal({t:t,s:s,size:'sm',body:'',noFocus:true,foot:'<button class="mx-btn mx-btn-s" data-close>Cancelar</button><button class="mx-btn '+(danger?'mx-btn-d':'mx-btn-p')+'" data-ok>'+(okTxt||'Aceptar')+'</button>',onMount:function(el){el.querySelector('[data-ok]').addEventListener('click',function(){done=true;closeModal(el);res(true);});}});
    var obs=new MutationObserver(function(){if(!m.isConnected){obs.disconnect();if(!done)res(false);}});obs.observe(root,{childList:true});});}

  /* ---- formularios ---- */
  function fld(label,inner,cls){return '<label class="mx-field'+(cls?' '+cls:'')+'"><span>'+label+'</span>'+inner+'</label>';}
  function inp(name,val,attrs){return '<input class="mx-input" name="'+name+'" value="'+esc(val==null?'':val)+'" '+(attrs||'')+'>';}
  function sel(name,opts,val,attrs){return '<select class="mx-select" name="'+name+'" '+(attrs||'')+'>'+opts.map(function(o){var v=Array.isArray(o)?o[0]:o,l=Array.isArray(o)?o[1]:o;return '<option value="'+esc(v)+'"'+(String(v)===String(val==null?'':val)?' selected':'')+'>'+esc(l)+'</option>';}).join('')+'</select>';}
  function txa(name,val,attrs){return '<textarea class="mx-input" name="'+name+'" rows="3" '+(attrs||'')+'>'+esc(val==null?'':val)+'</textarea>';}
  function formData(el){var o={};$$('[name]',el).forEach(function(i){if(i.type==='file')return;if(i.type==='checkbox'){o[i.name]=i.checked;return;}if(i.type==='radio'){if(i.checked)o[i.name]=i.value;return;}o[i.name]=i.value.trim();});return o;}
  function marcarError(el,name,msg){var i=el.querySelector('[name="'+name+'"]');if(i){i.classList.add('err');i.focus();i.addEventListener('input',function(){i.classList.remove('err');},{once:true});}toast(msg,'err');}
  function busy(btn,on,txt){if(!btn)return;if(on){btn._t=btn.innerHTML;btn.disabled=true;btn.innerHTML='<span class="mx-spin"></span>'+(txt||'Guardando…');}else{btn.disabled=false;if(btn._t)btn.innerHTML=btn._t;}}

  /* ---- menú desplegable ---- */
  function menu(btn,items){ // items: [[icon,label,fn]]
    cerrarMenus();var r=btn.getBoundingClientRect(),rr=root.getBoundingClientRect();
    var m=document.createElement('div');m.className='mx-menu';m.innerHTML=items.map(function(it,i){return it==='-'?'<hr>':'<button data-i="'+i+'">'+ico(it[0])+'<span>'+it[1]+(it[3]?'<small>'+it[3]+'</small>':'')+'</span></button>';}).join('');
    root.appendChild(m);var w=m.offsetWidth;var left=Math.min(r.right-w,window.innerWidth-w-10);m.style.left=Math.max(10,left)+'px';
    var top=r.bottom+6;if(top+m.offsetHeight>window.innerHeight-10)top=Math.max(10,r.top-m.offsetHeight-6);m.style.top=top+'px';
    $$('button',m).forEach(function(b){b.addEventListener('click',function(){var it=items[+b.dataset.i];cerrarMenus();it[2]();});});
    setTimeout(function(){document.addEventListener('mousedown',fuera);},0);
    function fuera(e){if(!m.contains(e.target)){cerrarMenus();}}
    m._off=function(){document.removeEventListener('mousedown',fuera);};
  }
  function cerrarMenus(){$$('.mx-menu').forEach(function(m){if(m._off)m._off();m.remove();});}

  /* ---- paginación ---- */
  function pager(total,page,size,id){var pages=Math.max(1,Math.ceil(total/size));if(total<=size)return '<div class="mx-pager"><span>'+nf(total)+' registro(s)</span></div>';
    return '<div class="mx-pager" id="'+id+'"><span>'+nf(page*size+1)+'–'+nf(Math.min(total,(page+1)*size))+' de '+nf(total)+'</span><div><button class="mx-btn mx-btn-s mx-btn-sm" data-pg="'+(page-1)+'"'+(page<=0?' disabled':'')+'>'+ico('chevL')+'</button><b>'+(page+1)+' / '+pages+'</b><button class="mx-btn mx-btn-s mx-btn-sm" data-pg="'+(page+1)+'"'+(page>=pages-1?' disabled':'')+'>'+ico('chevR')+'</button></div></div>';}

  /* ===================== CLIENTES: lógica compartida ===================== */
  function polizasDe(cid){return DB.polizas.filter(function(p){return p.cliente_id===cid;});}
  function segDe(cid){return DB.seguimientos.filter(function(s){return s.cliente_id===cid;}).sort(function(a,b){return new Date(b.created_at)-new Date(a.created_at);});}
  function docsDe(cid){return DB.documentos.filter(function(d){return d.cliente_id===cid;}).sort(function(a,b){return new Date(b.created_at)-new Date(a.created_at);});}
  function citasDe(cid){return DB.citas.filter(function(c){return c.cliente_id===cid;}).sort(function(a,b){return (a.fecha+a.hora)<(b.fecha+b.hora)?-1:1;});}
  function diasEtapa(c){return diasDesde(c.etapa_desde||c.created_at);}
  function ramoCliente(c){var p=polizasDe(c.id)[0];return c.ramo||(p&&p.ramo)||'';}
  function docTxt(c){return c.documento?(c.tipo_doc||'CC')+' '+c.documento:'';}

  async function addSeg(cid,tipo,texto,extra){var s={cliente_id:cid,tipo:tipo,texto:texto};if(extra)for(var k in extra)s[k]=extra[k];return dbInsert('seguimientos',s);}

  var TIPO_DOC=[['CC','Cédula de ciudadanía'],['NIT','NIT'],['CE','Cédula de extranjería'],['PP','Pasaporte'],['TI','Tarjeta de identidad'],['PPT','PPT']];
  var FIN_OPTS=['Contado','Financiado','Por definir'];

  /* ---- Crear / editar cliente ---- */
  function formCliente(c,opts){
    c=c||{};opts=opts||{};
    var h='<div class="mx-seg mx-mb" id="fcTipo"><button type="button" data-t="Persona" class="'+(c.tipo!=='Empresa'?'on':'')+'">'+ico('user')+' Persona natural</button><button type="button" data-t="Empresa" class="'+(c.tipo==='Empresa'?'on':'')+'">'+ico('building')+' Empresa</button></div><input type="hidden" name="tipo" value="'+(c.tipo||'Persona')+'">';
    h+='<div class="mx-form-sec">Datos personales</div><div class="mx-fgrid">'+
      fld('<span class="lbl-p">Nombre completo</span><span class="lbl-e">Razón social</span> *',inp('nombre',c.nombre,'autocomplete="off" placeholder="Ej: Carlos Andrés Ramírez"'),'span2')+
      fld('Tipo de documento',sel('tipo_doc',TIPO_DOC,c.tipo_doc||(c.tipo==='Empresa'?'NIT':'CC')))+
      fld('Número de cédula / NIT',inp('documento',c.documento,'inputmode="numeric" placeholder="Sin puntos"'))+
      fld('<span class="lbl-p">Empresa donde trabaja</span><span class="lbl-e">Persona de contacto</span>',inp('empresa',c.empresa))+
      fld('Cargo',inp('cargo',c.cargo))+
      fld('Fecha de nacimiento <small>(recordatorio de cumpleaños)</small>',inp('nacimiento',c.nacimiento,'type="date" max="'+ymd(hoy())+'"'),'only-p')+
      fld('Número de hijos',inp('hijos',c.hijos,'type="number" min="0" max="20"'),'only-p')+
    '</div>';
    h+='<div class="mx-form-sec">Contacto</div><div class="mx-fgrid">'+
      fld('Celular / WhatsApp *',inp('celular',c.celular,'inputmode="tel" placeholder="310 000 0000"'))+
      fld('Correo electrónico',inp('correo',c.correo,'type="email" placeholder="nombre@correo.com"'))+
      fld('Ciudad',inp('ciudad',c.ciudad||'Ibagué','list="mxCiudades"'))+
      fld('Dirección',inp('direccion',c.direccion,'placeholder="Calle, carrera, barrio"'))+
    '</div><datalist id="mxCiudades">'+['Ibagué','Espinal','Melgar','Honda','Mariquita','Chaparral','Líbano','Guamo','Flandes','Girardot','Bogotá','Neiva','Armenia','Pereira','Medellín','Cali'].map(function(x){return '<option value="'+x+'">';}).join('')+'</datalist>';
    h+='<div class="mx-form-sec">Negocio</div><div class="mx-fgrid">'+
      fld('Ramo de interés',sel('ramo',[['','— Por definir —']].concat(Object.keys(RAMOS).map(function(r){return [r,r+' · '+RAMOS[r][0]];})),c.ramo))+
      fld('Aseguradora',inp('aseguradora',c.aseguradora,'list="mxAseg" placeholder="Por definir"'))+
      fld('¿Cómo llegó?',sel('origen',Object.keys(ORIG).map(function(o){return [o,ORIG[o][0]];}),c.origen||'wa'))+
      fld('Prima estimada (COP)',inp('valor_prima',c.valor_prima||'','inputmode="numeric" placeholder="0"'))+
      fld('Financiación',sel('financiacion',FIN_OPTS,c.financiacion||'Por definir'))+
      fld('Próximo contacto',inp('proximo_contacto',c.proximo_contacto||ymd(addDays(hoy(),1)),'type="date"'))+
    '</div><datalist id="mxAseg">'+ASEG.map(function(a){return '<option value="'+a+'">';}).join('')+'</datalist>';
    h+=fld('Observaciones',txa('observaciones',c.observaciones,'placeholder="Necesidades, familia, vehículos, gustos, lo que debas recordar del cliente"'));
    if(opts.nuevo)h+='<div class="mx-form-sec">Documentos del cliente <small>(opcional · PDF, PNG o JPG)</small></div><label class="mx-drop" id="fcDrop"><input type="file" name="_files" multiple accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg">'+ico('upload')+'<b>Arrastra aquí los documentos o toca para elegirlos</b><small>Cédula, tarjeta de propiedad, pólizas anteriores, etc.</small><span class="files"></span></label>';
    return h;
  }
  function montarFormCliente(el){
    var tipoIn=el.querySelector('[name=tipo]');
    function aplicar(){var e=tipoIn.value==='Empresa';el.classList.toggle('is-emp',e);var td=el.querySelector('[name=tipo_doc]');if(e&&td.value==='CC')td.value='NIT';if(!e&&td.value==='NIT')td.value='CC';}
    $$('#fcTipo button',el).forEach(function(b){b.addEventListener('click',function(){$$('#fcTipo button',el).forEach(function(x){x.classList.toggle('on',x===b);});tipoIn.value=b.dataset.t;aplicar();});});
    el.classList.toggle('is-emp',tipoIn.value==='Empresa');
    var vp=el.querySelector('[name=valor_prima]');if(vp){vp.addEventListener('input',function(){var d=digits(vp.value);vp.value=d?(+d).toLocaleString('es-CO'):'';});if(vp.value)vp.value=(+digits(vp.value)).toLocaleString('es-CO');}
    var drop=el.querySelector('#fcDrop');if(drop)montarDrop(drop);
  }
  function montarDrop(drop){
    var fi=drop.querySelector('input[type=file]');var lista=drop.querySelector('.files');drop._files=[];
    function pintar(){lista.innerHTML=drop._files.map(function(f){return '<i>'+esc(f.name)+' · '+bytesFmt(f.size)+'</i>';}).join('');}
    function add(files){Array.prototype.forEach.call(files,function(f){if(!/\.(pdf|png|jpe?g)$/i.test(f.name)){toast(f.name+': solo se aceptan PDF, PNG o JPG','err');return;}if(f.size>15*1048576){toast(f.name+' pesa más de 15 MB','err');return;}drop._files.push(f);});pintar();}
    fi.addEventListener('change',function(){add(fi.files);fi.value='';});
    ['dragenter','dragover'].forEach(function(ev){drop.addEventListener(ev,function(e){e.preventDefault();drop.classList.add('over');});});
    ['dragleave','drop'].forEach(function(ev){drop.addEventListener(ev,function(e){e.preventDefault();drop.classList.remove('over');});});
    drop.addEventListener('drop',function(e){add(e.dataTransfer.files);});
  }
  function validarCliente(el,f,actual){
    if(!f.nombre){marcarError(el,'nombre','Escribe el nombre del cliente.');return false;}
    var cel=digits(f.celular);if(!cel){marcarError(el,'celular','El celular es obligatorio para WhatsApp.');return false;}
    if(cel.length<7||cel.length>12){marcarError(el,'celular','Revisa el número de celular.');return false;}
    if(f.correo&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.correo)){marcarError(el,'correo','El correo no parece válido.');return false;}
    var doc=digits(f.documento);
    var dup=DB.clientes.filter(function(c){return c!==actual&&((doc&&digits(c.documento)===doc)||digits(c.celular)===cel);})[0];
    if(dup){marcarError(el,doc&&digits(dup.documento)===doc?'documento':'celular','Ya tienes un cliente con ese '+(doc&&digits(dup.documento)===doc?'documento':'celular')+': '+dup.nombre);return false;}
    return true;
  }
  function normalizarCliente(f){
    var o={tipo:f.tipo||'Persona',nombre:titleCase(f.nombre).replace(/\b(Sas|S\.a\.s\.?|Ltda|S\.a\.?)\b/g,function(w){return w.toUpperCase();}),tipo_doc:f.tipo_doc,documento:digits(f.documento)||null,empresa:f.empresa||null,cargo:f.cargo||null,
      celular:digits(f.celular),correo:(f.correo||'').toLowerCase()||null,ciudad:f.ciudad||null,direccion:f.direccion||null,
      nacimiento:(f.tipo!=='Empresa'&&f.nacimiento)||null,hijos:(f.tipo!=='Empresa'&&f.hijos!=='')?(+f.hijos||0):null,
      ramo:f.ramo||null,aseguradora:f.aseguradora||null,origen:f.origen||'otro',valor_prima:+digits(f.valor_prima)||0,
      financiacion:f.financiacion||null,proximo_contacto:f.proximo_contacto||null,observaciones:f.observaciones||null};
    return o;
  }
  function nuevoCliente(pre){
    pre=pre||{};
    openModal({t:'Crear cliente',s:'Queda en la etapa 1 del pipeline: «Nuevo cliente».',size:'lg',body:'<form class="mx-form" id="fcForm" autocomplete="off">'+formCliente(pre,{nuevo:true})+'</form>',
      foot:'<button class="mx-btn mx-btn-s" data-close>Cancelar</button><button class="mx-btn mx-btn-p" id="fcSave">'+ico('check')+'Crear cliente</button>',
      onMount:function(el){montarFormCliente(el);
        el.querySelector('#fcSave').addEventListener('click',async function(){var b=this;var f=formData(el);if(!validarCliente(el,f,null))return;
          busy(b,true);try{
            var c=normalizarCliente(f);c.etapa=0;c.etapa_desde=new Date().toISOString();if(pre._base_registro)c.observaciones=(c.observaciones?c.observaciones+'\n':'')+'Origen: '+pre._base_registro;
            await dbInsert('clientes',c);
            await addSeg(c.id,'etapa','Cliente creado en «'+ETAPAS[0]+'».'+(c.observaciones?' '+c.observaciones:''),{etapa_desde:null,etapa_hasta:0});
            var drop=el.querySelector('#fcDrop');if(drop&&drop._files.length){for(var i=0;i<drop._files.length;i++){try{await guardarDoc(c.id,drop._files[i]);}catch(e){toast('No se subió '+drop._files[i].name+': '+errMsg(e),'err');}}}
            closeModal(el);toast(c.nombre+' creado en «Nuevo cliente»','ok');refreshAll();fichaCliente(c.id);
          }catch(e){busy(b,false);}
        });
      }});
  }
  function editarCliente(id){
    var c=byId(DB.clientes,id);if(!c)return;
    openModal({t:'Editar datos de '+c.nombre,size:'lg',body:'<form class="mx-form" autocomplete="off">'+formCliente(c)+'</form>',
      foot:'<button class="mx-btn mx-btn-s" data-close>Cancelar</button><button class="mx-btn mx-btn-p" data-save>'+ico('check')+'Guardar cambios</button>',
      onMount:function(el){montarFormCliente(el);el.querySelector('[data-save]').addEventListener('click',async function(){var b=this;var f=formData(el);if(!validarCliente(el,f,c))return;busy(b,true);
        try{await dbUpdate('clientes',c.id,normalizarCliente(f));closeModal(el);toast('Datos actualizados','ok');refreshAll();fichaCliente(c.id,'datos');}catch(e){busy(b,false);}});}});
  }
  async function eliminarCliente(id){
    var c=byId(DB.clientes,id);if(!c)return;
    if(!(await confirmar('¿Eliminar a '+c.nombre+'?','Se borran también sus pólizas, seguimientos, documentos y cotizaciones. No se puede deshacer.','Eliminar cliente',true)))return;
    try{docsDe(id).forEach(function(d){borrarArchivo('documentos',d.ruta);});await dbDelete('clientes',id);
      ['polizas','seguimientos','documentos','cotizaciones'].forEach(function(t){DB[t]=DB[t].filter(function(x){return x.cliente_id!==id;});});
      DB.citas.forEach(function(x){if(x.cliente_id===id)x.cliente_id=null;});saveLocal();closeDrawer();toast('Cliente eliminado');refreshAll();}catch(e){}
  }

  /* ---- Cambio de etapa con observación obligatoria ---- */
  function cambiarEtapa(id,et,obsPre){
    var c=byId(DB.clientes,id);if(!c||c.etapa===et)return;
    var sube=et>c.etapa;var pidePol=et>=6&&c.etapa<6&&!polizasDe(id).length;
    var h='<div class="mx-etapa-mov"><div><small>De</small><b>'+(c.etapa+1)+'. '+ETAPAS[c.etapa]+'</b></div><span>'+ico('next')+'</span><div class="to"><small>A</small><select class="mx-et-sel" name="_et" aria-label="Etapa destino">'+ETAPAS.map(function(e,i){return i===c.etapa?'':'<option value="'+i+'"'+(i===et?' selected':'')+'>'+(i+1)+'. '+e+'</option>';}).join('')+'</select></div></div>';
    h+=fld('Observación de esta etapa *',txa('obs',obsPre||'','rows="4" placeholder="¿Qué pasó? ¿Qué acordaron? ¿Cuál es el siguiente paso? Ej: Envié cotización de Mapfre y HDI, la revisa con la esposa y responde el viernes."'));
    h+='<div class="mx-fgrid">'+fld('Próximo contacto',inp('prox',c.proximo_contacto&&pd(c.proximo_contacto)>=hoy()?c.proximo_contacto:ymd(addDays(hoy(),2)),'type="date"'))+(et===2&&!DB.cotizaciones.some(function(q){return q.cliente_id===id;})?'<div class="mx-hint">'+ico('doc')+' Al pasar a «Seguimiento» se crea la cotización automáticamente.</div>':'')+'</div>';
    if(pidePol){h+='<label class="mx-check-row"><input type="checkbox" name="regpol" checked> Registrar la póliza ahora (activa cartera y renovaciones)</label><div class="mx-fgrid" id="cePol">'+
      fld('Ramo',sel('p_ramo',Object.keys(RAMOS).map(function(r){return [r,r+' · '+RAMOS[r][0]];}),c.ramo||'ATR'))+
      fld('Aseguradora',inp('p_aseg',c.aseguradora,'list="mxAseg2"'))+fld('N.º de póliza',inp('p_num',''))+
      fld('Prima total (COP)',inp('p_prima',c.valor_prima?(+c.valor_prima).toLocaleString('es-CO'):'','inputmode="numeric"'))+
      fld('Inicio de vigencia',inp('p_ini',ymd(hoy()),'type="date"'))+fld('Fin de vigencia',inp('p_fin',ymd(addMonths(hoy(),12)),'type="date"'))+
      fld('Forma de pago',sel('p_fin_t',['Contado','Financiado'],c.financiacion==='Financiado'?'Financiado':'Contado'))+fld('N.º de cuotas',inp('p_cuotas','1','type="number" min="1" max="24"'))+
    '</div><datalist id="mxAseg2">'+ASEG.map(function(a){return '<option value="'+a+'">';}).join('')+'</datalist>';}
    openModal({t:sube?'Avanzar etapa':'Devolver etapa',s:esc(c.nombre)+' · '+ramoN(c.ramo),body:'<form class="mx-form">'+h+'</form>',
      foot:'<button class="mx-btn mx-btn-s" data-close>Cancelar</button><button class="mx-btn mx-btn-p" data-ok>'+ico('check')+'Guardar y mover</button>',
      onMount:function(el){
        el.querySelector('[name=_et]').addEventListener('change',function(){var v=+this.value,t=el.querySelector('[name=obs]').value;closeModal(el);cambiarEtapa(id,v,t);});
        var cb=el.querySelector('[name=regpol]');if(cb)cb.addEventListener('change',function(){el.querySelector('#cePol').style.display=cb.checked?'':'none';});
        var pp=el.querySelector('[name=p_prima]');if(pp)pp.addEventListener('input',function(){var d=digits(pp.value);pp.value=d?(+d).toLocaleString('es-CO'):'';});
        var ft=el.querySelector('[name=p_fin_t]');if(ft)ft.addEventListener('change',function(){var cu=el.querySelector('[name=p_cuotas]');if(ft.value==='Contado')cu.value='1';else if(cu.value==='1')cu.value='10';});
        el.querySelector('[data-ok]').addEventListener('click',async function(){var b=this;var f=formData(el);
          if(f.obs.length<5){marcarError(el,'obs','Escribe la observación de la etapa (mínimo 5 letras).');return;}
          busy(b,true);
          try{
            var desde=c.etapa;
            await dbUpdate('clientes',id,{etapa:et,etapa_desde:new Date().toISOString(),proximo_contacto:f.prox||null});
            await addSeg(id,'etapa',f.obs,{etapa_desde:desde,etapa_hasta:et});
            if(et===2&&!DB.cotizaciones.some(function(q){return q.cliente_id===id;})){
              await dbInsert('cotizaciones',{cliente_id:id,numero:'COT-'+String(Date.now()).slice(-5),ramo:c.ramo,estado:'generada',financiacion:c.financiacion||'Por definir',ofertas:[],notas:f.obs});
            }
            if(pidePol&&f.regpol){var cu=Math.max(1,+f.p_cuotas||1);
              await dbInsert('polizas',{cliente_id:id,ramo:f.p_ramo,aseguradora:f.p_aseg||null,numero:f.p_num||null,prima:+digits(f.p_prima)||0,inicio:f.p_ini||null,vence:f.p_fin||null,financiacion:f.p_fin_t,cuotas:f.p_fin_t==='Contado'?1:cu,cuotas_pagadas:et>=6?1:0,renov_etapa:0,estado:'Activa'});
              if(f.p_aseg&&!c.aseguradora)await dbUpdate('clientes',id,{aseguradora:f.p_aseg});}
            closeModal(el);toast(c.nombre+' pasó a «'+ETAPAS[et]+'»'+(et===2?' · cotización creada':''),'ok');refreshAll();
            if(drawerCtx&&drawerCtx.id===id)fichaCliente(id,drawerCtx.tab);
          }catch(e){busy(b,false);}
        });
      }});
  }

  /* ---- Pólizas ---- */
  function formPoliza(p,cid){p=p||{};var c=byId(DB.clientes,cid)||{};
    return '<form class="mx-form"><div class="mx-fgrid">'+
      fld('Ramo',sel('ramo',Object.keys(RAMOS).map(function(r){return [r,r+' · '+RAMOS[r][0]];}),p.ramo||c.ramo||'ATR'))+
      fld('Aseguradora',inp('aseguradora',p.aseguradora||c.aseguradora,'list="mxAseg3"'))+
      fld('N.º de póliza',inp('numero',p.numero))+fld('Prima total (COP)',inp('prima',p.prima?(+p.prima).toLocaleString('es-CO'):'','inputmode="numeric"'))+
      fld('Inicio de vigencia',inp('inicio',p.inicio||ymd(hoy()),'type="date"'))+fld('Fin de vigencia',inp('vence',p.vence||ymd(addMonths(hoy(),12)),'type="date"'))+
      fld('Forma de pago',sel('financiacion',['Contado','Financiado'],p.financiacion||'Contado'))+fld('N.º de cuotas',inp('cuotas',p.cuotas||1,'type="number" min="1" max="24"'))+
      fld('Cuotas pagadas',inp('cuotas_pagadas',p.cuotas_pagadas||0,'type="number" min="0" max="24"'))+fld('Estado',sel('estado',['Activa','Cancelada','Vencida'],p.estado||'Activa'))+
    '</div><datalist id="mxAseg3">'+ASEG.map(function(a){return '<option value="'+a+'">';}).join('')+'</datalist></form>';}
  function editarPoliza(cid,pid){
    var p=pid?byId(DB.polizas,pid):null;
    openModal({t:p?'Editar póliza':'Agregar póliza',s:esc((byId(DB.clientes,cid)||{}).nombre||''),body:formPoliza(p,cid),
      foot:(p?'<button class="mx-btn mx-btn-g mx-del" data-del>'+ico('trash')+'Eliminar</button>':'')+'<button class="mx-btn mx-btn-s" data-close>Cancelar</button><button class="mx-btn mx-btn-p" data-ok>'+ico('check')+'Guardar póliza</button>',
      onMount:function(el){var pr=el.querySelector('[name=prima]');pr.addEventListener('input',function(){var d=digits(pr.value);pr.value=d?(+d).toLocaleString('es-CO'):'';});
        var fin=el.querySelector('[name=financiacion]');fin.addEventListener('change',function(){var cu=el.querySelector('[name=cuotas]');if(fin.value==='Contado')cu.value=1;else if(+cu.value<2)cu.value=10;});
        el.querySelector('[data-ok]').addEventListener('click',async function(){var b=this;var f=formData(el);
          if(!(+digits(f.prima))){marcarError(el,'prima','Escribe el valor de la prima.');return;}
          if(f.vence&&f.inicio&&pd(f.vence)<=pd(f.inicio)){marcarError(el,'vence','El fin de vigencia debe ser posterior al inicio.');return;}
          var cu=f.financiacion==='Contado'?1:Math.max(1,+f.cuotas||1);
          var o={ramo:f.ramo,aseguradora:f.aseguradora||null,numero:f.numero||null,prima:+digits(f.prima),inicio:f.inicio||null,vence:f.vence||null,financiacion:f.financiacion,cuotas:cu,cuotas_pagadas:Math.min(cu,+f.cuotas_pagadas||0),estado:f.estado};
          busy(b,true);try{if(p)await dbUpdate('polizas',p.id,o);else{o.cliente_id=cid;o.renov_etapa=0;await dbInsert('polizas',o);await addSeg(cid,'sistema','Póliza registrada: '+ramoN(o.ramo)+(o.aseguradora?' con '+o.aseguradora:'')+' por '+cop(o.prima)+'.');}
            closeModal(el);toast('Póliza guardada','ok');refreshAll();if(drawerCtx&&drawerCtx.id===cid)fichaCliente(cid,'polizas');}catch(e){busy(b,false);}});
        var d=el.querySelector('[data-del]');if(d)d.addEventListener('click',async function(){if(!(await confirmar('¿Eliminar esta póliza?','También desaparece de cartera y renovaciones.','Eliminar',true)))return;try{await dbDelete('polizas',p.id);closeModal(el);refreshAll();if(drawerCtx&&drawerCtx.id===cid)fichaCliente(cid,'polizas');}catch(e){}});
      }});
  }
  function cuotaInfo(p){var cu=+p.cuotas||1;if(p.financiacion!=='Financiado'||cu<2)return null;var pag=+p.cuotas_pagadas||0;if(pag>=cu)return {fin:true,valor:Math.round(p.prima/cu),pag:pag,tot:cu};
    var ini=pd(p.inicio)||hoy();var vence=addMonths(ini,pag);return {fin:false,valor:Math.round((+p.prima||0)/cu),pag:pag,tot:cu,num:pag+1,fecha:vence,dias:diffDays(vence,hoy())};}

  /* ---- Documentos ---- */
  async function guardarDoc(cid,file){
    var up=await subirArchivo('documentos',cid,file);
    var d={cliente_id:cid,nombre:file.name,ruta:up.ruta,mime:file.type||(/\.pdf$/i.test(file.name)?'application/pdf':'image/jpeg'),tamano:file.size};if(up.data)d.data=up.data;
    try{await dbInsert('documentos',d);}catch(e){borrarArchivo('documentos',up.ruta);throw e;}
    return d;
  }
  async function verDoc(id,descargar){
    var d=byId(DB.documentos,id);if(!d)return;
    try{var url=await urlArchivo('documentos',d);
      if(descargar){var a=document.createElement('a');a.href=url;a.download=d.nombre;a.target='_blank';document.body.appendChild(a);a.click();a.remove();return;}
      if(/^image\//.test(d.mime))openModal({t:d.nombre,size:'lg',noFocus:true,body:'<div class="mx-docview"><img src="'+url+'" alt="'+esc(d.nombre)+'"></div>',foot:'<button class="mx-btn mx-btn-s" data-close>Cerrar</button>'});
      else if(d.data){var w=window.open();if(w)w.document.write('<iframe src="'+url+'" style="border:0;position:fixed;inset:0;width:100%;height:100%"></iframe>');}
      else window.open(url,'_blank','noopener');
    }catch(e){toast('No se pudo abrir el documento: '+errMsg(e),'err');}
  }

  /* ---- Ficha del cliente ---- */
  function fichaCliente(id,tab){
    var c=byId(DB.clientes,id);if(!c)return;tab=tab||'datos';drawerCtx={tipo:'cliente',id:id,tab:tab};
    var pols=polizasDe(id),segs=segDe(id),docs=docsDe(id),cits=citasDe(id);
    var cum=proxCumple(c.nacimiento);
    var head='<div class="mx-ficha-head"><span class="mx-av lg" style="background:'+(c.tipo==='Empresa'?'linear-gradient(135deg,#0F3E8C,#00A7E8)':'linear-gradient(135deg,#05083D,#246BFD)')+'">'+esc(inic(c.nombre))+'</span><div><div class="tags">'+code(c.ramo)+src(c.origen)+(c.tipo==='Empresa'?badge('Empresa','info'):'')+'</div><div class="et">Etapa '+(c.etapa+1)+' · <b>'+ETAPAS[c.etapa]+'</b> · '+diasEtapa(c)+' días</div>'+steps(9,c.etapa)+'</div></div>';
    head+='<div class="mx-quick">'+
      (c.celular?'<a class="mx-btn mx-btn-wa mx-btn-sm" target="_blank" rel="noopener" href="'+waLink(c.celular,'Hola '+primerNombre(c.nombre)+', te saluda '+ME.nombre+' de Mateo Herrera Seguros. ')+'">'+ico('wa')+'WhatsApp</a><a class="mx-btn mx-btn-s mx-btn-sm" href="tel:+'+waNum(c.celular)+'">'+ico('phone')+'Llamar</a>':'')+
      (c.correo?'<a class="mx-btn mx-btn-s mx-btn-sm" href="mailto:'+esc(c.correo)+'">'+ico('mail')+'Correo</a>':'')+
      '<button class="mx-btn mx-btn-s mx-btn-sm" data-act="cita">'+ico('cal')+'Agendar cita</button>'+
      '<button class="mx-btn mx-btn-p mx-btn-sm" data-act="avanzar"'+(c.etapa>=8?' disabled':'')+'>'+ico('next')+'Avanzar etapa</button></div>';
    var tabs=[['datos','Datos'],['seg','Seguimiento',segs.length],['pol','Pólizas',pols.length],['docs','Documentos',docs.length],['citas','Citas',cits.length]];
    if(tab==='polizas')tab='pol';
    head+='<div class="mx-tabs" id="fcTabs">'+tabs.map(function(t){return '<button data-tab="'+t[0]+'" class="'+(tab===t[0]?'on':'')+'">'+t[1]+(t[2]?' <i>'+t[2]+'</i>':'')+'</button>';}).join('')+'</div>';
    var b='';
    if(tab==='datos'){
      function row(l,v){return '<dt>'+l+'</dt><dd>'+(v||'<span class="mute">—</span>')+'</dd>';}
      b+='<div class="mx-sec">Datos '+(c.tipo==='Empresa'?'de la empresa':'personales')+'</div><dl class="mx-dl">'+
        row(c.tipo==='Empresa'?'Razón social':'Nombre',esc(c.nombre))+row('Documento',esc(docTxt(c)))+
        (c.tipo==='Empresa'?row('Contacto',esc(c.empresa))+row('Cargo',esc(c.cargo)):row('Empresa',esc(c.empresa))+row('Cargo',esc(c.cargo))+row('Nacimiento',c.nacimiento?fchL(c.nacimiento)+(cum?' · <b>cumple '+cum.edad+' en '+(cum.dias===0?'¡hoy!':cum.dias+' días')+'</b>':''):'')+row('Hijos',c.hijos!=null?String(c.hijos):''))+
      '</dl><div class="mx-sec">Contacto</div><dl class="mx-dl">'+row('Celular',c.celular?telFmt(c.celular):'')+row('Correo',esc(c.correo))+row('Ciudad',esc(c.ciudad))+row('Dirección',esc(c.direccion))+'</dl>'+
      '<div class="mx-sec">Negocio</div><dl class="mx-dl">'+row('Ramo',c.ramo?code(c.ramo)+' '+ramoN(c.ramo):'')+row('Aseguradora',esc(c.aseguradora))+row('Prima estimada',c.valor_prima?cop(c.valor_prima):'')+row('Financiación',esc(c.financiacion))+row('Origen',(ORIG[c.origen]||ORIG.otro)[0])+row('Próximo contacto',c.proximo_contacto?fchL(c.proximo_contacto):'')+row('Creado',fchHora(c.created_at))+'</dl>'+
      '<div class="mx-sec">Observaciones</div><div class="mx-note">'+(c.observaciones?esc(c.observaciones).replace(/\n/g,'<br>'):'<span class="mute">Sin observaciones. Usa «Editar datos» para agregarlas.</span>')+'</div>'+
      '<div class="mx-sec">Recorrido en el pipeline</div>'+vsteps(ETAPAS,c.etapa);
    }
    if(tab==='seg'){
      b+='<form class="mx-form mx-segform" id="segForm"><div class="mx-seg-tipos">'+['nota','llamada','whatsapp','reunion','correo','visita'].map(function(k,i){return '<label><input type="radio" name="tipo" value="'+k+'"'+(i===0?' checked':'')+'><span>'+ico(SEG_TIPOS[k][1])+SEG_TIPOS[k][0]+'</span></label>';}).join('')+'</div>'+
        txa('texto','','rows="3" placeholder="Escribe la observación de seguimiento: qué hablaste, qué respondió, qué sigue…"')+
        '<div class="mx-segform-f"><label>Próximo contacto '+inp('prox',c.proximo_contacto||'','type="date"')+'</label><button type="submit" class="mx-btn mx-btn-p mx-btn-sm">'+ico('plus')+'Guardar seguimiento</button></div></form>';
      b+=segs.length?'<ol class="mx-timeline">'+segs.map(function(s){var t=SEG_TIPOS[s.tipo]||SEG_TIPOS.nota;
        var tit=s.tipo==='etapa'&&s.etapa_hasta!=null?(s.etapa_desde==null?'Ingresó a «'+ETAPAS[s.etapa_hasta]+'»':'Etapa '+(s.etapa_desde+1)+' → '+(s.etapa_hasta+1)+' · '+ETAPAS[s.etapa_hasta]):t[0];
        return '<li><span class="dot" style="background:'+t[2]+'">'+ico(t[1])+'</span><div><div class="h"><b>'+esc(tit)+'</b><small>'+fchHora(s.created_at)+'</small>'+(s.tipo!=='etapa'&&s.tipo!=='sistema'?'<button class="mx-x" data-delseg="'+s.id+'" title="Eliminar">'+ico('trash')+'</button>':'')+'</div><p>'+esc(s.texto).replace(/\n/g,'<br>')+'</p></div></li>';}).join('')+'</ol>':empty('note','Sin seguimientos todavía','Registra cada llamada, mensaje o reunión con el cliente.');
    }
    if(tab==='pol'){
      b+='<div class="mx-row-end"><button class="mx-btn mx-btn-p mx-btn-sm" data-act="addpol">'+ico('plus')+'Agregar póliza</button></div>';
      b+=pols.length?pols.map(function(p){var q=cuotaInfo(p);var dv=p.vence?diffDays(p.vence,hoy()):null;
        return '<div class="mx-pol" data-pol="'+p.id+'"><div class="t">'+code(p.ramo)+'<b>'+ramoN(p.ramo)+'</b>'+badge(p.estado,p.estado==='Activa'?'ok':'mute')+'</div><dl class="mx-dl sm"><dt>Aseguradora</dt><dd>'+esc(p.aseguradora||'—')+'</dd><dt>N.º póliza</dt><dd>'+esc(p.numero||'—')+'</dd><dt>Prima</dt><dd><b>'+cop(p.prima)+'</b></dd><dt>Vigencia</dt><dd>'+fchL(p.inicio)+' → '+fchL(p.vence)+(dv!=null&&dv<=60&&dv>=-30?' <span style="color:var(--mx-'+(dv<=15?'dan':'warn')+')">('+(dv<0?'venció hace '+(-dv):'vence en '+dv)+' d)</span>':'')+'</dd><dt>Pago</dt><dd>'+(p.financiacion==='Financiado'?'Financiado · '+p.cuotas_pagadas+' de '+p.cuotas+' cuotas'+(q&&!q.fin?' · próxima '+fch(q.fecha)+' por '+cop(q.valor):''):'Contado')+'</dd></dl></div>';}).join(''):empty('shield','Sin pólizas','Registra la póliza cuando el cliente la compre.');
    }
    if(tab==='docs'){
      b+='<label class="mx-drop sm" id="docDrop"><input type="file" multiple accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg">'+ico('upload')+'<b>Subir documentos</b><small>PDF, PNG o JPG · máx. 15 MB</small><span class="files"></span></label>';
      b+=docs.length?'<div class="mx-docs">'+docs.map(function(d){var img=/^image\//.test(d.mime);return '<div class="mx-doc"><span class="ic '+(img?'img':'pdf')+'">'+ico(img?'image':'file')+'</span><div><b title="'+esc(d.nombre)+'">'+esc(d.nombre)+'</b><small>'+bytesFmt(d.tamano)+' · '+fchL(d.created_at)+'</small></div><button class="mx-ico sm" data-vdoc="'+d.id+'" title="Ver">'+ico('eye')+'</button><button class="mx-ico sm" data-ddoc="'+d.id+'" title="Descargar">'+ico('download')+'</button><button class="mx-ico sm" data-xdoc="'+d.id+'" title="Eliminar">'+ico('trash')+'</button></div>';}).join('')+'</div>':empty('file','Sin documentos','Sube la cédula, la tarjeta de propiedad, la póliza firmada u otros soportes.');
    }
    if(tab==='citas'){
      b+='<div class="mx-row-end"><button class="mx-btn mx-btn-p mx-btn-sm" data-act="cita">'+ico('plus')+'Agendar cita</button></div>';
      b+=cits.length?cits.map(function(x){return '<div class="mx-cita-li" data-cita="'+x.id+'"><span class="bar" style="background:'+(CITA_COL[x.tipo]||'#475569')+'"></span><div><b>'+esc(x.tipo||'Cita')+'</b><small>'+fchL(x.fecha)+' · '+hora12(x.hora)+' · '+esc(x.lugar||'')+'</small></div>'+badge(x.estado,CITA_EST[x.estado])+'</div>';}).join(''):empty('cal','Sin citas','Agenda una cita y aparecerá en tu agenda semanal.');
    }
    var foot='<button class="mx-btn mx-btn-g mx-del" data-act="del">'+ico('trash')+'Eliminar</button><button class="mx-btn mx-btn-s" data-act="edit">'+ico('edit')+'Editar datos</button>'+(c.etapa>0?'<button class="mx-btn mx-btn-s" data-act="atras">'+ico('chevL')+'Devolver etapa</button>':'');
    openDrawer(c.nombre,esc(docTxt(c)||(c.celular?telFmt(c.celular):'')),head+'<div class="mx-ficha-b">'+b+'</div>',foot,true);
    var D=$('#mxDrawer');
    $$('#fcTabs button',D).forEach(function(x){x.addEventListener('click',function(){fichaCliente(id,x.dataset.tab);});});
    $$('[data-act]',D).forEach(function(x){x.addEventListener('click',function(){var a=x.dataset.act;
      if(a==='avanzar')cambiarEtapa(id,Math.min(8,c.etapa+1));if(a==='atras')cambiarEtapa(id,c.etapa-1);if(a==='edit')editarCliente(id);if(a==='del')eliminarCliente(id);
      if(a==='addpol')editarPoliza(id);if(a==='cita')nuevaCita({cliente_id:id});});});
    $$('[data-pol]',D).forEach(function(x){x.addEventListener('click',function(){editarPoliza(id,x.dataset.pol);});});
    $$('[data-cita]',D).forEach(function(x){x.addEventListener('click',function(){nuevaCita(null,x.dataset.cita);});});
    var sf=$('#segForm',D);if(sf)sf.addEventListener('submit',async function(e){e.preventDefault();var f=formData(sf);if(f.texto.length<3){marcarError(sf,'texto','Escribe la observación.');return;}
      var btn=sf.querySelector('button[type=submit]');busy(btn,true);try{await addSeg(id,f.tipo,f.texto);if(f.prox!==(c.proximo_contacto||''))await dbUpdate('clientes',id,{proximo_contacto:f.prox||null});toast('Seguimiento guardado','ok');refreshAll();fichaCliente(id,'seg');}catch(er){busy(btn,false);}});
    $$('[data-delseg]',D).forEach(function(x){x.addEventListener('click',async function(){if(!(await confirmar('¿Eliminar este seguimiento?','','Eliminar',true)))return;try{await dbDelete('seguimientos',x.dataset.delseg);fichaCliente(id,'seg');}catch(e){}});});
    var dd=$('#docDrop',D);if(dd){var fi=dd.querySelector('input');
      async function subir(files){var ok=0;dd.classList.add('busy');for(var i=0;i<files.length;i++){var f=files[i];if(!/\.(pdf|png|jpe?g)$/i.test(f.name)){toast(f.name+': solo PDF, PNG o JPG','err');continue;}if(f.size>15*1048576){toast(f.name+' pesa más de 15 MB','err');continue;}
        dd.querySelector('.files').innerHTML='<i>Subiendo '+esc(f.name)+'…</i>';try{await guardarDoc(id,f);ok++;}catch(e){toast('No se subió '+f.name+': '+errMsg(e),'err');}}
        dd.classList.remove('busy');if(ok){toast(ok+' documento(s) guardado(s)','ok');await addSeg(id,'sistema',ok+' documento(s) subido(s).');refreshAll();}fichaCliente(id,'docs');}
      fi.addEventListener('change',function(){subir(Array.prototype.slice.call(fi.files));});
      ['dragenter','dragover'].forEach(function(ev){dd.addEventListener(ev,function(e){e.preventDefault();dd.classList.add('over');});});
      ['dragleave','drop'].forEach(function(ev){dd.addEventListener(ev,function(e){e.preventDefault();dd.classList.remove('over');});});
      dd.addEventListener('drop',function(e){subir(Array.prototype.slice.call(e.dataTransfer.files));});}
    $$('[data-vdoc]',D).forEach(function(x){x.addEventListener('click',function(){verDoc(x.dataset.vdoc);});});
    $$('[data-ddoc]',D).forEach(function(x){x.addEventListener('click',function(){verDoc(x.dataset.ddoc,true);});});
    $$('[data-xdoc]',D).forEach(function(x){x.addEventListener('click',async function(){var d=byId(DB.documentos,x.dataset.xdoc);if(!(await confirmar('¿Eliminar '+d.nombre+'?','El archivo se borra del almacenamiento.','Eliminar',true)))return;try{await dbDelete('documentos',d.id);borrarArchivo('documentos',d.ruta);refreshAll();fichaCliente(id,'docs');}catch(e){}});});
  }

  /* ===================== RESUMEN (personal y global) ===================== */
  var dashScope='mio',GLOBAL=null,globalErr=null;
  function mesesLbl(){var h=hoy(),m=[];for(var i=5;i>=0;i--){var d=new Date(h.getFullYear(),h.getMonth()-i,1);m.push(d.toLocaleDateString('es-CO',{month:'short'}).replace('.',''));}return m;}
  function barChart(series){ // [{n,c,v:[6]}]
    if(!series.some(function(s){return s.v.some(function(x){return x>0;});}))return empty('trend','Sin producción registrada','Aparece cuando registras pólizas con su fecha de inicio de vigencia.');
    var meses=mesesLbl();var W=560,H=230,pl=48,pb=26,pt=12;var max=1;series.forEach(function(s){s.v.forEach(function(x){max=Math.max(max,x);});});
    var step=Math.pow(10,Math.floor(Math.log10(max)));var top=Math.ceil(max/step)*step;if(top/step>6)top=Math.ceil(max/(step*2))*step*2;
    var gw=(W-pl-10)/6,n=series.length,bw=Math.min(22,(gw-14)/n);
    var s='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Producción mensual">';
    for(var g=0;g<=4;g++){var y=pt+(H-pt-pb)*(1-g/4);s+='<line x1="'+pl+'" x2="'+(W-6)+'" y1="'+y+'" y2="'+y+'" stroke="var(--mx-line)" stroke-dasharray="3 4"/><text x="'+(pl-8)+'" y="'+(y+4)+'" text-anchor="end">'+(top*g/4>=1e6?(top*g/4/1e6).toLocaleString('es-CO',{maximumFractionDigits:1})+' M':copM(top*g/4).replace('$',''))+'</text>';}
    meses.forEach(function(m,i){var x0=pl+gw*i+gw/2-(n*bw+(n-1)*4)/2;series.forEach(function(se,j){var hh=(H-pt-pb)*se.v[i]/top;s+='<rect x="'+(x0+j*(bw+4))+'" y="'+(H-pb-hh)+'" width="'+bw+'" height="'+Math.max(hh,se.v[i]?2:0)+'" rx="4" fill="'+se.c+'"><title>'+esc(se.n)+' · '+m+': '+cop(se.v[i])+'</title></rect>';});
      s+='<text x="'+(pl+gw*i+gw/2)+'" y="'+(H-8)+'" text-anchor="middle">'+m+'</text>';});
    return s+'</svg>';
  }
  function donut(byO){var tot=0;for(var k in byO)tot+=byO[k];var a=0,s='<svg viewBox="0 0 120 120">',r=46,C=2*Math.PI*r;
    if(!tot)s+='<circle cx="60" cy="60" r="46" fill="none" stroke="var(--mx-line)" stroke-width="16"/>';
    Object.keys(ORIG).forEach(function(o){if(!byO[o])return;var f=byO[o]/tot;s+='<circle cx="60" cy="60" r="'+r+'" fill="none" stroke="'+ORIG[o][1]+'" stroke-width="16" stroke-dasharray="'+(f*C)+' '+C+'" stroke-dashoffset="'+(-a*C)+'" transform="rotate(-90 60 60)"/>';a+=f;});
    return s+'<text x="60" y="58" text-anchor="middle" style="font-size:20px;font-weight:800;fill:var(--mx-ink);font-family:Plus Jakarta Sans,sans-serif">'+tot+'</text><text x="60" y="74" text-anchor="middle" style="font-size:9px">clientes</text></svg>';}

  function accionesHoy(){
    var h=hoy(),L=[];
    var citasHoy=DB.citas.filter(function(c){return c.fecha===ymd(h)&&c.estado!=='Cancelada';}).sort(function(a,b){return a.hora<b.hora?-1:1;});
    var frios=DB.clientes.filter(function(c){return c.etapa<6&&diasEtapa(c)>=7;});
    var contactar=DB.clientes.filter(function(c){return c.etapa<8&&c.proximo_contacto&&pd(c.proximo_contacto)<=h;});
    var ren=DB.polizas.filter(function(p){if(p.estado!=='Activa'||!p.vence)return false;var d=diffDays(p.vence,h);return d>=-5&&d<=15&&(+p.renov_etapa||0)<4;});
    var cuotas=DB.polizas.map(function(p){return cuotaInfo(p);}).filter(function(q){return q&&!q.fin&&q.dias<=5;});
    var cumple=DB.clientes.filter(function(c){var x=proxCumple(c.nacimiento);return x&&x.dias<=7;});
    if(citasHoy.length)L.push(['info','cal',citasHoy.length+' cita(s) hoy','Primera: '+hora12(citasHoy[0].hora)+' con '+(citasHoy[0].cliente_nombre||'cliente'),'agenda','Ver agenda']);
    if(contactar.length)L.push(['warn','phone',contactar.length+' cliente(s) para contactar hoy','Su fecha de próximo contacto ya llegó.','pipe','Ver']);
    if(frios.length)L.push(['dan','clock',frios.length+' negocio(s) con 7 días o más sin avanzar','Escríbeles hoy para no perderlos.','pipe','Ver']);
    if(ren.length)L.push(['warn','refresh',ren.length+' póliza(s) vencen en 15 días o menos','Confirma la renovación antes del vencimiento.','ren','Gestionar']);
    if(cuotas.length)L.push(['dan','money',cuotas.length+' cuota(s) vencidas o por vencer','Recuerda el pago por WhatsApp.','cart','Cobrar']);
    if(cumple.length)L.push(['ok','gift',cumple.length+' cumpleaños en los próximos 7 días',cumple.slice(0,3).map(function(c){return primerNombre(c.nombre);}).join(', ')+(cumple.length>3?'…':''),'cart','Felicitar']);
    if(!L.length)return empty('check','Todo al día','No hay pendientes urgentes. Buen momento para prospectar desde la base de datos.','<button class="mx-btn mx-btn-s mx-btn-sm" data-go="bd">Abrir bases</button>');
    return L.map(function(a){return '<div class="mx-alert"><span class="ic" style="background:var(--mx-'+a[0]+'-bg);color:var(--mx-'+a[0]+')">'+ico(a[1])+'</span><div><b>'+esc(a[2])+'</b><p>'+esc(a[3])+'</p></div><button class="mx-btn mx-btn-s mx-btn-sm" data-go="'+a[4]+'">'+a[5]+'</button></div>';}).join('');
  }
  function renderDash(){
    var h='<div class="mx-scope"><div class="mx-seg" id="dScope"><button data-s="mio" class="'+(dashScope==='mio'?'on':'')+'">'+ico('user')+' Mis métricas</button><button data-s="global" class="'+(dashScope==='global'?'on':'')+'">'+ico('users')+' Global del equipo</button></div><span class="mx-scope-note">'+(dashScope==='mio'?'Solo tus clientes y tu producción. Nadie más ve estos datos.':'Totales de Mateo y Andrea. No muestra nombres ni datos de clientes del otro asesor.')+'</span></div>';
    if(dashScope==='global'){h+='<div id="dGlobal">'+(GLOBAL?dashGlobal(GLOBAL):(globalErr?empty('alert','No se pudieron cargar las métricas globales',esc(globalErr)):'<div class="mx-loading"><span class="mx-spin"></span>Cargando métricas del equipo…</div>'))+'</div>';$('#vDash').innerHTML=h;bindDash();
      if(!GLOBAL&&!globalErr)metricasGlobales().then(function(g){GLOBAL=g;if(cur==='dash'&&dashScope==='global')renderDash();}).catch(function(e){globalErr=errMsg(e)+' · Ejecuta el SQL v2 (función metricas_globales).';if(cur==='dash')renderDash();});return;}
    var m=metricasDe(DB,ME);
    h+='<div class="mx-grid mx-g-kpi">'+
      kpi('Primas emitidas este mes',copM(m.primas_mes),'según inicio de vigencia de tus pólizas','money',true)+
      kpi('Pólizas activas',nf(m.polizas_activas),'en '+nf(DB.clientes.filter(function(c){return polizasDe(c.id).length;}).length)+' clientes','shield')+
      kpi('Negocios abiertos',nf(m.abiertos),copM(m.valor_pipeline)+' en primas posibles','flow')+
      kpi('Tasa de cierre',pct(m.cerrados,m.clientes),m.cerrados+' de '+m.clientes+' clientes','target')+
      kpi('Citas esta semana',nf(m.citas_semana),DB.citas.filter(function(c){return c.fecha===ymd(hoy());}).length+' para hoy','cal')+
    '</div>';
    var val=ETAPAS.map(function(e,i){return copM(DB.clientes.filter(function(c){return c.etapa===i;}).reduce(function(a,c){return a+(+c.valor_prima||0);},0));});
    h+='<div class="mx-card mx-mb"><div class="mx-card-h"><div><h3>Mi pipeline por etapa</h3><p>Toca una etapa para abrir el tablero filtrado.</p></div><button class="mx-btn mx-btn-s mx-btn-sm" data-go="pipe">Abrir pipeline '+ico('next')+'</button></div><div id="dRail">'+rail(ETAPAS,m.por_etapa,val,null,true)+'</div></div>';
    h+='<div class="mx-grid mx-g-2 mx-mb"><div class="mx-card"><div class="mx-card-h"><div><h3>Mi producción mensual</h3><p>Primas de pólizas por mes de inicio, últimos 6 meses</p></div></div><div class="mx-chart">'+barChart([{n:ME.nombre,c:ME.color||'#0F3E8C',v:m.produccion}])+'</div></div>'+
      '<div class="mx-card"><div class="mx-card-h"><div><h3>Acciones de hoy</h3><p>Lo que no puede esperar</p></div></div>'+accionesHoy()+'</div></div>';
    var byR={};DB.clientes.forEach(function(c){var r=ramoCliente(c);if(r)byR[r]=(byR[r]||0)+1;});var top=Object.keys(byR).sort(function(a,b){return byR[b]-byR[a];}).slice(0,7);var mx=byR[top[0]]||1;
    var byO={};DB.clientes.forEach(function(c){var o=ORIG[c.origen]?c.origen:'otro';byO[o]=(byO[o]||0)+1;});
    h+='<div class="mx-grid mx-g-2e"><div class="mx-card"><div class="mx-card-h"><div><h3>Mis clientes por ramo</h3><p>Ramo de interés o de la póliza</p></div></div>'+(top.length?top.map(function(r){return '<div class="mx-hbar"><span>'+code(r)+' '+ramoN(r)+'</span><span class="tr"><i style="width:'+(byR[r]/mx*100)+'%"></i></span><b>'+byR[r]+'</b></div>';}).join(''):empty('tag','Aún sin datos','Crea tu primer cliente para ver la distribución.'))+'</div>'+
      '<div class="mx-card"><div class="mx-card-h"><div><h3>De dónde llegan mis clientes</h3><p>'+DB.clientes.length+' clientes</p></div></div><div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap;"><div class="mx-chart" style="width:170px;flex-shrink:0;">'+donut(byO)+'</div><div class="mx-legend" style="flex-direction:column;gap:8px;">'+Object.keys(ORIG).filter(function(o){return byO[o];}).map(function(o){return '<span><i style="background:'+ORIG[o][1]+'"></i>'+ORIG[o][0]+' · <b>'+byO[o]+'</b> ('+pct(byO[o],DB.clientes.length)+')</span>';}).join('')+'</div></div></div></div>';
    $('#vDash').innerHTML=h;bindDash();
    $$('#dRail .mx-stage').forEach(function(b){b.addEventListener('click',function(){pipeState.et=+b.dataset.i;go('pipe');});});
  }
  function bindDash(){$$('#dScope button').forEach(function(b){b.addEventListener('click',function(){dashScope=b.dataset.s;if(dashScope==='global'){GLOBAL=null;globalErr=null;}renderDash();});});bindGo();}
  function dashGlobal(G){
    var T={clientes:0,abiertos:0,valor_pipeline:0,cerrados:0,polizas_activas:0,primas_mes:0,cotizaciones:0,aprobadas:0,citas_semana:0,registros_bd:0},et=ETAPAS.map(function(){return 0;});
    G.forEach(function(a){for(var k in T)T[k]+=(+a[k]||0);(a.por_etapa||[]).forEach(function(v,i){et[i]+=+v||0;});});
    var h='<div class="mx-grid mx-g-kpi">'+kpi('Primas del equipo este mes',copM(T.primas_mes),G.length+' asesores','money',true)+kpi('Pólizas activas',nf(T.polizas_activas),'entre todo el equipo','shield')+kpi('Negocios abiertos',nf(T.abiertos),copM(T.valor_pipeline)+' en primas posibles','flow')+kpi('Tasa de cierre',pct(T.cerrados,T.clientes),T.cerrados+' de '+T.clientes+' clientes','target')+kpi('Citas esta semana',nf(T.citas_semana),'de todo el equipo','cal')+'</div>';
    h+='<div class="mx-card mx-mb"><div class="mx-card-h"><div><h3>Pipeline del equipo por etapa</h3><p>Suma de los dos asesores</p></div></div>'+rail(ETAPAS,et,null,null,true)+'</div>';
    h+='<div class="mx-grid mx-g-2 mx-mb"><div class="mx-card"><div class="mx-card-h"><div><h3>Producción mensual por asesor</h3><p>Primas por mes de inicio de vigencia</p></div><div class="mx-legend">'+G.map(function(a){return '<span><i style="background:'+(a.color||'#0F3E8C')+'"></i>'+esc(a.nombre)+'</span>';}).join('')+'</div></div><div class="mx-chart">'+barChart(G.map(function(a){return {n:a.nombre,c:a.color||'#0F3E8C',v:(a.produccion||[0,0,0,0,0,0]).map(Number)};}))+'</div></div>';
    h+='<div class="mx-card"><div class="mx-card-h"><div><h3>Comparativo del equipo</h3><p>Indicadores de cada asesor</p></div></div><div class="mx-table-wrap"><table class="mx-table mx-cmp"><thead><tr><th>Indicador</th>'+G.map(function(a){return '<th class="r">'+avatar(a,24)+' '+esc(primerNombre(a.nombre))+'</th>';}).join('')+'<th class="r">Total</th></tr></thead><tbody>'+
      [['Clientes','clientes',nf],['Negocios abiertos','abiertos',nf],['Valor en pipeline','valor_pipeline',copM],['Cerrados (etapa 7+)','cerrados',nf],['Pólizas activas','polizas_activas',nf],['Primas este mes','primas_mes',copM],['Cotizaciones','cotizaciones',nf],['Cotizaciones aprobadas','aprobadas',nf],['Citas esta semana','citas_semana',nf],['Registros en bases','registros_bd',nf]].map(function(r){var mx=Math.max.apply(null,G.map(function(a){return +a[r[1]]||0;}));return '<tr><td>'+r[0]+'</td>'+G.map(function(a){var v=+a[r[1]]||0;return '<td class="r'+(v&&v===mx&&G.length>1?' top1':'')+'">'+r[2](v)+'</td>';}).join('')+'<td class="r"><b>'+r[2](T[r[1]])+'</b></td></tr>';}).join('')+'</tbody></table></div></div></div>';
    return h;
  }

  /* ===================== PIPELINE ===================== */
  var pipeState={ramo:null,o:'',q:'',vista:'tablero',et:null};
  function filtraTexto(c,q){return norm([c.nombre,c.documento,c.celular,c.correo,c.ciudad,c.empresa,ramoN(c.ramo),c.aseguradora].join(' ')).indexOf(norm(q))>=0;}
  function clientesPipe(){return DB.clientes.filter(function(c){if(pipeState.ramo&&ramoCliente(c)!==pipeState.ramo)return false;if(pipeState.o&&c.origen!==pipeState.o)return false;if(pipeState.q&&!filtraTexto(c,pipeState.q))return false;return true;});}
  function leadCard(c){var p=c.proximo_contacto&&pd(c.proximo_contacto)<=hoy();return '<div class="mx-lead" draggable="true" data-id="'+c.id+'"><div class="mx-lead-top">'+code(ramoCliente(c))+src(c.origen)+badgeDias(diasEtapa(c))+'</div><h4>'+esc(c.nombre)+'</h4><div class="r">'+ramoN(ramoCliente(c))+(c.ciudad?' · '+esc(c.ciudad):'')+'</div>'+steps(9,c.etapa)+'<div class="mx-lead-bot"><span class="val">'+(c.valor_prima?copM(c.valor_prima):'—')+'</span><span'+(p?' class="late"':'')+'>'+(c.proximo_contacto?'Próx. '+fch(c.proximo_contacto):'Sin fecha')+'</span>'+avatar(ME,22)+'</div></div>';}
  function renderPipe(){
    var F=clientesPipe();
    var cnt=ETAPAS.map(function(e,i){return F.filter(function(c){return c.etapa===i;}).length;});
    var val=ETAPAS.map(function(e,i){return copM(F.filter(function(c){return c.etapa===i;}).reduce(function(a,c){return a+(+c.valor_prima||0);},0));});
    var usados={};DB.clientes.forEach(function(c){var r=ramoCliente(c);if(r)usados[r]=(usados[r]||0)+1;});
    var h='<div class="mx-card mx-mb"><div class="mx-card-h"><div><h3>Recorrido del cliente</h3><p>Al mover un cliente de etapa se pide la observación y queda en su seguimiento.</p></div>'+(pipeState.et!==null?'<button class="mx-btn mx-btn-s mx-btn-sm" id="pClrEt">Ver todas las etapas</button>':'')+'</div><div id="pRail">'+rail(ETAPAS,cnt,val,pipeState.et,true)+'</div></div>';
    h+='<div class="mx-toolbar"><input class="mx-input" id="pQ" placeholder="Buscar nombre, cédula, celular, ciudad…" value="'+esc(pipeState.q)+'">'+
      '<select class="mx-select" id="pO"><option value="">Todos los orígenes</option>'+Object.keys(ORIG).map(function(o){return '<option value="'+o+'"'+(pipeState.o===o?' selected':'')+'>'+ORIG[o][0]+'</option>';}).join('')+'</select>'+
      '<div class="mx-seg" id="pVista"><button data-v="tablero" class="'+(pipeState.vista==='tablero'?'on':'')+'">Tablero</button><button data-v="lista" class="'+(pipeState.vista==='lista'?'on':'')+'">Lista</button></div>'+
      '<button class="mx-btn mx-btn-p" id="pNew" style="margin-left:auto">'+ico('plus')+'Crear cliente</button></div>';
    h+='<div class="mx-chips" id="pChips"><button class="mx-chip all'+(!pipeState.ramo?' on':'')+'" data-r="">Todos los ramos</button>'+Object.keys(RAMOS).filter(function(r){return usados[r]||pipeState.ramo===r;}).map(function(r){return '<button class="mx-chip'+(pipeState.ramo===r?' on':'')+'" data-r="'+r+'">'+code(r)+RAMOS[r][0]+' <span style="opacity:.6">'+(usados[r]||0)+'</span></button>';}).join('')+'</div>';
    if(!DB.clientes.length){h+=empty('flow','Tu pipeline está vacío','Crea tu primer cliente y aparecerá en «Nuevo cliente».','<button class="mx-btn mx-btn-p" data-new>'+ico('plus')+'Crear cliente</button>');}
    else if(pipeState.vista==='tablero'){
      h+='<div class="mx-board" id="pBoard">';
      ETAPAS.forEach(function(e,i){if(pipeState.et!==null&&pipeState.et!==i)return;var ls=F.filter(function(c){return c.etapa===i;}).sort(function(a,b){return diasEtapa(b)-diasEtapa(a);});
        h+='<div class="mx-col" data-et="'+i+'"><div class="mx-col-h"><span class="dot" style="background:'+ET_COL[i]+'"></span><b>'+(i+1)+'. '+e+'</b><span class="ct">'+ls.length+'</span></div><div class="mx-col-sum">'+ET_DESC[i]+' · '+copM(ls.reduce(function(a,c){return a+(+c.valor_prima||0);},0))+'</div>';
        h+=ls.length?ls.map(leadCard).join(''):'<div class="mx-empty">Arrastra aquí un cliente</div>';h+='</div>';});
      h+='</div><p class="mx-foot-note">Arrastra una tarjeta a otra columna para cambiarla de etapa: se abre la ventana para escribir la observación.</p>';
    } else {
      h+='<div class="mx-table-wrap"><table class="mx-table"><thead><tr><th>Cliente</th><th>Ramo</th><th>Etapa</th><th>Origen</th><th class="r">Prima posible</th><th>Días en etapa</th><th>Próximo contacto</th></tr></thead><tbody>'+
        F.filter(function(c){return pipeState.et===null||c.etapa===pipeState.et;}).sort(function(a,b){return a.etapa-b.etapa;}).map(function(c){return '<tr class="click" data-id="'+c.id+'"><td><b>'+esc(c.nombre)+'</b><small>'+esc(c.ciudad||'')+'</small></td><td>'+code(ramoCliente(c))+' '+ramoN(ramoCliente(c))+'</td><td>'+(c.etapa+1)+'. '+ETAPAS[c.etapa]+steps(9,c.etapa)+'</td><td>'+src(c.origen)+'</td><td class="r"><b>'+(c.valor_prima?cop(c.valor_prima):'—')+'</b></td><td>'+badgeDias(diasEtapa(c)).replace('class="d"','')+'</td><td>'+(c.proximo_contacto?fch(c.proximo_contacto):'—')+'</td></tr>';}).join('')+'</tbody></table></div>';
    }
    $('#vPipe').innerHTML=h;
    $$('#pRail .mx-stage').forEach(function(b){b.addEventListener('click',function(){var i=+b.dataset.i;pipeState.et=(pipeState.et===i?null:i);renderPipe();});});
    var clr=$('#pClrEt');if(clr)clr.addEventListener('click',function(){pipeState.et=null;renderPipe();});
    var q=$('#pQ');q.addEventListener('input',debounce(function(){pipeState.q=q.value;renderPipe();var n=$('#pQ');n.focus();n.setSelectionRange(n.value.length,n.value.length);},250));
    $('#pO').addEventListener('change',function(e){pipeState.o=e.target.value;renderPipe();});
    $$('#pVista button').forEach(function(b){b.addEventListener('click',function(){pipeState.vista=b.dataset.v;renderPipe();});});
    $$('#pChips .mx-chip').forEach(function(c){c.addEventListener('click',function(){pipeState.ramo=(c.dataset.r&&pipeState.ramo!==c.dataset.r)?c.dataset.r:null;renderPipe();});});
    $('#pNew').addEventListener('click',function(){nuevoCliente();});var nb=$('#vPipe [data-new]');if(nb)nb.addEventListener('click',function(){nuevoCliente();});
    $$('#vPipe [data-id]').forEach(function(el){el.addEventListener('click',function(){fichaCliente(el.dataset.id);});});
    $$('#pBoard .mx-lead').forEach(function(c){c.addEventListener('dragstart',function(e){c.classList.add('drag');e.dataTransfer.setData('text/plain',c.dataset.id);e.dataTransfer.effectAllowed='move';});c.addEventListener('dragend',function(){c.classList.remove('drag');});});
    $$('#pBoard .mx-col').forEach(function(col){
      col.addEventListener('dragover',function(e){e.preventDefault();col.classList.add('over');});
      col.addEventListener('dragleave',function(e){if(!col.contains(e.relatedTarget))col.classList.remove('over');});
      col.addEventListener('drop',function(e){e.preventDefault();col.classList.remove('over');cambiarEtapa(e.dataTransfer.getData('text/plain'),+col.dataset.et);});
    });
  }

  /* ===================== CLIENTES (lista) ===================== */
  var cliState={q:'',ramo:'',et:'',tipo:'',orden:'reciente',page:0};
  function clientesFiltrados(){var L=DB.clientes.filter(function(c){if(cliState.ramo&&ramoCliente(c)!==cliState.ramo)return false;if(cliState.et!==''&&c.etapa!==+cliState.et)return false;if(cliState.tipo&&(c.tipo||'Persona')!==cliState.tipo)return false;if(cliState.q&&!filtraTexto(c,cliState.q))return false;return true;});
    var o=cliState.orden;L.sort(function(a,b){if(o==='nombre')return a.nombre.localeCompare(b.nombre,'es');if(o==='etapa')return b.etapa-a.etapa;if(o==='cumple'){var x=proxCumple(a.nacimiento),y=proxCumple(b.nacimiento);return (x?x.dias:999)-(y?y.dias:999);}return new Date(b.created_at)-new Date(a.created_at);});return L;}
  var CLI_COLS=[{k:'nombre',l:'Cliente',w:2.2},{k:'documento',l:'Documento',w:1.2},{k:'celular',l:'Celular',w:1.1},{k:'correo',l:'Correo',w:1.8},{k:'ciudad',l:'Ciudad',w:1},{k:'direccion',l:'Dirección',w:1.6},{k:'nacimiento',l:'Nacimiento',w:1},{k:'ramo',l:'Ramo',w:1.3},{k:'etapa',l:'Etapa',w:1.4},{k:'polizas',l:'Pólizas',w:.7},{k:'prima',l:'Prima',w:1}];
  function cliExportRows(L){return L.map(function(c){return {nombre:c.nombre,documento:docTxt(c),celular:c.celular?telFmt(c.celular):'',correo:c.correo||'',ciudad:c.ciudad||'',direccion:c.direccion||'',nacimiento:c.nacimiento?fchL(c.nacimiento):'',ramo:ramoCliente(c)?(ramoCliente(c)===ramoN(ramoCliente(c))?ramoCliente(c):ramoCliente(c)+' · '+ramoN(ramoCliente(c))):'',etapa:(c.etapa+1)+'. '+ETAPAS[c.etapa],polizas:polizasDe(c.id).length,prima:c.valor_prima?cop(c.valor_prima):''};});}
  function renderCli(){
    var L=clientesFiltrados(),size=25,pages=Math.max(1,Math.ceil(L.length/size));if(cliState.page>=pages)cliState.page=pages-1;var P=L.slice(cliState.page*size,(cliState.page+1)*size);
    var cum30=DB.clientes.filter(function(c){var x=proxCumple(c.nacimiento);return x&&x.dias<=30;}).length;
    var h='<div class="mx-grid mx-g-kpi mx-mb">'+kpi('Mis clientes',nf(DB.clientes.length),DB.clientes.filter(function(c){return c.tipo==='Empresa';}).length+' empresas · '+DB.clientes.filter(function(c){return c.tipo!=='Empresa';}).length+' personas','users',true)+
      kpi('Con póliza',nf(DB.clientes.filter(function(c){return polizasDe(c.id).length;}).length),DB.polizas.length+' pólizas registradas','shield')+
      kpi('Datos completos',pct(DB.clientes.filter(function(c){return c.correo&&c.documento&&c.direccion&&(c.tipo==='Empresa'||c.nacimiento);}).length,DB.clientes.length),'correo, cédula, dirección y nacimiento','check')+
      kpi('Cumpleaños en 30 días',nf(cum30),'para felicitar por WhatsApp','gift')+'</div>';
    h+='<div class="mx-toolbar"><input class="mx-input" id="cQ" placeholder="Buscar nombre, cédula, celular, correo…" value="'+esc(cliState.q)+'">'+
      '<select class="mx-select" id="cRamo">'+ramoOpts(cliState.ramo,'Todos los ramos')+'</select>'+
      '<select class="mx-select" id="cEt"><option value="">Todas las etapas</option>'+ETAPAS.map(function(e,i){return '<option value="'+i+'"'+(cliState.et===String(i)?' selected':'')+'>'+(i+1)+'. '+e+'</option>';}).join('')+'</select>'+
      '<select class="mx-select" id="cTipo"><option value="">Personas y empresas</option><option value="Persona"'+(cliState.tipo==='Persona'?' selected':'')+'>Personas</option><option value="Empresa"'+(cliState.tipo==='Empresa'?' selected':'')+'>Empresas</option></select>'+
      '<select class="mx-select" id="cOrd">'+[['reciente','Más recientes'],['nombre','Nombre A–Z'],['etapa','Etapa más avanzada'],['cumple','Próximo cumpleaños']].map(function(o){return '<option value="'+o[0]+'"'+(cliState.orden===o[0]?' selected':'')+'>'+o[1]+'</option>';}).join('')+'</select>'+
      '<div class="mx-tb-r"><button class="mx-btn mx-btn-s" id="cExp">'+ico('download')+'Exportar</button><button class="mx-btn mx-btn-p" id="cNew">'+ico('plus')+'Crear cliente</button></div></div>';
    if(!DB.clientes.length)h+=empty('users','Aún no tienes clientes','Crea tu primer cliente. Quedará en la etapa 1 del pipeline.','<button class="mx-btn mx-btn-p" data-new>'+ico('plus')+'Crear cliente</button>');
    else if(!L.length)h+=empty('search','Sin resultados','Ningún cliente coincide con los filtros.');
    else{h+='<div class="mx-table-wrap"><table class="mx-table"><thead><tr><th>Cliente</th><th>Contacto</th><th>Ciudad</th><th>Ramo</th><th>Etapa</th><th class="r">Pólizas</th><th>Cumpleaños</th><th>Próximo contacto</th></tr></thead><tbody>'+
      P.map(function(c){var cu=proxCumple(c.nacimiento);var np=polizasDe(c.id).length;return '<tr class="click" data-id="'+c.id+'"><td><div class="mx-cell-p"><span class="mx-av sm" style="background:'+(c.tipo==='Empresa'?'#0869B8':'#0A1B5C')+'">'+esc(inic(c.nombre))+'</span><div><b>'+esc(c.nombre)+'</b><small>'+esc(docTxt(c)||'Sin documento')+'</small></div></div></td><td>'+(c.celular?telFmt(c.celular):'—')+'<small>'+esc(c.correo||'Sin correo')+'</small></td><td>'+esc(c.ciudad||'—')+'</td><td>'+(ramoCliente(c)?code(ramoCliente(c))+' '+ramoN(ramoCliente(c)):'—')+'</td><td>'+(c.etapa+1)+'. '+ETAPAS[c.etapa]+steps(9,c.etapa)+'</td><td class="r">'+np+'</td><td>'+(cu?(cu.dias===0?'<b class="today">¡Hoy!</b>':fch(cu.fecha)+'<small>en '+cu.dias+' días</small>'):'—')+'</td><td>'+(c.proximo_contacto?fch(c.proximo_contacto):'—')+'</td></tr>';}).join('')+'</tbody></table></div>'+pager(L.length,cliState.page,size,'cPg');}
    $('#vCli').innerHTML=h;
    var q=$('#cQ');q.addEventListener('input',debounce(function(){cliState.q=q.value;cliState.page=0;renderCli();var n=$('#cQ');n.focus();n.setSelectionRange(n.value.length,n.value.length);},250));
    [['#cRamo','ramo'],['#cEt','et'],['#cTipo','tipo'],['#cOrd','orden']].forEach(function(x){$(x[0]).addEventListener('change',function(e){cliState[x[1]]=e.target.value;cliState.page=0;renderCli();});});
    $('#cNew').addEventListener('click',function(){nuevoCliente();});var nb=$('#vCli [data-new]');if(nb)nb.addEventListener('click',function(){nuevoCliente();});
    $('#cExp').addEventListener('click',function(){var L2=clientesFiltrados();if(!L2.length){toast('No hay clientes para exportar','err');return;}
      var meta={titulo:'Listado de clientes',sub:L2.length+' cliente(s)'+(cliState.q||cliState.ramo||cliState.et||cliState.tipo?' · filtrado':'')+' · Asesor: '+ME.nombre,archivo:'clientes-'+slug(ME.nombre)+'-'+ymd(hoy()),cols:CLI_COLS,rows:cliExportRows(L2)};
      menuExport(this,meta);});
    $$('#vCli tr[data-id]').forEach(function(tr){tr.addEventListener('click',function(){fichaCliente(tr.dataset.id);});});
    $$('#cPg [data-pg]').forEach(function(b){b.addEventListener('click',function(){cliState.page=+b.dataset.pg;renderCli();$('#mxScroll').scrollTop=0;});});
  }

  /* ===================== COTIZACIONES ===================== */
  var cotState={et:null};
  function renderCot(){
    var C=DB.cotizaciones.slice().sort(function(a,b){return new Date(b.created_at)-new Date(a.created_at);});
    var cnt=COT_KEY.map(function(k){return C.filter(function(c){return c.estado===k;}).length;});
    var h='<div class="mx-card mx-mb"><div class="mx-card-h"><div><h3>Estado de las cotizaciones</h3><p>Se crean solas cuando un cliente pasa a «Seguimiento». También puedes crearlas a mano.</p></div><button class="mx-btn mx-btn-p mx-btn-sm" id="qNew">'+ico('plus')+'Nueva cotización</button></div>'+rail(COT_ET,cnt,null,cotState.et,false)+'</div>';
    var L=C.filter(function(c){return cotState.et===null||c.estado===COT_KEY[cotState.et];});
    h+=L.length?'<div class="mx-table-wrap"><table class="mx-table"><thead><tr><th>Cotización</th><th>Cliente</th><th>Ramo</th><th>Ofertas</th><th class="r">Mejor valor</th><th>Estado</th><th>Fecha</th></tr></thead><tbody>'+L.map(function(q){var c=byId(DB.clientes,q.cliente_id)||{nombre:'(cliente eliminado)'};var of=q.ofertas||[];var best=of.length?Math.min.apply(null,of.map(function(o){return +o.v||0;})):0;
      return '<tr class="click" data-q="'+q.id+'"><td><b>'+esc(q.numero||'—')+'</b></td><td>'+esc(c.nombre)+'</td><td>'+code(q.ramo)+' '+ramoN(q.ramo)+'</td><td>'+(of.length?of.map(function(o){return esc(o.a);}).join(', '):'<span class="mute">Sin ofertas</span>')+'</td><td class="r"><b>'+(best?cop(best):'—')+'</b></td><td>'+badge(COT_ET[COT_KEY.indexOf(q.estado)]||q.estado,q.estado==='aprobada'?'ok':q.estado==='rechazada'?'dan':'info')+'</td><td>'+fch(q.created_at)+'</td></tr>';}).join('')+'</tbody></table></div>':empty('doc','Sin cotizaciones','Cuando un cliente pase a «Seguimiento» se crea su cotización aquí.');
    $('#vCot').innerHTML=h;
    $$('#vCot .mx-stage').forEach(function(b){b.addEventListener('click',function(){var i=+b.dataset.i;cotState.et=cotState.et===i?null:i;renderCot();});});
    $$('#vCot [data-q]').forEach(function(tr){tr.addEventListener('click',function(){cotDrawer(tr.dataset.q);});});
    $('#qNew').addEventListener('click',function(){if(!DB.clientes.length){toast('Primero crea un cliente','err');return;}
      openModal({t:'Nueva cotización',body:'<form class="mx-form">'+fld('Cliente',sel('cid',DB.clientes.slice().sort(function(a,b){return a.nombre.localeCompare(b.nombre,'es');}).map(function(c){return [c.id,c.nombre];}),''))+fld('Ramo',sel('ramo',Object.keys(RAMOS).map(function(r){return [r,r+' · '+RAMOS[r][0]];}),'ATR'))+'</form>',
        foot:'<button class="mx-btn mx-btn-s" data-close>Cancelar</button><button class="mx-btn mx-btn-p" data-ok>Crear</button>',onMount:function(el){var cs=el.querySelector('[name=cid]'),rs=el.querySelector('[name=ramo]');function pre(){var c=byId(DB.clientes,cs.value);if(c&&c.ramo)rs.value=c.ramo;}cs.addEventListener('change',pre);pre();
          el.querySelector('[data-ok]').addEventListener('click',async function(){var f=formData(el);try{var q=await dbInsert('cotizaciones',{cliente_id:f.cid,numero:'COT-'+String(Date.now()).slice(-5),ramo:f.ramo,estado:'generada',financiacion:'Por definir',ofertas:[]});closeModal(el);renderCot();cotDrawer(q.id);}catch(e){}});}});});
  }
  function cotDrawer(id){
    var q=byId(DB.cotizaciones,id);if(!q)return;var c=byId(DB.clientes,q.cliente_id)||{};var of=(q.ofertas||[]).slice().sort(function(a,b){return a.v-b.v;});var mx=Math.max.apply(null,of.map(function(o){return +o.v||0;}).concat([1]));
    var b='<div class="mx-sec">Estado</div><div class="mx-seg" id="qEst">'+COT_KEY.map(function(k,i){return '<button data-k="'+k+'" class="'+(q.estado===k?'on':'')+'">'+COT_ET[i]+'</button>';}).join('')+'</div>';
    b+='<div class="mx-sec">Comparativo por aseguradora</div>'+(of.length?of.map(function(o,i){return '<div class="mx-hbar"><span>'+(i===0?'⭐ ':'')+esc(o.a)+'</span><span class="tr"><i style="width:'+(o.v/mx*100)+'%"></i></span><b>'+cop(o.v)+'</b><button class="mx-x" data-xo="'+i+'">'+ico('x')+'</button></div>';}).join(''):'<p class="mute">Agrega las ofertas que te dio cada aseguradora.</p>');
    b+='<form class="mx-inline-form" id="qAdd"><input class="mx-input" name="a" list="mxAsegQ" placeholder="Aseguradora"><input class="mx-input" name="v" inputmode="numeric" placeholder="Valor prima"><button class="mx-btn mx-btn-s mx-btn-sm" type="submit">'+ico('plus')+'Agregar</button></form><datalist id="mxAsegQ">'+ASEG.map(function(a){return '<option value="'+a+'">';}).join('')+'</datalist>';
    b+='<div class="mx-sec">Notas</div><textarea class="mx-input" id="qNotas" rows="3" placeholder="Coberturas, deducibles, condiciones…">'+esc(q.notas||'')+'</textarea>';
    var msg='Hola '+primerNombre(c.nombre)+', te comparto la cotización de tu seguro de '+ramoN(q.ramo).toLowerCase()+':\n'+of.map(function(o){return '• '+o.a+': '+cop(o.v);}).join('\n')+'\n¿Cuál te gusta más? Quedo atento. '+ME.nombre+' · Mateo Herrera Seguros';
    openDrawer(q.numero||'Cotización',esc(c.nombre||'')+' · '+ramoN(q.ramo),b,(c.celular&&of.length?'<a class="mx-btn mx-btn-wa" target="_blank" rel="noopener" href="'+waLink(c.celular,msg)+'">'+ico('wa')+'Enviar por WhatsApp</a>':'')+'<button class="mx-btn mx-btn-s" id="qFicha">Ver cliente</button><button class="mx-btn mx-btn-g mx-del" id="qDel">'+ico('trash')+'</button>');
    var D=$('#mxDrawer');drawerCtx={tipo:'cot',id:id};
    $$('#qEst button',D).forEach(function(x){x.addEventListener('click',async function(){try{await dbUpdate('cotizaciones',id,{estado:x.dataset.k});if(c.id)await addSeg(c.id,'sistema','Cotización '+(q.numero||'')+' marcada como «'+COT_ET[COT_KEY.indexOf(x.dataset.k)]+'».');refreshAll();cotDrawer(id);}catch(e){}});});
    var fa=$('#qAdd',D);var vv=fa.querySelector('[name=v]');vv.addEventListener('input',function(){var d=digits(vv.value);vv.value=d?(+d).toLocaleString('es-CO'):'';});
    fa.addEventListener('submit',async function(e){e.preventDefault();var f=formData(fa);if(!f.a||!digits(f.v)){toast('Escribe aseguradora y valor','err');return;}try{await dbUpdate('cotizaciones',id,{ofertas:(q.ofertas||[]).concat([{a:f.a,v:+digits(f.v)}])});refreshAll();cotDrawer(id);}catch(er){}});
    $$('[data-xo]',D).forEach(function(x){x.addEventListener('click',async function(){var o=of[+x.dataset.xo];try{await dbUpdate('cotizaciones',id,{ofertas:(q.ofertas||[]).filter(function(y){return y!==o;})});refreshAll();cotDrawer(id);}catch(e){}});});
    $('#qNotas',D).addEventListener('change',function(){dbUpdate('cotizaciones',id,{notas:this.value}).then(function(){toast('Notas guardadas','ok');}).catch(function(){});});
    $('#qFicha',D).addEventListener('click',function(){if(c.id)fichaCliente(c.id);});
    $('#qDel',D).addEventListener('click',async function(){if(!(await confirmar('¿Eliminar la cotización?','','Eliminar',true)))return;try{await dbDelete('cotizaciones',id);closeDrawer();refreshAll();}catch(e){}});
  }

  /* ===================== RENOVACIONES ===================== */
  var renState={et:null};
  function renLista(){var h=hoy();return DB.polizas.filter(function(p){if(p.estado!=='Activa'||!p.vence)return false;var d=diffDays(p.vence,h);return d>=-30&&d<=60;}).map(function(p){return {p:p,c:byId(DB.clientes,p.cliente_id)||{nombre:'—'},dias:diffDays(p.vence,h),et:+p.renov_etapa||0};}).sort(function(a,b){return a.dias-b.dias;});}
  function renderRen(){
    var R=renLista();var cnt=REN_ET.map(function(e,i){return R.filter(function(r){return r.et===i;}).length;});
    var h='<div class="mx-grid mx-g-3 mx-mb">'+[['dan','≤ 15 días',R.filter(function(r){return r.dias<=15;}).length],['warn','16 a 30 días',R.filter(function(r){return r.dias>15&&r.dias<=30;}).length],['ok','31 a 60 días',R.filter(function(r){return r.dias>30;}).length]].map(function(x){return '<div class="mx-kpi"><div class="l"><i class="mx-sem" style="background:var(--mx-'+x[0]+')"></i>Vencen en '+x[1]+'</div><div class="v">'+x[2]+'</div><div class="s">pólizas</div></div>';}).join('')+'</div>';
    h+='<div class="mx-card mx-mb"><div class="mx-card-h"><div><h3>Proceso de renovación</h3><p>Al marcar «Renovada» la vigencia se extiende un año automáticamente.</p></div></div>'+rail(REN_ET,cnt,null,renState.et,false)+'</div>';
    var L=R.filter(function(r){return renState.et===null||r.et===renState.et;});
    h+=L.length?'<div class="mx-table-wrap"><table class="mx-table"><thead><tr><th>Cliente</th><th>Póliza</th><th>Vence</th><th>Etapa</th><th class="r">Prima</th><th></th></tr></thead><tbody>'+L.map(function(r){var col=r.dias<=15?'dan':r.dias<=30?'warn':'ok';var msg='Hola '+primerNombre(r.c.nombre)+', te saluda '+ME.nombre+' de Mateo Herrera Seguros. Tu póliza de '+ramoN(r.p.ramo).toLowerCase()+(r.p.aseguradora?' con '+r.p.aseguradora:'')+' '+(r.dias<0?'venció el ':'vence el ')+fchL(r.p.vence)+'. ¿Te preparo la renovación?';
      return '<tr><td><b>'+esc(r.c.nombre)+'</b><small>'+(r.c.celular?telFmt(r.c.celular):'')+'</small></td><td>'+code(r.p.ramo)+' '+ramoN(r.p.ramo)+'<small>'+esc(r.p.aseguradora||'')+(r.p.numero?' · '+esc(r.p.numero):'')+'</small></td><td><span style="color:var(--mx-'+col+');font-weight:700">'+(r.dias<0?'Venció hace '+(-r.dias)+' d':r.dias===0?'Hoy':'En '+r.dias+' d')+'</span><small>'+fchL(r.p.vence)+'</small></td><td><select class="mx-select sm" data-ren="'+r.p.id+'">'+REN_ET.map(function(e,i){return '<option value="'+i+'"'+(r.et===i?' selected':'')+'>'+(i+1)+'. '+e+'</option>';}).join('')+'</select></td><td class="r"><b>'+cop(r.p.prima)+'</b></td><td class="r nowrap">'+(r.c.celular?'<a class="mx-btn mx-btn-wa mx-btn-sm" target="_blank" rel="noopener" href="'+waLink(r.c.celular,msg)+'">'+ico('wa')+'Avisar</a>':'')+' <button class="mx-btn mx-btn-s mx-btn-sm" data-fc="'+r.c.id+'">Ficha</button></td></tr>';}).join('')+'</tbody></table></div>':empty('refresh','Sin renovaciones próximas','Aquí aparecen las pólizas activas que vencen en los próximos 60 días.');
    $('#vRen').innerHTML=h;
    $$('#vRen .mx-stage').forEach(function(b){b.addEventListener('click',function(){var i=+b.dataset.i;renState.et=renState.et===i?null:i;renderRen();});});
    $$('#vRen [data-ren]').forEach(function(s){s.addEventListener('change',async function(){var p=byId(DB.polizas,s.dataset.ren);var et=+s.value;
      try{if(et===4){var nv=addMonths(pd(p.vence),12);await dbUpdate('polizas',p.id,{inicio:p.vence,vence:ymd(nv),renov_etapa:0,cuotas_pagadas:0});await addSeg(p.cliente_id,'sistema','Póliza de '+ramoN(p.ramo)+' renovada hasta '+fchL(nv)+'.');toast('Póliza renovada hasta '+fchL(nv),'ok');}
        else{await dbUpdate('polizas',p.id,{renov_etapa:et});await addSeg(p.cliente_id,'sistema','Renovación de '+ramoN(p.ramo)+': «'+REN_ET[et]+'».');}refreshAll();}catch(e){renderRen();}});});
    $$('#vRen [data-fc]').forEach(function(b){b.addEventListener('click',function(){fichaCliente(b.dataset.fc,'pol');});});
  }

  /* ===================== CARTERA Y CUMPLEAÑOS ===================== */
  function renderCart(){
    var Q=DB.polizas.map(function(p){var q=cuotaInfo(p);return q&&!q.fin?{p:p,q:q,c:byId(DB.clientes,p.cliente_id)||{nombre:'—'}}:null;}).filter(Boolean).sort(function(a,b){return a.q.dias-b.q.dias;});
    var venc=Q.filter(function(x){return x.q.dias<0;}),prox=Q.filter(function(x){return x.q.dias>=0&&x.q.dias<=15;});
    var porCobrar=Q.reduce(function(a,x){return a+x.q.valor*(x.q.tot-x.q.pag);},0);
    var h='<div class="mx-grid mx-g-kpi mx-mb">'+kpi('Saldo por cobrar',copM(porCobrar),Q.length+' pólizas financiadas','money',true)+kpi('Cuotas vencidas',venc.length,copM(venc.reduce(function(a,x){return a+x.q.valor;},0)),'alert')+kpi('Vencen en 15 días',prox.length,copM(prox.reduce(function(a,x){return a+x.q.valor;},0)),'clock')+'</div>';
    h+='<div class="mx-grid mx-g-2"><div class="mx-card"><div class="mx-card-h"><div><h3>Próximas cuotas</h3><p>Pólizas con pago financiado</p></div></div>'+(Q.length?Q.map(function(x){var col=x.q.dias<0?'dan':x.q.dias<=5?'warn':'ok';var msg='Hola '+primerNombre(x.c.nombre)+', te recuerdo que la cuota '+x.q.num+' de '+x.q.tot+' de tu seguro de '+ramoN(x.p.ramo).toLowerCase()+' por '+cop(x.q.valor)+' '+(x.q.dias<0?'venció el ':'vence el ')+fchL(x.q.fecha)+'. ¿Te ayudo con el pago? '+ME.nombre+' · Mateo Herrera Seguros';
      return '<div class="mx-cuota"><i class="mx-sem" style="background:var(--mx-'+col+')"></i><div><b>'+esc(x.c.nombre)+'</b><small>'+code(x.p.ramo)+' Cuota '+x.q.num+'/'+x.q.tot+' · '+(x.q.dias<0?'venció hace '+(-x.q.dias)+' d':x.q.dias===0?'vence hoy':'vence '+fch(x.q.fecha))+'</small></div><b class="v">'+cop(x.q.valor)+'</b>'+(x.c.celular?'<a class="mx-ico sm wa" target="_blank" rel="noopener" title="Recordar por WhatsApp" href="'+waLink(x.c.celular,msg)+'">'+ico('wa')+'</a>':'')+(x.c.correo?'<a class="mx-ico sm" title="Recordar por correo" href="mailto:'+esc(x.c.correo)+'?subject='+encodeURIComponent('Recordatorio de pago · Mateo Herrera Seguros')+'&body='+encodeURIComponent(msg)+'">'+ico('mail')+'</a>':'')+'<button class="mx-btn mx-btn-s mx-btn-sm" data-pago="'+x.p.id+'">'+ico('check')+'Pagó</button></div>';}).join(''):empty('money','Sin cuotas pendientes','Registra pólizas con pago financiado para controlar la cartera.'))+'</div>';
    var C=DB.clientes.map(function(c){var x=proxCumple(c.nacimiento);return x?{c:c,x:x}:null;}).filter(Boolean).sort(function(a,b){return a.x.dias-b.x.dias;}).slice(0,25);
    h+='<div class="mx-card"><div class="mx-card-h"><div><h3>🎂 Próximos cumpleaños</h3><p>Según la fecha de nacimiento de la ficha</p></div></div>'+(C.length?C.map(function(o){var msg='¡Feliz cumpleaños, '+primerNombre(o.c.nombre)+'! 🎉 En Mateo Herrera Seguros te deseamos un día maravilloso. Gracias por confiar en nosotros. '+ME.nombre;
      return '<div class="mx-cuota"><span class="mx-cum'+(o.x.dias===0?' hoy':'')+'"><b>'+o.x.fecha.getDate()+'</b>'+o.x.fecha.toLocaleDateString('es-CO',{month:'short'}).replace('.','')+'</span><div><b>'+esc(o.c.nombre)+'</b><small>Cumple '+o.x.edad+' · '+(o.x.dias===0?'¡hoy!':'en '+o.x.dias+' días')+'</small></div>'+(o.c.celular?'<a class="mx-btn mx-btn-wa mx-btn-sm" target="_blank" rel="noopener" href="'+waLink(o.c.celular,msg)+'">'+ico('wa')+'Felicitar</a>':'')+'</div>';}).join(''):empty('gift','Sin cumpleaños registrados','Agrega la fecha de nacimiento en la ficha del cliente.'))+'</div></div>';
    $('#vCart').innerHTML=h;
    $$('#vCart [data-pago]').forEach(function(b){b.addEventListener('click',async function(){var p=byId(DB.polizas,b.dataset.pago);var q=cuotaInfo(p);try{await dbUpdate('polizas',p.id,{cuotas_pagadas:(+p.cuotas_pagadas||0)+1});await addSeg(p.cliente_id,'sistema','Pagó la cuota '+q.num+' de '+q.tot+' ('+cop(q.valor)+').');toast('Cuota '+q.num+' registrada como pagada','ok');refreshAll();}catch(e){}});});
  }

  /* ===================== AGENDA (lunes a viernes, 7:00 a. m. – 8:00 p. m.) ===================== */
  var agState={lunes:null,dia:null,vista:'semana'};
  var SLOT=30,ROW_H=34;
  function lunesDe(d){d=pd(d)||hoy();return addDays(d,-((d.getDay()+6)%7));}
  function slots(){var s=[];for(var m=H_INI*60;m<H_FIN*60;m+=SLOT)s.push(pad(Math.floor(m/60))+':'+pad(m%60));return s;}
  function minDe(h){var p=String(h||'0:0').split(':');return (+p[0])*60+(+p[1]||0);}
  function finCita(c){var m=minDe(c.hora)+(+c.duracion||60);return pad(Math.floor(m/60))+':'+pad(m%60);}
  function citasDia(f){return DB.citas.filter(function(c){return c.fecha===f;}).sort(function(a,b){return minDe(a.hora)-minDe(b.hora);});}
  function choques(c,ign){return DB.citas.filter(function(x){if(x.id===ign||x.fecha!==c.fecha||x.estado==='Cancelada')return false;var a=minDe(c.hora),b=a+(+c.duracion||60),xa=minDe(x.hora),xb=xa+(+x.duracion||60);return a<xb&&xa<b;});}
  function lanes(list){var L=[];list.forEach(function(c){var s=minDe(c.hora),e=s+(+c.duracion||60);var i=0;while(L[i]&&L[i]>s)i++;L[i]=e;c._lane=i;});var n=Math.max(1,L.length);
    list.forEach(function(c){var s=minDe(c.hora),e=s+(+c.duracion||60);c._n=Math.max.apply(null,list.filter(function(x){var xs=minDe(x.hora),xe=xs+(+x.duracion||60);return xs<e&&s<xe;}).map(function(x){return x._lane+1;}));});return n;}
  function renderAgenda(){
    var h0=hoy();if(!agState.lunes){var l=lunesDe(h0);if(h0.getDay()===6||h0.getDay()===0)l=addDays(l,7);agState.lunes=l;}
    if(!agState.dia){var d=h0.getDay()>=1&&h0.getDay()<=5?h0:agState.lunes;agState.dia=ymd(d);}
    var L=agState.lunes,dias=[0,1,2,3,4].map(function(i){return addDays(L,i);});
    var semana=DB.citas.filter(function(c){var x=pd(c.fecha);return x>=L&&x<=addDays(L,4);});
    var prox=DB.citas.filter(function(c){return pd(c.fecha)>=h0&&c.estado!=='Cancelada'&&c.estado!=='Realizada';}).sort(function(a,b){return (a.fecha+a.hora)<(b.fecha+b.hora)?-1:1;}).slice(0,8);
    var rango=dias[0].getDate()+' – '+dias[4].getDate()+' de '+dias[4].toLocaleDateString('es-CO',{month:'long',year:'numeric'});
    var h='<div class="mx-ag-top"><div class="mx-ag-nav"><button class="mx-ico" id="agPrev" aria-label="Semana anterior">'+ico('chevL')+'</button><button class="mx-btn mx-btn-s mx-btn-sm" id="agHoy">Hoy</button><button class="mx-ico" id="agNext" aria-label="Semana siguiente">'+ico('chevR')+'</button><h3>'+rango+'</h3></div>'+
      '<div class="mx-ag-who">'+avatar(ME,26)+'<span>Agenda de <b>'+esc(ME.nombre)+'</b></span></div>'+
      '<div class="mx-ag-stats"><span><b>'+semana.filter(function(c){return c.estado!=='Cancelada';}).length+'</b> citas esta semana</span><span><b>'+semana.filter(function(c){return c.estado==='Confirmada';}).length+'</b> confirmadas</span></div>'+
      '<input type="date" class="mx-input sm" id="agFecha" value="'+ymd(L)+'" title="Ir a una fecha"><button class="mx-btn mx-btn-p" id="agNew">'+ico('plus')+'Agendar cita</button></div>';
    h+='<div class="mx-ag-dtabs" id="agDTabs">'+dias.map(function(d){var f=ymd(d);var n=citasDia(f).filter(function(c){return c.estado!=='Cancelada';}).length;return '<button data-d="'+f+'" class="'+(agState.dia===f?'on':'')+(f===ymd(h0)?' today':'')+'"><small>'+d.toLocaleDateString('es-CO',{weekday:'short'}).replace('.','')+'</small><b>'+d.getDate()+'</b>'+(n?'<i>'+n+'</i>':'')+'</button>';}).join('')+'</div>';
    var S=slots();
    h+='<div class="mx-ag-layout"><div class="mx-ag-grid" id="agGrid" style="--rows:'+S.length+';--row-h:'+ROW_H+'px"><div class="mx-ag-corner"></div>'+dias.map(function(d){var f=ymd(d);return '<div class="mx-ag-dh'+(f===ymd(h0)?' today':'')+(agState.dia===f?' sel':'')+'" data-col="'+f+'"><small>'+d.toLocaleDateString('es-CO',{weekday:'long'})+'</small><b>'+d.getDate()+'</b></div>';}).join('');
    h+='<div class="mx-ag-times">'+S.map(function(s){return '<div class="t'+(s.slice(3)==='00'?' full':'')+'">'+(s.slice(3)==='00'?hora12(s).replace(':00',''):'')+'</div>';}).join('')+'</div>';
    dias.forEach(function(d){var f=ymd(d);var past=d<h0;var lst=citasDia(f);lanes(lst);
      h+='<div class="mx-ag-day'+(past?' past':'')+(agState.dia===f?' sel':'')+'" data-col="'+f+'">'+S.map(function(s){return '<button class="mx-ag-slot'+(s.slice(3)==='00'?' full':'')+'" data-f="'+f+'" data-h="'+s+'" aria-label="Agendar '+f+' '+s+'"><span>+ '+hora12(s)+'</span></button>';}).join('');
      lst.forEach(function(c){var top=(minDe(c.hora)-H_INI*60)/SLOT*ROW_H,ht=Math.max(ROW_H-4,(+c.duracion||60)/SLOT*ROW_H-4);var w=100/c._n;
        h+='<div class="mx-ag-ev st-'+slug(c.estado)+'" data-cita="'+c.id+'" style="top:'+(top+2)+'px;height:'+ht+'px;left:calc('+(c._lane*w)+'% + 3px);width:calc('+w+'% - 6px);--ev:'+(CITA_COL[c.tipo]||'#475569')+'" title="'+esc(c.tipo+' · '+(c.cliente_nombre||'')+' · '+hora12(c.hora)+'–'+hora12(finCita(c)))+'"><b>'+esc(c.cliente_nombre||'Sin cliente')+'</b><small>'+hora12(c.hora)+' · '+esc(c.tipo||'')+'</small>'+(ht>60&&c.empresa?'<small>'+ico('building')+esc(c.empresa)+'</small>':'')+(ht>80&&c.lugar?'<small>'+ico('pin')+esc(c.lugar)+'</small>':'')+'</div>';});
      if(f===ymd(h0)){var now=new Date(),nm=now.getHours()*60+now.getMinutes();if(nm>=H_INI*60&&nm<=H_FIN*60)h+='<div class="mx-ag-now" style="top:'+((nm-H_INI*60)/SLOT*ROW_H)+'px"></div>';}
      h+='</div>';});
    h+='</div><aside class="mx-ag-side"><div class="mx-card"><div class="mx-card-h"><div><h3>Próximas citas</h3><p>Pendientes desde hoy</p></div></div>'+(prox.length?prox.map(function(c){return '<button class="mx-ag-li" data-cita="'+c.id+'"><span class="bar" style="background:'+(CITA_COL[c.tipo]||'#475569')+'"></span><div><b>'+esc(c.cliente_nombre||'Sin cliente')+'</b><small>'+(c.fecha===ymd(h0)?'Hoy':fch(c.fecha))+' · '+hora12(c.hora)+' · '+esc(c.tipo||'')+'</small></div>'+badge(c.estado,CITA_EST[c.estado])+'</button>';}).join(''):'<p class="mute" style="font-size:.84rem">No tienes citas pendientes. Toca un espacio de la agenda para agendar.</p>')+'</div>'+
      '<div class="mx-card"><div class="mx-card-h"><div><h3>Tipos de cita</h3></div></div><div class="mx-legend" style="flex-direction:column;gap:7px">'+CITA_TIPOS.map(function(t){return '<span><i style="background:'+CITA_COL[t]+'"></i>'+t+'</span>';}).join('')+'</div><p class="mute" style="font-size:.76rem;margin-top:10px">Horario: lunes a viernes de 7:00 a. m. a 8:00 p. m. Cada asesor ve solo su agenda.</p></div></aside></div>';
    $('#vAgenda').innerHTML=h;
    var g=$('#agGrid');g.classList.toggle('one',window.innerWidth<820);g.dataset.dia=agState.dia;
    $('#agPrev').addEventListener('click',function(){agState.lunes=addDays(agState.lunes,-7);agState.dia=ymd(agState.lunes);renderAgenda();});
    $('#agNext').addEventListener('click',function(){agState.lunes=addDays(agState.lunes,7);agState.dia=ymd(agState.lunes);renderAgenda();});
    $('#agHoy').addEventListener('click',function(){agState.lunes=null;agState.dia=null;renderAgenda();});
    $('#agFecha').addEventListener('change',function(){var d=pd(this.value);if(!d)return;agState.lunes=lunesDe(d);var wd=d.getDay();agState.dia=ymd(wd===0||wd===6?agState.lunes:d);if(wd===0||wd===6)agState.lunes=addDays(agState.lunes,7),agState.dia=ymd(agState.lunes);renderAgenda();});
    $('#agNew').addEventListener('click',function(){nuevaCita({fecha:agState.dia});});
    $$('#agDTabs button').forEach(function(b){b.addEventListener('click',function(){agState.dia=b.dataset.d;renderAgenda();});});
    $$('#agGrid .mx-ag-slot').forEach(function(s){s.addEventListener('click',function(){nuevaCita({fecha:s.dataset.f,hora:s.dataset.h});});});
    $$('#vAgenda [data-cita]').forEach(function(e){e.addEventListener('click',function(ev){ev.stopPropagation();verCita(e.dataset.cita);});});
    var sc=$('#mxScroll');var nowEl=$('#agGrid .mx-ag-now');if(nowEl&&!agState._scrolled){agState._scrolled=true;setTimeout(function(){var r=nowEl.getBoundingClientRect(),rs=sc.getBoundingClientRect();if(r.top>rs.bottom-80)sc.scrollTop+=r.top-rs.top-200;},30);}
  }

  function opcionesHora(sel){return slots().map(function(s){return '<option value="'+s+'"'+(s===sel?' selected':'')+'>'+hora12(s)+'</option>';}).join('');}
  function nuevaCita(pre,editId){
    var c=editId?byId(DB.citas,editId):null;pre=pre||{};
    var x=c?Object.assign({},c):{fecha:pre.fecha||'',hora:pre.hora||'09:00',duracion:60,tipo:'Asesoría',lugar:LUGARES[0],estado:'Programada',cliente_id:pre.cliente_id||null};
    if(!x.fecha){var d=hoy();while(d.getDay()===0||d.getDay()===6)d=addDays(d,1);x.fecha=ymd(d);}
    var cli=x.cliente_id?byId(DB.clientes,x.cliente_id):null;
    if(cli&&!c){x.cliente_nombre=cli.nombre;x.empresa=cli.tipo==='Empresa'?cli.nombre:(cli.empresa||'');x.telefono=cli.celular;}
    var body='<form class="mx-form" autocomplete="off"><div class="mx-form-sec">Cliente</div>'+
      '<div class="mx-cli-pick"><input class="mx-input" id="ctBuscar" placeholder="Buscar en mis clientes por nombre, cédula o celular…" value="'+esc(cli?cli.nombre:'')+'"><input type="hidden" name="cliente_id" value="'+esc(x.cliente_id||'')+'"><div class="mx-cli-res" id="ctRes"></div></div>'+
      '<div class="mx-fgrid">'+fld('Nombre de quien asiste *',inp('cliente_nombre',x.cliente_nombre))+fld('Empresa',inp('empresa',x.empresa,'placeholder="Si aplica"'))+fld('Celular',inp('telefono',x.telefono?telFmt(x.telefono):'','inputmode="tel"'))+fld('Tipo de cita',sel('tipo',CITA_TIPOS,x.tipo))+'</div>'+
      '<div class="mx-form-sec">Fecha y hora</div><div class="mx-fgrid c3">'+fld('Fecha *',inp('fecha',x.fecha,'type="date"'))+fld('Hora *','<select class="mx-select" name="hora">'+opcionesHora(x.hora)+'</select>')+fld('Duración',sel('duracion',[[30,'30 min'],[60,'1 hora'],[90,'1 h 30 min'],[120,'2 horas'],[180,'3 horas']],x.duracion||60))+'</div>'+
      '<div class="mx-fgrid">'+fld('Lugar',inp('lugar',x.lugar,'list="mxLugares"'))+fld('Estado',sel('estado',Object.keys(CITA_EST),x.estado))+'</div><datalist id="mxLugares">'+LUGARES.map(function(l){return '<option value="'+esc(l)+'">';}).join('')+'</datalist>'+
      fld('Notas de la cita',txa('notas',x.notas,'rows="2" placeholder="Qué documentos traer, qué se va a revisar…"'))+
      '<div class="mx-warn" id="ctChoque" style="display:none"></div></form>';
    openModal({t:c?'Editar cita':'Agendar cita',s:'Agenda de '+esc(ME.nombre)+' · lunes a viernes, 7:00 a. m. a 8:00 p. m.',size:'lg',body:body,
      foot:(c?'<button class="mx-btn mx-btn-g mx-del" data-del>'+ico('trash')+'Eliminar</button>':'')+'<button class="mx-btn mx-btn-s" data-close>Cancelar</button><button class="mx-btn mx-btn-p" data-ok>'+ico('check')+(c?'Guardar cambios':'Agendar')+'</button>',
      onMount:function(el){
        var bus=el.querySelector('#ctBuscar'),res=el.querySelector('#ctRes'),hid=el.querySelector('[name=cliente_id]');
        function setCli(k){var cc=byId(DB.clientes,k);hid.value=cc?cc.id:'';if(cc){bus.value=cc.nombre;el.querySelector('[name=cliente_nombre]').value=cc.nombre;el.querySelector('[name=empresa]').value=cc.tipo==='Empresa'?cc.nombre:(cc.empresa||'');el.querySelector('[name=telefono]').value=cc.celular?telFmt(cc.celular):'';}res.innerHTML='';res.classList.remove('on');revisar();}
        bus.addEventListener('input',function(){var q=bus.value.trim();hid.value='';if(q.length<2){res.classList.remove('on');return;}
          var L=DB.clientes.filter(function(cc){return filtraTexto(cc,q);}).slice(0,6);
          res.innerHTML=(L.length?L.map(function(cc){return '<button type="button" data-k="'+cc.id+'"><b>'+esc(cc.nombre)+'</b><small>'+esc([docTxt(cc),cc.celular?telFmt(cc.celular):'',cc.empresa].filter(Boolean).join(' · '))+'</small></button>';}).join(''):'')+'<button type="button" data-k="" class="nuevo">'+ico('plus')+'Usar «'+esc(q)+'» sin ficha de cliente</button>';
          res.classList.add('on');$$('button',res).forEach(function(b){b.addEventListener('click',function(){if(b.dataset.k)setCli(b.dataset.k);else{el.querySelector('[name=cliente_nombre]').value=titleCase(q);res.classList.remove('on');}});});});
        bus.addEventListener('blur',function(){setTimeout(function(){res.classList.remove('on');},200);});
        var tel=el.querySelector('[name=telefono]');tel.addEventListener('input',function(){});
        function revisar(){var f=formData(el);var w=el.querySelector('#ctChoque');var msgs=[];var d=pd(f.fecha);
          if(d&&(d.getDay()===0||d.getDay()===6))msgs.push('La agenda funciona de lunes a viernes. Elige un día hábil.');
          if(f.hora&&minDe(f.hora)+(+f.duracion)>H_FIN*60)msgs.push('La cita termina después de las 8:00 p. m.');
          if(d&&f.hora){var ch=choques({fecha:f.fecha,hora:f.hora,duracion:+f.duracion},c&&c.id);if(ch.length)msgs.push('Se cruza con: '+ch.map(function(y){return hora12(y.hora)+' '+(y.cliente_nombre||'');}).join(', ')+'.');}
          w.style.display=msgs.length?'':'none';w.innerHTML=msgs.map(function(m){return ico('alert')+' '+esc(m);}).join('<br>');return msgs;}
        ['fecha','hora','duracion'].forEach(function(n){el.querySelector('[name='+n+']').addEventListener('change',revisar);});revisar();
        el.querySelector('[data-ok]').addEventListener('click',async function(){var b=this;var f=formData(el);
          if(!f.cliente_nombre){marcarError(el,'cliente_nombre','Escribe el nombre de quien asiste o elige un cliente.');return;}
          var d=pd(f.fecha);if(!d){marcarError(el,'fecha','Elige la fecha.');return;}
          if(d.getDay()===0||d.getDay()===6){marcarError(el,'fecha','La agenda es de lunes a viernes.');return;}
          if(minDe(f.hora)+(+f.duracion)>H_FIN*60){marcarError(el,'duracion','La cita debe terminar a más tardar a las 8:00 p. m.');return;}
          var o={fecha:f.fecha,hora:f.hora,duracion:+f.duracion,cliente_id:f.cliente_id||null,cliente_nombre:f.cliente_nombre,empresa:f.empresa||null,telefono:digits(f.telefono)||null,tipo:f.tipo,lugar:f.lugar||null,notas:f.notas||null,estado:f.estado};
          busy(b,true);
          try{if(c){await dbUpdate('citas',c.id,o);}else{await dbInsert('citas',o);if(o.cliente_id)await addSeg(o.cliente_id,'cita','Cita agendada: '+o.tipo+' el '+fchL(o.fecha)+' a las '+hora12(o.hora)+(o.lugar?' · '+o.lugar:'')+'.');}
            closeModal(el);toast(c?'Cita actualizada':'Cita agendada para el '+fchL(o.fecha)+' a las '+hora12(o.hora),'ok');
            agState.lunes=lunesDe(pd(o.fecha));agState.dia=o.fecha;refreshAll();if(drawerCtx&&drawerCtx.tipo==='cliente'&&o.cliente_id===drawerCtx.id)fichaCliente(drawerCtx.id,'citas');}catch(e){busy(b,false);}
        });
        var dl=el.querySelector('[data-del]');if(dl)dl.addEventListener('click',async function(){if(!(await confirmar('¿Eliminar esta cita?','','Eliminar',true)))return;try{await dbDelete('citas',c.id);closeModal(el);refreshAll();}catch(e){}});
      }});
  }
  function verCita(id){
    var c=byId(DB.citas,id);if(!c)return;var cli=c.cliente_id?byId(DB.clientes,c.cliente_id):null;var tel=c.telefono||(cli&&cli.celular);
    var msg='Hola '+primerNombre(c.cliente_nombre)+', te saluda '+ME.nombre+' de Mateo Herrera Seguros. Te confirmo nuestra cita de '+(c.tipo||'asesoría').toLowerCase()+' el '+pd(c.fecha).toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long'})+' a las '+hora12(c.hora)+(c.lugar?' en '+c.lugar:'')+'. ¿Me confirmas tu asistencia? 🙌';
    var b='<div class="mx-cita-card" style="--ev:'+(CITA_COL[c.tipo]||'#475569')+'"><small>'+esc(c.tipo||'Cita')+'</small><b>'+pd(c.fecha).toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long',year:'numeric'})+'</b><span>'+hora12(c.hora)+' – '+hora12(finCita(c))+'</span></div>'+
      '<dl class="mx-dl"><dt>Cliente</dt><dd>'+esc(c.cliente_nombre||'—')+(cli?' <small class="mute">(con ficha)</small>':'')+'</dd><dt>Empresa</dt><dd>'+esc(c.empresa||'—')+'</dd><dt>Celular</dt><dd>'+(tel?telFmt(tel):'—')+'</dd><dt>Lugar</dt><dd>'+esc(c.lugar||'—')+'</dd><dt>Estado</dt><dd>'+badge(c.estado,CITA_EST[c.estado])+'</dd></dl>'+(c.notas?'<div class="mx-sec">Notas</div><div class="mx-note">'+esc(c.notas)+'</div>':'')+
      '<div class="mx-sec">Cambiar estado</div><div class="mx-seg wrap" id="ctEst">'+Object.keys(CITA_EST).map(function(e){return '<button data-e="'+e+'" class="'+(c.estado===e?'on':'')+'">'+e+'</button>';}).join('')+'</div>';
    openModal({t:c.cliente_nombre||'Cita',s:esc(c.empresa||''),body:b,noFocus:true,foot:(tel?'<a class="mx-btn mx-btn-wa" target="_blank" rel="noopener" href="'+waLink(tel,msg)+'">'+ico('wa')+'Confirmar por WhatsApp</a>':'')+(cli?'<button class="mx-btn mx-btn-s" data-fc>Ficha</button>':'')+'<button class="mx-btn mx-btn-p" data-ed>'+ico('edit')+'Editar</button>',
      onMount:function(el){$$('#ctEst button',el).forEach(function(x){x.addEventListener('click',async function(){try{await dbUpdate('citas',id,{estado:x.dataset.e});if(c.cliente_id&&(x.dataset.e==='Realizada'||x.dataset.e==='No asistió'||x.dataset.e==='Cancelada'))await addSeg(c.cliente_id,'cita','Cita del '+fchL(c.fecha)+' ('+c.tipo+'): '+x.dataset.e.toLowerCase()+'.');closeModal(el);refreshAll();verCita(id);}catch(e){}});});
        var fc=el.querySelector('[data-fc]');if(fc)fc.addEventListener('click',function(){closeModal(el);fichaCliente(cli.id,'citas');});
        el.querySelector('[data-ed]').addEventListener('click',function(){closeModal(el);nuevaCita(null,id);});}});
  }

  /* ===================== EXPORTACIÓN CON MARCA (sin librerías externas) ===================== */
  var BRAND={navy:'#05083D',blue:'#0F3E8C',cyan:'#00A7E8',ink:'#0D1330',gray:'#6B7591',zebra:'#F3F6FB',line:'#DDE4F0'};
  var _logo=null;
  function logoImg(){if(_logo)return Promise.resolve(_logo);return new Promise(function(res){var src=(document.querySelector('.hdr-logo img')||{}).src;if(!src){res(null);return;}var im=new Image();im.onload=function(){_logo=im;res(im);};im.onerror=function(){res(null);};im.src=src;});}
  var _mc=null;function measure(t,size,bold){if(!_mc)_mc=document.createElement('canvas').getContext('2d');_mc.font=(bold?'bold ':'')+size+'px Helvetica, Arial, "Liberation Sans", sans-serif';return _mc.measureText(t).width;}
  function fitText(t,size,bold,maxW){t=String(t==null?'':t).replace(/\s+/g,' ').trim();if(measure(t,size,bold)<=maxW)return t;var lo=0,hi=t.length;while(lo<hi){var m=(lo+hi+1)>>1;if(measure(t.slice(0,m)+'…',size,bold)<=maxW)lo=m;else hi=m-1;}return lo?t.slice(0,lo).replace(/\s+$/,'')+'…':'';}
  function hex2rgb(h){h=h.replace('#','');return [parseInt(h.slice(0,2),16)/255,parseInt(h.slice(2,4),16)/255,parseInt(h.slice(4,6),16)/255];}
  function fechaGen(){var d=new Date();return d.toLocaleDateString('es-CO',{day:'numeric',month:'long',year:'numeric'})+' · '+d.toLocaleTimeString('es-CO',{hour:'numeric',minute:'2-digit'});}

  /* ---- diseño común: genera operaciones de dibujo por página ---- */
  function layoutTabla(meta,W,Hpage,logo){
    var M=28,top=M,cols=meta.cols,n=cols.length;
    var fs=n>12?6.2:n>9?6.8:n>6?7.6:8.4,hs=fs+.4,rowH=fs*2.05,hdrH=fs*2.6;
    var tw=W-2*M,sw=cols.reduce(function(a,c){return a+(c.w||1);},0);
    var cw=cols.map(function(c){return tw*(c.w||1)/sw;});
    var pages=[],ops=null,y=0,pageNo=0;
    var lh=36,lw=logo?lh*logo.width/logo.height:0;
    function header(){ops=[];pages.push(ops);pageNo++;y=top;
      if(logo)ops.push({t:'img',x:M,y:y,w:lw,h:lh});
      ops.push({t:'text',x:W-M,y:y+12,s:meta.titulo,size:15,bold:1,color:BRAND.navy,align:'r'});
      ops.push({t:'text',x:W-M,y:y+25,s:meta.sub||'',size:8.5,color:BRAND.gray,align:'r'});
      ops.push({t:'text',x:W-M,y:y+35,s:'Generado el '+fechaGen(),size:7.5,color:BRAND.gray,align:'r'});
      y+=lh+10;ops.push({t:'rect',x:M,y:y,w:tw,h:3,c:BRAND.navy});ops.push({t:'rect',x:M,y:y,w:tw*.22,h:3,c:BRAND.cyan});y+=11;
      ops.push({t:'rect',x:M,y:y,w:tw,h:hdrH,c:BRAND.blue});var x=M;
      cols.forEach(function(c,i){ops.push({t:'text',x:x+5,y:y+hdrH/2+hs*.36,s:fitText(c.l,hs,1,cw[i]-10),size:hs,bold:1,color:'#FFFFFF'});x+=cw[i];});y+=hdrH;}
    header();
    var bottom=Hpage?Hpage-M-18:Infinity;
    meta.rows.forEach(function(r,ri){
      if(y+rowH>bottom)header();
      if(ri%2)ops.push({t:'rect',x:M,y:y,w:tw,h:rowH,c:BRAND.zebra});
      var x=M;cols.forEach(function(c,i){var v=r[c.k];ops.push({t:'text',x:x+5,y:y+rowH/2+fs*.36,s:fitText(v,fs,i===0,cw[i]-10),size:fs,bold:i===0?1:0,color:i===0?BRAND.ink:'#38415C'});x+=cw[i];});
      y+=rowH;ops.push({t:'rect',x:M,y:y-.5,w:tw,h:.5,c:BRAND.line});
    });
    if(!meta.rows.length){ops.push({t:'text',x:M+6,y:y+16,s:'Sin registros',size:9,color:BRAND.gray});y+=24;}
    var total=pages.length;
    pages.forEach(function(p,i){var fy=Hpage?Hpage-M+2:null;p._fy=fy;p.push({t:'foot',i:i+1,n:total});});
    return {pages:pages,M:M,W:W,endY:y};
  }
  var PIE=NEGOCIO.nombre+' · '+NEGOCIO.dir+' · WhatsApp '+NEGOCIO.waTxt;

  /* ---- PDF vectorial ---- */
  var WIN={0x20AC:128,0x201A:130,0x192:131,0x201E:132,0x2026:133,0x2020:134,0x2021:135,0x2C6:136,0x2030:137,0x160:138,0x2039:139,0x152:140,0x17D:142,0x2018:145,0x2019:146,0x201C:147,0x201D:148,0x2022:149,0x2013:150,0x2014:151,0x2DC:152,0x2122:153,0x161:154,0x203A:155,0x153:156,0x17E:158,0x178:159};
  function pdfStr(s){var o='';for(var i=0;i<s.length;i++){var c=s.charCodeAt(i),b;if(c>=0xD800&&c<=0xDBFF){i++;continue;}if(c<128)b=c;else if(c>=160&&c<=255)b=c;else b=WIN[c]||63;
    if(b===40||b===41||b===92)o+='\\'+String.fromCharCode(b);else if(b<32)o+=' ';else if(b>126)o+='\\'+('00'+b.toString(8)).slice(-3);else o+=String.fromCharCode(b);}return o;}
  function num(n){return (Math.round(n*100)/100).toString();}
  async function deflate(u8){if(typeof CompressionStream==='undefined')return null;try{var cs=new CompressionStream('deflate');var s=new Blob([u8]).stream().pipeThrough(cs);return new Uint8Array(await new Response(s).arrayBuffer());}catch(e){return null;}}
  function b64u8(b64){var bin=atob(b64),u=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u;}
  async function exportPDF(meta){
    var logo=await logoImg();var W=842,H=595;
    var L=layoutTabla(meta,W,H,logo);
    var jpg=null,lw=0,lh=0;if(logo){var cv=document.createElement('canvas');cv.width=logo.width;cv.height=logo.height;var cx=cv.getContext('2d');cx.fillStyle='#fff';cx.fillRect(0,0,cv.width,cv.height);cx.drawImage(logo,0,0);jpg=b64u8(cv.toDataURL('image/jpeg',.92).split(',')[1]);lw=cv.width;lh=cv.height;}
    var enc=new TextEncoder();var chunks=[],len=0,offs=[];
    function put(x){var u=typeof x==='string'?latin(x):x;chunks.push(u);len+=u.length;}
    function latin(s){var u=new Uint8Array(s.length);for(var i=0;i<s.length;i++)u[i]=s.charCodeAt(i)&255;return u;}
    function obj(n){offs[n]=len;put(n+' 0 obj\n');}
    var nPages=L.pages.length,firstPage=6;
    put('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    obj(1);put('<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
    var kids=[];for(var i=0;i<nPages;i++)kids.push((firstPage+i*2)+' 0 R');
    obj(2);put('<< /Type /Pages /Kids ['+kids.join(' ')+'] /Count '+nPages+' >>\nendobj\n');
    obj(3);put('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n');
    obj(4);put('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n');
    obj(5);if(jpg){put('<< /Type /XObject /Subtype /Image /Width '+lw+' /Height '+lh+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+jpg.length+' >>\nstream\n');put(jpg);put('\nendstream\nendobj\n');}else put('<< >>\nendobj\n');
    for(var p=0;p<nPages;p++){
      var s='';L.pages[p].forEach(function(o){
        if(o.t==='rect'){var c=hex2rgb(o.c);s+=num(c[0])+' '+num(c[1])+' '+num(c[2])+' rg '+num(o.x)+' '+num(H-o.y-o.h)+' '+num(o.w)+' '+num(o.h)+' re f\n';}
        else if(o.t==='img'&&jpg){s+='q '+num(o.w)+' 0 0 '+num(o.h)+' '+num(o.x)+' '+num(H-o.y-o.h)+' cm /Im1 Do Q\n';}
        else if(o.t==='text'){if(!o.s)return;var c2=hex2rgb(o.color||BRAND.ink);var x=o.align==='r'?o.x-measure(o.s,o.size,o.bold):o.x;s+='BT '+num(c2[0])+' '+num(c2[1])+' '+num(c2[2])+' rg /'+(o.bold?'F2':'F1')+' '+num(o.size)+' Tf '+num(x)+' '+num(H-o.y)+' Td ('+pdfStr(o.s)+') Tj ET\n';}
        else if(o.t==='foot'){var g=hex2rgb(BRAND.gray);var fy=16;s+='0.87 0.89 0.94 rg '+num(L.M)+' '+num(fy+10)+' '+num(W-2*L.M)+' 0.6 re f\n';s+='BT '+num(g[0])+' '+num(g[1])+' '+num(g[2])+' rg /F1 7 Tf '+num(L.M)+' '+num(fy)+' Td ('+pdfStr(PIE)+') Tj ET\n';var pg='Página '+o.i+' de '+o.n;s+='BT /F2 7 Tf '+num(W-L.M-measure(pg,7,1))+' '+num(fy)+' Td ('+pdfStr(pg)+') Tj ET\n';}
      });
      var raw=latin(s);var z=await deflate(raw);
      var pn=firstPage+p*2;obj(pn);put('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+W+' '+H+'] /Resources << /Font << /F1 3 0 R /F2 4 0 R >>'+(jpg?' /XObject << /Im1 5 0 R >>':'')+' >> /Contents '+(pn+1)+' 0 R >>\nendobj\n');
      obj(pn+1);put('<< /Length '+(z||raw).length+(z?' /Filter /FlateDecode':'')+' >>\nstream\n');put(z||raw);put('\nendstream\nendobj\n');
    }
    var total=firstPage+nPages*2;var xref=len;put('xref\n0 '+total+'\n0000000000 65535 f \n');for(var k=1;k<total;k++)put(('0000000000'+offs[k]).slice(-10)+' 00000 n \n');
    put('trailer\n<< /Size '+total+' /Root 1 0 R /Info << /Title ('+pdfStr(meta.titulo)+') /Producer (Mateo Herrera Seguros) >> >>\nstartxref\n'+xref+'\n%%EOF');
    download(meta.archivo+'.pdf',new Blob(chunks,{type:'application/pdf'}));
  }

  /* ---- PNG ---- */
  async function exportPNG(meta){
    var MAXR=600;var rows=meta.rows;var cort=rows.length>MAXR;var m2=Object.assign({},meta,{rows:rows.slice(0,MAXR),sub:(meta.sub||'')+(cort?' · primeras '+MAXR+' filas':'')});
    var logo=await logoImg();var W=Math.max(842,meta.cols.reduce(function(a,c){return a+(c.w||1)*72;},0)+56);
    var L=layoutTabla(m2,W,0,logo);var H=L.endY+40;var sc=2;
    var cv=document.createElement('canvas');cv.width=W*sc;cv.height=H*sc;var cx=cv.getContext('2d');cx.scale(sc,sc);cx.fillStyle='#fff';cx.fillRect(0,0,W,H);
    L.pages[0].forEach(function(o){if(o.t==='rect'){cx.fillStyle=o.c;cx.fillRect(o.x,o.y,o.w,o.h);}else if(o.t==='img'&&logo){cx.drawImage(logo,o.x,o.y,o.w,o.h);}
      else if(o.t==='text'&&o.s){cx.font=(o.bold?'bold ':'')+o.size+'px Helvetica, Arial, "Liberation Sans", sans-serif';cx.fillStyle=o.color||BRAND.ink;cx.textAlign=o.align==='r'?'right':'left';cx.fillText(o.s,o.x,o.y);}
      else if(o.t==='foot'){cx.fillStyle=BRAND.line;cx.fillRect(L.M,H-28,W-2*L.M,.6);cx.font='7.5px Helvetica, Arial, sans-serif';cx.fillStyle=BRAND.gray;cx.textAlign='left';cx.fillText(PIE,L.M,H-16);}});
    if(cort)toast('La imagen incluye las primeras '+MAXR+' filas. Para todo el listado usa PDF o Excel.');
    var blob=await new Promise(function(res){cv.toBlob(res,'image/png');});download(meta.archivo+'.png',blob);
  }

  /* ---- CSV ---- */
  function exportCSV(meta){var q=function(v){v=String(v==null?'':v);return /[;"\n\r]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;};
    var out=[meta.cols.map(function(c){return q(c.l);}).join(';')].concat(meta.rows.map(function(r){return meta.cols.map(function(c){return q(r[c.k]);}).join(';');}));
    download(meta.archivo+'.csv',new Blob(['﻿'+out.join('\r\n')],{type:'text/csv;charset=utf-8'}));}

  /* ---- Excel (.xlsx real, con logo, estilos, filtros y paneles fijos) ---- */
  var CRC=(function(){var t=new Uint32Array(256);for(var n=0;n<256;n++){var c=n;for(var k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
  function crc32(u){var c=0xFFFFFFFF;for(var i=0;i<u.length;i++)c=CRC[(c^u[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0;}
  function zip(files){ // [{name, data:Uint8Array}] · método store
    var enc=new TextEncoder(),parts=[],cen=[],off=0;
    files.forEach(function(f){var nm=enc.encode(f.name),d=f.data,cr=crc32(d);
      var h=new DataView(new ArrayBuffer(30));h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint16(8,0,true);h.setUint16(10,0,true);h.setUint16(12,0x21,true);h.setUint32(14,cr,true);h.setUint32(18,d.length,true);h.setUint32(22,d.length,true);h.setUint16(26,nm.length,true);h.setUint16(28,0,true);
      parts.push(new Uint8Array(h.buffer),nm,d);
      var c=new DataView(new ArrayBuffer(46));c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x0800,true);c.setUint16(10,0,true);c.setUint16(12,0,true);c.setUint16(14,0x21,true);c.setUint32(16,cr,true);c.setUint32(20,d.length,true);c.setUint32(24,d.length,true);c.setUint16(28,nm.length,true);c.setUint32(42,off,true);
      cen.push(new Uint8Array(c.buffer),nm);off+=30+nm.length+d.length;});
    var cs=cen.reduce(function(a,u){return a+u.length;},0);var e=new DataView(new ArrayBuffer(22));e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,cs,true);e.setUint32(16,off,true);
    return new Blob(parts.concat(cen,[new Uint8Array(e.buffer)]),{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
  }
  function xesc(s){return String(s==null?'':s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function colL(i){var s='';i++;while(i>0){var m=(i-1)%26;s=String.fromCharCode(65+m)+s;i=Math.floor((i-1)/26);}return s;}
  async function exportXLSX(meta){
    var logo=await logoImg();var png=null,lw=0,lh=0;
    if(logo){var cv=document.createElement('canvas');cv.width=logo.width;cv.height=logo.height;cv.getContext('2d').drawImage(logo,0,0);png=b64u8(cv.toDataURL('image/png').split(',')[1]);lw=logo.width;lh=logo.height;}
    var enc=new TextEncoder(),cols=meta.cols,n=cols.length,last=colL(n-1),HR=5;
    var widths=cols.map(function(c){var m=c.l.length;meta.rows.slice(0,800).forEach(function(r){var v=String(r[c.k]==null?'':r[c.k]);if(v.length>m)m=v.length;});return Math.min(48,Math.max(9,m+2));});
    function cell(ref,v,s){if(v===''||v==null)return '<c r="'+ref+'" s="'+s+'"/>';if(typeof v==='number'&&isFinite(v))return '<c r="'+ref+'" s="'+s+'"><v>'+v+'</v></c>';return '<c r="'+ref+'" s="'+s+'" t="inlineStr"><is><t xml:space="preserve">'+xesc(v)+'</t></is></c>';}
    var x='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">';
    x+='<sheetViews><sheetView workbookViewId="0" showGridLines="0"><pane ySplit="'+HR+'" topLeftCell="A'+(HR+1)+'" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="18"/>';
    x+='<cols>'+widths.map(function(w,i){return '<col min="'+(i+1)+'" max="'+(i+1)+'" width="'+w+'" customWidth="1"/>';}).join('')+'</cols><sheetData>';
    var tc=n>=3?2:Math.max(0,n-1);var tl=colL(tc);
    x+='<row r="1" ht="30" customHeight="1">'+cell(tl+'1',meta.titulo,1)+'</row>';
    x+='<row r="2" ht="17" customHeight="1">'+cell(tl+'2',meta.sub||'',2)+'</row>';
    x+='<row r="3" ht="15" customHeight="1">'+cell(tl+'3','Generado el '+fechaGen()+' · '+NEGOCIO.nombre,2)+'</row>';
    x+='<row r="4" ht="5" customHeight="1">';for(var i=0;i<n;i++)x+='<c r="'+colL(i)+'4" s="'+(i===0?7:3)+'"/>';x+='</row>';
    x+='<row r="'+HR+'" ht="24" customHeight="1">'+cols.map(function(c,i){return cell(colL(i)+HR,c.l,4);}).join('')+'</row>';
    meta.rows.forEach(function(r,ri){var rn=HR+1+ri;x+='<row r="'+rn+'">'+cols.map(function(c,i){var v=r[c.k];return cell(colL(i)+rn,v,(ri%2?6:5)+(i===0?3:0));}).join('')+'</row>';});
    var fr=HR+meta.rows.length+2;x+='<row r="'+fr+'">'+cell('A'+fr,PIE,2)+'</row>';
    x+='</sheetData>';
    if(meta.rows.length)x+='<autoFilter ref="A'+HR+':'+last+(HR+meta.rows.length)+'"/>';
    x+='<pageMargins left="0.4" right="0.4" top="0.5" bottom="0.5" header="0.3" footer="0.3"/><pageSetup orientation="landscape" paperSize="9" fitToWidth="1" fitToHeight="0"/>';
    if(png)x+='<drawing r:id="rId1"/>';x+='</worksheet>';
    var styles='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'+
      '<fonts count="6"><font><sz val="10"/><color rgb="FF38415C"/><name val="Calibri"/></font><font><b/><sz val="16"/><color rgb="FF05083D"/><name val="Calibri"/></font><font><sz val="9"/><color rgb="FF6B7591"/><name val="Calibri"/></font><font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font><font><b/><sz val="10"/><color rgb="FF0D1330"/><name val="Calibri"/></font><font><sz val="10"/><color rgb="FF38415C"/><name val="Calibri"/></font></fonts>'+
      '<fills count="6"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF05083D"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FF0F3E8C"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF3F6FB"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FF00A7E8"/></patternFill></fill></fills>'+
      '<borders count="2"><border/><border><bottom style="thin"><color rgb="FFDDE4F0"/></bottom></border></borders>'+
      '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="10">'+
      [[0,0,0,''],[1,0,0,'<alignment vertical="center"/>'],[2,0,0,''],[0,2,0,''],[3,3,0,'<alignment vertical="center" wrapText="1"/>'],[5,0,1,'<alignment vertical="center"/>'],[5,4,1,'<alignment vertical="center"/>'],[0,5,0,''],[4,0,1,'<alignment vertical="center"/>'],[4,4,1,'<alignment vertical="center"/>']].map(function(x){return '<xf numFmtId="0" fontId="'+x[0]+'" fillId="'+x[1]+'" borderId="'+x[2]+'" xfId="0"'+(x[0]?' applyFont="1"':'')+(x[1]?' applyFill="1"':'')+(x[2]?' applyBorder="1"':'')+(x[3]?' applyAlignment="1">'+x[3]+'</xf>':'/>');}).join('')+
      '</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
    var files=[
      {name:'[Content_Types].xml',s:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'+(png?'<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>':'')+'</Types>'},
      {name:'_rels/.rels',s:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'},
      {name:'xl/workbook.xml',s:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="'+xesc((meta.hoja||meta.titulo).replace(/[\[\]\*\?\/\\:]/g,' ').slice(0,31))+'" sheetId="1" r:id="rId1"/></sheets>'+(meta.rows.length?'<definedNames><definedName name="_xlnm._FilterDatabase" localSheetId="0" hidden="1">\'' +xesc((meta.hoja||meta.titulo).replace(/[\[\]\*\?\/\\:]/g,' ').slice(0,31)).replace(/'/g,"''")+'\'!$A$'+HR+':$'+last+'$'+(HR+meta.rows.length)+'</definedName></definedNames>':'')+'</workbook>'},
      {name:'xl/_rels/workbook.xml.rels',s:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'},
      {name:'xl/styles.xml',s:styles},
      {name:'xl/worksheets/sheet1.xml',s:x}
    ];
    if(png){var ew=Math.round(150*9525),eh=Math.round(150*lh/lw*9525);
      files.push({name:'xl/worksheets/_rels/sheet1.xml.rels',s:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/></Relationships>'});
      files.push({name:'xl/drawings/drawing1.xml',s:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><xdr:oneCellAnchor><xdr:from><xdr:col>0</xdr:col><xdr:colOff>76200</xdr:colOff><xdr:row>0</xdr:row><xdr:rowOff>57150</xdr:rowOff></xdr:from><xdr:ext cx="'+ew+'" cy="'+eh+'"/><xdr:pic><xdr:nvPicPr><xdr:cNvPr id="2" name="Logo"/><xdr:cNvPicPr><a:picLocks noChangeAspect="1"/></xdr:cNvPicPr></xdr:nvPicPr><xdr:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill><xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="'+ew+'" cy="'+eh+'"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr></xdr:pic><xdr:clientData/></xdr:oneCellAnchor></xdr:wsDr>'});
      files.push({name:'xl/drawings/_rels/drawing1.xml.rels',s:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/logo.png"/></Relationships>'});
      files.push({name:'xl/media/logo.png',data:png});}
    download(meta.archivo+'.xlsx',zip(files.map(function(f){return {name:f.name,data:f.data||enc.encode(f.s)};})));
  }

  function menuExport(btn,meta){
    menu(btn,[['file','PDF con marca',function(){correrExport(exportPDF,meta,'PDF');},'Para imprimir o enviar'],['table','Excel con marca',function(){correrExport(exportXLSX,meta,'Excel');},'Con logo, filtros y encabezado fijo'],['image','Imagen PNG',function(){correrExport(exportPNG,meta,'PNG');},'Para WhatsApp o presentaciones'],'-',['doc','CSV',function(){correrExport(exportCSV,meta,'CSV');},'Separado por punto y coma']]);
  }
  async function correrExport(fn,meta,tipo){toast('Generando '+tipo+'…');try{await fn(meta);toast(tipo+' listo: '+meta.rows.length+' registro(s)','ok');}catch(e){console.error(e);toast('No se pudo generar el '+tipo+': '+(e.message||e),'err');}}

  /* ===================== LECTURA DE EXCEL Y CSV (importador) ===================== */
  async function unzip(buf){
    var dv=new DataView(buf),u8=new Uint8Array(buf),eocd=-1;for(var i=u8.length-22;i>=Math.max(0,u8.length-66000);i--){if(dv.getUint32(i,true)===0x06054b50){eocd=i;break;}}
    if(eocd<0)throw new Error('El archivo no es un Excel válido (.xlsx).');
    var n=dv.getUint16(eocd+10,true),off=dv.getUint32(eocd+16,true),out={},dec=new TextDecoder();
    for(var k=0;k<n;k++){var met=dv.getUint16(off+10,true),csz=dv.getUint32(off+20,true),nl=dv.getUint16(off+28,true),el=dv.getUint16(off+30,true),cl=dv.getUint16(off+32,true),lo=dv.getUint32(off+42,true);
      var name=dec.decode(u8.subarray(off+46,off+46+nl));var lnl=dv.getUint16(lo+26,true),lel=dv.getUint16(lo+28,true);var data=u8.subarray(lo+30+lnl+lel,lo+30+lnl+lel+csz);
      out[name]={met:met,data:data};off+=46+nl+el+cl;}
    return {list:Object.keys(out),read:async function(nm){var f=out[nm];if(!f)return null;if(f.met===0)return dec.decode(f.data);
      if(typeof DecompressionStream==='undefined')throw new Error('Tu navegador no puede leer Excel. Guarda el archivo como CSV e impórtalo.');
      var s=new Blob([f.data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));return dec.decode(await new Response(s).arrayBuffer());}};
  }
  function xmlDoc(s){return new DOMParser().parseFromString(s,'application/xml');}
  function byTag(n,t){return Array.prototype.slice.call(n.getElementsByTagNameNS('*',t));}
  async function leerXLSX(file){
    var z=await unzip(await file.arrayBuffer());
    var wb=xmlDoc(await z.read('xl/workbook.xml'));var rels=xmlDoc(await z.read('xl/_rels/workbook.xml.rels')||'<r/>');
    var rmap={};byTag(rels,'Relationship').forEach(function(r){rmap[r.getAttribute('Id')]=r.getAttribute('Target');});
    var ss=[];var sst=await z.read('xl/sharedStrings.xml');if(sst)byTag(xmlDoc(sst),'si').forEach(function(si){ss.push(byTag(si,'t').map(function(t){return t.textContent;}).join(''));});
    var hojas=[];
    for(var s of byTag(wb,'sheet')){var rid=s.getAttribute('r:id')||s.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id');var tg=(rmap[rid]||'').replace(/^\/?(xl\/)?/,'');var x=await z.read('xl/'+tg);if(!x)continue;
      var rows=[];byTag(xmlDoc(x),'row').forEach(function(r){var ri=(+r.getAttribute('r')||rows.length+1)-1;var row=[];byTag(r,'c').forEach(function(c){var ref=c.getAttribute('r')||'';var col=0,m=ref.match(/^[A-Z]+/);if(m)for(var i=0;i<m[0].length;i++)col=col*26+(m[0].charCodeAt(i)-64);col=col?col-1:row.length;
        var t=c.getAttribute('t'),v=byTag(c,'v')[0],val=null;if(t==='s')val=v?ss[+v.textContent]:'';else if(t==='inlineStr')val=byTag(c,'t').map(function(e){return e.textContent;}).join('');else if(t==='b')val=v&&v.textContent==='1'?'Sí':'No';else if(v){var tx=v.textContent;val=t==='str'||t==='e'?tx:(isNaN(+tx)?tx:+tx);}
        row[col]=val;});rows[ri]=row;});
      for(var i=0;i<rows.length;i++)if(!rows[i])rows[i]=[];
      hojas.push({nombre:s.getAttribute('name'),rows:rows});}
    return hojas;
  }
  async function leerCSV(file){var t=await file.text();t=t.replace(/^﻿/,'');var first=t.split(/\r?\n/)[0]||'';var d=[';',',','\t'].sort(function(a,b){return first.split(b).length-first.split(a).length;})[0];
    var rows=[],row=[],f='',q=false;for(var i=0;i<t.length;i++){var ch=t[i];if(q){if(ch==='"'){if(t[i+1]==='"'){f+='"';i++;}else q=false;}else f+=ch;}else if(ch==='"')q=true;else if(ch===d){row.push(f);f='';}else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&t[i+1]==='\n')i++;row.push(f);rows.push(row);row=[];f='';}else f+=ch;}
    if(f||row.length){row.push(f);rows.push(row);}return [{nombre:file.name.replace(/\.[^.]+$/,''),rows:rows}];}

  /* ===================== BASE DE DATOS (prospectos, separada de clientes y pipeline) ===================== */
  var STD=[ // clave, etiqueta, sinónimos de encabezado (normalizados), peso en tabla
    ['nombre','Nombre / Razón social',['nombre / razon social','razon social','razon_social','empresa','nombre empresa','nombre','nombre tomador','nombre cliente','cliente','nombres','nombre completo'],2.2],
    ['tipo_persona','Tipo de persona',['tipo de persona','tipo persona'],1],
    ['tipo_doc','Tipo de documento',['tipo de documento','tipo documento','tipo de identificacion tomador','tipo de identificacion','tipo id','tipo doc'],.8],
    ['documento','Documento / NIT',['documento / nit','nit','nitempresa','id_empresa','nit empresa','numero de identificacion tomador','numero de identificacion','identificacion','cedula','documento','cc','nro documento'],1.2],
    ['contacto','Contacto / Representante',['contacto / representante','nombre representante','representante','representante legal','contacto','gerente'],1.6],
    ['cargo','Cargo',['cargo'],1],
    ['telefono','Teléfono',['telefono','tel','telefono tomador','celular','movil','whatsapp','telefono 1'],1.1],
    ['telefono2','Teléfono 2',['telefono 2','tel 2','otro telefono','telefono2'],1],
    ['correo','Correo',['correo','correo oficial','email','e-mail','emailalertas','email tomador','correo electronico','mail'],1.8],
    ['correo2','Otros correos',['otros correos','correo 2','e-mail 2','email 2','correo2'],1.6],
    ['direccion','Dirección',['direccion','direccion empresa','domicilio'],1.6],
    ['ciudad','Ciudad',['ciudad','municipio'],1],
    ['departamento','Departamento',['departamento','territorial','dpto','depto'],1],
    ['sector','Sector',['sector','sector_corto','macro sector','macrosector','sector economico','actividad economica','actividad'],1.5],
    ['subsector','Subsector',['subsector','sub sector'],1.4],
    ['tamano','Tamaño de empresa',['tamano de empresa','tamano','tamano empresa'],.9],
    ['empleados','N.º de empleados',['n.o de empleados','no. de trab','no de trab','empleados','trabajadores','numero de empleados','n de trabajadores','no. de trabajadores'],.8],
    ['arl','ARL actual',['arl actual','arl'],.9],
    ['producto','Producto',['producto'],1.1],
    ['estado','Estado',['estado','estado de la solicitud'],1.2],
    ['paso','Paso',['paso','paso de la solicitud'],1.1],
    ['valor','Valor prima',['valor prima','valor prima total','prima','valor'],1],
    ['fecha','Fecha',['fecha','fecha de radicacion','fecha radicacion'],1],
    ['solicitud','N.º solicitud',['n.o solicitud','numero de solicitud','solicitud'],1],
    ['poliza','N.º póliza',['n.o poliza','numero de poliza','poliza'],1],
    ['intermediario','Intermediario',['intermediario','agente - intermediario','agente','asesor'],1.4],
    ['solicitudes','Solicitudes',['solicitudes'],.7],
    ['ramos','Ramos sugeridos',['ramos sugeridos'],1.2],
    ['etiquetas','Etiquetas',['etiquetas','tags'],1.6],
    ['notas','Notas',['notas','observaciones','comentarios'],1.6]
  ];
  var STD_L={},STD_W={};STD.forEach(function(s){STD_L[s[0]]=s[1];STD_W[s[0]]=s[3];});
  var BD_CATS=['Gremio / afiliados','Transporte','Empresas por tamaño · ARL','Personas · Educativo','Personas','Empresas','Otra'];
  var BD_COL={'Gremio / afiliados':'#0F3E8C','Transporte':'#0369A1','Empresas por tamaño · ARL':'#EA580C','Personas · Educativo':'#EC4899','Personas':'#7C3AED','Empresas':'#0891B2','Otra':'#64748B'};
  var REGLAS=[ // [expresión sobre sector/subsector/nombre, ramos sugeridos, etiqueta de sector]
    [/transporte|carga|logistic|mensajer|courier|trasteo|expres/,['TRCA','TRME','RCCE','AC','SOAT','ARL'],'Transporte'],
    [/construc|inmobiliar|arquitect|ingenier|\bobras?\b|demolic|acabado/,['TRC','CUM','DEC','ARL','VG'],'Construcción e inmobiliario'],
    [/salud|hospital|clinic|medic|odontol|\bips\b|\beps\b|farmac|laborator/,['RCM','SC','VG','ARL'],'Salud'],
    [/educa|colegio|instituto|universidad|escuela|academia|jardin/,['APE','VG','EDU','ARL'],'Educación'],
    [/automotor|autos|motos|repuesto|concesionari|vehicul|taller|lubric/,['AC','ATR','SOAT','PYME'],'Automotor'],
    [/restaurante|\bbar(es)?\b|hotel|turis|gastronom|comida|cafe/,['PYME','APG','ARL'],'Restaurantes y turismo'],
    [/centro comercial|propiedad raiz|copropiedad|conjunto|edificio|condominio/,['COPC','COPR','PYME'],'Propiedad horizontal'],
    [/vigilancia|seguridad privada|escolta|limpieza|\baseo\b|temporal|outsourcing/,['ARL','VG','CUM','APG'],'Servicios de personal'],
    [/agric|ganad|agro|quimic|cultivo|pecuari|veterinar/,['PYME','TRME','ARL','APG'],'Agro e insumos'],
    [/funerari|cementerio|exequial/,['EXE','PYME'],'Funerario'],
    [/financ|asegurad|banco|cooperativ|credito/,['VG','VDG','PYME'],'Financiero'],
    [/tecnolog|comunicac|software|sistemas|telecom|publicidad|creativ/,['PYME','CUM','VG'],'Tecnología y comunicaciones'],
    [/admon publica|municipio|alcaldia|gobernacion|publica/,['CUM','VG','ARL'],'Sector público'],
    [/comercio|almacen|supermercado|hipermercado|cadena|textil|confecc|mueble|distribu|ferreter|tienda/,['PYME','CUM','VG','ARL'],'Comercio'],
    [/servicio domestico|domestic/,['ARL'],'Servicio doméstico']
  ];
  function arrify(v){if(Array.isArray(v))return v;if(v==null||v==='')return [];return String(v).split(/\s*[,;|]\s*/).filter(Boolean);}
  function fixMojibake(s){if(typeof s!=='string'||!/[ÃÂ][\x80-\xBF€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ¡-¿]/.test(s))return s;try{var b=new Uint8Array(s.length);for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);if(c>255&&WIN[c]==null)return s;b[i]=c>255?WIN[c]:c;}return new TextDecoder('utf-8',{fatal:true}).decode(b);}catch(e){return s;}}
  function razonSocial(s){return titleCase(s).replace(/(^|[\s"(])(s\.?\s?a\.?\s?s\.?|ltda\.?|s\.?\s?a\.?|e\.?\s?u\.?|e\.?s\.?p\.?|ips|eps|sas|cia\.?|c\.?\s?i\.?|ong|rndc)(?=[\s",.)]|$)/gi,function(m,a,b){return a+b.toUpperCase();});}
  function limpiarSector(s){return String(s||'').replace(/^\s*\d+\s*[.)-]\s*/,'').replace(/^(macro\s*sector|macrosector|sector)\s+(de\s+(los?\s+|las?\s+)?)?/i,'').trim();}
  function nitFmt(d){d=digits(d);if(d.length===10&&/^[89]/.test(d))return d.slice(0,9)+'-'+d.slice(9);return d;}
  function telefonos(v){var s=String(v==null?'':v),out=[];
    s.split(/[\/,;|]|\s{2,}|-\s+|\s+-|\s+y\s+/).forEach(function(part){var d=digits(part);if(d.length>=7&&d.length<=12){out.push(d);return;}
      part.split(/\D+/).forEach(function(t){if(t.length>=7)out.push(t);});});
    if(!out.length){var d=digits(s);if(d.length>=7)out=[d.slice(0,12)];}
    return out.map(function(p){if(p.length===12&&p.indexOf('57')===0)p=p.slice(2);return p;});}
  function tamanoDe(n){n=+n;if(!n)return '';if(n<=10)return 'Micro';if(n<=50)return 'Pequeña';if(n<=200)return 'Mediana';return 'Grande';}
  function etiquetar(d,cat){
    var ramos=arrify(d.ramos),tags=arrify(d.etiquetas),sec='';
    var esPersona=d.tipo_persona==='Persona'||/personas/i.test(cat||'')||(d.tipo_doc&&/^(CC|CE|PS|PP|TI)$/i.test(d.tipo_doc)&&!/sas|ltda|s\.a|empresa/i.test(d.nombre||''));
    var txt=norm([d.sector,d.subsector,esPersona?'':d.nombre,/transporte/i.test(cat||'')?'transporte':''].join(' '));
    REGLAS.forEach(function(r){if(r[0].test(txt)){r[1].forEach(function(x){if(ramos.indexOf(x)<0)ramos.push(x);});if(!sec)sec=r[2];}});
    if(/educativ/i.test(norm(d.producto)+' '+norm(cat))){['EDU','VI','API'].forEach(function(x){if(ramos.indexOf(x)<0)ramos.push(x);});}
    if(!ramos.length)ramos=esPersona?['VI','HOG','ATR']:['PYME','VG','ARL'];
    if(!d.tipo_persona)d.tipo_persona=esPersona?'Persona':'Empresa';
    if(!d.sector&&/transporte/i.test(cat||''))d.sector='Transporte de carga';
    if(!d.tamano&&d.empleados)d.tamano=tamanoDe(d.empleados);
    function t(x){if(x&&tags.indexOf(x)<0)tags.push(x);}
    if(sec)t(sec);if(d.tamano)t(titleCase(d.tamano));
    if(/tolima/i.test(d.departamento||'')||/ibagu/i.test(norm(d.ciudad)))t('Tolima');
    var tel=digits(d.telefono);t(tel.length===10&&tel[0]==='3'?'Con WhatsApp':tel?'Solo fijo':'Sin teléfono');
    if(!d.correo)t('Sin correo');
    if(/arl/i.test(cat||''))t('Prospecto ARL');
    d.ramos=ramos.slice(0,6);d.etiquetas=tags;return d;
  }
  function detectarEncabezado(rows){var best=0,bi=0;for(var i=0;i<Math.min(15,rows.length);i++){var r=rows[i]||[];var hits=0,filled=0;r.forEach(function(c){if(c==null||c==='')return;filled++;var n=norm(c);if(STD.some(function(s){return s[2].indexOf(n)>=0;}))hits++;});var sc=hits*3+filled;if(filled>=2&&sc>best){best=sc;bi=i;}}return bi;}
  function mapearColumnas(hdr){var usados={};return hdr.map(function(h){var n=norm(h).replace(/[º°]/g,'o').replace(/\s+/g,' ');if(!n||/^(#|n[°º.o]?|no\.?|item|consecutivo|orden)$/.test(n))return '';var k='';STD.forEach(function(s){if(!k&&s[2].indexOf(n)>=0)k=s[0];});
      if(!k){if(/^e-?mail|correo/.test(n))k='correo';else if(/tel/.test(n))k='telefono';}
      if(k&&usados[k]){if(k==='correo')k='correo2';else if(k==='telefono')k='telefono2';else if(k==='correo2'||k==='telefono2'){/* se concatena */}else k='x:'+slug(h);}
      if(!k)k='x:'+slug(h);usados[k]=1;return k;});}
  function adivinarCategoria(nombre,hdrKeys){var n=norm(nombre);if(/fenalco|gremio|afiliad|camara/.test(n))return 'Gremio / afiliados';if(/transport|rndc|carga/.test(n))return 'Transporte';if(/arl|empleado|trabajador|tamano/.test(n)||hdrKeys.indexOf('empleados')>=0)return 'Empresas por tamaño · ARL';if(/educativ/.test(n)||hdrKeys.indexOf('producto')>=0)return 'Personas · Educativo';return hdrKeys.indexOf('tamano')>=0?'Empresas':'Otra';}
  function construirRegistros(rows,keys,cat,dedupe){
    var out=[],last={},LLENAR={sector:1,subsector:1,departamento:1,tipo_persona:1};
    rows.forEach(function(r){if(!r||!r.some(function(c){return c!=null&&String(c).trim()!=='';}))return;var d={},extra={};
      keys.forEach(function(k,i){if(!k)return;var v=r[i];if(v==null)v='';if(typeof v==='string')v=fixMojibake(v).replace(/\s+/g,' ').trim();
        if(k.indexOf('x:')===0){if(v!=='')extra[k.slice(2)]=v;return;}
        if((k==='correo2'||k==='telefono2')&&d[k]&&v!==''){d[k]+=', '+v;return;}
        if(v===''&&LLENAR[k]&&last[k])v=last[k];if(v!==''&&LLENAR[k])last[k]=v;if(v!=='')d[k]=v;});
      if(!d.nombre)return;
      d.nombre=String(d.nombre).replace(/^\s+|\s+$/g,'').replace(/\s+/g,' ');if(d.nombre===d.nombre.toUpperCase()||d.nombre===d.nombre.toLowerCase())d.nombre=razonSocial(d.nombre);
      if(d.contacto&&(d.contacto===String(d.contacto).toUpperCase()||d.contacto===String(d.contacto).toLowerCase()))d.contacto=titleCase(d.contacto);
      if(d.sector)d.sector=titleCase(limpiarSector(d.sector)).replace(/\bY\b/g,'y');if(d.subsector)d.subsector=titleCase(limpiarSector(d.subsector)).replace(/\bY\b/g,'y');
      if(d.documento!=null){d.documento=/nit/i.test(d.tipo_doc||'')||String(digits(d.documento)).length>=9&&/^[89]/.test(digits(d.documento))?nitFmt(d.documento):digits(d.documento);if(!d.tipo_doc)d.tipo_doc=/^[89]\d{8}/.test(digits(d.documento))?'NIT':'CC';}
      if(d.telefono!=null||d.telefono2!=null){var ts=telefonos(d.telefono).concat(telefonos(d.telefono2));ts=ts.filter(function(x,i){return ts.indexOf(x)===i;});ts.sort(function(a,b){return (b.length===10&&b[0]==='3')-(a.length===10&&a[0]==='3');});d.telefono=ts[0]||'';d.telefono2=ts.slice(1).join(', ');if(!d.telefono2)delete d.telefono2;if(!d.telefono)delete d.telefono;}
      ['correo','correo2'].forEach(function(k){if(d[k])d[k]=String(d[k]).toLowerCase().split(/[\s,;]+/).filter(function(x){return /@/.test(x);}).join(', ');if(!d[k])delete d[k];});
      if(d.correo&&d.correo.indexOf(',')>0){var cs=d.correo.split(', ');d.correo=cs[0];d.correo2=cs.slice(1).concat(d.correo2?[d.correo2]:[]).join(', ');}
      if(d.correo2){var c2=d.correo2.split(', ').filter(function(x,i,a){return x!==d.correo&&a.indexOf(x)===i;});d.correo2=c2.join(', ');if(!d.correo2)delete d.correo2;}
      if(d.ciudad){d.ciudad=titleCase(String(d.ciudad));if(d.departamento){var dep=titleCase(d.departamento);if(norm(d.ciudad).endsWith(' '+norm(dep)))d.ciudad=d.ciudad.slice(0,d.ciudad.length-dep.length).trim();}}
      if(d.departamento)d.departamento=titleCase(d.departamento);
      if(d.empleados)d.empleados=+digits(d.empleados)||d.empleados;if(d.tamano)d.tamano=titleCase(d.tamano);
      if(d.valor!=null&&d.valor!==''){var vv=+digits(d.valor);if(vv)d.valor=vv;}
      if(typeof d.fecha==='number'&&d.fecha>20000&&d.fecha<80000){var dt=new Date(Date.UTC(1899,11,30)+d.fecha*864e5);d.fecha=dt.toISOString().slice(0,10);}
      else if(typeof d.fecha==='string'){var m=d.fecha.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);if(m)d.fecha=m[3]+'-'+pad(+m[2])+'-'+pad(+m[1]);}
      if(Object.keys(extra).length)d.extra=extra;
      out.push(etiquetar(d,cat));});
    if(dedupe){var vistos={},res=[];out.forEach(function(d){var k=d.documento?'d'+digits(d.documento):d.telefono?'t'+d.telefono:'n'+norm(d.nombre);if(vistos[k]){var a=vistos[k];a.solicitudes=(+a.solicitudes||1)+1;if((d.fecha||'')>(a.fecha||'')){var n=a.solicitudes;for(var j in d)a[j]=d[j];a.solicitudes=n;}}else{vistos[k]=d;res.push(d);}});out=res;}
    return out;
  }

  /* ---- vista ---- */
  var bdState={tab:'all',vista:'tabla',q:'',f:{},page:0,size:50,agrupar:'sector'};
  function regsDe(bid){return DB.base_registros.filter(function(r){return r.base_id===bid;});}
  function baseDe(r){return byId(DB.bases,r.base_id)||{nombre:'—',categoria:'Otra'};}
  function bdRegistros(){var L=bdState.tab==='all'?DB.base_registros:regsDe(bdState.tab);var f=bdState.f;
    return L.filter(function(r){var d=r.datos||{};if(f.cat&&baseDe(r).categoria!==f.cat)return false;if(f.sector&&(d.sector||'—')!==f.sector)return false;if(f.lugar&&(d.departamento||d.ciudad||'—')!==f.lugar)return false;if(f.tamano&&(d.tamano||'—')!==f.tamano)return false;
      if(f.ramo&&arrify(d.ramos).indexOf(f.ramo)<0)return false;if(f.tag&&(r.etiquetas||[]).concat(arrify(d.etiquetas)).indexOf(f.tag)<0)return false;if(f.estado&&(d.estado||'—')!==f.estado)return false;
      if(bdState.q){var q=norm(bdState.q);var hay=norm([d.nombre,d.documento,d.contacto,d.telefono,d.telefono2,d.correo,d.ciudad,d.sector,d.subsector,d.direccion].join(' '));if(hay.indexOf(q)<0)return false;}return true;});}
  function tagsDe(r){var d=r.datos||{};var t=arrify(d.etiquetas);(r.etiquetas||[]).forEach(function(x){if(t.indexOf(x)<0)t.push(x);});return t;}
  function contar(L,fn){var m={};L.forEach(function(r){arrify(fn(r)).forEach(function(v){v=v||'—';m[v]=(m[v]||0)+1;});});return Object.keys(m).map(function(k){return [k,m[k]];}).sort(function(a,b){return b[1]-a[1];});}
  function colsBase(){
    if(bdState.tab==='all')return [{k:'_base',l:'Base',w:1.3},{k:'nombre',l:'Nombre / Razón social',w:2.2},{k:'documento',l:'Documento / NIT',w:1.1},{k:'contacto',l:'Contacto',w:1.5},{k:'telefono',l:'Teléfono',w:1},{k:'correo',l:'Correo',w:1.7},{k:'ubic',l:'Ciudad / Depto.',w:1.2},{k:'sector',l:'Sector',w:1.4},{k:'tamano',l:'Tamaño',w:.8},{k:'ramos',l:'Ramos sugeridos',w:1.2}];
    var b=byId(DB.bases,bdState.tab);var cs=(b&&b.columnas&&b.columnas.length?b.columnas:['nombre','documento','telefono','correo','ciudad','sector']).filter(function(k){return k!=='etiquetas'&&k!=='tipo_persona'&&k!=='tipo_doc';});
    return cs.map(function(k){return k.indexOf('x:')===0?{k:k,l:titleCase(k.slice(2).replace(/-/g,' ')),w:1.2}:{k:k,l:STD_L[k]||k,w:STD_W[k]||1};});
  }
  function valCol(r,k){var d=r.datos||{};if(k==='_base')return baseDe(r).nombre;if(k==='ubic')return [d.ciudad,d.departamento].filter(Boolean).join(', ');if(k==='ramos')return arrify(d.ramos).join(', ');if(k==='etiquetas')return tagsDe(r).join(', ');
    if(k.indexOf('x:')===0)return (d.extra||{})[k.slice(2)]||'';var v=d[k];if(k==='valor'&&v)return cop(v);if(k==='fecha'&&v)return fchL(v);if(k==='empleados'&&v)return nf(v);if(k==='telefono'&&v)return telFmt(v);return v==null?'':v;}
  function renderBD(){
    var B=DB.bases.slice().sort(function(a,b){return a.nombre.localeCompare(b.nombre,'es');});
    if(bdState.tab!=='all'&&!byId(DB.bases,bdState.tab))bdState.tab='all';
    var all=DB.base_registros;
    var h='<div class="mx-grid mx-g-kpi mx-mb">'+kpi('Registros en mis bases',nf(all.length),B.length+' base(s) · separadas de clientes y pipeline','db',true)+
      kpi('Con WhatsApp',nf(all.filter(function(r){var t=digits((r.datos||{}).telefono);return t.length===10&&t[0]==='3';}).length),pct(all.filter(function(r){var t=digits((r.datos||{}).telefono);return t.length===10&&t[0]==='3';}).length,all.length)+' del total','wa')+
      kpi('Con correo',nf(all.filter(function(r){return (r.datos||{}).correo;}).length),pct(all.filter(function(r){return (r.datos||{}).correo;}).length,all.length)+' del total','mail')+
      kpi('Empresas',nf(all.filter(function(r){return (r.datos||{}).tipo_persona!=='Persona';}).length),nf(all.filter(function(r){return (r.datos||{}).tipo_persona==='Persona';}).length)+' personas','building')+'</div>';
    h+='<div class="mx-bd-tabs" id="bdTabs"><button data-t="all" class="'+(bdState.tab==='all'?'on':'')+'">'+ico('layers')+'Todas las bases <i>'+nf(all.length)+'</i></button>'+B.map(function(b){return '<button data-t="'+b.id+'" class="'+(bdState.tab===b.id?'on':'')+'"><span class="sw" style="background:'+(BD_COL[b.categoria]||'#64748B')+'"></span>'+esc(b.nombre)+' <i>'+nf(regsDe(b.id).length)+'</i></button>';}).join('')+'<button class="imp" id="bdImp">'+ico('upload')+'Importar base</button></div>';
    if(!B.length){h+=empty('db','Aún no tienes bases de datos','Importa tus archivos de Excel o CSV. El sistema reconoce las columnas, limpia teléfonos y correos, y etiqueta cada registro con sector, tamaño y ramos sugeridos.','<button class="mx-btn mx-btn-p" id="bdImp2">'+ico('upload')+'Importar base</button>');$('#vBD').innerHTML=h;$('#bdImp').addEventListener('click',importarBase);$('#bdImp2').addEventListener('click',importarBase);return;}
    var base=bdState.tab==='all'?null:byId(DB.bases,bdState.tab);
    if(base)h+='<div class="mx-bd-info"><span class="sw" style="background:'+(BD_COL[base.categoria]||'#64748B')+'"></span><div><b>'+esc(base.nombre)+'</b><small>'+esc(base.categoria||'Otra')+(base.fuente?' · Fuente: '+esc(base.fuente):'')+' · Importada el '+fchL(base.created_at)+'</small></div><button class="mx-btn mx-btn-s mx-btn-sm" id="bdEdit">'+ico('edit')+'Editar</button><button class="mx-btn mx-btn-g mx-btn-sm mx-del" id="bdDel">'+ico('trash')+'Eliminar base</button></div>';
    var pool=bdState.tab==='all'?all:regsDe(bdState.tab);
    function opts(id,lbl,arr,val){return '<select class="mx-select" data-f="'+id+'"><option value="">'+lbl+'</option>'+arr.slice(0,80).map(function(x){return '<option value="'+esc(x[0])+'"'+(val===x[0]?' selected':'')+'>'+esc(x[0])+' ('+x[1]+')</option>';}).join('')+'</select>';}
    var f=bdState.f;
    h+='<div class="mx-toolbar"><input class="mx-input" id="bdQ" placeholder="Buscar nombre, NIT, contacto, teléfono, correo…" value="'+esc(bdState.q)+'">'+
      (bdState.tab==='all'?opts('cat','Todas las categorías',contar(pool,function(r){return baseDe(r).categoria;}),f.cat):'')+
      opts('sector','Todos los sectores',contar(pool,function(r){return (r.datos||{}).sector;}),f.sector)+
      opts('lugar','Toda ubicación',contar(pool,function(r){return (r.datos||{}).departamento||(r.datos||{}).ciudad;}),f.lugar)+
      (pool.some(function(r){return (r.datos||{}).tamano;})?opts('tamano','Todo tamaño',contar(pool,function(r){return (r.datos||{}).tamano;}),f.tamano):'')+
      (pool.some(function(r){return (r.datos||{}).estado;})?opts('estado','Todo estado',contar(pool,function(r){return (r.datos||{}).estado;}),f.estado):'')+
      opts('ramo','Ramo sugerido',contar(pool,function(r){return (r.datos||{}).ramos;}).map(function(x){return x;}),f.ramo)+
      opts('tag','Etiqueta',contar(pool,tagsDe),f.tag)+
      ((bdState.q||Object.keys(f).some(function(k){return f[k];}))?'<button class="mx-btn mx-btn-g mx-btn-sm" id="bdClr">'+ico('x')+'Limpiar</button>':'')+'</div>';
    h+='<div class="mx-toolbar"><div class="mx-seg" id="bdVista">'+[['tabla','table','Tabla'],['tarjetas','cards','Tarjetas'],['agrupada','layers','Agrupada'],['resumen','grid','Resumen']].map(function(v){return '<button data-v="'+v[0]+'" class="'+(bdState.vista===v[0]?'on':'')+'">'+ico(v[1])+' '+v[2]+'</button>';}).join('')+'</div>'+
      (bdState.vista==='agrupada'?'<select class="mx-select" id="bdAgr">'+[['sector','Agrupar por sector'],['lugar','Agrupar por ubicación'],['tamano','Agrupar por tamaño'],['ramo','Agrupar por ramo sugerido'],['tag','Agrupar por etiqueta'],['base','Agrupar por base']].map(function(o){return '<option value="'+o[0]+'"'+(bdState.agrupar===o[0]?' selected':'')+'>'+o[1]+'</option>';}).join('')+'</select>':'')+
      '<div class="mx-tb-r"><button class="mx-btn mx-btn-s" id="bdExp">'+ico('download')+'Exportar</button></div></div>';
    var L=bdRegistros();var cols=colsBase();
    if(!L.length)h+=empty('search','Sin resultados','Ningún registro coincide con la búsqueda o los filtros.');
    else if(bdState.vista==='tabla'){var pages=Math.ceil(L.length/bdState.size);if(bdState.page>=pages)bdState.page=pages-1;var P=L.slice(bdState.page*bdState.size,(bdState.page+1)*bdState.size);
      h+='<div class="mx-table-wrap mx-bd-table"><table class="mx-table"><thead><tr>'+cols.map(function(c){return '<th>'+esc(c.l)+'</th>';}).join('')+'<th>Etiquetas</th></tr></thead><tbody>'+P.map(function(r){return '<tr class="click" data-r="'+r.id+'">'+cols.map(function(c,i){var v=valCol(r,c.k);if(c.k==='ramos')return '<td class="nowrap">'+arrify((r.datos||{}).ramos).map(function(x){return code(x);}).join('')+'</td>';if(c.k==='_base')return '<td><span class="mx-pill" style="--c:'+(BD_COL[baseDe(r).categoria]||'#64748B')+'">'+esc(v)+'</span></td>';return '<td'+(i===0||c.k==='nombre'?' class="b"':'')+'>'+(i===0||c.k==='nombre'?'<b>'+esc(v)+'</b>':esc(v))+'</td>';}).join('')+'<td class="tags">'+tagsDe(r).slice(0,3).map(function(t){return '<span class="mx-tag">'+esc(t)+'</span>';}).join('')+'</td></tr>';}).join('')+'</tbody></table></div>'+pager(L.length,bdState.page,bdState.size,'bdPg');}
    else if(bdState.vista==='tarjetas'){var size=36,pg=Math.min(bdState.page,Math.ceil(L.length/size)-1);var P2=L.slice(pg*size,(pg+1)*size);
      h+='<div class="mx-bd-cards">'+P2.map(function(r){var d=r.datos||{};var tel=digits(d.telefono);return '<div class="mx-bd-card" data-r="'+r.id+'"><div class="top"><span class="mx-pill" style="--c:'+(BD_COL[baseDe(r).categoria]||'#64748B')+'">'+esc(baseDe(r).nombre)+'</span>'+(d.tamano?'<span class="mx-tag">'+esc(d.tamano)+'</span>':'')+'</div><h4>'+esc(d.nombre)+'</h4><small>'+esc([d.documento?(d.tipo_doc||'')+' '+d.documento:'',d.sector].filter(Boolean).join(' · '))+'</small>'+
        '<ul>'+(d.contacto?'<li>'+ico('user')+esc(d.contacto)+'</li>':'')+(tel?'<li>'+ico('phone')+telFmt(tel)+'</li>':'')+(d.correo?'<li>'+ico('mail')+esc(d.correo)+'</li>':'')+((d.ciudad||d.departamento)?'<li>'+ico('pin')+esc([d.ciudad,d.departamento].filter(Boolean).join(', '))+'</li>':'')+'</ul><div class="ramos">'+arrify(d.ramos).map(function(x){return code(x);}).join('')+'</div>'+
        '<div class="act">'+(tel.length===10&&tel[0]==='3'?'<a class="mx-btn mx-btn-wa mx-btn-sm" target="_blank" rel="noopener" href="'+waLink(tel,'Hola'+(d.contacto?' '+primerNombre(titleCase(d.contacto)):'')+', le saluda '+ME.nombre+' de Mateo Herrera Seguros. ')+'" data-stop>'+ico('wa')+'WhatsApp</a>':'')+(d.correo?'<a class="mx-btn mx-btn-s mx-btn-sm" href="mailto:'+esc(d.correo)+'" data-stop>'+ico('mail')+'Correo</a>':'')+'</div></div>';}).join('')+'</div>'+pager(L.length,pg,size,'bdPg');}
    else if(bdState.vista==='agrupada'){var fn={sector:function(r){return (r.datos||{}).sector;},lugar:function(r){return (r.datos||{}).departamento||(r.datos||{}).ciudad;},tamano:function(r){return (r.datos||{}).tamano;},ramo:function(r){return (r.datos||{}).ramos;},tag:tagsDe,base:function(r){return baseDe(r).nombre;}}[bdState.agrupar];
      var G=contar(L,fn);h+='<div class="mx-bd-groups">'+G.slice(0,40).map(function(g){var items=L.filter(function(r){var v=arrify(fn(r));return g[0]==='—'?!v.length:v.indexOf(g[0])>=0;});
        return '<details class="mx-bd-group"'+(G.length<=3?' open':'')+'><summary>'+(bdState.agrupar==='ramo'&&RAMOS[g[0]]?code(g[0])+' '+ramoN(g[0]):'<b>'+esc(g[0])+'</b>')+'<i>'+nf(g[1])+'</i><span class="bar"><span style="width:'+(g[1]/G[0][1]*100)+'%"></span></span></summary><div class="rows">'+items.slice(0,60).map(function(r){var d=r.datos||{};return '<button data-r="'+r.id+'"><b>'+esc(d.nombre)+'</b><small>'+esc([d.contacto,d.telefono?telFmt(d.telefono):'',d.ciudad].filter(Boolean).join(' · '))+'</small></button>';}).join('')+(items.length>60?'<p class="mute">… y '+nf(items.length-60)+' más. Usa el filtro para verlos todos.</p>':'')+'</div></details>';}).join('')+'</div>';}
    else{function barras(t,arr,lbl){var mx=arr.length?arr[0][1]:1;return '<div class="mx-card"><div class="mx-card-h"><div><h3>'+t+'</h3></div></div>'+arr.slice(0,10).map(function(x){return '<div class="mx-hbar"><span>'+(lbl?lbl(x[0]):esc(x[0]))+'</span><span class="tr"><i style="width:'+(x[1]/mx*100)+'%"></i></span><b>'+nf(x[1])+'</b></div>';}).join('')+'</div>';}
      h+='<div class="mx-grid mx-g-2e">'+barras('Por sector',contar(L,function(r){return (r.datos||{}).sector;}))+barras('Ramos sugeridos para ofrecer',contar(L,function(r){return (r.datos||{}).ramos;}),function(k){return code(k)+' '+ramoN(k);})+barras('Por ubicación',contar(L,function(r){return (r.datos||{}).departamento||(r.datos||{}).ciudad;}))+barras('Etiquetas',contar(L,tagsDe))+
        (L.some(function(r){return (r.datos||{}).tamano;})?barras('Por tamaño de empresa',contar(L,function(r){return (r.datos||{}).tamano;})):'')+(L.some(function(r){return (r.datos||{}).estado;})?barras('Por estado',contar(L,function(r){return (r.datos||{}).estado;})):'')+'</div>';}
    $('#vBD').innerHTML=h;
    $$('#bdTabs [data-t]').forEach(function(b){b.addEventListener('click',function(){bdState.tab=b.dataset.t;bdState.f={};bdState.page=0;renderBD();});});
    $('#bdImp').addEventListener('click',importarBase);
    var q=$('#bdQ');q.addEventListener('input',debounce(function(){bdState.q=q.value;bdState.page=0;renderBD();var n=$('#bdQ');n.focus();n.setSelectionRange(n.value.length,n.value.length);},300));
    $$('#vBD [data-f]').forEach(function(s){s.addEventListener('change',function(){bdState.f[s.dataset.f]=s.value;bdState.page=0;renderBD();});});
    var cl=$('#bdClr');if(cl)cl.addEventListener('click',function(){bdState.f={};bdState.q='';bdState.page=0;renderBD();});
    $$('#bdVista button').forEach(function(b){b.addEventListener('click',function(){bdState.vista=b.dataset.v;bdState.page=0;renderBD();});});
    var ag=$('#bdAgr');if(ag)ag.addEventListener('change',function(){bdState.agrupar=ag.value;renderBD();});
    $$('#vBD [data-r]').forEach(function(e){e.addEventListener('click',function(ev){if(ev.target.closest('[data-stop]'))return;fichaRegistro(e.dataset.r);});});
    $$('#bdPg [data-pg]').forEach(function(b){b.addEventListener('click',function(){bdState.page=+b.dataset.pg;renderBD();$('#mxScroll').scrollTop=0;});});
    $('#bdExp').addEventListener('click',function(){var L2=bdRegistros();if(!L2.length){toast('No hay registros para exportar','err');return;}var c2=colsBase().concat([{k:'etiquetas',l:'Etiquetas',w:1.6}]);var nb=base?base.nombre:'Todas las bases';
      menuExport(this,{titulo:'Base de datos · '+nb,hoja:nb,sub:nf(L2.length)+' registro(s)'+(bdState.q||Object.keys(bdState.f).some(function(k){return bdState.f[k];})?' · filtrado':'')+' · '+ME.nombre,archivo:'base-'+slug(nb)+'-'+ymd(hoy()),cols:c2,rows:L2.map(function(r){var o={};c2.forEach(function(c){o[c.k]=valCol(r,c.k);});return o;})});});
    var be=$('#bdEdit');if(be)be.addEventListener('click',function(){editarBase(base.id);});
    var bx=$('#bdDel');if(bx)bx.addEventListener('click',async function(){if(!(await confirmar('¿Eliminar la base «'+base.nombre+'»?','Se borran sus '+nf(regsDe(base.id).length)+' registros. Tus clientes no se tocan.','Eliminar base',true)))return;try{await dbDelete('bases',base.id);DB.base_registros=DB.base_registros.filter(function(r){return r.base_id!==base.id;});saveLocal();bdState.tab='all';toast('Base eliminada');refreshAll();}catch(e){}});
  }
  function editarBase(id){var b=byId(DB.bases,id);openModal({t:'Editar base',body:'<form class="mx-form">'+fld('Nombre',inp('nombre',b.nombre))+fld('Categoría',sel('categoria',BD_CATS,b.categoria))+fld('Fuente',inp('fuente',b.fuente,'placeholder="Ej: FENALCO Tolima 2026"'))+'</form>',foot:'<button class="mx-btn mx-btn-s" data-close>Cancelar</button><button class="mx-btn mx-btn-p" data-ok>Guardar</button>',
    onMount:function(el){el.querySelector('[data-ok]').addEventListener('click',async function(){var f=formData(el);if(!f.nombre){marcarError(el,'nombre','Escribe el nombre.');return;}try{await dbUpdate('bases',id,{nombre:f.nombre,categoria:f.categoria,fuente:f.fuente||null});closeModal(el);renderBD();}catch(e){}});}});}
  function fichaRegistro(id){
    var r=byId(DB.base_registros,id);if(!r)return;var d=r.datos||{},b=baseDe(r);var tel=digits(d.telefono);
    var rows=STD.filter(function(s){return s[0]!=='ramos'&&s[0]!=='etiquetas'&&d[s[0]]!=null&&d[s[0]]!=='';}).map(function(s){return '<dt>'+s[1]+'</dt><dd>'+esc(valCol(r,s[0]))+'</dd>';}).join('');
    Object.keys(d.extra||{}).forEach(function(k){rows+='<dt>'+esc(titleCase(k.replace(/-/g,' ')))+'</dt><dd>'+esc(d.extra[k])+'</dd>';});
    var body='<div class="tags" style="margin-bottom:12px"><span class="mx-pill" style="--c:'+(BD_COL[b.categoria]||'#64748B')+'">'+esc(b.nombre)+'</span> '+badge(d.tipo_persona||'Empresa','info')+'</div><dl class="mx-dl">'+rows+'</dl>'+
      '<div class="mx-sec">Ramos sugeridos para ofrecer</div><div class="mx-ramos-sel">'+arrify(d.ramos).map(function(x){return code(x)+' <span>'+ramoN(x)+'</span>';}).join('<br>')+'</div>'+
      '<div class="mx-sec">Etiquetas</div><div class="mx-tagedit" id="rgTags">'+tagsDe(r).map(function(t){return '<span class="mx-tag">'+esc(t)+'<button data-xt="'+esc(t)+'">×</button></span>';}).join('')+'<input class="mx-input sm" id="rgTagIn" placeholder="+ etiqueta y Enter"></div>'+
      '<div class="mx-sec">Notas</div><textarea class="mx-input" id="rgNotas" rows="3" placeholder="Llamé, no contestó; volver a llamar el lunes…">'+esc(d.notas||'')+'</textarea>';
    var saludo='Hola'+(d.contacto?' '+primerNombre(titleCase(d.contacto)):'')+', le saluda '+ME.nombre+' de Mateo Herrera Seguros, asesores con 29 años de experiencia en el Tolima. ';
    openDrawer(d.nombre,esc([d.documento?(d.tipo_doc||'')+' '+d.documento:'',d.sector].filter(Boolean).join(' · ')),body,
      (tel.length===10&&tel[0]==='3'?'<a class="mx-btn mx-btn-wa" target="_blank" rel="noopener" href="'+waLink(tel,saludo)+'">'+ico('wa')+'WhatsApp</a>':'')+(tel?'<a class="mx-btn mx-btn-s" href="tel:'+(tel.length===10?'+57'+tel:tel)+'">'+ico('phone')+'Llamar</a>':'')+(d.correo?'<a class="mx-btn mx-btn-s" href="mailto:'+esc(d.correo)+'">'+ico('mail')+'</a>':'')+
      '<button class="mx-btn mx-btn-p" id="rgCli" title="Copia los datos a una ficha de cliente nueva en la etapa 1. El registro sigue en la base.">'+ico('plus')+'Crear cliente</button><button class="mx-btn mx-btn-g mx-del" id="rgDel">'+ico('trash')+'</button>');
    drawerCtx={tipo:'reg',id:id};var D=$('#mxDrawer');
    async function guardarTags(t){var nd=Object.assign({},d,{etiquetas:t});try{await dbUpdate('base_registros',id,{datos:nd,etiquetas:[]});fichaRegistro(id);}catch(e){}}
    var ti=$('#rgTagIn',D);ti.addEventListener('keydown',function(e){if(e.key==='Enter'&&ti.value.trim()){e.preventDefault();var t=tagsDe(r);var v=titleCase(ti.value.trim());if(t.indexOf(v)<0)t.push(v);guardarTags(t);}});
    $$('[data-xt]',D).forEach(function(x){x.addEventListener('click',function(){guardarTags(tagsDe(r).filter(function(t){return t!==x.dataset.xt;}));});});
    $('#rgNotas',D).addEventListener('change',function(){var nd=Object.assign({},d,{notas:this.value});dbUpdate('base_registros',id,{datos:nd}).then(function(){toast('Nota guardada','ok');}).catch(function(){});});
    $('#rgCli',D).addEventListener('click',function(){var esEmp=d.tipo_persona!=='Persona';closeDrawer();
      nuevoCliente({tipo:esEmp?'Empresa':'Persona',nombre:d.nombre,tipo_doc:d.tipo_doc||(esEmp?'NIT':'CC'),documento:digits(String(d.documento||'').split('-')[0]),empresa:esEmp?(d.contacto?titleCase(d.contacto):''):'',cargo:'',celular:tel.length===10?tel:digits(d.telefono2||'').slice(0,10)||tel,correo:d.correo||'',ciudad:d.ciudad||'',direccion:d.direccion||'',ramo:arrify(d.ramos)[0]||'',origen:'bd',observaciones:(d.notas||''),_base_registro:b.nombre});});
    $('#rgDel',D).addEventListener('click',async function(){if(!(await confirmar('¿Eliminar este registro de la base?','','Eliminar',true)))return;try{await dbDelete('base_registros',id);closeDrawer();refreshAll();}catch(e){}});
  }

  /* ---- importador ---- */
  function importarBase(){
    var st={hojas:null,sel:{}};
    var m=openModal({t:'Importar base de datos',s:'Excel (.xlsx) o CSV. Cada hoja puede quedar como una base separada. No se mezcla con tus clientes ni con el pipeline.',size:'lg',noFocus:true,
      body:'<label class="mx-drop" id="imDrop"><input type="file" accept=".xlsx,.csv,.txt,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv">'+ico('upload')+'<b>Arrastra aquí el archivo o toca para elegirlo</b><small>El sistema detecta las columnas (NIT, teléfono, correo, sector, tamaño, ARL…), limpia los datos y etiqueta cada registro.</small><span class="files"></span></label><div id="imCfg"></div>',
      foot:'<button class="mx-btn mx-btn-s" data-close>Cancelar</button><button class="mx-btn mx-btn-p" id="imGo" disabled>'+ico('upload')+'Importar</button>',
      onMount:function(el){var drop=el.querySelector('#imDrop'),fi=drop.querySelector('input');
        async function cargar(file){if(!file)return;drop.querySelector('.files').innerHTML='<i>Leyendo '+esc(file.name)+'…</i>';
          try{var hojas=/\.xlsx$/i.test(file.name)?await leerXLSX(file):await leerCSV(file);
            st.hojas=hojas.map(function(hj){var hi=detectarEncabezado(hj.rows);var hdr=(hj.rows[hi]||[]).map(function(x){return x==null?'':String(x);});var keys=mapearColumnas(hdr);var datos=hj.rows.slice(hi+1).filter(function(r){return r&&r.some(function(c){return c!=null&&String(c).trim()!=='';});});
              var nom=hojas.length===1?file.name.replace(/\.[^.]+$/,'').replace(/[_]+/g,' ').replace(/^[0-9a-f]{6,}-/i,''):hj.nombre;
              return {nombre:nom,hdr:hdr,keys:keys,datos:datos,cat:adivinarCategoria(nom+' '+file.name,keys)};}).filter(function(h){return h.datos.length&&h.keys.indexOf('nombre')>=0||h.datos.length>0;});
            st.hojas.forEach(function(h,i){st.sel[i]=h.keys.indexOf('nombre')>=0&&!/^resumen|^portada|^indice/i.test(h.nombre);});
            drop.querySelector('.files').innerHTML='<i>'+esc(file.name)+' · '+st.hojas.length+' hoja(s)</i>';st.fuente=file.name;pintar();}catch(e){console.error(e);drop.querySelector('.files').innerHTML='';toast(e.message||'No se pudo leer el archivo','err');}}
        fi.addEventListener('change',function(){cargar(fi.files[0]);});
        ['dragenter','dragover'].forEach(function(ev){drop.addEventListener(ev,function(e){e.preventDefault();drop.classList.add('over');});});
        ['dragleave','drop'].forEach(function(ev){drop.addEventListener(ev,function(e){e.preventDefault();drop.classList.remove('over');});});
        drop.addEventListener('drop',function(e){cargar(e.dataTransfer.files[0]);});
        function pintar(){var c=el.querySelector('#imCfg');
          c.innerHTML=st.hojas.map(function(h,i){var ok=h.keys.indexOf('nombre')>=0;var rec=h.keys.filter(function(k){return k&&k.indexOf('x:')<0;});
            return '<div class="mx-imp-sheet'+(st.sel[i]?'':' off')+'" data-i="'+i+'"><label class="mx-check-row"><input type="checkbox" data-sel="'+i+'"'+(st.sel[i]?' checked':'')+(ok?'':' disabled')+'> <b>'+esc(h.nombre)+'</b> · '+nf(h.datos.length)+' filas</label>'+
              (ok?'<div class="mx-fgrid">'+fld('Nombre de la base','<input class="mx-input" data-nom="'+i+'" value="'+esc(h.nombre)+'">')+fld('Categoría','<select class="mx-select" data-cat="'+i+'">'+BD_CATS.map(function(x){return '<option'+(x===h.cat?' selected':'')+'>'+x+'</option>';}).join('')+'</select>')+'</div>'+
              '<div class="mx-imp-map">'+h.hdr.map(function(x,j){if(!x)return '';var k=h.keys[j];return '<span class="'+(!k||k.indexOf('x:')===0?'extra':'ok')+'"><small>'+esc(x)+'</small>'+ico('next')+'<select data-map="'+i+':'+j+'">'+STD.filter(function(s){return s[0]!=='ramos'&&s[0]!=='etiquetas'||k===s[0];}).map(function(s){return '<option value="'+s[0]+'"'+(k===s[0]?' selected':'')+'>'+s[1]+'</option>';}).join('')+'<option value="x:'+slug(x)+'"'+(k.indexOf('x:')===0?' selected':'')+'>Dejar como «'+esc(x)+'»</option><option value=""'+(k===''?' selected':'')+'>No importar</option></select></span>';}).join('')+'</div>'+
              '<p class="mx-hint">'+ico('tag')+' Se reconocieron '+rec.length+' de '+h.hdr.filter(Boolean).length+' columnas. Se etiquetará con sector, ubicación, tamaño, WhatsApp y ramos sugeridos.'+(h.keys.indexOf('solicitud')>=0?' Las solicitudes repetidas de la misma persona se unen en un solo registro.':'')+'</p>':'<p class="mx-warn">'+ico('alert')+' No se encontró una columna de nombre o razón social. Esta hoja no se puede importar.</p>')+'</div>';}).join('');
          paintIcons(c);
          $$('[data-sel]',c).forEach(function(x){x.addEventListener('change',function(){st.sel[x.dataset.sel]=x.checked;x.closest('.mx-imp-sheet').classList.toggle('off',!x.checked);upd();});});
          $$('[data-nom]',c).forEach(function(x){x.addEventListener('input',function(){st.hojas[x.dataset.nom].nombre=x.value;});});
          $$('[data-cat]',c).forEach(function(x){x.addEventListener('change',function(){st.hojas[x.dataset.cat].cat=x.value;});});
          $$('[data-map]',c).forEach(function(x){x.addEventListener('change',function(){var p=x.dataset.map.split(':');st.hojas[+p[0]].keys[+p[1]]=x.value;x.parentNode.className=x.value.indexOf('x:')===0||!x.value?'extra':'ok';});});
          upd();}
        function upd(){var n=0;st.hojas.forEach(function(h,i){if(st.sel[i])n+=h.datos.length;});var b=el.querySelector('#imGo');b.disabled=!n;b.innerHTML=ico('upload')+(n?'Importar '+nf(n)+' filas':'Importar');}
        el.querySelector('#imGo').addEventListener('click',async function(){var b=this;busy(b,true,'Importando…');var total=0,ultima=null;
          try{for(var i=0;i<st.hojas.length;i++){if(!st.sel[i])continue;var h=st.hojas[i];
              if(!h.nombre.trim()){toast('Ponle nombre a cada base','err');busy(b,false);return;}
              var dedupe=h.keys.indexOf('solicitud')>=0&&h.keys.indexOf('documento')>=0;
              var regs=construirRegistros(h.datos,h.keys,h.cat,dedupe);
              var cols=STD.map(function(s){return s[0];}).filter(function(k){return regs.some(function(r){return r[k]!=null&&r[k]!==''&&!(Array.isArray(r[k])&&!r[k].length);});});
              var ex={};regs.forEach(function(r){Object.keys(r.extra||{}).forEach(function(k){ex['x:'+k]=1;});});cols=cols.concat(Object.keys(ex));
              var base=await dbInsert('bases',{nombre:h.nombre.trim(),categoria:h.cat,fuente:st.fuente,columnas:cols});ultima=base;
              await dbInsertMany('base_registros',regs.map(function(d){return {base_id:base.id,datos:d,etiquetas:[]};}),function(a,t){b.innerHTML='<span class="mx-spin"></span>'+esc(h.nombre)+': '+nf(a)+' de '+nf(t);});
              total+=regs.length;}
            closeModal(el);toast(nf(total)+' registros importados y etiquetados','ok');bdState.tab=ultima&&Object.keys(st.sel).filter(function(k){return st.sel[k];}).length===1?ultima.id:'all';bdState.f={};bdState.page=0;refreshAll();
          }catch(e){console.error(e);busy(b,false);if(total)refreshAll();}
        });
      }});
  }

  /* ===================== CAMPAÑAS WHATSAPP ===================== */
  var cw={step:0,obj:null,aud:null,audFilter:'',msg:'',sent:{},img:null};
  var CW_OBJ=[
    {id:'renov',e:'🔄',t:'Aviso de renovación',d:'Pólizas próximas a vencer'},{id:'promo',e:'🎉',t:'Promoción u oferta',d:'Descuentos o combos especiales'},
    {id:'nuevo',e:'✨',t:'Producto o ramo nuevo',d:'Anunciar un seguro recién agregado'},{id:'recup',e:'🔁',t:'Recuperar clientes',d:'Reactivar a quien no ha comprado'},
    {id:'cumple',e:'🎂',t:'Feliz cumpleaños',d:'Felicitar a clientes que cumplen años'},{id:'pago',e:'💰',t:'Recordatorio de pago',d:'Cuota próxima o vencida'},
    {id:'prospec',e:'🏢',t:'Prospección desde base',d:'Primer contacto con empresas o personas de tus bases'},{id:'fecha',e:'🎁',t:'Fecha especial',d:'Navidad, Día de la Madre, aniversarios'},
    {id:'libre',e:'✍️',t:'Mensaje personalizado',d:'Tú escribes todo desde cero'}
  ];
  function cliContacto(c){var p=polizasDe(c.id)[0];return {id:'c'+c.id,n:c.nombre,tel:c.celular,tipo:c.tipo||'Persona',ramo:(p&&p.ramo)||c.ramo,aseg:(p&&p.aseguradora)||c.aseguradora,vence:p&&p.vence,extra:''};}
  function regContacto(r){var d=r.datos||{};var tel=digits(d.telefono);if(!(tel.length===10&&tel[0]==='3')){var t2=String(d.telefono2||'').split(', ').filter(function(x){return x.length===10&&x[0]==='3';})[0];tel=t2||'';}
    return {id:'r'+r.id,n:d.contacto?titleCase(d.contacto):d.nombre,empresa:d.tipo_persona==='Persona'?'':d.nombre,tel:tel,tipo:d.tipo_persona||'Empresa',ramo:arrify(d.ramos)[0],aseg:'',vence:null,extra:d.sector||''};}
  var CW_AUD=[
    {id:'todos',e:'👥',t:'Todos mis clientes',d:'Toda tu cartera',f:function(){return DB.clientes.map(cliContacto);}},
    {id:'nuevos',e:'🌱',t:'Clientes nuevos',d:'Creados en los últimos 30 días',f:function(){var l=addDays(hoy(),-30);return DB.clientes.filter(function(c){return new Date(c.created_at)>=l;}).map(cliContacto);}},
    {id:'etapa',e:'🧭',t:'Por etapa del pipeline',d:'Clientes en una etapa',f:function(){if(cw.audFilter==='')return [];return DB.clientes.filter(function(c){return c.etapa===+cw.audFilter;}).map(cliContacto);}},
    {id:'activos',e:'🛡️',t:'Con póliza activa',d:'Clientes con al menos una póliza',f:function(){return DB.clientes.filter(function(c){return polizasDe(c.id).some(function(p){return p.estado==='Activa';});}).map(cliContacto);}},
    {id:'empresa',e:'🏢',t:'Empresas',d:'Clientes tipo empresa',f:function(){return DB.clientes.filter(function(c){return c.tipo==='Empresa';}).map(cliContacto);}},
    {id:'persona',e:'👤',t:'Personas naturales',d:'Clientes personas',f:function(){return DB.clientes.filter(function(c){return c.tipo!=='Empresa';}).map(cliContacto);}},
    {id:'vencer',e:'🔴',t:'Póliza por vencer',d:'Vence en 30 días o menos',f:function(){return DB.clientes.filter(function(c){return polizasDe(c.id).some(function(p){var d=p.vence?diffDays(p.vence,hoy()):999;return d>=0&&d<=30;});}).map(cliContacto);}},
    {id:'ramo',e:'🏷️',t:'Por ramo',d:'Quien tiene o busca cierto ramo',f:function(){if(!cw.audFilter)return [];return DB.clientes.filter(function(c){return ramoCliente(c)===cw.audFilter||polizasDe(c.id).some(function(p){return p.ramo===cw.audFilter;});}).map(cliContacto);}},
    {id:'cumple',e:'🎂',t:'Cumpleaños en 30 días',d:'Según la fecha de nacimiento',f:function(){return DB.clientes.filter(function(c){var x=proxCumple(c.nacimiento);return x&&x.dias<=30;}).map(cliContacto);}},
    {id:'cartera',e:'💰',t:'Cuotas pendientes',d:'Vencidas o que vencen en 15 días',f:function(){var ids={};DB.polizas.forEach(function(p){var q=cuotaInfo(p);if(q&&!q.fin&&q.dias<=15)ids[p.cliente_id]=1;});return DB.clientes.filter(function(c){return ids[c.id];}).map(cliContacto);}},
    {id:'base',e:'🗂️',t:'Una base de datos',d:'Registros con WhatsApp de una base',f:function(){if(!cw.audFilter)return [];return DB.base_registros.filter(function(r){return r.base_id===cw.audFilter;}).map(regContacto).filter(function(x){return x.tel;});}}
  ];
  var FIRMA='\n\n_Mateo Herrera Seguros_ 📞 '+NEGOCIO.waTxt;
  var CW_TPL={
    renov:'¡Hola {nombre}! 🛡️\n\nTu póliza de {ramo} vence el {vencimiento}.\n\n📋 No dejes que tu protección se interrumpa. Renovar es rápido y fácil.\n\n¿Te preparo la cotización de renovación?',
    promo:'¡Hola {nombre}! 🎉\n\nEste mes tenemos condiciones especiales en seguros.\n\n🔥 Te comparo varias aseguradoras y te muestro la mejor opción.\n\n¿Quieres que te cotice?',
    nuevo:'¡Hola {nombre}! ✨\n\nLlegó un nuevo producto a *Mateo Herrera Seguros* 🎁\n\n🛡️ Ahora puedes proteger lo que más importa con coberturas ampliadas.\n\n¿Te cuento los detalles?',
    recup:'¡Hola {nombre}! 👋\n\nHace un tiempo hablamos sobre tu seguro y quería saber cómo estás.\n\n💙 Sigo aquí para ayudarte a proteger lo que importa.\n\n¿Tienes un momento para conversar?',
    cumple:'¡Hola {nombre}! 🎂\n\n¡Feliz cumpleaños! En *Mateo Herrera Seguros* celebramos tu día. 🎉\n\nGracias por confiar en nosotros.\n\n¡Que sea un gran día!',
    pago:'¡Hola {nombre}! 💰\n\nTe recuerdo que tu cuota del seguro de {ramo} está próxima a vencer o ya venció.\n\n📋 Pago puntual = protección continua.\n\n¿Te ayudo con el pago?',
    prospec:'Hola {nombre}, buen día. 👋\n\nLe saluda {asesor} de *Mateo Herrera Seguros*, asesores con 29 años de experiencia en el Tolima.\n\nTrabajamos con las principales aseguradoras y ayudamos a empresas como {empresa} con {ramo}, ARL y pólizas para su equipo.\n\n¿Me permite enviarle una propuesta sin compromiso?',
    fecha:'¡Hola {nombre}! 🎁\n\n¡Feliz día! En *Mateo Herrera Seguros* queremos celebrar contigo.\n\n🎉 Tenemos un detalle especial para nuestros clientes.\n\n¿Te gustaría conocerlo?',
    libre:'¡Hola {nombre}! 🛡️\n\n'
  };
  function cwContacts(){if(!cw.aud)return [];var a=CW_AUD.filter(function(x){return x.id===cw.aud;})[0];return a?a.f().filter(function(c){return digits(c.tel).length>=10;}):[];}
  function cwFill(msg,c){var t=msg||'';c=c||{n:'Carlos',empresa:'tu empresa'};
    t=t.replace(/\{nombre\}/g,primerNombre(c.n)||'').replace(/\{nombre_completo\}/g,c.n||'').replace(/\{ramo\}/g,c.ramo?ramoN(c.ramo).toLowerCase():'seguros').replace(/\{aseguradora\}/g,c.aseg||'tu aseguradora')
      .replace(/\{asesor\}/g,ME.nombre).replace(/\{vencimiento\}/g,c.vence?fchL(c.vence):'pronto').replace(/\{empresa\}/g,c.empresa||'la suya');return t;}
  function cwHtml(t){return esc(t).replace(/\*([^*\n]+)\*/g,'<b>$1</b>').replace(/_([^_\n]+)_/g,'<i>$1</i>').replace(/\n/g,'<br>');}
  function renderCamp(){
    var contacts=cwContacts();var envTotal=Object.keys(cw.sent).length;
    var h='<div class="mx-grid mx-g-kpi mx-mb">'+kpi('Campañas guardadas',DB.campanas.length,'historial','mega',true)+kpi('Clientes con celular',DB.clientes.filter(function(c){return digits(c.celular).length>=10;}).length,'de '+DB.clientes.length+' clientes','users')+kpi('Mensajes abiertos',DB.campanas.reduce(function(a,c){return a+(+c.total_enviados||0);},0),'chats lanzados desde aquí','chat')+kpi('WhatsApp del negocio',NEGOCIO.waTxt,'se firma en los mensajes','wa')+'</div>';
    var steps=['Objetivo','Audiencia','Mensaje','Enviar'];
    h+='<div class="mx-card mx-mb"><div class="mx-card-h"><div><h3>🚀 Crear campaña</h3></div>'+(cw.step>0?'<button class="mx-btn mx-btn-s mx-btn-sm" id="cwReset">Empezar de nuevo</button>':'')+'</div><div class="mx-wiz">'+steps.map(function(s,i){return '<div class="mx-wiz-s '+(i<cw.step?'done':(i===cw.step?'on':''))+'" data-ws="'+i+'"><span class="num">'+(i<cw.step?'✓':(i+1))+'</span>'+s+'</div>';}).join('')+'</div><div class="mx-wiz-body">';
    if(cw.step===0){h+='<p class="mx-lead-p">¿De qué quieres crear la campaña?</p><div class="mx-obj-grid">'+CW_OBJ.map(function(o){return '<div class="mx-obj'+(cw.obj===o.id?' sel':'')+'" data-obj="'+o.id+'"><span class="emo">'+o.e+'</span><b>'+o.t+'</b><small>'+o.d+'</small></div>';}).join('')+'</div>';
      if(cw.obj)h+='<div class="mx-row-end" style="margin-top:16px"><button class="mx-btn mx-btn-p" id="cwNext1">Siguiente: Audiencia →</button></div>';}
    else if(cw.step===1){h+='<p class="mx-lead-p">¿A quién le vas a escribir?</p><div class="mx-aud-grid">'+CW_AUD.map(function(a){var keep=cw.audFilter;if(cw.aud!==a.id&&(a.id==='ramo'||a.id==='etapa'||a.id==='base'))cw.audFilter='';var cnt=a.f().filter(function(c){return digits(c.tel).length>=10;}).length;cw.audFilter=keep;
        return '<div class="mx-aud'+(cw.aud===a.id?' sel':'')+'" data-aud="'+a.id+'"><span class="emo">'+a.e+'</span><b>'+a.t+'</b><small>'+a.d+'</small><span class="ct">'+((a.id==='ramo'||a.id==='etapa'||a.id==='base')&&cw.aud!==a.id?'Elige un filtro':cnt+' contacto(s)')+'</span></div>';}).join('')+'</div>';
      if(cw.aud==='ramo')h+=fld('Selecciona el ramo','<select class="mx-select" id="cwF">'+ramoOpts(cw.audFilter,'— Elegir —')+'</select>');
      if(cw.aud==='etapa')h+=fld('Selecciona la etapa','<select class="mx-select" id="cwF"><option value="">— Elegir —</option>'+ETAPAS.map(function(e,i){return '<option value="'+i+'"'+(cw.audFilter===String(i)?' selected':'')+'>'+(i+1)+'. '+e+'</option>';}).join('')+'</select>');
      if(cw.aud==='base')h+=fld('Selecciona la base','<select class="mx-select" id="cwF"><option value="">— Elegir —</option>'+DB.bases.map(function(b){return '<option value="'+b.id+'"'+(cw.audFilter===b.id?' selected':'')+'>'+esc(b.nombre)+'</option>';}).join('')+'</select>');
      h+='<div class="mx-row" style="margin-top:16px"><button class="mx-btn mx-btn-s" id="cwPrev1">← Objetivo</button>'+(cw.aud&&contacts.length?'<button class="mx-btn mx-btn-p" id="cwNext2">Siguiente: Mensaje → ('+contacts.length+' contactos)</button>':cw.aud?'<span class="mx-warn-t">No hay contactos con celular en esta audiencia.</span>':'')+'</div>';}
    else if(cw.step===2){var aT=(CW_AUD.filter(function(a){return a.id===cw.aud;})[0]||{}).t||'';
      h+='<p class="mx-lead-p">Mensaje — usa <b>*asteriscos*</b> para negrilla en WhatsApp y las variables de abajo. La firma se agrega sola.</p><div class="mx-msg-grid"><div><textarea class="mx-msg-area" id="cwMsg" rows="9">'+esc(cw.msg)+'</textarea><div class="mx-vars">'+[['{nombre}','👤 Nombre'],['{nombre_completo}','👥 Nombre completo'],['{empresa}','🏢 Empresa'],['{ramo}','🛡️ Ramo'],['{aseguradora}','🏛️ Aseguradora'],['{asesor}','👨‍💼 Asesor'],['{vencimiento}','📅 Vencimiento']].map(function(x){return '<button class="mx-var" data-var="'+x[0]+'">'+x[1]+'</button>';}).join('')+'</div>'+
        '<div class="mx-sec" style="margin-top:8px">💡 Otras plantillas</div>'+CW_OBJ.filter(function(o){return o.id!==cw.obj&&o.id!=='libre';}).slice(0,5).map(function(o){return '<div class="mx-tpl" data-tpl="'+o.id+'">'+o.e+' '+o.t+'</div>';}).join('')+'</div>'+
        '<div><div class="mx-preview"><div class="mx-preview-h">👁️ <b>Vista previa</b></div><p class="mute" style="font-size:.78rem;margin-bottom:10px">Así lo verá <b>'+esc(contacts[0]?primerNombre(contacts[0].n):'el cliente')+'</b></p>'+(cw.img?'<img class="mx-bubble-img" src="'+cw.img.url+'" alt="">':'')+'<div class="mx-bubble" id="cwBubble"></div><div class="mx-aud-note">🎯 '+contacts.length+' contacto(s) · '+esc(aT)+'</div></div></div></div>'+
        '<div class="mx-note" style="margin-top:14px">📷 <b>Imagen de la campaña (opcional):</b> <input type="file" accept="image/png,image/jpeg,image/webp" id="cwImg"> '+(cw.img?'<button class="mx-btn mx-btn-g mx-btn-sm" id="cwImgX">Quitar</button>':'')+'<br><small class="mute">WhatsApp no permite adjuntar imágenes desde un enlace: la imagen se guarda con la campaña y, al enviar, la pegas en el chat (botón «Copiar imagen»).</small></div>'+
        '<div class="mx-row" style="margin-top:16px"><button class="mx-btn mx-btn-s" id="cwPrev2">← Audiencia</button><button class="mx-btn mx-btn-p" id="cwNext3">Siguiente: Enviar →</button></div>';}
    else if(cw.step===3){var aT2=(CW_AUD.filter(function(a){return a.id===cw.aud;})[0]||{}).t||'';
      h+='<div class="mx-send-banner">🚀 Toca <b>Enviar</b> en cada contacto: se abre WhatsApp con el mensaje personalizado y se marca el progreso.'+(cw.img?' Luego pega la imagen en el chat.':'')+'</div>';
      h+='<div class="mx-prog"><div class="mx-prog-bar"><i style="width:'+(contacts.length?envTotal/contacts.length*100:0)+'%"></i></div><span class="mx-prog-txt">'+envTotal+' de '+contacts.length+'</span></div>';
      h+='<div class="mx-row" style="margin-bottom:16px"><button class="mx-btn mx-btn-s" id="cwPrev3">← Editar mensaje</button><button class="mx-btn mx-btn-s" id="cwResetProg">Reiniciar</button>'+(cw.img?'<button class="mx-btn mx-btn-s" id="cwCopyImg">'+ico('image')+'Copiar imagen</button>':'')+'<button class="mx-btn mx-btn-p" id="cwSave">💾 Guardar campaña</button></div>';
      h+='<div class="mx-card"><div class="mx-card-h"><div><h3>🎯 '+esc(aT2)+'</h3></div><span class="mute" style="font-size:.84rem">'+contacts.length+' contacto(s)</span></div>'+contacts.map(function(c){var msg=cwFill(cw.msg,c)+FIRMA;return '<div class="mx-contact"><div class="mx-av" style="width:34px;height:34px;font-size:.68rem">'+esc(inic(c.n))+'</div><div class="info"><b>'+esc(c.n)+'</b><small>'+telFmt(c.tel)+(c.empresa?' · '+esc(c.empresa):'')+'</small></div>'+(cw.sent[c.id]?'<span class="sent">✅ Enviado</span>':'<a class="mx-btn mx-btn-wa mx-btn-sm" href="'+waLink(c.tel,msg)+'" target="_blank" rel="noopener" data-send="'+c.id+'">💬 Enviar</a>')+'</div>';}).join('')+'</div>';}
    h+='</div></div>';
    h+='<div class="mx-card mx-hist-table"><div class="mx-card-h"><div><h3>📁 Campañas guardadas</h3></div></div>'+(DB.campanas.length?'<div class="mx-table-wrap"><table class="mx-table"><thead><tr><th>Fecha</th><th>Campaña</th><th>Audiencia</th><th class="r">Contactos</th><th class="r">Enviados</th></tr></thead><tbody>'+DB.campanas.slice().sort(function(a,b){return new Date(b.created_at)-new Date(a.created_at);}).map(function(c){return '<tr class="click" data-camp="'+c.id+'"><td>'+fchL(c.created_at)+'</td><td><b>'+esc(c.nombre)+'</b>'+(c.imagen_ruta?' 📷':'')+'</td><td>'+esc(c.audiencia||'')+'</td><td class="r">'+(c.total_contactos||0)+'</td><td class="r">'+(c.total_enviados||0)+'</td></tr>';}).join('')+'</tbody></table></div>':'<p class="mute" style="font-size:.85rem">Aún no has guardado campañas.</p>')+'</div>';
    $('#vCamp').innerHTML=h;
    function upd(){var ta=$('#cwMsg'),b=$('#cwBubble');if(ta&&b)b.innerHTML=cwHtml(cwFill(ta.value,contacts[0])+FIRMA);}
    $$('.mx-wiz-s').forEach(function(s){s.addEventListener('click',function(){var i=+s.dataset.ws;if(i<cw.step){if(cw.step===2){var ta=$('#cwMsg');if(ta)cw.msg=ta.value;}cw.step=i;renderCamp();}});});
    var on=function(id,fn){var e=$(id);if(e)e.addEventListener('click',fn);};
    on('#cwReset',function(){cw={step:0,obj:null,aud:null,audFilter:'',msg:'',sent:{},img:null};renderCamp();});
    $$('.mx-obj').forEach(function(o){o.addEventListener('click',function(){cw.obj=o.dataset.obj;cw.msg=CW_TPL[cw.obj]||CW_TPL.libre;if(cw.obj==='prospec'&&!cw.aud){cw.aud='base';}renderCamp();});});
    on('#cwNext1',function(){cw.step=1;renderCamp();});
    $$('.mx-aud').forEach(function(a){a.addEventListener('click',function(){if(cw.aud!==a.dataset.aud){cw.aud=a.dataset.aud;cw.audFilter='';}renderCamp();});});
    var f=$('#cwF');if(f)f.addEventListener('change',function(){cw.audFilter=f.value;renderCamp();});
    on('#cwPrev1',function(){cw.step=0;renderCamp();});on('#cwNext2',function(){cw.step=2;cw.sent={};renderCamp();});
    on('#cwPrev2',function(){cw.msg=$('#cwMsg').value;cw.step=1;renderCamp();});on('#cwNext3',function(){cw.msg=$('#cwMsg').value;if(cw.msg.trim().length<5){toast('Escribe el mensaje','err');return;}cw.step=3;renderCamp();});
    on('#cwPrev3',function(){cw.step=2;renderCamp();});
    $$('.mx-var').forEach(function(v){v.addEventListener('click',function(){var ta=$('#cwMsg');var p=ta.selectionStart||ta.value.length;ta.value=ta.value.slice(0,p)+v.dataset.var+ta.value.slice(p);ta.focus();ta.setSelectionRange(p+v.dataset.var.length,p+v.dataset.var.length);upd();});});
    $$('.mx-tpl').forEach(function(t){t.addEventListener('click',function(){cw.msg=CW_TPL[t.dataset.tpl];cw.obj=t.dataset.tpl;renderCamp();});});
    var ta=$('#cwMsg');if(ta){ta.addEventListener('input',upd);upd();}
    var fi=$('#cwImg');if(fi)fi.addEventListener('change',function(){var file=fi.files[0];if(!file)return;if(file.size>5*1048576){toast('La imagen pesa más de 5 MB','err');return;}cw.msg=$('#cwMsg').value;cw.img={file:file,url:URL.createObjectURL(file)};renderCamp();});
    on('#cwImgX',function(){cw.msg=$('#cwMsg').value;cw.img=null;renderCamp();});
    on('#cwCopyImg',async function(){try{var blob=cw.img.file;if(blob.type!=='image/png'){var im=await createImageBitmap(blob);var cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;cv.getContext('2d').drawImage(im,0,0);blob=await new Promise(function(r){cv.toBlob(r,'image/png');});}
      await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);toast('Imagen copiada: pégala en el chat de WhatsApp','ok');}catch(e){toast('Tu navegador no permite copiar imágenes. Descárgala y adjúntala.','err');}});
    $$('[data-send]').forEach(function(a){a.addEventListener('click',function(){cw.sent[a.dataset.send]=true;setTimeout(renderCamp,300);});});
    on('#cwResetProg',function(){cw.sent={};renderCamp();});
    on('#cwSave',async function(){var b=this;var obj=CW_OBJ.filter(function(o){return o.id===cw.obj;})[0];var aud=CW_AUD.filter(function(a){return a.id===cw.aud;})[0];busy(b,true);
      try{var ruta=null,data=null;if(cw.img){var up=await subirArchivo('campanas','campanas',cw.img.file);ruta=up.ruta;data=up.data;}
        var row={nombre:(obj?obj.t:'Campaña')+' · '+fch(hoy()),objetivo:cw.obj||'',audiencia:aud?aud.t:'',mensaje:cw.msg,imagen_ruta:ruta,total_contactos:contacts.length,total_enviados:Object.keys(cw.sent).length};if(data)row.data=data;
        await dbInsert('campanas',row);cw={step:0,obj:null,aud:null,audFilter:'',msg:'',sent:{},img:null};toast('Campaña guardada','ok');refreshAll();}catch(e){busy(b,false);toast('No se pudo guardar: '+errMsg(e),'err');}});
    $$('[data-camp]').forEach(function(tr){tr.addEventListener('click',async function(){var c=byId(DB.campanas,tr.dataset.camp);var img='';if(c.imagen_ruta){try{img='<img class="mx-bubble-img" src="'+(await urlArchivo('campanas',{ruta:c.imagen_ruta,data:c.data}))+'" alt="">';}catch(e){}}
      openModal({t:c.nombre,s:esc(c.audiencia||'')+' · '+(c.total_enviados||0)+' de '+(c.total_contactos||0)+' enviados',noFocus:true,body:img+'<div class="mx-bubble">'+cwHtml(cwFill(c.mensaje,null)+FIRMA)+'</div>',foot:'<button class="mx-btn mx-btn-g mx-del" data-del>'+ico('trash')+'Eliminar</button><button class="mx-btn mx-btn-s" data-reuse>Reutilizar mensaje</button><button class="mx-btn mx-btn-p" data-close>Cerrar</button>',
        onMount:function(el){el.querySelector('[data-reuse]').addEventListener('click',function(){cw={step:0,obj:c.objetivo||'libre',aud:null,audFilter:'',msg:c.mensaje,sent:{},img:null};closeModal(el);renderCamp();});
          el.querySelector('[data-del]').addEventListener('click',async function(){if(!(await confirmar('¿Eliminar la campaña?','','Eliminar',true)))return;try{await dbDelete('campanas',c.id);borrarArchivo('campanas',c.imagen_ruta);closeModal(el);renderCamp();}catch(e){}});}});});});
  }

  /* ===================== CONFIGURACIÓN ===================== */
  function renderConf(){
    var h='<div class="mx-grid mx-g-2e mx-mb"><div class="mx-card"><div class="mx-card-h"><div><h3>Mi perfil</h3><p>Así apareces en los mensajes, la agenda y las métricas globales.</p></div></div><form class="mx-form" id="pfForm"><div class="mx-fgrid">'+
      fld('Nombre',inp('nombre',ME.nombre))+fld('Iniciales',inp('iniciales',ME.iniciales,'maxlength="3"'))+fld('Cargo',inp('rol',ME.rol||'Asesor'))+fld('Color',inp('color',ME.color||'#0F3E8C','type="color"'))+
      '</div><div class="mx-row-end"><button class="mx-btn mx-btn-p mx-btn-sm" type="submit">'+ico('check')+'Guardar perfil</button></div></form><p class="mute" style="font-size:.78rem">Usuario de ingreso: cédula '+esc(ME.cedula||'')+'. La contraseña se cambia en Supabase → Authentication.</p></div>';
    h+='<div class="mx-card"><div class="mx-card-h"><div><h3>Privacidad entre asesores</h3><p>Cómo se separa la información</p></div></div>'+
      '<div class="mx-check"><i style="background:var(--mx-ok-bg);color:var(--mx-ok)">'+ico('lock')+'</i><div><b>Cada asesor ve solo lo suyo</b>Clientes, pipeline, agenda, cotizaciones, documentos, campañas y bases pertenecen a quien los creó. La base de datos lo impone con reglas de seguridad (RLS), no solo la pantalla.</div></div>'+
      '<div class="mx-check"><i style="background:var(--mx-ok-bg);color:var(--mx-ok)">'+ico('users')+'</i><div><b>Métricas globales sin datos personales</b>En «Resumen → Global del equipo» solo se ven totales por asesor: número de clientes, primas, pólizas y citas.</div></div>'+
      '<div class="mx-check"><i style="background:var(--mx-'+(MODE==='sb'?'ok':'warn')+'-bg);color:var(--mx-'+(MODE==='sb'?'ok':'warn')+')">'+ico('db')+'</i><div><b>'+(MODE==='sb'?'Conectado a Supabase':'Modo local de pruebas')+'</b>'+(MODE==='sb'?'Los datos se guardan en la nube y se ven desde cualquier equipo.':'Los datos se guardan solo en este navegador. Úsalo solo para probar.')+'</div></div>'+
      '<div class="mx-check"><i style="background:var(--mx-info-bg);color:var(--mx-info)">'+ico('shield')+'</i><div><b>Ley 1581 de 2012</b>Usa los datos de clientes y bases solo para la finalidad autorizada y atiende las solicitudes de eliminación.</div></div></div></div>';
    h+='<div class="mx-grid mx-g-3"><div class="mx-card"><div class="mx-card-h"><div><h3>Etapas del pipeline</h3></div></div>'+vsteps(ETAPAS,99)+'</div><div class="mx-card"><div class="mx-card-h"><div><h3>Ramos ('+Object.keys(RAMOS).length+')</h3></div></div><div class="mx-ramos-list">'+Object.keys(RAMOS).map(function(r){return '<span>'+code(r)+' '+RAMOS[r][0]+'</span>';}).join('')+'</div></div><div class="mx-card"><div class="mx-card-h"><div><h3>Cotización y renovación</h3></div></div>'+vsteps(COT_ET,99)+'<div class="mx-sec">Renovación</div>'+vsteps(REN_ET,99)+'</div></div>';
    $('#vConf').innerHTML=h;
    $('#pfForm').addEventListener('submit',async function(e){e.preventDefault();var f=formData(this);if(!f.nombre){marcarError(this,'nombre','Escribe tu nombre');return;}
      try{await guardarPerfil({nombre:f.nombre,iniciales:(f.iniciales||inic(f.nombre)).toUpperCase().slice(0,3),rol:f.rol||'Asesor',color:f.color});pintarUsuario();toast('Perfil guardado','ok');}catch(er){}});
  }

  /* ===================== NAVEGACIÓN ===================== */
  var TIT={dash:['Resumen','Tus métricas y las del equipo'],pipe:['Pipeline de ventas','9 etapas, con observación en cada avance'],cli:['Clientes','Fichas completas, seguimiento y documentos'],agenda:['Agenda','Lunes a viernes · 7:00 a. m. a 8:00 p. m.'],cot:['Cotizaciones','Comparativo entre aseguradoras'],ren:['Renovaciones','Pólizas que vencen en los próximos 60 días'],cart:['Cartera y cumpleaños','Cuotas financiadas y fechas especiales'],bd:['Base de datos','Prospectos organizados, separados de clientes'],camp:['Campañas WhatsApp','Mensajes personalizados a clientes y bases'],conf:['Configuración','Perfil, privacidad y catálogos']};
  var RENDER={dash:renderDash,pipe:renderPipe,cli:renderCli,agenda:renderAgenda,cot:renderCot,ren:renderRen,cart:renderCart,bd:renderBD,camp:renderCamp,conf:renderConf};
  var cur='dash';
  function go(v){if(!RENDER[v])v='dash';cur=v;cerrarMenus();if($('#mxDrawer').classList.contains('on'))closeDrawer();$$('.mx-nav-i').forEach(function(b){b.classList.toggle('on',b.dataset.v===v);});$$('.mx-view').forEach(function(s){s.classList.toggle('on',s.dataset.v===v);});
    $('#mxTitle').textContent=TIT[v][0];$('#mxSub').textContent=TIT[v][1]+' · '+new Date().toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long'});
    try{RENDER[v]();}catch(e){console.error(e);$('.mx-view[data-v="'+v+'"]').innerHTML=empty('alert','Algo falló al mostrar esta sección',esc(e.message||String(e)));}
    paintIcons(root);bindGo();$('#mxScroll').scrollTop=0;$('#mxSide').classList.remove('open');if(!$('#mxDrawer').classList.contains('on'))$('#mxScrim').classList.remove('on');
    try{sessionStorage.setItem('mxView',v);}catch(e){}}
  function bindGo(){$$('[data-go]').forEach(function(b){if(b._g)return;b._g=1;b.addEventListener('click',function(){go(b.dataset.go);});});}
  function counts(){var h=hoy();
    $('#ctPipe').textContent=DB.clientes.filter(function(c){return c.etapa<6;}).length;$('#ctCli').textContent=DB.clientes.length;
    $('#ctAg').textContent=DB.citas.filter(function(c){return c.fecha===ymd(h)&&c.estado!=='Cancelada';}).length;
    $('#ctCot').textContent=DB.cotizaciones.filter(function(c){return c.estado==='generada';}).length;
    $('#ctRen').textContent=DB.polizas.filter(function(p){if(p.estado!=='Activa'||!p.vence)return false;var d=diffDays(p.vence,h);return d>=-30&&d<=30&&(+p.renov_etapa||0)<4;}).length;
    $('#ctCart').textContent=DB.polizas.filter(function(p){var q=cuotaInfo(p);return q&&!q.fin&&q.dias<=15;}).length;
    $('#ctBD').textContent=nf(DB.base_registros.length);
    $$('#mxNav .ct').forEach(function(e){e.style.display=e.textContent==='0'?'none':'';});}
  function refreshAll(){counts();var sc=$('#mxScroll').scrollTop;try{RENDER[cur]();}catch(e){console.error(e);}paintIcons(root);bindGo();$('#mxScroll').scrollTop=sc;}

  $$('.mx-nav-i').forEach(function(b){b.addEventListener('click',function(){go(b.dataset.v);});});
  $('#mxBurger').addEventListener('click',function(){$('#mxSide').classList.add('open');$('#mxScrim').classList.add('on');});
  $('#mxScrim').addEventListener('click',function(){$('#mxSide').classList.remove('open');closeDrawer();$('#mxScrim').classList.remove('on');});
  $('#mxDrX').addEventListener('click',closeDrawer);
  document.addEventListener('keydown',function(e){if(e.key!=='Escape'||!document.body.classList.contains('adm-mode'))return;if($$('.mx-menu').length){cerrarMenus();return;}if(modalStack.length){closeModal();return;}closeDrawer();});
  function toSite(){if(typeof window.goPage==='function')window.goPage('inicio');else location.hash='#inicio';}
  $$('[data-mx-site]').forEach(function(b){b.addEventListener('click',toSite);});
  var _rz;window.addEventListener('resize',function(){clearTimeout(_rz);_rz=setTimeout(function(){if(cur==='agenda'&&ME)renderAgenda();},200);});

  function themeIcon(){var d=document.body.classList.contains('dark');var s=$('#mxTheme span');s.innerHTML=ico(d?'sun':'moon');}
  $('#mxTheme').addEventListener('click',function(){var tb=document.getElementById('temaBtn');if(tb)tb.click();else document.body.classList.toggle('dark');themeIcon();});
  var hl=document.querySelector('.hdr-logo img');if(hl){$('#mxBrandLogo').src=hl.src;$('#mxLoginLogo').src=hl.src;}

  /* ===================== SESIÓN ===================== */
  function pintarUsuario(){$('#mxUserBox').innerHTML=avatar(ME)+'<div><b>'+esc(ME.nombre)+'</b><small>'+esc(ME.rol||'Asesor')+(MODE==='local'?' · modo local':'')+'</small></div><button id="mxSalir" title="Cerrar sesión" aria-label="Cerrar sesión">'+ico('logout')+'</button>';
    $('#mxSalir').addEventListener('click',salir);$('#mxLive').innerHTML='<i></i>'+(MODE==='sb'?'Conectado':'Modo local');$('#mxLive').classList.toggle('local',MODE==='local');}
  async function entrar(){var u=$('#mxUser').value.trim(),p=$('#mxPass').value;var b=$('#mxEntrar');var err=$('#mxErr');err.classList.remove('on');
    if(!digits(u)){err.textContent='Escribe tu número de cédula.';err.classList.add('on');return;}if(!p){err.textContent='Escribe tu contraseña.';err.classList.add('on');return;}
    busy(b,true,'Ingresando…');
    try{await login(u,p);await abrirApp();}catch(e){err.textContent=e.message||String(e);err.classList.add('on');$('#mxPass').value='';$('#mxPass').focus();}
    busy(b,false);}
  async function abrirApp(){
    $('#mxLogin').style.display='none';$('#mxApp').classList.add('on');$('#mxLoading').classList.add('on');
    GLOBAL=null;globalErr=null;agState.lunes=null;agState.dia=null;bdState={tab:'all',vista:'tabla',q:'',f:{},page:0,size:50,agrupar:'sector'};
    await cargarTodo();$('#mxLoading').classList.remove('on');pintarUsuario();counts();
    var v='dash';try{v=sessionStorage.getItem('mxView')||'dash';}catch(e){}go(RENDER[v]?v:'dash');
    if(!ME.nombre||ME.nombre==='Asesor')completarPerfil();
  }
  function completarPerfil(){openModal({t:'¡Bienvenido! Completa tu perfil',s:'Tu nombre aparece en los mensajes de WhatsApp, la agenda y las métricas del equipo.',size:'sm',body:'<form class="mx-form">'+fld('Nombre completo',inp('nombre','','placeholder="Ej: Andrea Rodríguez"'))+'<div class="mx-fgrid">'+fld('Iniciales',inp('iniciales','','maxlength="3" placeholder="AR"'))+fld('Color',inp('color','#7C3AED','type="color"'))+'</div></form>',
    foot:'<button class="mx-btn mx-btn-p" data-ok>Guardar</button>',onMount:function(el){var n=el.querySelector('[name=nombre]'),i=el.querySelector('[name=iniciales]');n.addEventListener('input',function(){i.value=inic(n.value);});
      el.querySelector('[data-ok]').addEventListener('click',async function(){var f=formData(el);if(!f.nombre){marcarError(el,'nombre','Escribe tu nombre');return;}try{await guardarPerfil({nombre:titleCase(f.nombre),iniciales:(f.iniciales||inic(f.nombre)).toUpperCase(),color:f.color});pintarUsuario();closeModal(el);refreshAll();}catch(e){}});}});}
  async function salir(){await logout();closeDrawer();modalStack.slice().forEach(function(m){closeModal(m);});$('#mxApp').classList.remove('on');$('#mxLogin').style.display='';$('#mxUser').value='';$('#mxPass').value='';try{sessionStorage.removeItem('mxView');}catch(e){}toSite();}
  $('#mxEntrar').addEventListener('click',entrar);
  ['mxUser','mxPass'].forEach(function(id){$('#'+id).addEventListener('keydown',function(e){if(e.key==='Enter')entrar();});});
  if(MODE==='local'){$('#mxLoginNote').innerHTML=LOCAL_OK?'<b>Modo local de pruebas.</b> Sin conexión a Supabase: los datos quedan solo en este navegador.':'<b>Sin conexión con la base de datos.</b> Revisa tu internet y recarga la página.';$('#mxLoginNote').classList.add('warn');}

  paintIcons(root);themeIcon();
  sesionGuardada().then(function(u){if(u)abrirApp();}).catch(function(){});
  window.mxThemeIcon=themeIcon;
})();
