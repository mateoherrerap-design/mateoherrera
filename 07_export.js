
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
