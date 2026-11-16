/* PeopleX site search palette. Brand Method, 13 Nov 2026. Plain ES5, one IIFE, no libraries.
   Opens from [data-search-open] (an optional attribute value prefills the query), "/" and Cmd+K / Ctrl+K.
   The index is read from the live DOM at every open:
     1. section[data-section] with an h2 (the hero uses its h1), target the section
     2. details.fq-it, title from the summary, opening a result opens the question
     3. [data-search] with data-search (title), data-search-group, data-search-text (keywords),
        optional data-search-desc (the line under the title), data-search-action="click"
     4. .sv-it service tabs, clicked after the scroll
   Public: window.PXSearch.open(query?), window.PXSearch.close() */
(function(){
'use strict';
var D=document,W=window,H=D.documentElement;
if(W.PXSearch)return;

var GROUPS=['Sections','App','Services','Questions'];
/* 13 Nov review pass: wheel guard and scrollbar gutter while open, focus kept in the input, data-kw keywords, filtered
   questions indexed, hidden copy left out, focus follows the visitor to the result, the phone menu closes on a result. */
var CHIPS=['EPF','PCB','Leave','Claims','Payslip','Employer of Record','Free consultation'];
var MAXG=8,SNIP=110,HIT_MS=2200;
var WORD=/[0-9a-z\u00c0-\u024f]+/gi;
var INLINE={B:1,STRONG:1,EM:1,I:1,SPAN:1,A:1,SMALL:1,MARK:1,SUP:1,SUB:1,ABBR:1,U:1,S:1,OUTPUT:1,TIME:1,CODE:1,Q:1,CITE:1};
var SKIPTAG={SCRIPT:1,STYLE:1,TEMPLATE:1,NOSCRIPT:1,VIDEO:1,AUDIO:1,CANVAS:1,IFRAME:1,svg:1,SVG:1,INPUT:1,SELECT:1,TEXTAREA:1};

var root,panel,field,input,body,list,emptyEl,noneEl,noneQ,foot,countEl,live,closeBtn;
var isOpen=false,opener=null,items=[],shown=[],active=-1,prevOverflow='',settleOff=null,hideT=0,liveT=0,lastPt='',hitEl=null,hitT=0,hitWash=null;
var downIn=false,lastPT='mouse',tfEl=null;
var QMAX=60;

function RM(){return !!((W.matchMedia&&W.matchMedia('(prefers-reduced-motion: reduce)').matches)||H.classList.contains('still'))}
function $$(s,c){return [].slice.call((c||D).querySelectorAll(s))}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function clean(s){return String(s||'').replace(/\s*\u0001[\s\u0001]*/g,'\u0001').replace(/^\u0001|\u0001$/g,'').replace(/([A-Za-z)])\u0001(?=[A-Z])/g,'$1. ').replace(/\u0001/g,' ').replace(/\s+/g,' ').replace(/\s+([,.;:?!)%])/g,'$1').replace(/\(\s+/g,'(').replace(/([,.;:?])(?=[A-Za-z])/g,'$1 ').trim()}
function words(s){return String(s||'').toLowerCase().match(WORD)||[]}
function inPalette(el){return !!(root&&root.contains(el))}
function rendered(el){return !!(el&&el.getClientRects&&el.getClientRects().length)}

/* text of a subtree; block boundaries become a period between two phrases (clean() decides), decorative and skipped subtrees are left out */
function isBlock(n){
  if(!INLINE[n.tagName])return true;
  var d='';try{d=W.getComputedStyle(n).display}catch(e){}
  return !!d&&d.indexOf('inline')<0&&d!=='contents'&&d!=='none';
}
function textOf(el,skip,labels){
  var out=[];
  (function walk(n){
    if(n.nodeType===3){out.push(n.nodeValue);return}
    if(n.nodeType!==1)return;
    var t=n.tagName;
    if(SKIPTAG[t])return;
    if(n!==el&&n.hidden&&!rendered(n))return; /* copy the visitor cannot see (a success message, an empty filter note); hidden panes that still render stay */
    if(skip&&n!==el&&skip(n))return;
    if(t==='BR'){out.push(' ');return}
    var blk=n!==el&&isBlock(n);
    out.push(blk?'\u0001':' ');
    if(labels&&n!==el){var al=n.getAttribute('aria-label');if(al&&!/^(A|BUTTON)$/.test(t)&&!/^(tablist|tab|toolbar|menu|menubar|listbox|radiogroup)$/.test(n.getAttribute('role')||''))out.push(' '+al+' ')}
    for(var c=n.firstChild;c;c=c.nextSibling)walk(c);
    out.push(blk?'\u0001':' ');
  })(el);
  return clean(out.join(''));
}

/* ---------- icons ---------- */
function svg(d,cls){return '<svg class="'+(cls||'')+'" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+d+'</svg>'}
var IC={
  search:'<circle cx="10.75" cy="10.75" r="6.25"/><path d="M15.5 15.5l5 5"/>',
  close:'<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  arrow:'<path d="M5 12h14M13.5 6.5L19 12l-5.5 5.5"/>',
  go:'<path d="M19 5.5V12a3 3 0 0 1-3 3H6"/><path d="M10 11l-4 4 4 4"/>',
  Sections:'<path d="M9.5 4L7.5 20M16.5 4l-2 16M5 9h15M4 15h15"/>',
  App:'<rect x="6.5" y="2.75" width="11" height="18.5" rx="2.25"/><path d="M10.5 18h3"/>',
  Services:'<rect x="3.5" y="7" width="17" height="12.5" rx="1.5"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3.5 12.5h17"/>',
  Questions:'<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.6a2.5 2.5 0 0 1 4.85.85c0 1.65-2.45 2.2-2.45 3.65"/><path d="M12 17.1h.01"/>'
};

/* ---------- index, built from the live DOM ---------- */
function build(){
  var out=[],seen=[],n=0;
  function has(el){return seen.indexOf(el)>-1}
  function sectionOf(el){var s=el.closest?el.closest('[data-section]'):null;return s?s.getAttribute('data-section'):''}
  function add(o){
    if(!o.title||!o.el||has(o.el))return;
    o.order=n++;o.tw=words(o.title);o.xw=words(o.text);o.sec=sectionOf(o.el);
    out.push(o);seen.push(o.el);
  }
  function skipBase(el){return el.closest&&(el.closest('.bmws')||inPalette(el))}

  /* 3. anything marked [data-search] (explicit marks win over the automatic ones) */
  $$('[data-search]').forEach(function(el){
    if(skipBase(el)||!rendered(el))return;
    var own=textOf(el);
    var kw=clean(el.getAttribute('data-search-text')||'');
    var desc=clean(el.getAttribute('data-search-desc')||'');
    var title=clean(el.getAttribute('data-search')||'')||own;
    add({title:title,text:clean([desc,kw,own].join(' ')),snip:desc||kw||own,
      group:clean(el.getAttribute('data-search-group')||'')||'App',el:el,
      action:el.getAttribute('data-search-action')==='click'?'click':''});
  });

  /* 4. services */
  $$('.sv-it').forEach(function(el){
    if(skipBase(el)||!rendered(el))return;
    var t=el.querySelector('.sv-t'),d=el.querySelector('.sv-d');
    var title=t?textOf(t):textOf(el),desc=d?textOf(d):'';
    add({title:title,text:desc,snip:desc,group:'Services',el:el,action:'click'});
  });

  /* 2. questions, also the ones the FAQ filter has hidden (goTo clears the filter); data-kw adds the page's own keywords */
  $$('details.fq-it').forEach(function(el){
    if(skipBase(el)||!(el.hidden||rendered(el)))return;
    var s=el.querySelector('summary');if(!s)return;
    var a=textOf(el,function(x){return x===s});
    add({title:textOf(s),text:clean(a+' '+(el.getAttribute('data-kw')||'')),snip:a,group:'Questions',el:el,action:''});
  });

  /* 1. sections */
  $$('section[data-section]').forEach(function(el){
    if(skipBase(el)||has(el))return;
    var h=el.querySelector('h2')||el.querySelector('h1');if(!h)return;
    var tx=textOf(el,function(x){
      return x===h||has(x)||x.tagName==='BUTTON'||x.getAttribute('aria-hidden')==='true'||x.hasAttribute('data-search-open');
    },true);
    var lede=el.querySelector('.lede,.hero-lede');
    add({title:textOf(h),text:tx,snip:tx,lede:lede?textOf(lede):'',group:'Sections',el:el,action:''});
  });
  return out;
}

/* ---------- matching ---------- */
function tokens(q){var t=words(q),o=[];t.forEach(function(x){if(o.indexOf(x)<0)o.push(x)});return o}
function pre(ws,t){var best=0;for(var i=0;i<ws.length;i++){if(ws[i].lastIndexOf(t,0)===0){if(ws[i].length===t.length)return 2;best=1}}return best}
function score(it,tk){
  var inT=0,ex=0;
  for(var i=0;i<tk.length;i++){
    var a=pre(it.tw,tk[i]);
    if(a){inT++;ex+=a===2?2:1;continue}
    var b=pre(it.xw,tk[i]);
    if(!b)return null;
    ex+=b===2?.5:.25;
  }
  return {tier:inT===tk.length?0:(inT?1:2),s:inT*10+ex};
}
function groupRank(g){var i=GROUPS.indexOf(g);return i<0?GROUPS.length:i}
function search(q){
  var tk=tokens(q),byG={},order=[];
  if(!tk.length)return {tk:tk,groups:[]};
  items.forEach(function(it){
    var r=score(it,tk);if(!r)return;
    it.r=r;
    if(!byG[it.group]){byG[it.group]=[];order.push(it.group)}
    byG[it.group].push(it);
  });
  var groups=order.map(function(g,fi){
    var a=byG[g].sort(function(x,y){return x.r.tier-y.r.tier||y.r.s-x.r.s||x.order-y.order}).slice(0,MAXG);
    return {name:g,items:a,best:a[0].r.tier,rank:groupRank(g),first:fi};
  });
  groups.sort(function(x,y){return x.best-y.best||x.rank-y.rank||x.first-y.first});
  return {tk:tk,groups:groups};
}

/* wrap the matched prefix of every word in <mark> */
function mark(s,tk){
  s=String(s||'');if(!tk.length)return esc(s);
  var re=new RegExp(WORD.source,'gi'),out='',last=0,m;
  while((m=re.exec(s))){
    var lw=m[0].toLowerCase(),best=0;
    for(var i=0;i<tk.length;i++){if(tk[i].length>best&&lw.lastIndexOf(tk[i],0)===0)best=tk[i].length}
    if(best){out+=esc(s.slice(last,m.index))+'<mark>'+esc(m[0].slice(0,best))+'</mark>';last=m.index+best}
  }
  return out+esc(s.slice(last));
}
/* where the snippet centres: the first whole word hit, else the first prefix hit */
function firstHit(s,tk){
  var re=new RegExp(WORD.source,'gi'),m,pre=-1;
  while((m=re.exec(s))){
    var lw=m[0].toLowerCase();
    for(var i=0;i<tk.length;i++){if(lw.lastIndexOf(tk[i],0)===0){if(lw.length===tk[i].length)return m.index;if(pre<0)pre=m.index}}
  }
  return pre;
}
/* up to SNIP characters (ellipses included) around the first hit */
function snippet(src,tk){
  src=clean(src);if(!src)return '';
  if(src.length<=SNIP)return src;
  var pos=tk.length?firstHit(src,tk):-1,start=0,end;
  if(pos>34){start=src.lastIndexOf(' ',pos-26);start=start<0?0:start+1}
  var room=SNIP-(start>0?1:0);
  if(start+room>=src.length){
    end=src.length;room=SNIP-1;start=Math.max(0,end-room);
    var sp=src.indexOf(' ',start);if(start>0&&sp>-1&&(pos<0||sp<pos))start=sp+1;
  }else{
    room-=1;end=start+room;
    var ep=src.lastIndexOf(' ',end);if(ep>start+40)end=ep;
  }
  var cut=src.slice(start,end);if(end<src.length)cut=cut.replace(/[\s,;:.]+$/,'');
  return (start>0?'\u2026':'')+cut+(end<src.length?'\u2026':'');
}

/* ---------- DOM ---------- */
function chipsHTML(){return CHIPS.map(function(c){return '<button type="button" class="pxs-chip" data-q="'+esc(c)+'">'+esc(c)+'</button>'}).join('')}
function mount(){
  root=D.createElement('div');
  root.className='pxs';root.id='pxs';root.hidden=true;
  root.setAttribute('data-lenis-prevent','');
  root.innerHTML=
    '<div class="pxs-scrim" aria-hidden="true"></div>'+
    '<div class="pxs-panel" role="dialog" aria-modal="true" aria-labelledby="pxs-title">'+
      '<h2 class="pxs-sr" id="pxs-title">Search the PeopleX page</h2>'+
      '<div class="pxs-head"><div class="pxs-field">'+svg(IC.search,'pxs-gl')+
        '<input class="pxs-in" id="pxs-input" type="text" role="combobox" aria-expanded="false" aria-controls="pxs-list" aria-autocomplete="list" aria-describedby="pxs-help" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="go" placeholder="What are you looking for?">'+
        '<button type="button" class="pxs-x" aria-label="Close search">'+svg(IC.close)+'</button>'+
      '</div></div>'+
      '<div class="pxs-body">'+
        '<div class="pxs-empty"><p>Search sections, the app, our services and common questions.</p><div class="pxs-chips">'+chipsHTML()+'</div></div>'+
        '<div class="pxs-list" id="pxs-list" role="listbox" aria-label="Results"></div>'+
        '<div class="pxs-none" hidden><p class="pxs-none-t">No match for <b class="pxs-none-q"></b>. Ask our team instead.</p>'+
          '<a class="pxs-btn" href="#contact"><span>Talk to our team</span>'+svg(IC.arrow)+'</a>'+
          '<p class="pxs-none-or">Or try a popular topic.</p><div class="pxs-chips">'+chipsHTML()+'</div></div>'+
      '</div>'+
      '<div class="pxs-foot"><span class="pxs-keys" id="pxs-help"><span><kbd>\u2191</kbd><kbd>\u2193</kbd>to move</span><span><kbd>Enter</kbd>to open</span><span><kbd>Esc</kbd>to close</span></span><span class="pxs-count" aria-hidden="true"></span></div>'+
      '<div class="pxs-sr" role="status" aria-live="polite"></div>'+
    '</div>';
  D.body.appendChild(root);
  panel=root.querySelector('.pxs-panel');field=root.querySelector('.pxs-field');input=root.querySelector('.pxs-in');
  body=root.querySelector('.pxs-body');list=root.querySelector('.pxs-list');emptyEl=root.querySelector('.pxs-empty');
  noneEl=root.querySelector('.pxs-none');noneQ=root.querySelector('.pxs-none-q');foot=root.querySelector('.pxs-foot');
  countEl=root.querySelector('.pxs-count');live=root.querySelector('[role="status"]');closeBtn=root.querySelector('.pxs-x');

  input.addEventListener('input',render);
  input.addEventListener('keydown',onInputKey);
  panel.addEventListener('keydown',onPanelKey);
  closeBtn.addEventListener('click',function(){close()});
  root.addEventListener('click',function(e){
    var t=e.target,started=downIn;
    downIn=false;
    if(!panel.contains(t)){if(!started)close();return}
    var chip=t.closest?t.closest('.pxs-chip'):null;
    if(chip){input.value=chip.getAttribute('data-q');render();focusInput();return}
    var opt=t.closest?t.closest('.pxs-opt'):null;
    if(opt){goTo(+opt.getAttribute('data-k'));return}
    if(t.closest&&t.closest('.pxs-btn')){close(false)} /* the page's own link handler scrolls to #contact */
  });
  list.addEventListener('pointermove',function(e){
    var p=e.clientX+','+e.clientY;if(p===lastPt)return;lastPt=p;
    var opt=e.target.closest?e.target.closest('.pxs-opt'):null;
    if(opt){var k=+opt.getAttribute('data-k');if(k!==active)setActive(k,true)}
  });
}

function setActive(k,fromPointer){
  var prev=list.querySelector('.pxs-act');
  if(prev){prev.classList.remove('pxs-act');prev.setAttribute('aria-selected','false')}
  active=k;
  var el=k>=0?D.getElementById('pxs-o'+k):null;
  if(!el){active=-1;input.removeAttribute('aria-activedescendant');return}
  el.classList.add('pxs-act');el.setAttribute('aria-selected','true');
  input.setAttribute('aria-activedescendant',el.id);
  if(fromPointer)return;
  if(k===0){body.scrollTop=0;return}
  var br=body.getBoundingClientRect(),or=el.getBoundingClientRect(),pad=8;
  if(or.top<br.top+pad)body.scrollTop-=(br.top+pad-or.top);
  else if(or.bottom>br.bottom-pad)body.scrollTop+=(or.bottom-(br.bottom-pad));
}

/* emptied first, so the same count after a new query ("ep", then "epf") is read again */
function announce(msg){clearTimeout(liveT);live.textContent='';liveT=setTimeout(function(){live.textContent=msg},250)}

function optHTML(it,k,tk,withSnip){
  var sn='';
  if(withSnip){
    var src=it.snip;
    if(it.r&&it.r.tier===0&&it.lede&&firstHit(it.lede,tk)<0)src=it.lede;
    sn=snippet(src,tk);
  }
  return '<div class="pxs-opt" role="option" id="pxs-o'+k+'" aria-selected="false" data-k="'+k+'" data-pxs-group="'+esc(it.group)+'" data-pxs-section="'+esc(it.sec)+'">'+
    '<span class="pxs-ic" aria-hidden="true">'+svg(IC[it.group]||IC.arrow)+'</span>'+
    '<span class="pxs-tx"><span class="pxs-t">'+mark(it.title,tk)+'</span>'+(sn?'<span class="pxs-s">'+mark(sn,tk)+'</span>':'')+'</span>'+
    '<span class="pxs-go" aria-hidden="true">'+svg(IC.go)+'</span></div>';
}
function render(){
  /* a query of punctuation or another script has no tokens: it is still a query, so it gets the no match state */
  var q=input.value,res=search(q),tk=res.tk,html='',k=0,hasQ=q.replace(/\s+/g,'')!=='';
  shown=[];
  if(hasQ){
    res.groups.forEach(function(g,gi){
      html+='<div class="pxs-grp" role="group" aria-labelledby="pxs-g'+gi+'"><div class="pxs-gh" id="pxs-g'+gi+'">'+esc(g.name)+'</div>';
      g.items.forEach(function(it){html+=optHTML(it,k,tk,true);shown.push(it);k++});
      html+='</div>';
    });
  }else{
    /* before typing: the chips, then every section as a quick jump */
    var secs=items.filter(function(it){return it.group==='Sections'});
    if(secs.length){
      html+='<div class="pxs-grp pxs-jump" role="group" aria-labelledby="pxs-gj"><div class="pxs-gh" id="pxs-gj">Jump to a section</div>';
      secs.forEach(function(it){html+=optHTML(it,k,tk,false);shown.push(it);k++});
      html+='</div>';
    }
  }
  list.innerHTML=html;
  body.scrollTop=0;
  var n=shown.length;
  list.classList.toggle('pxs-list-jump',!hasQ);
  emptyEl.hidden=hasQ;
  list.hidden=!n;
  noneEl.hidden=!(hasQ&&!n);
  if(hasQ&&!n){var cq=clean(q);if(cq.length>QMAX)cq=cq.slice(0,QMAX-1).replace(/\s+$/,'')+'\u2026';noneQ.textContent='\u201c'+cq+'\u201d'}
  input.setAttribute('aria-expanded',String(n>0));
  countEl.textContent=hasQ?(n===1?'1 result':n+' results'):'';
  setActive(hasQ&&n?0:-1);
  announce(hasQ?(n?(n===1?'1 result':n+' results'):'No results'):'');
}

/* ---------- open and close ---------- */
function focusInput(){try{input.focus({preventScroll:true})}catch(e){input.focus()}}
/* overflow hidden stops native scrolling, not a script driven smooth scroll (Lenis) listening for the wheel on window:
   while open, a wheel anywhere outside the results list is cancelled before it reaches one (pinch zoom, ctrl+wheel, is left alone) */
function onWheel(e){
  if(e.ctrlKey)return;
  var t=e.target;
  if(t&&t.nodeType===1&&body.contains(t))return;
  if(e.cancelable)e.preventDefault();
  e.stopPropagation();
}
/* a press on a part of the panel that cannot take focus (the glyph, a group name, the foot), or on the admin bar,
   would move focus to body and typing would go nowhere: keep it in the input. Mouse and pen only; a tap on a phone may close the keyboard. */
/* also where the press started: a drag that starts in the panel and ends on the scrim (selecting the query) does not close */
function onPointerType(e){lastPT=e.pointerType||'mouse';downIn=!!(isOpen&&panel&&e.target&&panel.contains(e.target))}
function onMouseDown(e){
  if(!isOpen||lastPT==='touch'||e.button!==0)return;
  var t=e.target;
  if(!t||t.nodeType!==1)return;
  if(panel.contains(t)){
    if(t.closest('input,textarea,select,button,a[href],label'))return;
    if(t===body&&e.offsetX>=body.clientWidth)return; /* its scrollbar */
    e.preventDefault();
  }else if(!root.contains(t))e.preventDefault();
}
function open(q,from){
  if(!root)mount();
  clearTimeout(hideT);
  if(!isOpen){
    var a=D.activeElement;
    opener=from||(a&&a!==D.body&&!inPalette(a)?a:null);
    isOpen=true;
    items=build();
    var sbw=W.innerWidth-H.clientWidth;
    prevOverflow=H.style.overflow;
    H.style.overflow='hidden';H.classList.add('pxs-lock');
    if(sbw>0)H.classList.add('pxs-gut'); /* a scrollbar that takes space: search.css keeps its gutter, so nothing moves sideways */
    W.addEventListener('wheel',onWheel,{capture:true,passive:false});
    root.hidden=false;
    void root.offsetWidth;
    root.classList.add('pxs-on');
  }
  input.setAttribute('placeholder',W.innerWidth<480?'Search the page':'What are you looking for?');
  input.value=typeof q==='string'?q:'';
  render();
  focusInput();
  var L=input.value.length;try{input.setSelectionRange(L,L)}catch(e){}
}
function close(ret){
  if(!isOpen)return;
  isOpen=false;
  root.classList.remove('pxs-on');
  H.style.overflow=prevOverflow;H.classList.remove('pxs-lock');H.classList.remove('pxs-gut');
  W.removeEventListener('wheel',onWheel,{capture:true});
  input.removeAttribute('aria-activedescendant');
  var f=ret===false?null:(ret||opener);
  opener=null;
  if(f&&f.focus&&D.contains(f)){try{f.focus({preventScroll:true})}catch(e){f.focus()}}
  else if(ret!==false&&D.activeElement&&inPalette(D.activeElement))D.activeElement.blur();
  hideT=setTimeout(function(){if(!isOpen)root.hidden=true},RM()?0:280);
}

/* ---------- opening a result ---------- */
function barH(){var v=parseFloat(W.getComputedStyle(H).getPropertyValue('--bmx-bar'));return isNaN(v)?66:v}
function navH(){var n=D.getElementById('nav');return n&&n.offsetHeight?n.offsetHeight:76}
/* a reveal (.rv not yet .in) holds its element 28 px low for a moment; measure where it will rest */
function revealShift(el){
  var dy=0;
  for(var n=el;n&&n!==D.body;n=n.parentElement){
    if(n.classList&&n.classList.contains('rv')&&!n.classList.contains('in')){
      var m=(W.getComputedStyle(n).transform||'').match(/matrix(3d)?\(([^)]+)\)/);
      if(m){var v=m[2].split(',');dy+=parseFloat(m[1]?v[13]:v[5])||0}
    }
  }
  return dy;
}
/* reveal a target that has not scrolled into view yet, without its entrance, so it is measured where it will rest
   (it is off screen, so nobody sees the entrance skipped) */
function settleReveal(el){
  if(!H.classList.contains('io'))return;
  var list=[];
  for(var n=el;n&&n!==D.body;n=n.parentElement){if(n.classList&&n.classList.contains('rv')&&!n.classList.contains('in'))list.push(n)}
  if(!list.length)return;
  var saved=list.map(function(n){return n.style.transitionDelay});
  list.forEach(function(n){n.style.transition='none';n.classList.add('in')});
  void el.offsetWidth;
  W.requestAnimationFrame(function(){list.forEach(function(n,i){n.style.transition='';if(saved[i])n.style.transitionDelay=saved[i]})});
}
function scrollToTarget(el){
  var off=barH()+navH(),r=el.getBoundingClientRect(),rTop=r.top-revealShift(el);
  if(typeof W.__pxScrollTo==='function'){try{W.__pxScrollTo(el)}catch(e){}}
  else{
    var gap=el.tagName==='SECTION'?0:20;
    var top=Math.max(0,rTop+(W.pageYOffset||0)-off-gap);
    try{W.scrollTo({top:top,behavior:RM()?'auto':'smooth'})}catch(e){W.scrollTo(0,top)}
  }
  return Math.abs(rTop-off);
}
function collapseOthers(el){
  /* close the other open questions at once, so the target does not move while we travel to it */
  $$('details.fq-it[open]').forEach(function(o){
    if(o===el)return;
    var kids=[].slice.call(o.children);
    kids.forEach(function(c){c.style.transition='none'});
    o.open=false;void o.offsetHeight;
    W.requestAnimationFrame(function(){kids.forEach(function(c){c.style.transition=''})});
  });
}
/* Questions open on arrival: opening one makes the page re-measure its pinned sections 520 ms later, which stops a
   native smooth scroll short, and an answer growing mid trip moves the page under the scroll. So travel first, open
   when the scroll rests, then check the landing once more (at most twice, never after the visitor scrolls). */
/* one trip at a time: a new result cancels the previous trip's watch (its interval and its three listeners) without opening its question */
function cancelSettle(){if(settleOff){var f=settleOff;settleOff=null;f()}}
function settle(el,onRest){
  cancelSettle();
  var iv=0,last=-1,still=0,tries=0,t0=Date.now(),rested=!onRest;
  function off(){clearInterval(iv);W.removeEventListener('wheel',stop,true);W.removeEventListener('touchstart',stop,true);W.removeEventListener('keydown',stop,true)}
  function stop(){
    if(settleOff===off)settleOff=null;
    off();
    if(!rested){rested=true;onRest()} /* the visitor took over: still open the question */
  }
  W.addEventListener('wheel',stop,true);W.addEventListener('touchstart',stop,true);W.addEventListener('keydown',stop,true);
  settleOff=off;
  iv=setInterval(function(){
    var y=W.pageYOffset||0,t=Date.now()-t0;
    still=Math.abs(y-last)<1?still+1:0;last=y;
    if(!rested){
      if((still>=2&&t>280)||t>2200){rested=true;still=0;onRest()}
      return;
    }
    if(t>6000){stop();return}
    if(still<3)return;
    var want=barH()+navH()+20,top=el.getBoundingClientRect().top-revealShift(el),maxY=H.scrollHeight-W.innerHeight;
    var off=top-want;
    if(Math.abs(off)>48&&!(off>0&&y>=maxY-2)&&!(off<0&&y<=0)&&tries<2){tries++;still=0;scrollToTarget(el)}
    else stop();
  },100);
}
/* focus follows the visitor to the result: a question's summary, a control itself, else the section heading (or the target)
   made focusable for the moment with tabindex -1, which goes again on blur */
function clearTf(){if(tfEl){tfEl.removeEventListener('blur',clearTf);tfEl.removeAttribute('tabindex');tfEl.classList.remove('pxs-tf');tfEl=null}}
function focusFor(el){
  if(el.tagName==='DETAILS')return el.querySelector('summary');
  if(el.matches&&el.matches('a[href],button,input,select,textarea,[tabindex]'))return el;
  var h=el.tagName==='SECTION'?(el.querySelector('h2')||el.querySelector('h1')):null,f=h||el;
  if(f.matches('a[href],button,input,select,textarea,[tabindex]'))return f;
  clearTf();
  f.setAttribute('tabindex','-1');f.classList.add('pxs-tf');f.addEventListener('blur',clearTf);tfEl=f;
  return f;
}
/* a result inside the mobile menu's page, or hidden by the FAQ filter, needs the page put back first */
function closeMenu(){var s=D.getElementById('sheet'),bg=D.getElementById('burger');if(s&&!s.hidden&&bg){try{bg.click()}catch(e){}}}
function unfilter(el){
  if(!el.hidden)return;
  var sec=el.closest('[data-section]')||D;
  $$('input[type="search"]',sec).forEach(function(f){
    if(!f.value)return;
    f.value='';
    var ev;try{ev=new Event('input',{bubbles:true})}catch(e){ev=D.createEvent('Event');ev.initEvent('input',true,false)}
    f.dispatchEvent(ev);
  });
  if(el.hidden)el.hidden=false;
}
function goTo(k){
  var it=shown[k];if(!it)return;
  var el=it.el,back=opener;
  close(false);
  cancelSettle();
  closeMenu();
  unfilter(el);
  if(el.tagName==='DETAILS')collapseOthers(el);
  W.requestAnimationFrame(function(){
    settleReveal(el);
    var dist=scrollToTarget(el);
    if(it.action==='click'){try{el.click()}catch(e){}}
    else if(el.tagName==='DETAILS')settle(el,function(){if(!el.open)el.open=true});
    hit(el,dist);
    var f=focusFor(el)||back;
    if(f&&f.focus){try{f.focus({preventScroll:true})}catch(e){}}
  });
}

/* a soft yellow wash on the target for 2.2 s (opacity only) */
function clearHit(){
  clearTimeout(hitT);
  if(hitEl){hitEl.classList.remove('px-hit');hitEl.classList.remove('pxs-alt');hitEl.classList.remove('pxs-rel');hitEl.style.removeProperty('--pxs-hd')}
  if(hitWash&&hitWash.parentNode)hitWash.parentNode.removeChild(hitWash);
  hitEl=null;hitWash=null;
}
function hit(el,dist){
  clearHit();
  if(/^(INPUT|IMG|VIDEO|TEXTAREA|SELECT|CANVAS|IFRAME|BR|HR)$/.test(el.tagName))el=el.parentElement;
  if(!el)return;
  var cs=W.getComputedStyle(el),alt=false,after='none';
  try{after=W.getComputedStyle(el,'::after').getPropertyValue('content')}catch(e){}
  alt=!!(after&&after!=='none'&&after!=='normal');
  if(cs.position==='static')el.classList.add('pxs-rel');
  var delay=RM()||dist<48?0:620;
  el.style.setProperty('--pxs-hd',delay+'ms');
  if(alt){el.classList.add('pxs-alt');hitWash=D.createElement('span');hitWash.className='pxs-wash';hitWash.setAttribute('aria-hidden','true');el.appendChild(hitWash)}
  void el.offsetWidth;
  el.classList.add('px-hit');
  hitEl=el;
  hitT=setTimeout(clearHit,HIT_MS+delay);
}

/* ---------- keyboard ---------- */
function isField(t){return !!(t&&t.matches&&t.matches('input,textarea,select,[contenteditable]'))}
function onInputKey(e){
  if(e.isComposing)return;
  var n=shown.length,k=e.key;
  if(k==='ArrowDown'||k==='Down'){e.preventDefault();if(n)setActive(active<0?0:(active+1)%n)}
  else if(k==='ArrowUp'||k==='Up'){e.preventDefault();if(n)setActive(active<0?n-1:(active-1+n)%n)}
  else if(k==='Enter'){e.preventDefault();if(active>=0)goTo(active)}
}
function focusables(){
  return $$('input,button,a[href],[tabindex]:not([tabindex="-1"])',panel).filter(function(el){
    return !el.disabled&&!el.closest('[hidden]')&&rendered(el);
  });
}
function onPanelKey(e){
  if(e.key==='Tab'){
    var f=focusables();if(!f.length){e.preventDefault();return}
    var first=f[0],last=f[f.length-1],a=D.activeElement,i=f.indexOf(a);
    if(e.shiftKey&&(a===first||i<0)){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&(a===last||i<0)){e.preventDefault();first.focus()}
    return;
  }
  if((e.key==='k'||e.key==='K')&&(e.metaKey||e.ctrlKey)){e.preventDefault();focusInput();try{input.select()}catch(x){}}
}
D.addEventListener('keydown',function(e){
  var t=e.target,k=e.key;
  if(!k)return;
  if(isOpen){
    if(e.isComposing||e.keyCode===229)return; /* Escape cancels the IME composition, not the palette */
    if((k==='Escape'||k==='Esc')&&(inPalette(t)||!isField(t))){e.preventDefault();close()}
    return;
  }
  if(isField(t)||e.isComposing)return;
  if((k==='k'||k==='K')&&(e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey){e.preventDefault();open(undefined,t&&t.focus&&t!==D.body?t:null);return}
  if(k==='/'&&!e.metaKey&&!e.ctrlKey&&!e.altKey){e.preventDefault();open(undefined,t&&t.focus&&t!==D.body?t:null)}
});
/* keep focus inside while open */
D.addEventListener('focusin',function(e){if(isOpen&&!panel.contains(e.target))focusInput()});
D.addEventListener('pointerdown',onPointerType,true);
D.addEventListener('mousedown',onMouseDown,true);
/* openers */
D.addEventListener('click',function(e){
  if(isOpen&&e.target===H){var st=downIn;downIn=false;if(!st)close();return} /* the kept scrollbar gutter acts as part of the scrim */
  var t=e.target&&e.target.closest?e.target.closest('[data-search-open]'):null;
  if(!t||inPalette(t))return;
  e.preventDefault();
  var q=t.getAttribute('data-search-open');
  open(q?q:undefined,t);
});

W.PXSearch={
  open:function(q){open(typeof q==='string'?q:undefined)},
  close:function(){close()},
  isOpen:function(){return isOpen}
};
})();
