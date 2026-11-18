
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
