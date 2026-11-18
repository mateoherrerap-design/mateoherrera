
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
