/* ================= PORTAL ADMINISTRATIVO v2 ================= */
(function(){
  var root=document.getElementById('mxAdmin'); if(!root) return;

  /* ===== SUPABASE ===== */
  var SB_URL='https://ppzegmemytxcfallivez.supabase.co';
  var SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwemVnbWVteXR4Y2ZhbGxpdmV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxOTUyNjUsImV4cCI6MjEwNTc3MTI2NX0.itD8mTsB3athrMnHrOmZIt8p2_m2aAJULjI7NaTK6s8';
  var sb=null,sbOk=false;
  try{
    if(window.supabase){sb=window.supabase.createClient(SB_URL,SB_KEY);sbOk=true;console.log('[SB] Supabase conectado');}
    else console.warn('[SB] supabase-js no cargó, modo demo');
  }catch(e){console.warn('[SB] Error init:',e);}

  /* --- helpers Supabase --- */

  /* --- CRUD Supabase --- */
  async function sbUpdateLead(leadId,fields){
    if(!sbOk)return;
    try{
      // Find by matching name since we don't store SB ids yet
      var l=LEADS.filter(function(x){return x.id===leadId;})[0];
      if(!l)return;
      var {data}=await sb.from('leads').select('id').eq('nombre',l.n).limit(1).single();
      if(data)await sb.from('leads').update(fields).eq('id',data.id);
    }catch(e){console.warn('[SB] updateLead:',e);}
  }

  async function sbInsertLead(l){
    if(!sbOk)return;
    try{
      var {data:asesores}=await sb.from('asesores').select('id,iniciales');
      var as=asesores&&asesores.find(function(a){return a.iniciales===(l.as==='M'?'MH':'AN');});
      await sb.from('leads').insert({
        nombre:l.n,celular:l.tel,ciudad:l.ciudad,ramo:l.ramo,origen:l.o,
        campana:l.camp||null,asesor_id:as?as.id:null,
        etapa:l.et,valor_prima:l.v,aseguradora:l.aseg,
        dias_en_etapa:l.dias,proximo_contacto:l.prox.toISOString().slice(0,10),nota:l.nota
      });
    }catch(e){console.warn('[SB] insertLead:',e);}
  }

  async function sbInsertCotizacion(c){
    if(!sbOk)return;
    try{
      var {data:asesores}=await sb.from('asesores').select('id,iniciales');
      var as=asesores&&asesores.find(function(a){return a.iniciales===(c.as==='M'?'MH':'AN');});
      var {data:cot}=await sb.from('cotizaciones').insert({
        numero:c.id,ramo:c.l.ramo,
        estado:['generada','aprobada','rechazada'][c.et],
        financiacion:c.fin||'Por definir',asesor_id:as?as.id:null
      }).select().single();
      if(cot){
        for(var j=0;j<c.of.length;j++){
          await sb.from('cotizacion_ofertas').insert({
            cotizacion_id:cot.id,aseguradora:c.of[j].a,valor:c.of[j].v,seleccionada:j===0
          });
        }
      }
    }catch(e){console.warn('[SB] insertCot:',e);}
  }

  async function sbUpdateCotizacion(cotId,estado){
    if(!sbOk)return;
    try{
      await sb.from('cotizaciones').update({estado:estado}).eq('numero',cotId);
    }catch(e){console.warn('[SB] updateCot:',e);}
  }

  async function sbMarkPago(p){
    if(!sbOk)return;
    try{
      // Update poliza cuotas_pagadas
      var {data}=await sb.from('polizas').select('id,cuotas_pagadas').eq('numero_poliza',p.p.num).single();
      if(data)await sb.from('polizas').update({cuotas_pagadas:data.cuotas_pagadas+1}).eq('id',data.id);
    }catch(e){console.warn('[SB] markPago:',e);}
  }

  async function sbUploadFile(bucket,file,path){
    if(!sbOk||!file)return null;
    try{
      var {data,error}=await sb.storage.from(bucket).upload(path,file,{upsert:true});
      if(error){console.error('[SB] upload:',error);return null;}
      var {data:pub}=sb.storage.from(bucket).getPublicUrl(path);
      return pub?pub.publicUrl:null;
    }catch(e){console.warn('[SB] upload:',e);return null;}
  }

  async function sbSaveCampaign(camp){
    if(!sbOk)return;
    try{
      await sb.from('campanas').insert({
        nombre:camp.nombre,objetivo:camp.objetivo||'',audiencia:camp.audiencia||'',
        mensaje:camp.mensaje||'',imagen_url:camp.imagen_url||null,
        total_contactos:camp.contactos||0,total_enviados:camp.enviados||0
      });
    }catch(e){console.warn('[SB] saveCampaign:',e);}
  }

  var CLAVE='93412108';
  function $(s,c){return (c||root).querySelector(s);} function $$(s,c){return Array.prototype.slice.call((c||root).querySelectorAll(s));}

  /* ---------- íconos ---------- */
  var P='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
  var IC={
    grid:P+'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
    flow:P+'<path d="M3 6h5l3 6-3 6H3l3-6z"/><path d="M13 6h5l3 6-3 6h-5l3-6z"/></svg>',
    users:P+'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 010 6.8M18.5 14.8c1.6.8 2.6 2.6 3 5.2"/></svg>',
    doc:P+'<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
    refresh:P+'<path d="M20 11a8 8 0 00-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0014.3 4.9L20 16M20 20v-4h-4"/></svg>',
    mega:P+'<path d="M3 11v2a1 1 0 001 1h2l5 4V6L6 10H4a1 1 0 00-1 1z"/><path d="M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13"/></svg>',
    link:P+'<path d="M10 14a4.5 4.5 0 006.4 0l3-3a4.5 4.5 0 00-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 00-6.4 0l-3 3a4.5 4.5 0 006.4 6.4l1-1"/></svg>',
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
    copy:P+'<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1"/></svg>',
    next:P+'<path d="M5 12h14M13 5l7 7-7 7"/></svg>'
  };
  function ico(n){return IC[n]||'';}
  function paintIcons(scope){$$('[data-ico]',scope).forEach(function(e){if(!e.dataset.done){e.innerHTML=ico(e.dataset.ico);e.style.display='inline-flex';e.dataset.done='1';}});}

  /* ---------- utilidades ---------- */
  var seed=20260923; function rnd(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}
  function pick(a){return a[Math.floor(rnd()*a.length)];}
  function rint(a,b){return Math.floor(a+rnd()*(b-a+1));}
  function cop(n){return '$'+Math.round(n).toLocaleString('es-CO');}
  function copM(n){if(n>=1e6)return '$'+(n/1e6).toLocaleString('es-CO',{maximumFractionDigits:1})+' M';if(n>=1e3)return '$'+Math.round(n/1e3).toLocaleString('es-CO')+' mil';return cop(n);}
  function nf(n){return Math.round(n).toLocaleString('es-CO');}
  function pct(a,b){return b?(a/b*100).toLocaleString('es-CO',{maximumFractionDigits:1})+'%':'—';}
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  var HOY=new Date(); HOY.setHours(0,0,0,0);
  function addD(d){var x=new Date(HOY);x.setDate(x.getDate()+d);return x;}
  function fch(d){return d.toLocaleDateString('es-CO',{day:'2-digit',month:'short'});}
  function fchL(d){return d.toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'});}
  function waLink(tel,msg){return 'https://wa.me/'+tel+'?text='+encodeURIComponent(msg);}
  function toast(t){var el=$('#mxToast');el.textContent=t;el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(function(){el.classList.remove('on');},2200);}

  /* ---------- catálogo ---------- */
  var RAMOS={
    ATR:['Auto Todo Riesgo','#2563EB'],HOG:['Hogar','#D97706'],
    VD:['Vida Deudor Individual','#3B82F6'],VI:['Vida Individual','#1A57E0'],API:['AP Individual','#F59E0B'],
    PCF:['Plan Capital Futuro','#10B981'],EXE:['Exequial','#64748B'],VIA:['Viaje','#A855F7'],
    EDU:['Educativo','#EC4899'],
    MV:['Millón Vida','#0EA5E9'],PYME:['PYME','#1E3A8A'],VG:['Vida Colectivo','#06B6D4'],
    APG:['AP Colectivo','#F97316'],VDG:['Vida Grupo Deudor','#4F46E5'],VDA:['Vida Grupo Aportes','#7C3AED'],
    COPR:['Copropiedad Residencial','#14B8A6'],COPC:['Copropiedad Comercial','#0891B2'],
    DEC:['Decenal','#92400E'],AC:['Autos Colectivo','#DC2626'],CUM:['Cumplimiento','#7C3AED'],
    ARL:['ARL','#EA580C'],SC:['Salud Colectiva','#059669'],TRC:['Todo Riesgo Construcción','#B45309'],
    TRM:['Todo Riesgo Montaje','#78716C'],VAI:['Vida Ahorro e Inversión','#8B5CF6'],
    TRCA:['Transporte de Carga','#0369A1'],TRME:['Transporte de Mercancías','#155E75'],
    RCCE:['RCC/RCE Pasajeros','#4338CA'],
    SALUD:['Salud','#E11D48'],MP:['Medicina Prepagada','#BE185D'],RCM:['RC Médica','#0D9488'],
    JUD:['Judicial','#475569'],APE:['AP Escolar','#DB2777']
  };
  var PRIMA={ATR:[1.6,4.2],HOG:[.35,1.1],VI:[.8,3],VD:[.3,1.2],API:[.12,.5],PCF:[1.5,5],EXE:[.18,.5],VAI:[2,8],EDU:[1.2,4],MV:[3,9],PYME:[2.5,12],VG:[4,15],APG:[1,4],VDG:[1.5,6],VDA:[2,8],
    COPR:[3,18],COPC:[5,22],DEC:[6,25],AC:[8,30],CUM:[.6,4],ARL:[1,6],SC:[6,28],TRC:[4,20],TRM:[3,14],TRCA:[2,9],TRME:[1.5,7],RCCE:[3,12],SALUD:[2,7],MP:[1.5,5],RCM:[1.2,4],VIA:[.15,.6],JUD:[.3,2],APE:[.8,3]};
  function code(c){var r=RAMOS[c]||['Varios','#475569'];return '<span class="mx-code" style="background:'+r[1]+'">'+c+'</span>';}
  function ramoN(c){return (RAMOS[c]||['Varios'])[0];}
  function prima(c){var r=PRIMA[c]||[.5,2];return Math.round((r[0]+rnd()*(r[1]-r[0]))*1e6/10000)*10000;}

  var ETAPAS=['Nuevo cliente','Cliente potencial','Seguimiento','Acuerdo consensual','Firma de solicitud','Expedición de la póliza','Póliza recaudada','Proceso completado','Venta cruzada'];
  var ET_DESC=['Llegó el contacto; aún no se ha hablado','Mostró interés real y tiene la necesidad','Se envió información y se hace seguimiento','Cliente y asesor acordaron el producto','El cliente firmó la solicitud','La aseguradora expide la póliza','El cliente pagó la prima o primera cuota','Póliza entregada y cliente activo','Se ofrece un segundo ramo al cliente'];
  var ET_COL=['#0A1650','#0C2266','#0E307D','#0F3E8C','#0B55A6','#0869B8','#0580C9','#0395D6','#00A7E8'];
  var ASES={M:'Mateo Herrera',A:'Andrea'};
  var ORIG={meta:['Meta Ads','#246BFD'],wa:['WhatsApp directo','#1FAF5A'],ref:['Referido','#F59E0B'],ig:['Instagram orgánico','#C026D3'],web:['Sitio web','#0EA5E9'],tel:['Llamada','#64748B']};
  var ASEG=['Mapfre','HDI','Confianza','Seguros del Estado','Positiva','Seguros Mundial','Equidad','Solidaria','AXA Colpatria','Qualitas','SMI'];
  var NOMBRES=['Carlos Ramírez','Laura Gómez','Andrés Peña','Marcela Ruiz','Jorge Castillo','Diana Torres','Felipe Ortiz','Sandra Molina','Ricardo Vargas','Paola Herrera','Juan Camilo Rojas','Natalia Cárdenas','Sebastián Lozano','Valentina Prada','Óscar Bermúdez','Luisa Fernanda Díaz','Hernán Quintero','Catalina Varón','Mauricio Guzmán','Daniela Oviedo','Fabián Rincón','Gloria Aguirre','Cristian Barrios','Mónica Salazar','Esteban Murillo','Liliana Cruz','Álvaro Méndez','Yuliana Parra','Camilo Tovar','Adriana Leal','Transportes El Tolima SAS','Constructora Ambalá','Conjunto La Arboleda','Clínica Dental Sonríe','Ferretería El Tornillo','Cooperativa Coopemtol','Edificio Torre Quinta','Distribuidora La 60','Dr. Mario Suárez','Colegio San Simón','Julián Arango','Tatiana Ospina','Nelson Cuéllar','Brenda Lozada','Iván Perdomo','Rocío Saavedra','Wilson Trujillo','Karen Montealegre'];
  var CIUD=['Ibagué','Ibagué','Ibagué','Ibagué','Espinal','Melgar','Honda','Mariquita','Chaparral','Bogotá'];
  var EMPRESA=/SAS|Constructora|Conjunto|Clínica|Ferretería|Cooperativa|Edificio|Distribuidora|Colegio/;
  var RAMO_EMP=['PYME','VG','APG','VDG','VDA','COPR','COPC','DEC','AC','CUM','ARL','SC','TRC','TRM','TRCA','TRME','RCCE','APE'];
  var RAMO_PER=['ATR','ATR','ATR','HOG','HOG','VI','VI','VD','API','PCF','EXE','VAI','EDU','MV','SALUD','SALUD','MP','RCM','VIA','JUD'];

  /* ---------- campañas Meta ---------- */
  var FUNNEL_ET=[['Reconocimiento','Darse a conocer: alcance y reproducciones de video'],['Consideración','Generar interés: interacción y mensajes'],['Conversión','Pedir la cotización: mensajes a WhatsApp y formularios'],['Remarketing','Volver a impactar a quien ya escribió o visitó']];
  var CICLO=['Planeación','Creativos','Revisión de Meta','Aprendizaje','Optimización','Escalado','Cierre'];
  var CAMP=[]; var _OLD_CAMP=[];

  /* ---------- datos demo ---------- */
  var LEADS=[],CLIENTES=[],COTIZ=[],RENOV=[],PAGOS=[];
  function genData(){
    // Base de datos vacía — los datos reales se cargan desde Supabase
  }
    var COT_ETAPAS=['Cotización generada','Aprobada','Rechazada'];
  var REN_ETAPAS=['Aviso enviado','Cliente contactado','Recotización','Renovación aceptada','Renovada'];

  /* ---------- componentes ---------- */
  function rail(etapas,counts,sub,colors,onSel,sel,cum){
    var h='<div class="mx-railwrap" style="--rail-min:'+(etapas.length*112)+'px"><div class="mx-rail">';
    etapas.forEach(function(e,i){h+='<button class="mx-stage'+(sel===i?' sel':'')+'" data-i="'+i+'" style="--st-bg:'+(colors?colors[i]:ET_COL[Math.round(i*(ET_COL.length-1)/Math.max(1,etapas.length-1))])+'"><span class="n">Etapa '+(i+1)+'</span><span class="t">'+e+'</span><span><span class="c">'+counts[i]+'</span>'+(sub?'<span class="m">'+sub[i]+'</span>':'')+'</span></button>';});
    h+='</div>';
    if(cum){var reach=counts.map(function(c,i){return counts.slice(i).reduce(function(a,b){return a+b;},0);});
      h+='<div class="mx-conv">'+etapas.map(function(e,i){return '<span>'+(i<etapas.length-1&&reach[i]?'avanza '+Math.round(reach[i+1]/reach[i]*100)+'% →':'')+'</span>';}).join('')+'</div>';}
    return h+'</div>';
  }
  function steps(total,cur){var h='<div class="mx-steps">';for(var i=0;i<total;i++)h+='<i class="'+(i<cur?'done':(i===cur?'cur':''))+'"></i>';return h+'</div>';}
  function vsteps(list,cur){return '<ol class="mx-vsteps">'+list.map(function(s,i){return '<li class="'+(i<cur?'done':(i===cur?'cur':''))+'"><i>'+(i<cur?'✓':i+1)+'</i><span>'+s+'</span></li>';}).join('')+'</ol>';}
  function kpi(l,v,s,icn,hero){return '<div class="mx-kpi'+(hero?' hero':'')+'"><div class="l">'+ico(icn)+l+'</div><div class="v">'+v+'</div><div class="s">'+s+'</div></div>';}
  function badgeDias(d){var c=d>=7?'dan':(d>=4?'warn':'ok');return '<span class="d" style="color:var(--mx-'+c+')">'+d+' d</span>';}
  function src(o){var x=ORIG[o];return '<span class="mx-src"><i style="background:'+x[1]+'"></i>'+x[0]+'</span>';}
  function asAv(a){return '<span class="as as-'+a+'" title="'+ASES[a]+'">'+(a==='M'?'MH':'AN')+'</span>';}
  function stBadge(s){var m={'Activa':'ok','En aprendizaje':'info','Pausada':'warn','Finalizada':'mute','Borrador':'mute'};return '<span class="mx-badge b-'+m[s]+'"><i></i>'+s+'</span>';}

  /* ---------- drawer ---------- */
  function openDrawer(t,s,body,foot){$('#mxDrT').textContent=t;$('#mxDrS').innerHTML=s||'';$('#mxDrB').innerHTML=body;$('#mxDrF').innerHTML=foot||'';$('#mxDrawer').classList.add('on');$('#mxScrim').classList.add('on');$('#mxDrawer').setAttribute('aria-hidden','false');paintIcons($('#mxDrawer'));}
  function closeDrawer(){$('#mxDrawer').classList.remove('on');$('#mxDrawer').setAttribute('aria-hidden','true');if(!$('#mxSide').classList.contains('open'))$('#mxScrim').classList.remove('on');}

  /* ================= VISTAS ================= */
  var TOTALS={};
  function calcMeta(){var t={g:0,imp:0,alc:0,cl:0,conv:0,cot:0,pol:0,pri:0};CAMP.forEach(function(c){for(var k in t)t[k]+=c[k];});return t;}

  /* ---- Resumen ---- */
  function renderDash(){
    var pipeCount=LEADS.filter(function(l){return l.et<6;}).length; var pipeVal=LEADS.filter(function(l){return l.et<6;}).reduce(function(a,l){return a+l.v;},0);
    var cerr=LEADS.filter(function(l){return l.et>=6;}).length; var ren30=RENOV.filter(function(r){return r.p.dias<=30&&r.et<4;}).length;
    var primasMes=LEADS.filter(function(l){return l.et>=6;}).reduce(function(a,l){return a+l.v;},0)+42300000;
    var polAct=CLIENTES.reduce(function(a,c){return a+c.pols.length;},0);
    var h='<div class="mx-grid mx-g-kpi">'+
      kpi('Primas emitidas este mes',copM(primasMes),'<b class="up">▲ 14%</b> frente al mes anterior','money',true)+
      kpi('Pólizas activas',nf(polAct),'en '+CLIENTES.length+' clientes','shield')+
      kpi('Negocios abiertos',nf(pipeCount),copM(pipeVal)+' en primas posibles','flow')+
      kpi('Tasa de cierre',pct(cerr,LEADS.length),cerr+' de '+LEADS.length+' contactos','target')+
      kpi('Renovaciones ≤ 30 días',ren30,'requieren gestión','refresh')+
    '</div>';
    // riel pipeline
    var cnt=ETAPAS.map(function(e,i){return LEADS.filter(function(l){return l.et===i;}).length;});
    var val=ETAPAS.map(function(e,i){return copM(LEADS.filter(function(l){return l.et===i;}).reduce(function(a,l){return a+l.v;},0));});
    h+='<div class="mx-card mx-mb"><div class="mx-card-h"><div><h3>Pipeline de ventas por etapa</h3><p>Toca una etapa para abrir el tablero filtrado.</p></div><button class="mx-btn mx-btn-s mx-btn-sm" data-go="pipe">Abrir pipeline '+ico('next')+'</button></div><div id="dRail">'+rail(ETAPAS,cnt,val,null,null,null,true)+'</div></div>';
    // gráfica + alertas
    h+='<div class="mx-grid mx-g-2 mx-mb"><div class="mx-card"><div class="mx-card-h"><div><h3>Producción mensual por asesor</h3><p>Primas emitidas, últimos 6 meses (millones de pesos)</p></div><div class="mx-legend"><span><i style="background:#0F3E8C"></i>Mateo</span><span><i style="background:#00A7E8"></i>Andrea</span></div></div><div class="mx-chart">'+barChart()+'</div></div>';
    h+='<div class="mx-card"><div class="mx-card-h"><div><h3>Acciones de hoy</h3><p>Lo que no puede esperar</p></div></div>'+alertas()+'</div></div>';
    // ramos + origen
    var byR={};LEADS.forEach(function(l){byR[l.ramo]=(byR[l.ramo]||0)+l.v;});var top=Object.keys(byR).sort(function(a,b){return byR[b]-byR[a];}).slice(0,7);var mx=byR[top[0]];
    h+='<div class="mx-grid mx-g-2e"><div class="mx-card"><div class="mx-card-h"><div><h3>Ramos con más valor en el pipeline</h3><p>Suma de primas posibles por unidad de negocio</p></div></div>'+top.map(function(r){return '<div class="mx-hbar"><span>'+code(r)+' '+ramoN(r)+'</span><span class="tr"><i style="width:'+(byR[r]/mx*100)+'%"></i></span><b>'+copM(byR[r])+'</b></div>';}).join('')+'</div>';
    var byO={};LEADS.forEach(function(l){byO[l.o]=(byO[l.o]||0)+1;});
    h+='<div class="mx-card"><div class="mx-card-h"><div><h3>De dónde llegan los contactos</h3><p>'+LEADS.length+' contactos en el pipeline</p></div></div><div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap;"><div class="mx-chart" style="width:170px;flex-shrink:0;">'+donut(byO)+'</div><div class="mx-legend" style="flex-direction:column;gap:8px;">'+Object.keys(ORIG).filter(function(o){return byO[o];}).map(function(o){return '<span><i style="background:'+ORIG[o][1]+'"></i>'+ORIG[o][0]+' · <b>'+byO[o]+'</b> ('+pct(byO[o],LEADS.length)+')</span>';}).join('')+'</div></div></div></div>';
    $('#vDash').innerHTML=h;
    $$('#dRail .mx-stage').forEach(function(b){b.addEventListener('click',function(){pipeState.et=+b.dataset.i;go('pipe');});});
  }
  function barChart(){
    var meses=[];for(var i=5;i>=0;i--){var d=new Date(HOY);d.setMonth(d.getMonth()-i);meses.push(d.toLocaleDateString('es-CO',{month:'short'}).replace('.',''));}
    var M=[0,0,0,0,0,0],A=[0,0,0,0,0,0];
    var W=560,H=230,pl=34,pb=26,pt=10,max=30,bw=18,gw=(W-pl-10)/6;
    var s='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Producción mensual">';
    for(var g=0;g<=3;g++){var y=pt+(H-pt-pb)*(1-g/3);s+='<line x1="'+pl+'" x2="'+(W-6)+'" y1="'+y+'" y2="'+y+'" stroke="var(--mx-line)" stroke-dasharray="3 4"/><text x="'+(pl-8)+'" y="'+(y+4)+'" text-anchor="end">'+(max*g/3)+'</text>';}
    meses.forEach(function(m,i){var x=pl+gw*i+gw/2;var hm=(H-pt-pb)*M[i]/max,ha=(H-pt-pb)*A[i]/max;
      s+='<rect x="'+(x-bw-2)+'" y="'+(H-pb-hm)+'" width="'+bw+'" height="'+hm+'" rx="5" fill="#0F3E8C"><title>Mateo '+M[i]+' M</title></rect>';
      s+='<rect x="'+(x+2)+'" y="'+(H-pb-ha)+'" width="'+bw+'" height="'+ha+'" rx="5" fill="#00A7E8"><title>Andrea '+A[i]+' M</title></rect>';
      s+='<text x="'+x+'" y="'+(H-8)+'" text-anchor="middle">'+m+'</text>';});
    return s+'</svg>';
  }
  function donut(byO){var tot=0;for(var k in byO)tot+=byO[k];var a=0,s='<svg viewBox="0 0 120 120">',r=46,C=2*Math.PI*r;
    Object.keys(ORIG).forEach(function(o){if(!byO[o])return;var f=byO[o]/tot;s+='<circle cx="60" cy="60" r="'+r+'" fill="none" stroke="'+ORIG[o][1]+'" stroke-width="16" stroke-dasharray="'+(f*C)+' '+C+'" stroke-dashoffset="'+(-a*C)+'" transform="rotate(-90 60 60)"/>';a+=f;});
    return s+'<text x="60" y="58" text-anchor="middle" style="font-size:20px;font-weight:800;fill:var(--mx-ink);font-family:Plus Jakarta Sans,sans-serif">'+tot+'</text><text x="60" y="74" text-anchor="middle" style="font-size:9px">contactos</text></svg>';}
  function alertas(){
    var frios=LEADS.filter(function(l){return l.dias>=7&&l.et<6;});var urg=RENOV.filter(function(r){return r.p.dias<=10&&r.et<4;});
    var cotEsp=COTIZ.filter(function(c){return c.et===2;});
    var L=[
      ['dan','clock',frios.length+' contactos llevan 7 días o más sin avanzar','Escríbeles hoy para no perder el negocio.','pipe','Ver'],
      ['warn','refresh',urg.length+' pólizas vencen en 10 días o menos','Confirma la renovación antes del vencimiento.','ren','Gestionar'],
      ['info','doc',cotEsp.length+' cotizaciones esperan respuesta del cliente','Haz seguimiento a las enviadas hace más de 2 días.','cot','Revisar'],
      ['info','mega','Revisa los cumpleaños próximos','Felicita a tus clientes y aprovecha para ofrecer un seguro de regalo.','cart','Ver']
    ];
    return L.map(function(a){return '<div class="mx-alert"><span class="ic" style="background:var(--mx-'+a[0]+'-bg);color:var(--mx-'+a[0]+')">'+ico(a[1])+'</span><div><b>'+esc(a[2])+'</b><p>'+a[3]+'</p></div><button class="mx-btn mx-btn-s mx-btn-sm" data-go="'+a[4]+'">'+a[5]+'</button></div>';}).join('');
  }

  /* ---- Pipeline ---- */
  var pipeState={ramo:null,as:'',o:'',q:'',vista:'tablero',et:null};
  function leadsFiltrados(){return LEADS.filter(function(l){
    if(pipeState.ramo&&l.ramo!==pipeState.ramo)return false; if(pipeState.as&&l.as!==pipeState.as)return false; if(pipeState.o&&l.o!==pipeState.o)return false;
    if(pipeState.q){var q=pipeState.q.toLowerCase();if((l.n+' '+ramoN(l.ramo)+' '+l.ciudad+' '+(l.camp||'')).toLowerCase().indexOf(q)<0)return false;}return true;});}
  function renderPipe(){
    var F=leadsFiltrados();
    var cnt=ETAPAS.map(function(e,i){return F.filter(function(l){return l.et===i;}).length;});
    var val=ETAPAS.map(function(e,i){return copM(F.filter(function(l){return l.et===i;}).reduce(function(a,l){return a+l.v;},0));});
    var usados={};LEADS.forEach(function(l){usados[l.ramo]=(usados[l.ramo]||0)+1;});
    var h='<div class="mx-card mx-mb"><div class="mx-card-h"><div><h3>Recorrido del cliente</h3><p>9 etapas desde el primer contacto hasta la venta cruzada. El porcentaje indica qué parte de los contactos que llegaron a una etapa siguió avanzando.</p></div>'+(pipeState.et!==null?'<button class="mx-btn mx-btn-s mx-btn-sm" id="pClrEt">Ver todas las etapas</button>':'')+'</div><div id="pRail">'+rail(ETAPAS,cnt,val,null,null,pipeState.et,true)+'</div></div>';
    h+='<div class="mx-toolbar"><input class="mx-input" id="pQ" placeholder="Buscar cliente, ramo, ciudad o campaña" value="'+esc(pipeState.q)+'">'+
      '<select class="mx-select" id="pAs"><option value="">Todos los asesores</option><option value="M"'+(pipeState.as==='M'?' selected':'')+'>Mateo Herrera</option><option value="A"'+(pipeState.as==='A'?' selected':'')+'>Andrea</option></select>'+
      '<select class="mx-select" id="pO"><option value="">Todos los orígenes</option>'+Object.keys(ORIG).map(function(o){return '<option value="'+o+'"'+(pipeState.o===o?' selected':'')+'>'+ORIG[o][0]+'</option>';}).join('')+'</select>'+
      '<div class="mx-seg" id="pVista"><button data-v="tablero" class="'+(pipeState.vista==='tablero'?'on':'')+'">Tablero</button><button data-v="lista" class="'+(pipeState.vista==='lista'?'on':'')+'">Lista</button></div>'+
      '<button class="mx-btn mx-btn-p" id="pNew" style="margin-left:auto">'+ico('plus')+'Nuevo contacto</button></div>';
    h+='<div class="mx-chips" id="pChips"><button class="mx-chip all'+(!pipeState.ramo?' on':'')+'" data-r="">Todos los ramos</button>'+Object.keys(RAMOS).map(function(r){return '<button class="mx-chip'+(pipeState.ramo===r?' on':'')+'" data-r="'+r+'" title="'+RAMOS[r][0]+'">'+code(r)+RAMOS[r][0]+(usados[r]?' <span style="opacity:.6">'+usados[r]+'</span>':'')+'</button>';}).join('')+'</div>';
    if(pipeState.vista==='tablero'){
      h+='<div class="mx-board" id="pBoard">';
      ETAPAS.forEach(function(e,i){if(pipeState.et!==null&&pipeState.et!==i)return;var ls=F.filter(function(l){return l.et===i;});
        h+='<div class="mx-col" data-et="'+i+'"><div class="mx-col-h"><span class="dot" style="background:'+ET_COL[i]+'"></span><b>'+(i+1)+'. '+e+'</b><span class="ct">'+ls.length+'</span></div><div class="mx-col-sum">'+ET_DESC[i]+' · '+copM(ls.reduce(function(a,l){return a+l.v;},0))+'</div>';
        h+=ls.length?ls.map(leadCard).join(''):'<div class="mx-empty">Arrastra aquí un contacto</div>';h+='</div>';});
      h+='</div><p style="font-size:.76rem;color:var(--mx-ink-3);margin-top:8px;">Arrastra una tarjeta a otra columna para cambiarla de etapa, o ábrela para ver el detalle.</p>';
    } else {
      h+='<div class="mx-table-wrap"><table class="mx-table"><thead><tr><th>Contacto</th><th>Ramo</th><th>Etapa</th><th>Origen</th><th>Asesor</th><th class="r">Prima posible</th><th>Días en etapa</th><th>Próximo contacto</th></tr></thead><tbody>'+
        F.filter(function(l){return pipeState.et===null||l.et===pipeState.et;}).sort(function(a,b){return a.et-b.et;}).map(function(l){return '<tr class="click" data-id="'+l.id+'"><td><b>'+esc(l.n)+'</b><small>'+l.ciudad+'</small></td><td>'+code(l.ramo)+' '+ramoN(l.ramo)+'</td><td>'+(l.et+1)+'. '+ETAPAS[l.et]+steps(9,l.et)+'</td><td>'+src(l.o)+'</td><td>'+ASES[l.as]+'</td><td class="r"><b>'+cop(l.v)+'</b></td><td>'+badgeDias(l.dias).replace('class="d"','')+'</td><td>'+fch(l.prox)+'</td></tr>';}).join('')+'</tbody></table></div>';
    }
    $('#vPipe').innerHTML=h;
    // eventos
    $$('#pRail .mx-stage').forEach(function(b){b.addEventListener('click',function(){var i=+b.dataset.i;pipeState.et=(pipeState.et===i?null:i);renderPipe();});});
    var clr=$('#pClrEt');if(clr)clr.addEventListener('click',function(){pipeState.et=null;renderPipe();});
    var q=$('#pQ');q.addEventListener('input',function(){pipeState.q=q.value;clearTimeout(q._t);q._t=setTimeout(function(){renderPipe();var n=$('#pQ');n.focus();n.setSelectionRange(n.value.length,n.value.length);},250);});
    $('#pAs').addEventListener('change',function(e){pipeState.as=e.target.value;renderPipe();});
    $('#pO').addEventListener('change',function(e){pipeState.o=e.target.value;renderPipe();});
    $$('#pVista button').forEach(function(b){b.addEventListener('click',function(){pipeState.vista=b.dataset.v;renderPipe();});});
    $$('#pChips .mx-chip').forEach(function(c){c.addEventListener('click',function(){pipeState.ramo=c.dataset.r||null;if(pipeState.ramo===c.dataset.r&&c.classList.contains('on')&&c.dataset.r)pipeState.ramo=null;renderPipe();});});
    $('#pNew').addEventListener('click',nuevoLead);
    $$('#vPipe [data-id]').forEach(function(el){el.addEventListener('click',function(){leadDrawer(el.dataset.id);});});
    // drag & drop
    $$('#pBoard .mx-lead').forEach(function(c){c.addEventListener('dragstart',function(e){c.classList.add('drag');e.dataTransfer.setData('text/plain',c.dataset.id);e.dataTransfer.effectAllowed='move';});c.addEventListener('dragend',function(){c.classList.remove('drag');});});
    $$('#pBoard .mx-col').forEach(function(col){
      col.addEventListener('dragover',function(e){e.preventDefault();col.classList.add('over');});
      col.addEventListener('dragleave',function(e){if(!col.contains(e.relatedTarget))col.classList.remove('over');});
      col.addEventListener('drop',function(e){e.preventDefault();col.classList.remove('over');var id=e.dataTransfer.getData('text/plain');moverLead(id,+col.dataset.et);});
    });
  }
  function leadCard(l){return '<div class="mx-lead" draggable="true" data-id="'+l.id+'"><div class="mx-lead-top">'+code(l.ramo)+src(l.o)+badgeDias(l.dias)+'</div><h4>'+esc(l.n)+'</h4><div class="r">'+ramoN(l.ramo)+' · '+l.ciudad+'</div>'+steps(9,l.et)+'<div class="mx-lead-bot"><span class="val">'+copM(l.v)+'</span><span>Próx. '+fch(l.prox)+'</span>'+asAv(l.as)+'</div></div>';}
  function moverLead(id,et){var l=LEADS.filter(function(x){return x.id===id;})[0];if(!l||l.et===et)return;l.et=et;l.dias=0;if(et>=4&&l.aseg==='Por definir')l.aseg=pick(ASEG);
    // Al pasar a etapa 2 (Seguimiento) auto-crear cotización
    if(et===2){var ya=COTIZ.some(function(c){return c.l.id===l.id;});if(!ya){var of=[{a:pick(ASEG),v:l.v},{a:pick(ASEG),v:Math.round(l.v*1.12/10000)*10000}].sort(function(a,b){return a.v-b.v;});COTIZ.unshift({id:'COT-'+Date.now().toString().slice(-4),l:l,et:0,of:of,fecha:HOY,as:l.as,fin:'Por definir'});sbInsertCotizacion(COTIZ[0]);toast(l.n+' pasó a «'+ETAPAS[et]+'» — cotización creada automáticamente');refreshAll();return;}}
    toast(l.n+' pasó a «'+ETAPAS[et]+'»');sbUpdateLead(id,{etapa:et,dias_en_etapa:0,aseguradora:l.aseg});refreshAll();}
  function leadDrawer(id){var l=LEADS.filter(function(x){return x.id===id;})[0];if(!l)return;
    var msg='Hola '+l.n.split(' ')[0]+', te saluda '+ASES[l.as]+' de Mateo Herrera Seguros. Te escribo por tu '+ramoN(l.ramo).toLowerCase()+'. ¿Tienes un momento?';
    var b='<div class="mx-sec">Etapa actual</div>'+vsteps(ETAPAS,l.et)+
      '<div class="mx-sec">Datos del contacto</div><dl class="mx-dl"><dt>Ramo</dt><dd>'+code(l.ramo)+' '+ramoN(l.ramo)+'</dd><dt>Prima posible</dt><dd>'+cop(l.v)+'</dd><dt>Aseguradora</dt><dd>'+l.aseg+'</dd><dt>Origen</dt><dd>'+ORIG[l.o][0]+(l.camp?'<br><small style="color:var(--mx-ink-3)">Campaña: '+esc(l.camp)+'</small>':'')+'</dd><dt>Asesor</dt><dd>'+ASES[l.as]+'</dd><dt>Ciudad</dt><dd>'+l.ciudad+'</dd><dt>Teléfono</dt><dd>+'+l.tel.slice(0,2)+' '+l.tel.slice(2,5)+' '+l.tel.slice(5)+'</dd><dt>Días en la etapa</dt><dd>'+l.dias+'</dd><dt>Próximo contacto</dt><dd>'+fchL(l.prox)+'</dd></dl>'+
      '<div class="mx-sec">Nota</div><div class="mx-note">'+esc(l.nota)+'</div>'+
      '<label class="mx-field"><span>Mover a la etapa</span><select class="mx-select" id="drEt">'+ETAPAS.map(function(e,i){return '<option value="'+i+'"'+(i===l.et?' selected':'')+'>'+(i+1)+'. '+e+'</option>';}).join('')+'</select></label>';
    var f='<a class="mx-btn mx-btn-wa" target="_blank" rel="noopener" href="'+waLink(l.tel,msg)+'">'+ico('wa')+'Escribir por WhatsApp</a>'+(l.et<8?'<button class="mx-btn mx-btn-p" id="drNext">Avanzar a «'+ETAPAS[l.et+1]+'»</button>':'');
    openDrawer(l.n,code(l.ramo)+' '+ramoN(l.ramo)+' · Etapa '+(l.et+1)+' de 9',b,f);
    $('#drEt').addEventListener('change',function(e){moverLead(l.id,+e.target.value);leadDrawer(l.id);});
    var nx=$('#drNext');if(nx)nx.addEventListener('click',function(){moverLead(l.id,l.et+1);leadDrawer(l.id);});
  }
  function nuevoLead(){
    var b='<label class="mx-field"><span>Nombre del cliente</span><input class="mx-input" id="nlN" placeholder="Ej. María López"></label><label class="mx-field"><span>WhatsApp</span><input class="mx-input" id="nlT" placeholder="310 000 0000" inputmode="tel"></label>'+
      '<label class="mx-field"><span>Ramo de interés</span><select class="mx-select" id="nlR">'+Object.keys(RAMOS).map(function(r){return '<option value="'+r+'">'+RAMOS[r][0]+'</option>';}).join('')+'</select></label>'+
      '<label class="mx-field"><span>Origen</span><select class="mx-select" id="nlO">'+Object.keys(ORIG).map(function(o){return '<option value="'+o+'">'+ORIG[o][0]+'</option>';}).join('')+'</select></label>'+
      '<label class="mx-field"><span>Asesor</span><select class="mx-select" id="nlA"><option value="M">Mateo Herrera</option><option value="A">Andrea</option></select></label>'+
      '<div class="mx-note">En esta versión de demostración el contacto se guarda solo mientras la página esté abierta.</div>';
    openDrawer('Nuevo contacto','Entra al pipeline en la etapa 1 · Nuevo cliente',b,'<button class="mx-btn mx-btn-p" id="nlSave">Agregar al pipeline</button>');
    $('#nlSave').addEventListener('click',function(){var n=$('#nlN').value.trim();if(!n){$('#nlN').focus();$('#nlN').style.borderColor='var(--mx-dan)';return;}
      var r=$('#nlR').value;LEADS.unshift({id:'L'+Date.now(),n:n,tel:'57'+($('#nlT').value.replace(/\D/g,'')||'3100000000'),ciudad:'Ibagué',ramo:r,o:$('#nlO').value,camp:null,as:$('#nlA').value,et:0,v:prima(r),dias:0,prox:addD(1),aseg:'Por definir',nota:'Contacto creado desde el portal.'});
      closeDrawer();sbInsertLead(LEADS[0]);toast('Contacto agregado a «Nuevo cliente»');refreshAll();});
  }

  /* ---- Clientes ---- */
  var cliQ='',cliRamo='';
  function renderCli(){
    var F=CLIENTES.filter(function(c){
      if(cliRamo&&!c.pols.some(function(p){return p.ramo===cliRamo;}))return false;
      if(!cliQ)return true;var s=(c.n+' '+c.doc+' '+c.ciudad+' '+(c.email||'')+' '+c.pols.map(function(p){return ramoN(p.ramo)+' '+p.aseg;}).join(' ')).toLowerCase();return s.indexOf(cliQ.toLowerCase())>-1;});
    var tot=CLIENTES.reduce(function(a,c){return a+c.pols.reduce(function(x,p){return x+p.prima;},0);},0);var emp=CLIENTES.filter(function(c){return c.tipo==='Empresa';}).length;
    var mono=CLIENTES.filter(function(c){return c.pols.length===1;}).length;
    var h='<div class="mx-grid mx-g-kpi">'+kpi('Clientes activos',CLIENTES.length,emp+' empresas · '+(CLIENTES.length-emp)+' personas','users',true)+kpi('Primas anuales en cartera',copM(tot),'suma de pólizas vigentes','money')+kpi('Pólizas por cliente',(CLIENTES.reduce(function(a,c){return a+c.pols.length;},0)/CLIENTES.length).toLocaleString('es-CO',{maximumFractionDigits:1}),'promedio','shield')+kpi('Clientes con un solo ramo',mono,'oportunidad de venta cruzada','trend')+'</div>';
    h+='<div class="mx-toolbar"><input class="mx-input" id="cQ" placeholder="Buscar por nombre, documento, email, ramo o aseguradora" value="'+esc(cliQ)+'"><select class="mx-select" id="cRF"><option value="">Todos los ramos</option>'+Object.keys(RAMOS).map(function(r){return '<option value="'+r+'"'+(cliRamo===r?' selected':'')+'>'+RAMOS[r][0]+'</option>';}).join('')+'</select></div>';
    h+='<div class="mx-table-wrap"><table class="mx-table"><thead><tr><th>Cliente</th><th>Documento</th><th>Celular</th><th>Pólizas</th><th>Financiación</th><th class="r">Primas</th><th>Cumpleaños</th><th>Asesor</th></tr></thead><tbody>'+
      F.map(function(c){var pr=c.pols.reduce(function(a,p){return a+p.prima;},0);var nx=c.pols.slice().sort(function(a,b){return a.dias-b.dias;})[0];
        var fins=c.pols.map(function(p){return p.fin==='financiado'?'Financ.':'Contado';}).filter(function(v,i,a){return a.indexOf(v)===i;}).join(', ');
        var nacStr=c.nac?c.nac.toLocaleDateString('es-CO',{day:'2-digit',month:'short'}):'—';
        return '<tr class="click" data-cl="'+c.id+'"><td><b>'+esc(c.n)+'</b><small>'+c.tipo+' · '+c.ciudad+'</small></td><td>'+c.doc+'</td><td>'+c.tel.replace(/^57/,'')+'</td><td>'+c.pols.map(function(p){return code(p.ramo);}).join(' ')+'</td><td>'+fins+'</td><td class="r"><b>'+cop(pr)+'</b></td><td>'+nacStr+'</td><td>'+ASES[c.as]+'</td></tr>';}).join('')+
      (F.length?'':'<tr><td colspan="8" style="text-align:center;padding:28px">No hay clientes que coincidan.</td></tr>')+'</tbody></table></div>';
    $('#vCli').innerHTML=h;
    var q=$('#cQ');q.addEventListener('input',function(){cliQ=q.value;clearTimeout(q._t);q._t=setTimeout(function(){renderCli();var n=$('#cQ');n.focus();n.setSelectionRange(n.value.length,n.value.length);},250);});
    $('#cRF').addEventListener('change',function(e){cliRamo=e.target.value;renderCli();});
    $$('#vCli [data-cl]').forEach(function(tr){tr.addEventListener('click',function(){cliDrawer(tr.dataset.cl);});});
  }
  function cliDrawer(id){var c=CLIENTES.filter(function(x){return x.id===id;})[0];
    var tiene=c.pols.map(function(p){return p.ramo;});var sug=(c.tipo==='Empresa'?['PYME','VG','ARL','SC','CUM','AC']:['VI','HOG','SALUD','EDU','ATR','EXE','MP']).filter(function(r){return tiene.indexOf(r)<0;}).slice(0,3);
    var nacStr=c.nac?c.nac.toLocaleDateString('es-CO',{day:'2-digit',month:'long',year:'numeric'}):'—';
    var b='<div class="mx-sec">Datos personales</div><dl class="mx-dl"><dt>Nombre</dt><dd>'+esc(c.n)+'</dd><dt>Documento</dt><dd>'+c.doc+'</dd><dt>Tipo</dt><dd>'+c.tipo+'</dd><dt>Celular</dt><dd>+'+c.tel.slice(0,2)+' '+c.tel.slice(2,5)+' '+c.tel.slice(5)+'</dd><dt>Correo</dt><dd>'+esc(c.email||'—')+'</dd><dt>Ciudad</dt><dd>'+c.ciudad+'</dd><dt>Dirección</dt><dd>'+esc(c.dir||'—')+'</dd><dt>Nacimiento</dt><dd>'+nacStr+'</dd><dt>Hijos</dt><dd>'+(c.hijos>0?c.hijos+' hijo(s)':'No registra')+'</dd><dt>Asesor</dt><dd>'+ASES[c.as]+'</dd><dt>Cliente desde</dt><dd>'+c.desde+'</dd></dl>'+
      (c.obs?'<div class="mx-sec">Observaciones</div><div class="mx-note">'+esc(c.obs)+'</div>':'')+
      '<div class="mx-sec">Pólizas ('+c.pols.length+')</div>'+c.pols.map(function(p){return '<div class="mx-note" style="display:flex;gap:10px;align-items:flex-start;flex-wrap:wrap;"><div style="flex:1;min-width:160px">'+code(p.ramo)+' <b style="color:var(--mx-ink)">'+ramoN(p.ramo)+'</b><br><small>'+p.aseg+' · '+p.num+'</small><br><small>Vence: '+fchL(p.vence)+'</small><br><small>Pago: '+(p.fin==='financiado'?'Financiado a '+p.cuotas+' cuotas de '+cop(p.cuotaVal)+' ('+p.cuotaPagadas+'/'+p.cuotas+' pagadas)':'Contado')+'</small></div><b class="num" style="color:var(--mx-ink)">'+copM(p.prima)+'</b></div>';}).join('')+
      '<div class="mx-sec">Sugerencia de venta cruzada</div><div class="mx-note">Este cliente aún no tiene: '+sug.map(function(r){return code(r)+' '+ramoN(r);}).join(', ')+'.</div>';
    openDrawer(c.n,c.tipo+' · '+c.pols.length+' póliza(s)',b,'<a class="mx-btn mx-btn-wa" target="_blank" rel="noopener" href="'+waLink(c.tel,'Hola '+c.n.split(' ')[0]+', te saluda '+ASES[c.as]+' de Mateo Herrera Seguros.')+'">'+ico('wa')+'Escribir por WhatsApp</a><a class="mx-btn mx-btn-s" href="mailto:'+esc(c.email||'')+'">📧 Enviar correo</a>');
  }

  /* ---- Cotizaciones ---- */
  var cotEt=null;
  function renderCot(){
    var cnt=COT_ETAPAS.map(function(e,i){return COTIZ.filter(function(c){return c.et===i;}).length;});
    var F=COTIZ.filter(function(c){return cotEt===null||c.et===cotEt;});
    var apro=COTIZ.filter(function(c){return c.et===1;}).length;
    var h='<div class="mx-grid mx-g-kpi">'+kpi('Cotizaciones totales',COTIZ.length,'este periodo','doc',true)+kpi('Aprobadas',apro,pct(apro,COTIZ.length)+' del total','shield')+kpi('Rechazadas',cnt[2],'se pueden reactivar','alert')+'</div>';
    h+='<div class="mx-card mx-mb"><div class="mx-card-h"><div><h3>Estado de las cotizaciones</h3><p>Toca una etapa para filtrar.</p></div>'+(cotEt!==null?'<button class="mx-btn mx-btn-s mx-btn-sm" id="cClr">Ver todas</button>':'')+'</div><div id="cRail">'+rail(COT_ETAPAS,cnt,null,['#0F3E8C','#0E8A55','#C4372B'],null,cotEt,true)+'</div></div>';
    h+='<div class="mx-table-wrap"><table class="mx-table"><thead><tr><th>N.º</th><th>Cliente</th><th>Ramo</th><th>Estado</th><th>Aseguradoras</th><th>Financiación</th><th class="r">Mejor oferta</th><th>Asesor</th><th>Fecha</th></tr></thead><tbody>'+
      F.map(function(c){var bc=['b-info','b-ok','b-dan'][c.et];return '<tr class="click" data-cot="'+c.id+'"><td><b>'+c.id+'</b></td><td><b>'+esc(c.l.n)+'</b></td><td>'+code(c.l.ramo)+' '+ramoN(c.l.ramo)+'</td><td><span class="mx-badge '+bc+'"><i></i>'+COT_ETAPAS[c.et]+'</span></td><td>'+c.of.map(function(o){return o.a;}).join(', ')+'</td><td>'+c.fin+'</td><td class="r"><b>'+cop(c.of[0].v)+'</b><small>'+c.of[0].a+'</small></td><td>'+ASES[c.as]+'</td><td>'+fch(c.fecha)+'</td></tr>';}).join('')+'</tbody></table></div>';
    $('#vCot').innerHTML=h;
    $$('#cRail .mx-stage').forEach(function(b){b.addEventListener('click',function(){var i=+b.dataset.i;cotEt=(cotEt===i?null:i);renderCot();});});
    var cl=$('#cClr');if(cl)cl.addEventListener('click',function(){cotEt=null;renderCot();});
    $$('#vCot [data-cot]').forEach(function(tr){tr.addEventListener('click',function(){cotDrawer(tr.dataset.cot);});});
  }
  function cotDrawer(id){var c=COTIZ.filter(function(x){return x.id===id;})[0];var mx=c.of[c.of.length-1].v;
    var b='<div class="mx-sec">Estado</div>'+vsteps(COT_ETAPAS,c.et)+
      (c.et===2?'<div class="mx-note" style="color:var(--mx-dan)">El cliente rechazó la propuesta. Puedes reactivarla más adelante.</div>':'')+
      '<div class="mx-sec">Comparativo de aseguradoras</div>'+c.of.map(function(o,i){return '<div class="mx-hbar"><span>'+(i===0?'<b>'+o.a+'</b>':o.a)+'</span><span class="tr"><i style="width:'+(o.v/mx*100)+'%;'+(i===0?'':'background:var(--mx-ink-3);opacity:.45')+'"></i></span><b>'+cop(o.v)+'</b></div>';}).join('')+
      '<div class="mx-note">La mejor oferta ('+c.of[0].a+') ahorra '+cop(mx-c.of[0].v)+' frente a la más costosa.</div>'+
      '<dl class="mx-dl"><dt>Cliente</dt><dd>'+esc(c.l.n)+'</dd><dt>Ramo</dt><dd>'+ramoN(c.l.ramo)+'</dd><dt>Financiación</dt><dd>'+c.fin+'</dd><dt>Asesor</dt><dd>'+ASES[c.as]+'</dd><dt>Fecha</dt><dd>'+fchL(c.fecha)+'</dd></dl>'+
      '<div class="mx-note">📎 La subida de PDFs de cotización estará disponible al conectar Supabase.</div>'+
      '<label class="mx-field"><span>Cambiar estado</span><select class="mx-select" id="drCotEt">'+COT_ETAPAS.map(function(e,i){return '<option value="'+i+'"'+(i===c.et?' selected':'')+'>'+e+'</option>';}).join('')+'</select></label>';
    openDrawer(c.id,esc(c.l.n)+' · '+COT_ETAPAS[c.et],b,'<a class="mx-btn mx-btn-wa" target="_blank" rel="noopener" href="'+waLink(c.l.tel,'Hola '+c.l.n.split(' ')[0]+', ya tengo tu cotización de '+ramoN(c.l.ramo).toLowerCase()+'. La mejor opción es '+c.of[0].a+' por '+cop(c.of[0].v)+' al año.')+'">'+ico('wa')+'Enviar al cliente</a>');
    $('#drCotEt').addEventListener('change',function(e){c.et=+e.target.value;sbUpdateCotizacion(c.id,COT_ETAPAS[c.et]);toast('Cotización '+c.id+' → '+COT_ETAPAS[c.et]);refreshAll();cotDrawer(id);});
  }

  /* ---- Renovaciones ---- */
  var renEt=null;
  function renderRen(){
    var cnt=REN_ETAPAS.map(function(e,i){return RENOV.filter(function(r){return r.et===i;}).length;});
    var F=RENOV.filter(function(r){return renEt===null||r.et===renEt;});
    var rojo=RENOV.filter(function(r){return r.p.dias<=15&&r.et<4;}),amb=RENOV.filter(function(r){return r.p.dias>15&&r.p.dias<=30&&r.et<4;}),azul=RENOV.filter(function(r){return r.p.dias>30&&r.et<4;});
    var h='<div class="mx-grid mx-g-kpi">'+kpi('Por renovar en 60 días',RENOV.filter(function(r){return r.et<4;}).length,copM(RENOV.reduce(function(a,r){return a+(r.et<4?r.p.prima:0);},0))+' en primas','refresh',true)+
      '<div class="mx-kpi"><div class="l"><span class="mx-badge b-dan"><i></i>≤ 15 días</span></div><div class="v">'+rojo.length+'</div><div class="s">urgentes</div></div>'+
      '<div class="mx-kpi"><div class="l"><span class="mx-badge b-warn"><i></i>16 a 30 días</span></div><div class="v">'+amb.length+'</div><div class="s">por vencer</div></div>'+
      '<div class="mx-kpi"><div class="l"><span class="mx-badge b-info"><i></i>31 a 60 días</span></div><div class="v">'+azul.length+'</div><div class="s">con tiempo</div></div></div>';
    h+='<div class="mx-card mx-mb"><div class="mx-card-h"><div><h3>Etapas de la renovación</h3><p>En seguros, conservar al cliente vale más que conseguir uno nuevo.</p></div>'+(renEt!==null?'<button class="mx-btn mx-btn-s mx-btn-sm" id="rClr">Ver todas</button>':'')+'</div><div id="rRail">'+rail(REN_ETAPAS,cnt,null,['#0C2266','#0F3E8C','#0869B8','#0395D6','#0E8A55'],null,renEt,true)+'</div></div>';
    h+='<div class="mx-table-wrap"><table class="mx-table"><thead><tr><th>Cliente</th><th>Póliza</th><th>Aseguradora</th><th>Vence</th><th>Semáforo</th><th>Etapa</th><th class="r">Prima</th><th>Acción</th></tr></thead><tbody>'+
      F.map(function(r,idx){var d=r.p.dias;var bc=d<0?'b-dan':(d<=15?'b-dan':(d<=30?'b-warn':'b-info'));var lb=d<0?'Vencida hace '+(-d)+' d':(d===0?'Vence hoy':d+' días');
        var msg='Hola '+r.cl.n.split(' ')[0]+', te saluda '+ASES[r.cl.as]+' de Mateo Herrera Seguros. Tu póliza de '+ramoN(r.p.ramo).toLowerCase()+' con '+r.p.aseg+' vence el '+fchL(r.p.vence)+'. ¿Te preparo la renovación?';
        return '<tr><td><b>'+esc(r.cl.n)+'</b><small>'+ASES[r.cl.as]+'</small></td><td>'+code(r.p.ramo)+' '+ramoN(r.p.ramo)+'<small>'+r.p.num+'</small></td><td>'+r.p.aseg+'</td><td>'+fchL(r.p.vence)+'</td><td><span class="mx-badge '+(r.et===4?'b-ok':bc)+'"><i></i>'+(r.et===4?'Renovada':lb)+'</span></td><td><select class="mx-select" data-ren="'+RENOV.indexOf(r)+'" style="padding:6px 8px;font-size:.78rem;min-width:170px">'+REN_ETAPAS.map(function(e,i){return '<option value="'+i+'"'+(i===r.et?' selected':'')+'>'+(i+1)+'. '+e+'</option>';}).join('')+'</select></td><td class="r"><b>'+cop(r.p.prima)+'</b></td><td><a class="mx-btn mx-btn-wa mx-btn-sm" target="_blank" rel="noopener" href="'+waLink(r.cl.tel,msg)+'">'+ico('wa')+'Avisar</a></td></tr>';}).join('')+'</tbody></table></div>';
    $('#vRen').innerHTML=h;
    $$('#rRail .mx-stage').forEach(function(b){b.addEventListener('click',function(){var i=+b.dataset.i;renEt=(renEt===i?null:i);renderRen();});});
    var cl=$('#rClr');if(cl)cl.addEventListener('click',function(){renEt=null;renderRen();});
    $$('#vRen [data-ren]').forEach(function(s){s.addEventListener('change',function(){RENOV[+s.dataset.ren].et=+s.value;toast('Renovación actualizada a «'+REN_ETAPAS[+s.value]+'»');refreshAll();});});
  }

  /* ---- Campañas Meta ---- */
  var metaFe=null;
  function spark(seedN,up){var pts=[],v=40;for(var i=0;i<14;i++){v+=Math.sin(i*1.3+seedN)*8+(up?2.2:-.5);pts.push(Math.max(6,Math.min(34,v/2)));}var s='';pts.forEach(function(y,i){s+=(i?'L':'M')+(i*(200/13)).toFixed(1)+' '+(36-y).toFixed(1);});return '<svg class="mx-spark" viewBox="0 0 200 36" preserveAspectRatio="none"><path d="'+s+'" fill="none" stroke="var(--mx-cyan)" stroke-width="2"/></svg>';}
  function renderMeta(){
    var t=calcMeta();var act=CAMP.filter(function(c){return c.st==='Activa'||c.st==='En aprendizaje';}).length;
    var h='<div class="mx-grid mx-g-kpi">'+kpi('Inversión del mes',copM(t.g),act+' campañas en circulación','money',true)+kpi('Personas alcanzadas',nf(t.alc),nf(t.imp)+' impresiones','users')+kpi('Conversaciones de WhatsApp',nf(t.conv),'costo promedio '+cop(t.g/Math.max(1,t.conv)),'chat')+kpi('Pólizas atribuidas',t.pol,pct(t.pol,t.conv)+' de las conversaciones','shield')+kpi('Retorno sobre la inversión',(t.pri/Math.max(1,t.g)).toLocaleString('es-CO',{maximumFractionDigits:1})+'x',copM(t.pri)+' en primas generadas','trend')+'</div>';
    // embudo
    var steps2=[['Impresiones','Veces que se mostró un anuncio',t.imp],['Alcance','Personas únicas',t.alc],['Clics al enlace','Abrieron WhatsApp o el formulario',t.cl],['Conversaciones','Chats iniciados con el asesor',t.conv],['Contactos calificados','Tienen necesidad real',Math.round(t.conv*.62)],['Cotizaciones','Se les envió propuesta',t.cot],['Pólizas pagadas','Clientes nuevos',t.pol]];
    var cols=['#0A1650','#0C2266','#0F3E8C','#0869B8','#0580C9','#0395D6','#00A7E8'];
    h+='<div class="mx-card mx-mb"><div class="mx-card-h"><div><h3>Embudo de Meta a póliza pagada</h3><p>Del anuncio al cliente: cada barra muestra cuántos pasan a la siguiente etapa.</p></div></div><div class="mx-funnel">'+
      steps2.map(function(s,i){var w=Math.max(8,Math.pow(s[2]/steps2[0][2],.28)*100);return '<div class="mx-fn"><div class="lb">'+s[0]+'<small>'+s[1]+'</small></div><div class="bar"><i style="width:'+w+'%;background:'+cols[i]+'">'+nf(s[2])+'</i></div><div class="pc">'+(i?'<b>'+pct(s[2],steps2[i-1][2])+'</b>de la anterior':'<b>100%</b>base')+'</div></div>';}).join('')+'</div></div>';
    // etapas del embudo publicitario
    h+='<div class="mx-card mx-mb"><div class="mx-card-h"><div><h3>Campañas por etapa del embudo</h3><p>Cada campaña cumple un papel distinto. Toca una para ver sus conjuntos de anuncios y su ciclo.</p></div><div class="mx-seg" id="mFe"><button data-f="" class="'+(metaFe===null?'on':'')+'">Todas</button>'+FUNNEL_ET.map(function(f,i){return '<button data-f="'+i+'" class="'+(metaFe===i?'on':'')+'">'+f[0]+'</button>';}).join('')+'</div></div><div class="mx-stagecols">'+
      FUNNEL_ET.map(function(f,i){if(metaFe!==null&&metaFe!==i)return '';var cs=CAMP.filter(function(c){return c.fe===i;});
        return '<div class="mx-sc"><div class="mx-sc-h"><span class="mx-code" style="background:'+cols[i*2]+'">'+(i+1)+'</span><b>'+f[0]+'</b><span class="ct">'+cs.length+'</span></div><p>'+f[1]+'</p>'+
          cs.map(function(c){return '<div class="mx-camp" data-camp="'+c.id+'"><div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">'+stBadge(c.st)+(c.ramo!=='VAR'?code(c.ramo):'<span class="mx-code" style="background:#475569">VAR</span>')+'</div><h4>'+esc(c.n)+'</h4><div class="o">'+c.obj+'</div>'+steps(CICLO.length,c.ci)+'<div class="mx-steps-lbl">Ciclo: '+CICLO[c.ci]+'</div>'+
            '<div class="mx-camp-m"><div>Gasto<b>'+copM(c.g)+'</b></div><div>Chats<b>'+nf(c.conv)+'</b></div><div>Pólizas<b>'+c.pol+'</b></div></div>'+(c.g?spark(c.id.charCodeAt(1),c.st==='Activa'):'')+'</div>';}).join('')+(cs.length?'':'<div class="mx-empty">Sin campañas en esta etapa</div>')+'</div>';}).join('')+'</div></div>';
    // tabla detallada
    h+='<div class="mx-card mx-mb"><div class="mx-card-h"><div><h3>Rendimiento por campaña</h3><p>Métricas del administrador de anuncios y resultado comercial en el pipeline</p></div></div><div class="mx-table-wrap"><table class="mx-table" style="min-width:1080px"><thead><tr><th>Campaña</th><th>Etapa</th><th>Estado</th><th class="r">Presupuesto/día</th><th class="r">Gasto</th><th class="r">Impresiones</th><th class="r">CTR</th><th class="r">CPM</th><th class="r">Chats</th><th class="r">Costo por chat</th><th class="r">Cotizaciones</th><th class="r">Pólizas</th><th class="r">Retorno</th></tr></thead><tbody>'+
      CAMP.map(function(c){return '<tr class="click" data-camp="'+c.id+'"><td><b>'+esc(c.n)+'</b><small>'+c.obj+'</small></td><td>'+FUNNEL_ET[c.fe][0]+'</td><td>'+stBadge(c.st)+'</td><td class="r">'+cop(c.pd)+'</td><td class="r"><b>'+cop(c.g)+'</b></td><td class="r">'+nf(c.imp)+'</td><td class="r">'+pct(c.cl,c.imp)+'</td><td class="r">'+(c.imp?cop(c.g/c.imp*1000):'—')+'</td><td class="r">'+nf(c.conv)+'</td><td class="r">'+(c.conv?cop(c.g/c.conv):'—')+'</td><td class="r">'+c.cot+'</td><td class="r"><b>'+c.pol+'</b></td><td class="r">'+(c.g?(c.pri/c.g).toLocaleString('es-CO',{maximumFractionDigits:1})+'x':'—')+'</td></tr>';}).join('')+
      '</tbody><tfoot><tr><td><b>Total</b></td><td></td><td></td><td class="r">'+cop(CAMP.reduce(function(a,c){return a+(c.st==='Activa'||c.st==='En aprendizaje'?c.pd:0);},0))+'</td><td class="r"><b>'+cop(t.g)+'</b></td><td class="r">'+nf(t.imp)+'</td><td class="r">'+pct(t.cl,t.imp)+'</td><td class="r">'+cop(t.g/t.imp*1000)+'</td><td class="r">'+nf(t.conv)+'</td><td class="r">'+cop(t.g/t.conv)+'</td><td class="r">'+t.cot+'</td><td class="r"><b>'+t.pol+'</b></td><td class="r">'+(t.pri/t.g).toLocaleString('es-CO',{maximumFractionDigits:1})+'x</td></tr></tfoot></table></div></div>';
    // ciclo + checklist
    var cicloCnt=CICLO.map(function(e,i){return CAMP.filter(function(c){return c.ci===i;}).length;});
    h+='<div class="mx-grid mx-g-2e"><div class="mx-card"><div class="mx-card-h"><div><h3>Ciclo de vida de las campañas</h3><p>En qué fase está cada campaña, de la planeación al cierre</p></div></div>'+rail(CICLO,cicloCnt,null,['#0A1650','#0C2266','#0F3E8C','#0869B8','#0580C9','#00A7E8','#8A94AD'])+'</div>';
    var CK=[['ok','Píxel y conjunto de datos','Instalado en el sitio web; mide visitas y clics a WhatsApp.'],['ok','Número de WhatsApp Business conectado','310 864 6019 vinculado a la página de Facebook.'],['warn','API de conversiones','Pendiente: envía a Meta los contactos que se convierten en póliza.'],['warn','Categoría especial de anuncios','Revisa si aplica «servicios financieros»: limita la segmentación por edad, género y ubicación.'],['ok','Públicos personalizados','Chats de 30 días y visitantes del sitio para remarketing.'],['warn','Pruebas A/B de creativos','Sugerido: probar video testimonio contra carrusel en Auto.']];
    h+='<div class="mx-card"><div class="mx-card-h"><div><h3>Lista de control de Meta</h3><p>Configuración que sostiene la medición</p></div></div>'+CK.map(function(k){return '<div class="mx-check"><i style="background:var(--mx-'+k[0]+'-bg);color:var(--mx-'+k[0]+')">'+(k[0]==='ok'?'✓':'!')+'</i><div><b>'+k[1]+'</b>'+k[2]+'</div></div>';}).join('')+'</div></div>';
    $('#vMeta').innerHTML=h;
    $$('#mFe button').forEach(function(b){b.addEventListener('click',function(){metaFe=b.dataset.f===''?null:+b.dataset.f;renderMeta();});});
    $$('#vMeta [data-camp]').forEach(function(el){el.addEventListener('click',function(){campDrawer(el.dataset.camp);});});
  }
  function campDrawer(id){var c=CAMP.filter(function(x){return x.id===id;})[0];
    var sets=[{n:'Público principal',p:.62},{n:c.fe===3?'Públicos similares':'Intereses ampliados',p:.38}];
    var ads=[c.fmt.split('+')[0].trim(),'Versión B · texto corto','Historia 9:16'];
    var b='<div class="mx-sec">Ciclo de la campaña</div>'+vsteps(CICLO,c.ci)+
      '<dl class="mx-dl"><dt>Etapa del embudo</dt><dd>'+FUNNEL_ET[c.fe][0]+'</dd><dt>Objetivo en Meta</dt><dd>'+c.obj+'</dd><dt>Público</dt><dd>'+c.pub+'</dd><dt>Formato</dt><dd>'+c.fmt+'</dd><dt>Presupuesto diario</dt><dd>'+cop(c.pd)+'</dd><dt>Estado</dt><dd>'+stBadge(c.st)+'</dd></dl>'+
      '<div class="mx-sec">Conjuntos de anuncios</div>'+(c.g?sets.map(function(s,i){return '<div class="mx-note"><b style="color:var(--mx-ink)">'+s.n+'</b><br><small>Gasto '+cop(c.g*s.p)+' · '+nf(c.conv*s.p)+' chats · costo por chat '+cop(c.g/Math.max(1,c.conv))+'</small><div style="margin-top:8px">'+ads.slice(0,i?2:3).map(function(a){return '<span class="mx-badge b-info" style="margin:0 4px 4px 0">'+a+'</span>';}).join('')+'</div></div>';}).join(''):'<div class="mx-note">La campaña aún no está publicada. Sigue la etapa «'+CICLO[c.ci]+'».</div>')+
      '<div class="mx-sec">Resultado comercial</div><dl class="mx-dl"><dt>Conversaciones</dt><dd>'+nf(c.conv)+'</dd><dt>Cotizaciones</dt><dd>'+c.cot+'</dd><dt>Pólizas pagadas</dt><dd>'+c.pol+'</dd><dt>Primas generadas</dt><dd>'+cop(c.pri)+'</dd><dt>Retorno</dt><dd>'+(c.g?(c.pri/c.g).toLocaleString('es-CO',{maximumFractionDigits:1})+'x':'—')+'</dd></dl>';
    openDrawer(c.n,FUNNEL_ET[c.fe][0]+' · '+c.obj,b,'<button class="mx-btn mx-btn-s" data-camp-link="'+c.id+'">'+ico('link')+'Crear enlace de WhatsApp</button><button class="mx-btn mx-btn-p" data-camp-leads="'+esc(c.n)+'">Ver sus contactos en el pipeline</button>');
    $('[data-camp-link]').addEventListener('click',function(){closeDrawer();cw.step=0;cw.obj=null;go('camp');});
    $('[data-camp-leads]').addEventListener('click',function(){closeDrawer();pipeState.q=c.n;pipeState.et=null;go('pipe');});
  }

  /* ---- Cartera y finanzas ---- */
  function renderCart(){
    var alDia=PAGOS.filter(function(p){return p.pagado;});
    var porCobrar=PAGOS.filter(function(p){return !p.pagado&&p.dias>=0;});
    var vencidas=PAGOS.filter(function(p){return !p.pagado&&p.dias<0;});
    var totalPorCobrar=porCobrar.reduce(function(a,p){return a+p.val;},0);
    var totalVencida=vencidas.reduce(function(a,p){return a+p.val;},0);
    var prox15=PAGOS.filter(function(p){return !p.pagado&&p.dias>=0&&p.dias<=15;});
    var h='<div class="mx-grid mx-g-kpi">'+
      kpi('Cartera al día',alDia.length+' cuotas',copM(alDia.reduce(function(a,p){return a+p.val;},0))+' recaudado','money',true)+
      kpi('Por cobrar',porCobrar.length+' cuotas',copM(totalPorCobrar),'clock')+
      kpi('Cartera vencida',vencidas.length+' cuotas',copM(totalVencida)+' pendientes','alert')+
      kpi('Próximos 15 días',prox15.length+' pagos','requieren recordatorio','refresh')+'</div>';
    // próximos pagos
    h+='<div class="mx-card mx-mb"><div class="mx-card-h"><div><h3>💰 Próximos pagos financiados</h3><p>Cuotas que vencen pronto. Envía recordatorio por WhatsApp o correo.</p></div></div><div class="mx-table-wrap"><table class="mx-table"><thead><tr><th>Cliente</th><th>Póliza</th><th>Cuota</th><th>Vence</th><th>Semáforo</th><th class="r">Valor</th><th>Acciones</th></tr></thead><tbody>'+
      PAGOS.filter(function(p){return !p.pagado;}).slice(0,20).map(function(p,idx){
        var d=p.dias;var bc=d<0?'b-dan':(d<=7?'b-warn':'b-info');var lb=d<0?'Vencida hace '+(-d)+' d':(d===0?'Vence hoy':d+' días');
        var msgWa='Hola '+p.cl.n.split(' ')[0]+', te recordamos que tu cuota '+p.cuota+'/'+p.total+' de '+ramoN(p.p.ramo).toLowerCase()+' por '+cop(p.val)+' vence el '+fchL(p.vence)+'. ¿Necesitas ayuda con el pago?\n\n_Mateo Herrera Seguros_ 📞 3108646019';
        var msgMail='Recordatorio de pago - Cuota '+p.cuota+'/'+p.total+' de '+ramoN(p.p.ramo)+' por '+cop(p.val)+' - Mateo Herrera Seguros';
        return '<tr><td><b>'+esc(p.cl.n)+'</b></td><td>'+code(p.p.ramo)+' '+ramoN(p.p.ramo)+'</td><td>'+p.cuota+' de '+p.total+'</td><td>'+fchL(p.vence)+'</td><td><span class="mx-badge '+bc+'"><i></i>'+lb+'</span></td><td class="r"><b>'+cop(p.val)+'</b></td><td style="display:flex;gap:4px;flex-wrap:wrap"><a class="mx-btn mx-btn-wa mx-btn-sm" target="_blank" rel="noopener" href="'+waLink(p.cl.tel,msgWa)+'">'+ico('wa')+'</a><a class="mx-btn mx-btn-s mx-btn-sm" href="mailto:'+esc(p.cl.email||'')+'?subject='+encodeURIComponent(msgMail)+'">📧</a><button class="mx-btn mx-btn-s mx-btn-sm" data-pago="'+PAGOS.indexOf(p)+'">✅ Pagó</button></td></tr>';}).join('')+'</tbody></table></div></div>';
    // cumpleaños próximos
    var hoy=HOY.getMonth()*100+HOY.getDate();
    var cumps=CLIENTES.filter(function(c){return c.nac;}).map(function(c){var d=c.nac.getMonth()*100+c.nac.getDate();var diff=d-hoy;if(diff<-30)diff+=1200;return {cl:c,diff:diff,fecha:c.nac};}).filter(function(x){return x.diff>=0&&x.diff<=60;}).sort(function(a,b){return a.diff-b.diff;});
    h+='<div class="mx-card"><div class="mx-card-h"><div><h3>🎂 Cumpleaños próximos</h3><p>Usa la sección de campañas para enviar felicitaciones personalizadas con imagen.</p></div></div>';
    if(cumps.length){h+='<div class="mx-table-wrap"><table class="mx-table"><thead><tr><th>Cliente</th><th>Cumpleaños</th><th>Faltan</th><th>Celular</th><th>Correo</th></tr></thead><tbody>'+
      cumps.slice(0,15).map(function(x){var d=x.diff<3;return '<tr><td><b>'+esc(x.cl.n)+'</b></td><td>'+x.fecha.toLocaleDateString('es-CO',{day:'2-digit',month:'long'})+'</td><td><span class="mx-badge '+(d?'b-warn':'b-info')+'"><i></i>'+(x.diff===0?'¡Hoy!':x.diff+' días')+'</span></td><td>'+x.cl.tel.replace(/^57/,'')+'</td><td>'+esc(x.cl.email||'—')+'</td></tr>';}).join('')+'</tbody></table></div>';}
    else h+='<div class="mx-empty">No hay cumpleaños en los próximos 60 días.</div>';
    h+='</div>';
    $('#vCart').innerHTML=h;
    $$('#vCart [data-pago]').forEach(function(b){b.addEventListener('click',function(){var _pg=PAGOS[+b.dataset.pago];_pg.pagado=true;sbMarkPago(_pg);toast('Cuota marcada como pagada');refreshAll();});});
  }

  /* ---- Campañas WhatsApp (wizard) ---- */
  var cw={step:0,obj:null,aud:null,audFilter:'',msg:'',sent:{}};
  var CW_OBJ=[
    {id:'renov',e:'🔄',t:'Aviso de renovación',d:'Pólizas próximas a vencer'},
    {id:'promo',e:'🎉',t:'Promoción u oferta',d:'Descuentos o combos especiales'},
    {id:'nuevo',e:'✨',t:'Producto o ramo nuevo',d:'Anunciar un seguro recién agregado'},
    {id:'recup',e:'🔁',t:'Recuperar clientes',d:'Reactivar a quien no ha comprado'},
    {id:'cumple',e:'🎂',t:'Feliz cumpleaños',d:'Felicitar a clientes que cumplen años'},
    {id:'pago',e:'💰',t:'Recordatorio de pago',d:'Aviso de cuota próxima a vencer'},
    {id:'fecha',e:'🎁',t:'Fecha especial',d:'Navidad, Día de la Madre, aniversarios'},
    {id:'estado',e:'🔧',t:'Estado de póliza',d:'Avisar que la póliza está lista'},
    {id:'libre',e:'✍️',t:'Mensaje personalizado',d:'Tú escribes todo desde cero'}
  ];
  var CW_AUD=[
    {id:'todos',e:'👥',t:'Todos los clientes',d:'Toda tu base de datos',f:function(){return CLIENTES;}},
    {id:'nuevos',e:'🌱',t:'Clientes nuevos',d:'Ingresaron en los últimos 30 días',f:function(){return CLIENTES.filter(function(c){return c.desde>=2025;});}},
    {id:'antiguos',e:'🕰️',t:'Clientes antiguos',d:'Sin póliza nueva hace más de 1 año',f:function(){return CLIENTES.filter(function(c){return c.desde<2024;});}},
    {id:'mejores',e:'⭐',t:'Mejores clientes',d:'Los que más primas tienen',f:function(){return CLIENTES.slice().sort(function(a,b){return b.pols.reduce(function(s,p){return s+p.prima;},0)-a.pols.reduce(function(s,p){return s+p.prima;},0);}).slice(0,10);}},
    {id:'empresa',e:'🏢',t:'Empresas',d:'Clientes tipo empresa o PJ',f:function(){return CLIENTES.filter(function(c){return c.tipo==='Empresa';});}},
    {id:'persona',e:'👤',t:'Personas naturales',d:'Clientes personas naturales',f:function(){return CLIENTES.filter(function(c){return c.tipo!=='Empresa';});}},
    {id:'vencer',e:'🔴',t:'Póliza por vencer',d:'Vence en menos de 30 días',f:function(){return CLIENTES.filter(function(c){return c.pols.some(function(p){return p.dias>=0&&p.dias<=30;});});}},
    {id:'vencida',e:'⚠️',t:'Póliza vencida',d:'Ya venció y no renovó',f:function(){return CLIENTES.filter(function(c){return c.pols.some(function(p){return p.dias<0;});});}},
    {id:'ramo',e:'🛡️',t:'Por ramo contratado',d:'Quien tiene cierto ramo',f:function(){if(!cw.audFilter)return [];return CLIENTES.filter(function(c){return c.pols.some(function(p){return p.ramo===cw.audFilter;});});}},
    {id:'cumple',e:'🎂',t:'Cumpleaños este mes',d:'Clientes que cumplen años pronto',f:function(){var hoy=HOY.getMonth()*100+HOY.getDate();return CLIENTES.filter(function(c){if(!c.nac)return false;var d=c.nac.getMonth()*100+c.nac.getDate();var diff=d-hoy;if(diff<-30)diff+=1200;return diff>=0&&diff<=30;});}},
    {id:'asesor',e:'👨‍💼',t:'Por asesor',d:'Clientes de Mateo o Andrea',f:function(){return CLIENTES.filter(function(c){return !cw.audFilter||c.as===cw.audFilter;});}}
  ];
  var CW_TPL={
    renov:'¡Hola {nombre}! 🛡️\n\nTe recordamos que tu póliza de seguro está próxima a vencer.\n\n📋 No dejes que tu protección se interrumpa. Renovar es rápido y fácil.\n\n¿Te preparo la cotización de renovación?\n\n_Mateo Herrera Seguros_ 📞 3108646019',
    promo:'¡Hola {nombre}! 🎉\n\n¡Tenemos una promoción especial en seguros!\n\n🔥 Hasta un 15% de descuento en nuevas pólizas este mes.\n\n¿Quieres que te cotice?\n\n_Mateo Herrera Seguros_ 📞 3108646019',
    nuevo:'¡Hola {nombre}! ✨\n\n¡Llegó un nuevo producto a *Mateo Herrera Seguros*! 🎁\n\n🛡️ Ahora puedes proteger lo que más importa con coberturas ampliadas.\n\n¿Te cuento los detalles?\n\n_Mateo Herrera Seguros_ 📞 3108646019',
    recup:'¡Hola {nombre}! 👋\n\nHace un tiempo hablamos sobre tu seguro y queremos saber cómo estás.\n\n💙 Seguimos aquí para ayudarte a proteger lo que importa.\n\n¿Tienes un momento para conversar?\n\n_Mateo Herrera Seguros_ 📞 3108646019',
    fecha:'¡Hola {nombre}! 🎁\n\n¡Feliz día! En *Mateo Herrera Seguros* queremos celebrar contigo.\n\n🎉 Tenemos un detalle especial para nuestros clientes.\n\n¿Te gustaría conocerlo?\n\n_Mateo Herrera Seguros_ 📞 3108646019',
    estado:'¡Hola {nombre}! 📋\n\nTu póliza ya está lista.\n\n✅ Puedes contar con tu protección activa desde hoy.\n\nSi tienes alguna duda, estoy para ayudarte.\n\n_Mateo Herrera Seguros_ 📞 3108646019',
    cumple:'¡Hola {nombre}! 🎂\n\n¡Feliz cumpleaños! En *Mateo Herrera Seguros* queremos celebrar tu día especial. 🎉\n\nGracias por confiar en nosotros para proteger lo que más importa.\n\n¡Que sea un gran día!\n\n_Mateo Herrera Seguros_ 📞 3108646019',
    pago:'¡Hola {nombre}! 💰\n\nTe recordamos que tu cuota de seguro de {ramo} está próxima a vencer.\n\n📋 Pago puntual = protección continua.\n\n¿Necesitas ayuda con el pago o tienes alguna duda?\n\n_Mateo Herrera Seguros_ 📞 3108646019',
    libre:'¡Hola {nombre}! 🛡️\n\n\n\n_Mateo Herrera Seguros_ 📞 3108646019'
  };
  var CW_HIST=[];

  function cwContacts(){
    if(!cw.aud) return [];
    var a=CW_AUD.filter(function(x){return x.id===cw.aud;})[0];
    return a?a.f():[];
  }
  function cwPreview(msg,cli){
    var t=msg||'';
    t=t.replace(/\{nombre\}/g,cli?cli.n.split(' ')[0]:'Carlos');
    t=t.replace(/\{nombre_completo\}/g,cli?cli.n:'Carlos Ramírez');
    t=t.replace(/\{ramo\}/g,cli&&cli.pols[0]?ramoN(cli.pols[0].ramo):'Auto Todo Riesgo');
    t=t.replace(/\{aseguradora\}/g,cli&&cli.pols[0]?cli.pols[0].aseg:'Mapfre');
    t=t.replace(/\{asesor\}/g,cli?ASES[cli.as]:'Mateo Herrera');
    t=t.replace(/\{vencimiento\}/g,cli&&cli.pols[0]?fchL(cli.pols[0].vence):'28 sept 2026');
    t=t.replace(/\*([^*]+)\*/g,'<b>$1</b>');
    t=t.replace(/_([^_]+)_/g,'<i>$1</i>');
    return t;
  }

  function renderCamp(){
    var contacts=cwContacts();
    var envTotal=Object.keys(cw.sent).length;
    var h='<div class="mx-grid mx-g-kpi mx-mb">'+
      kpi('Campañas enviadas',CW_HIST.length,'histórico','mega',true)+
      kpi('Contactos disponibles',CLIENTES.length,'de '+CLIENTES.length+' clientes con teléfono','users')+
      kpi('Mensajes abiertos',CW_HIST.reduce(function(a,c){return a+c.env;},0),'chats lanzados desde aquí','chat')+
      kpi('WhatsApp del negocio','310 864 6019','se firma en los mensajes','wa')+'</div>';

    // wizard
    var steps=['Objetivo','Audiencia','Mensaje','Enviar'];
    h+='<div class="mx-card mx-mb"><div class="mx-card-h"><div><h3>🚀 Crear campaña</h3></div>'+(cw.step>0?'<button class="mx-btn mx-btn-s mx-btn-sm" id="cwReset">Empezar de nuevo</button>':'')+'</div>';
    h+='<div class="mx-wiz">';
    steps.forEach(function(s,i){
      var cls=i<cw.step?'done':(i===cw.step?'on':'');
      h+='<div class="mx-wiz-s '+cls+'" data-ws="'+i+'"><span class="num">'+(i<cw.step?'✓':(i+1))+'</span>'+s+'</div>';
    });
    h+='</div><div class="mx-wiz-body">';

    if(cw.step===0){
      h+='<p style="font-size:.86rem;color:var(--mx-ink-2);margin-bottom:14px;">¿De qué quieres crear la campaña?</p>';
      h+='<div class="mx-obj-grid">'+CW_OBJ.map(function(o){
        return '<div class="mx-obj'+(cw.obj===o.id?' sel':'')+'" data-obj="'+o.id+'"><span class="emo">'+o.e+'</span><b>'+o.t+'</b><small>'+o.d+'</small></div>';
      }).join('')+'</div>';
      if(cw.obj) h+='<div style="margin-top:16px;text-align:right;"><button class="mx-btn mx-btn-p" id="cwNext1">Siguiente: Audiencia →</button></div>';
    }
    else if(cw.step===1){
      h+='<p style="font-size:.86rem;color:var(--mx-ink-2);margin-bottom:14px;">¿A quién le vas a escribir?</p>';
      h+='<div class="mx-aud-grid">'+CW_AUD.map(function(a){
        var cnt=a.f().length;
        return '<div class="mx-aud'+(cw.aud===a.id?' sel':'')+'" data-aud="'+a.id+'"><span class="emo">'+a.e+'</span><b>'+a.t+'</b><small>'+a.d+'</small>'+(cnt?'<span class="ct">'+cnt+' contacto(s)</span>':'<span class="ct" style="color:var(--mx-ink-3)">0 contacto(s)</span>')+'</div>';
      }).join('')+'</div>';
      if(cw.aud==='ramo'){
        h+='<label class="mx-field"><span>Selecciona el ramo</span><select class="mx-select" id="cwRamoF"><option value="">— Elegir —</option>'+Object.keys(RAMOS).map(function(r){return '<option value="'+r+'"'+(cw.audFilter===r?' selected':'')+'>'+RAMOS[r][0]+'</option>';}).join('')+'</select></label>';
      }
      if(cw.aud==='asesor'){
        h+='<label class="mx-field"><span>Selecciona el asesor</span><select class="mx-select" id="cwAseF"><option value="">Todos</option><option value="M"'+(cw.audFilter==='M'?' selected':'')+'>Mateo Herrera</option><option value="A"'+(cw.audFilter==='A'?' selected':'')+'>Andrea</option></select></label>';
      }
      if(cw.aud&&contacts.length>0) h+='<div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap;"><button class="mx-btn mx-btn-s" id="cwPrev1">← Objetivo</button><button class="mx-btn mx-btn-p" id="cwNext2">Siguiente: Mensaje → ('+contacts.length+' contactos)</button></div>';
      else if(cw.aud) h+='<div style="margin-top:16px;"><button class="mx-btn mx-btn-s" id="cwPrev1">← Objetivo</button><span style="margin-left:12px;font-size:.84rem;color:var(--mx-warn);">No hay contactos en esta audiencia.</span></div>';
    }
    else if(cw.step===2){
      h+='<p style="font-size:.86rem;color:var(--mx-ink-2);margin-bottom:8px;">Mensaje de la campaña — usa <b>*asteriscos*</b> para negrilla en WhatsApp y las variables de abajo</p>';
      h+='<div class="mx-msg-grid"><div>';
      h+='<textarea class="mx-msg-area" id="cwMsg" rows="8">'+esc(cw.msg)+'</textarea>';
      h+='<div class="mx-vars">';
      [{v:'{nombre}',l:'👤 Nombre'},{v:'{nombre_completo}',l:'👥 Nombre completo'},{v:'{ramo}',l:'🛡️ Ramo'},{v:'{aseguradora}',l:'🏢 Aseguradora'},{v:'{asesor}',l:'👨‍💼 Asesor'},{v:'{vencimiento}',l:'📅 Vencimiento'}].forEach(function(x){
        h+='<button class="mx-var" data-var="'+x.v+'">'+x.l+'</button>';
      });
      h+='</div>';
      h+='<div class="mx-sec" style="margin-top:8px;">💡 Otras plantillas sugeridas</div>';
      CW_OBJ.filter(function(o){return o.id!==cw.obj;}).slice(0,4).forEach(function(o){
        h+='<div class="mx-tpl" data-tpl="'+o.id+'">'+o.e+' '+o.t+'</div>';
      });
      h+='</div><div><div class="mx-preview"><div class="mx-preview-h">👁️ <b>Vista previa</b></div><p style="font-size:.78rem;color:var(--mx-ink-3);margin-bottom:10px;">Así lo verá <b>'+(contacts[0]?contacts[0].n.split(' ')[0]:'el cliente')+'</b></p><div class="mx-bubble" id="cwBubble">'+cwPreview(cw.msg,contacts[0])+'</div><div style="margin-top:10px;background:var(--mx-info-bg);padding:10px 12px;border-radius:10px;font-size:.78rem;color:var(--mx-info);display:flex;gap:8px;align-items:center;">🎯 <span>'+contacts.length+' contacto(s) en '+((CW_AUD.filter(function(a){return a.id===cw.aud;})[0]||{}).t||'')+'</span></div></div></div></div>';
      h+='<div class="mx-note" style="margin-top:14px;">📷 <b>Adjuntar imagen:</b> <input type="file" accept="image/*" id="cwImg" style="font-size:.8rem;margin-left:8px;"><br><small style="color:var(--mx-ink-3)">La imagen se adjuntará a la campaña. La subida real requiere Supabase.</small></div>';
      h+='<div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap;"><button class="mx-btn mx-btn-s" id="cwPrev2">← Audiencia</button><button class="mx-btn mx-btn-p" id="cwNext3">Siguiente: Enviar →</button></div>';
    }
    else if(cw.step===3){
      h+='<div class="mx-send-banner">🚀 Toca <b>Enviar</b> en cada contacto: se abre WhatsApp con el mensaje ya escrito y personalizado. Marca el progreso automáticamente.</div>';
      h+='<div class="mx-prog"><div class="mx-prog-bar"><i style="width:'+(contacts.length?(envTotal/contacts.length*100):0)+'%"></i></div><span class="mx-prog-txt">'+envTotal+' de '+contacts.length+'</span></div>';
      h+='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;"><button class="mx-btn mx-btn-s" id="cwPrev3">← Editar mensaje</button><button class="mx-btn mx-btn-s" id="cwResetProg">Reiniciar</button><button class="mx-btn mx-btn-p" id="cwSave">💾 Guardar campaña</button></div>';
      h+='<div class="mx-card"><div class="mx-card-h"><div><h3>🎯 '+((CW_AUD.filter(function(a){return a.id===cw.aud;})[0]||{}).t||'Contactos')+'</h3></div><span style="font-size:.84rem;color:var(--mx-ink-3);">'+contacts.length+' contacto(s)</span></div>';
      contacts.forEach(function(cl){
        var ini=cl.n.split(' ').map(function(w){return w[0];}).slice(0,2).join('');
        var sent=cw.sent[cl.id];
        var msg=cwPreview(cw.msg,cl).replace(/<[^>]+>/g,'');
        var url=waLink(cl.tel,msg);
        h+='<div class="mx-contact"><div class="mx-av" style="font-size:.68rem;width:34px;height:34px;">'+ini+'</div><div class="info"><b>'+esc(cl.n)+'</b><small>'+cl.tel.replace(/^57/,'')+' · '+cl.tipo+'</small></div>';
        if(sent) h+='<span class="sent">✅ Enviado</span>';
        else h+='<a class="mx-btn mx-btn-wa mx-btn-sm" href="'+url+'" target="_blank" rel="noopener" data-send="'+cl.id+'">💬 Enviar</a>';
        h+='</div>';
      });
      h+='</div>';
    }
    h+='</div></div>';

    // historial
    h+='<div class="mx-card mx-hist-table"><div class="mx-card-h"><div><h3>📁 Campañas anteriores</h3></div></div><div class="mx-table-wrap"><table class="mx-table"><thead><tr><th>Fecha</th><th>Campaña</th><th>Audiencia</th><th class="r">Contactos</th><th class="r">Enviados</th></tr></thead><tbody>'+
      CW_HIST.map(function(c){return '<tr><td>'+c.fecha+'</td><td><b>'+esc(c.nombre)+'</b></td><td>'+c.aud+'</td><td class="r">'+c.cont+'</td><td class="r">'+c.env+'</td></tr>';}).join('')+
      '</tbody></table></div></div>';

    $('#vCamp').innerHTML=h;

    // events
    $$('.mx-wiz-s').forEach(function(s){s.addEventListener('click',function(){var i=+s.dataset.ws;if(i<cw.step){cw.step=i;renderCamp();}});});
    var rst=$('#cwReset');if(rst)rst.addEventListener('click',function(){cw={step:0,obj:null,aud:null,audFilter:'',msg:'',sent:{}};renderCamp();});
    $$('.mx-obj').forEach(function(o){o.addEventListener('click',function(){cw.obj=o.dataset.obj;if(!cw.msg||cw.msg===CW_TPL[cw.obj]||Object.values(CW_TPL).indexOf(cw.msg)>-1)cw.msg=CW_TPL[cw.obj]||CW_TPL.libre;renderCamp();});});
    var n1=$('#cwNext1');if(n1)n1.addEventListener('click',function(){cw.step=1;renderCamp();});
    $$('.mx-aud').forEach(function(a){a.addEventListener('click',function(){cw.aud=a.dataset.aud;cw.audFilter='';renderCamp();});});
    var rf=$('#cwRamoF');if(rf)rf.addEventListener('change',function(){cw.audFilter=rf.value;renderCamp();});
    var af=$('#cwAseF');if(af)af.addEventListener('change',function(){cw.audFilter=af.value;renderCamp();});
    var p1=$('#cwPrev1');if(p1)p1.addEventListener('click',function(){cw.step=0;renderCamp();});
    var n2=$('#cwNext2');if(n2)n2.addEventListener('click',function(){if(!cw.msg||Object.values(CW_TPL).indexOf(cw.msg)<0)cw.msg=CW_TPL[cw.obj]||CW_TPL.libre;cw.step=2;renderCamp();});
    var p2=$('#cwPrev2');if(p2)p2.addEventListener('click',function(){cw.step=1;renderCamp();});
    var n3=$('#cwNext3');if(n3)n3.addEventListener('click',function(){cw.msg=$('#cwMsg').value;cw.step=3;renderCamp();});
    var p3=$('#cwPrev3');if(p3)p3.addEventListener('click',function(){cw.step=2;renderCamp();});
    $$('.mx-var').forEach(function(v){v.addEventListener('click',function(){var ta=$('#cwMsg');if(!ta)return;var pos=ta.selectionStart||ta.value.length;var val=ta.value;ta.value=val.slice(0,pos)+v.dataset.var+val.slice(pos);ta.focus();ta.setSelectionRange(pos+v.dataset.var.length,pos+v.dataset.var.length);updatePreview();});});
    $$('.mx-tpl').forEach(function(t){t.addEventListener('click',function(){cw.msg=CW_TPL[t.dataset.tpl]||CW_TPL.libre;cw.obj=t.dataset.tpl;renderCamp();});});
    var ta=$('#cwMsg');if(ta){ta.addEventListener('input',updatePreview);updatePreview();}
    function updatePreview(){var b=$('#cwBubble');if(b&&ta)b.innerHTML=cwPreview(ta.value,contacts[0]);}
    $$('[data-send]').forEach(function(a){a.addEventListener('click',function(){cw.sent[a.dataset.send]=true;setTimeout(function(){renderCamp();},300);});});
    var rp=$('#cwResetProg');if(rp)rp.addEventListener('click',function(){cw.sent={};renderCamp();});
    var sv=$('#cwSave');if(sv)sv.addEventListener('click',function(){var obj=CW_OBJ.filter(function(o){return o.id===cw.obj;})[0];CW_HIST.unshift({fecha:fch(HOY),nombre:(obj?obj.t:'Campaña')+' · '+fch(HOY),aud:(CW_AUD.filter(function(a){return a.id===cw.aud;})[0]||{}).t||'Manual',cont:contacts.length,env:envTotal});sbSaveCampaign({nombre:CW_HIST[0].nombre,objetivo:cw.obj||'',audiencia:CW_HIST[0].aud,mensaje:cw.msg,contactos:contacts.length,enviados:envTotal});cw={step:0,obj:null,aud:null,audFilter:'',msg:'',sent:{}};toast('Campaña guardada en Supabase');renderCamp();});
  }

  /* ---- Configuración ---- */
  function renderConf(){
    var h='<div class="mx-grid mx-g-2e mx-mb"><div class="mx-card"><div class="mx-card-h"><div><h3>Equipo</h3><p>Personas con acceso al portal</p></div></div>'+
      '<div class="mx-alert"><span class="mx-av">MH</span><div><b>Mateo Herrera Puentes</b><p>Administrador · ve todo el negocio</p></div><span class="mx-badge b-ok" style="margin-left:auto"><i></i>Activo</span></div>'+
      '<div class="mx-alert"><span class="mx-av" style="background:linear-gradient(135deg,#7C3AED,#EC4899)">AN</span><div><b>Andrea</b><p>Asesora comercial · ve sus clientes y su pipeline</p></div><span class="mx-badge b-ok" style="margin-left:auto"><i></i>Activa</span></div></div>'+
      '<div class="mx-card"><div class="mx-card-h"><div><h3>Estado de la plataforma</h3><p>Lo que falta para trabajar con datos reales</p></div></div>'+
      '<div class="mx-check"><i style="background:var(--mx-warn-bg);color:var(--mx-warn)">!</i><div><b>Inicio de sesión</b>Hoy es de demostración (la clave está en el código). Se reemplaza por usuarios reales con Supabase.</div></div>'+
      '<div class="mx-check"><i style="background:var(--mx-warn-bg);color:var(--mx-warn)">!</i><div><b>Base de datos compartida</b>Necesita la Project URL y la anon key de Supabase para que Mateo y Andrea vean la misma información.</div></div>'+
      '<div class="mx-check"><i style="background:var(--mx-warn-bg);color:var(--mx-warn)">!</i><div><b>Datos de clientes reales</b>No los cargues hasta activar el acceso seguro (Ley 1581 de 2012).</div></div>'+
      '<div class="mx-check"><i style="background:var(--mx-ok-bg);color:var(--mx-ok)">✓</i><div><b>Catálogo de ramos</b>'+Object.keys(RAMOS).length+' unidades de negocio configuradas como filtros del pipeline.</div></div></div></div>';
    h+='<div class="mx-grid mx-g-3"><div class="mx-card"><div class="mx-card-h"><div><h3>Etapas del pipeline</h3></div></div>'+vsteps(ETAPAS,99)+'</div><div class="mx-card"><div class="mx-card-h"><div><h3>Etapas de cotización</h3></div></div>'+vsteps(COT_ETAPAS,99)+'</div><div class="mx-card"><div class="mx-card-h"><div><h3>Etapas de renovación y campañas</h3></div></div>'+vsteps(REN_ETAPAS,99)+'<div class="mx-sec" style="margin-top:6px">Ciclo de campañas Meta</div>'+vsteps(CICLO,99)+'</div></div>';
    $('#vConf').innerHTML=h;
  }

  /* ================= NAVEGACIÓN ================= */
  var TIT={dash:['Resumen','Cómo va el negocio hoy'],pipe:['Pipeline de ventas','9 etapas, del primer contacto a la venta cruzada'],cli:['Clientes','Cartera de clientes y sus pólizas'],cot:['Cotizaciones','Comparativo entre aseguradoras y su avance'],ren:['Renovaciones','Pólizas que vencen en los próximos 60 días'],cart:['Cartera y finanzas','Cuotas financiadas, próximos pagos y cumpleaños'],camp:['Campañas WhatsApp','Crea, personaliza y envía campañas a tus clientes'],conf:['Configuración','Equipo, etapas y estado de la plataforma']};
  var RENDER={dash:renderDash,pipe:renderPipe,cli:renderCli,cot:renderCot,ren:renderRen,cart:renderCart,camp:renderCamp,conf:renderConf};
  var cur='dash';
  function go(v){cur=v;$$('.mx-nav-i').forEach(function(b){b.classList.toggle('on',b.dataset.v===v);});$$('.mx-view').forEach(function(s){s.classList.toggle('on',s.dataset.v===v);});
    $('#mxTitle').textContent=TIT[v][0];$('#mxSub').textContent=TIT[v][1]+' · '+HOY.toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long'});
    RENDER[v]();bindGo();$('#mxScroll').scrollTop=0;$('#mxSide').classList.remove('open');if(!$('#mxDrawer').classList.contains('on'))$('#mxScrim').classList.remove('on');
    try{sessionStorage.setItem('mxView',v);}catch(e){}}
  function bindGo(){$$('[data-go]').forEach(function(b){if(b._g)return;b._g=1;b.addEventListener('click',function(){go(b.dataset.go);});});}
  function counts(){$('#ctPipe').textContent=LEADS.filter(function(l){return l.et<6;}).length;$('#ctCli').textContent=CLIENTES.length;$('#ctCot').textContent=COTIZ.filter(function(c){return c.et<4;}).length;$('#ctRen').textContent=RENOV.filter(function(r){return r.p.dias<=30&&r.et<4;}).length;try{$('#ctCart').textContent=PAGOS.filter(function(p){return p.dias<=15&&!p.pagado;}).length;}catch(e){}try{$('#ctCamp').textContent=CLIENTES.length;}catch(e){}}
  function refreshAll(){counts();RENDER[cur]();bindGo();}

  $$('.mx-nav-i').forEach(function(b){b.addEventListener('click',function(){go(b.dataset.v);});});
  $('#mxBurger').addEventListener('click',function(){$('#mxSide').classList.add('open');$('#mxScrim').classList.add('on');});
  $('#mxScrim').addEventListener('click',function(){$('#mxSide').classList.remove('open');closeDrawer();$('#mxScrim').classList.remove('on');});
  $('#mxDrX').addEventListener('click',closeDrawer);
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&document.body.classList.contains('adm-mode'))closeDrawer();});
  function toSite(){if(typeof window.goPage==='function')window.goPage('inicio');else location.hash='#inicio';}
  $$('[data-mx-site]').forEach(function(b){b.addEventListener('click',toSite);});

  // tema
  function themeIcon(){var d=document.body.classList.contains('dark');var s=$('#mxTheme span');s.innerHTML=ico(d?'sun':'moon');}
  $('#mxTheme').addEventListener('click',function(){var tb=document.getElementById('temaBtn');if(tb)tb.click();else document.body.classList.toggle('dark');themeIcon();});

  // logos (se reutiliza el del encabezado, sin duplicar la imagen en el archivo)
  var hl=document.querySelector('.hdr-logo img');if(hl){$('#mxBrandLogo').src=hl.src;$('#mxLoginLogo').src=hl.src;}

  // login
  function entrar(){var u=$('#mxUser').value.trim(),p=$('#mxPass').value.trim();
    if(u===CLAVE&&p===CLAVE){$('#mxErr').classList.remove('on');abrirApp();try{sessionStorage.setItem('mxAdm','1');}catch(e){}}
    else{$('#mxErr').classList.add('on');$('#mxPass').value='';$('#mxPass').focus();}}
  var iniciado=false;
  function abrirApp(){$('#mxLogin').style.display='none';$('#mxApp').classList.add('on');if(!iniciado){genData();iniciado=true;}counts();var v='dash';try{v=sessionStorage.getItem('mxView')||'dash';}catch(e){}go(RENDER[v]?v:'dash');}
  $('#mxEntrar').addEventListener('click',entrar);
  ['mxUser','mxPass'].forEach(function(id){$('#'+id).addEventListener('keydown',function(e){if(e.key==='Enter')entrar();});});
  $('#mxSalir').addEventListener('click',function(){try{sessionStorage.removeItem('mxAdm');}catch(e){}$('#mxApp').classList.remove('on');$('#mxLogin').style.display='';$('#mxUser').value='';$('#mxPass').value='';toSite();});

  paintIcons(root);themeIcon();
  try{if(sessionStorage.getItem('mxAdm')==='1')abrirApp();}catch(e){}
  window.mxThemeIcon=themeIcon;
})();
