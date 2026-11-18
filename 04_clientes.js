
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
