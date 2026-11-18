
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
