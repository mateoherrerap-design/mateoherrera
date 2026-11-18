
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
