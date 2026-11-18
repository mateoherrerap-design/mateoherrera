
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
