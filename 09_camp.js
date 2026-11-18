
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
