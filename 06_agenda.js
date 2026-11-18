
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
