/* ═══════════════════════════════════════════════════════════════
   YACHT STYLE ARABIA · PROTOTYPE WEB 1 · behaviour
   Vanilla JS, no library. Each block is self contained, bails out
   quietly when its markup is absent, and never hides content that
   only a later trigger could show again.

   01 workspace bar height   02 language and direction
   03 header                 04 mobile menu
   05 reveal on scroll       06 count up
   07 hero reel              08 magazine covers
   09 chart places           10 forms (not connected)
   11 mobile action bar      12 filters (section page)
   13 films                  14 demo ribbon
   15 ambient films          16 search
   18 parallax                19 yacht on the chart
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var doc=document, root=doc.documentElement;
  var RM=window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s,c){return (c||doc).querySelector(s)}
  function $$(s,c){return Array.prototype.slice.call((c||doc).querySelectorAll(s))}

  /* 01 · the Brand Method bar is sticky above the site: keep its height in --bmws-h */
  (function(){
    var bar=$('.bmws');
    if(!bar){root.style.setProperty('--bmws-h','0px');return;}
    function fit(){root.style.setProperty('--bmws-h',(Math.round(bar.getBoundingClientRect().height)||0)+'px');}
    fit();
    if(window.ResizeObserver) new ResizeObserver(fit).observe(bar);
    addEventListener('resize',fit); addEventListener('load',fit);
  })();

  /* 02 · LANGUAGE. English lives in the markup; Arabic rides on data-ar (text or inline markup),
          data-ar-placeholder, data-ar-aria-label and data-ar-alt. One switch flips <html lang dir>. */
  var I18N={
    formMsg:{en:'Prototype: this form is not connected yet. Nothing was sent.',ar:'نموذج أولي: هذا النموذج غير مفعّل بعد، ولم يُرسل أي شيء.'},
    issue:{en:'Issue',ar:'العدد'}
  };
  var lang='en';
  function t(k){return I18N[k][lang]||I18N[k].en}
  function setLang(next,store){
    lang=(next==='ar')?'ar':'en';
    root.lang=lang; root.dir=(lang==='ar')?'rtl':'ltr';
    $$('[data-ar]').forEach(function(el){
      if(el._en===undefined) el._en=el.innerHTML;
      el.innerHTML=(lang==='ar')?el.getAttribute('data-ar'):el._en;
    });
    [['placeholder','data-ar-placeholder'],['aria-label','data-ar-aria-label'],['alt','data-ar-alt'],['title','data-ar-title']].forEach(function(p){
      $$('['+p[1]+']').forEach(function(el){
        var key='_en_'+p[0];
        if(el[key]===undefined) el[key]=el.getAttribute(p[0])||'';
        el.setAttribute(p[0],(lang==='ar')?el.getAttribute(p[1]):el[key]);
      });
    });
    var ta=root.getAttribute('data-title-ar');
    if(ta){ if(root._enTitle===undefined) root._enTitle=doc.title; doc.title=(lang==='ar')?ta:root._enTitle; }
    $$('[data-lang]').forEach(function(b){b.setAttribute('aria-pressed',String(b.getAttribute('data-lang')===lang));});
    /* carry the choice across the prototype pages */
    $$('a[data-keep-lang]').forEach(function(a){
      var h=a.getAttribute('href').replace(/([?&])lang=ar(&|$)/,'$1').replace(/[?&]$/,'');
      if(lang==='ar'){var i=h.indexOf('#'), base=i<0?h:h.slice(0,i), hash=i<0?'':h.slice(i); h=base+(base.indexOf('?')<0?'?':'&')+'lang=ar'+hash;}
      a.setAttribute('href',h);
    });
    if(store){try{localStorage.setItem('ysaLang',lang)}catch(e){}}
    window.dispatchEvent(new Event('ysa:lang'));
  }
  (function(){
    var want='en';
    try{ want=localStorage.getItem('ysaLang')||'en'; }catch(e){}
    var m=/[?&]lang=(ar|en)\b/.exec(location.search); if(m) want=m[1];
    $$('[data-lang]').forEach(function(b){b.addEventListener('click',function(){setLang(b.getAttribute('data-lang'),true);});});
    if(want==='ar') setLang('ar',false);
  })();

  /* 03 · HEADER. Clear over the cover, light once the page moves, away on the way down, back on the way up. */
  (function(){
    var hd=$('#ysaHd'); if(!hd) return;
    var fixedSolid=hd.classList.contains('ysa-hd--solid'), last=window.scrollY, tick=false;
    function run(){
      tick=false;
      var y=window.scrollY, menuOpen=$('#ysaMenu.open')||($('#ysaFind')&&!$('#ysaFind').hidden);
      if(!fixedSolid) hd.classList.toggle('is-solid',y>24||!!menuOpen);
      if(!menuOpen){
        if(y>120 && y>last+4) hd.classList.add('is-hidden');
        else if(y<last-6||y<=120) hd.classList.remove('is-hidden');
      }
      last=y;
    }
    addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(run);}},{passive:true});
    run();
    /* mark the section in view on the primary navigation */
    var links=$$('.ysa-nav a[href^="#"]'); if(!links.length||!('IntersectionObserver' in window)) return;
    var map={}; links.forEach(function(a){var s=$(a.getAttribute('href')); if(s) map[s.id]=a;});
    var io=new IntersectionObserver(function(es){es.forEach(function(en){
      if(en.isIntersecting){links.forEach(function(a){a.classList.remove('on')}); if(map[en.target.id]) map[en.target.id].classList.add('on');}
    });},{rootMargin:'-45% 0px -50% 0px'});
    Object.keys(map).forEach(function(id){io.observe(doc.getElementById(id));});
  })();

  /* 04 · MOBILE MENU */
  (function(){
    var b=$('#ysaBurger'), m=$('#ysaMenu'), hd=$('#ysaHd'); if(!b||!m) return;
    function set(open){
      m.classList.toggle('open',open); b.setAttribute('aria-expanded',String(open));
      doc.body.style.overflow=open?'hidden':'';
      if(hd){ if(open){hd.classList.add('is-solid');hd.classList.remove('is-hidden');} else if(!hd.classList.contains('ysa-hd--solid')&&window.scrollY<=24) hd.classList.remove('is-solid'); }
    }
    b.addEventListener('click',function(){set(!m.classList.contains('open'));});
    m.addEventListener('click',function(e){if(e.target.closest('a[href]')) set(false);});
    addEventListener('keydown',function(e){if(e.key==='Escape') set(false);});
    addEventListener('resize',function(){if(innerWidth>=1360) set(false);});
  })();

  /* 05 · REVEAL. Hidden state exists only under html.ysa-rv-on, which is set here and nowhere else. */
  (function(){
    var els=$$('[data-rv]'); if(!els.length||RM||!('IntersectionObserver' in window)) return;
    root.classList.add('ysa-rv-on');
    var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}});},{rootMargin:'0px 0px -6% 0px',threshold:.01});
    els.forEach(function(el){io.observe(el);});
    /* safety sweep: anything already on screen or above it is shown, whatever the observer did */
    function sweep(){var h=innerHeight;els.forEach(function(el){if(el.getBoundingClientRect().top<h) el.classList.add('in');});}
    addEventListener('load',function(){setTimeout(sweep,400);});
    setTimeout(sweep,2600);
    /* if the tab cannot animate (hidden, print, capture), show everything */
    addEventListener('beforeprint',function(){els.forEach(function(el){el.classList.add('in');});});
  })();

  /* 06 · COUNT UP. The final figure is in the markup; the count is decoration. */
  (function(){
    var els=$$('[data-count]'); if(!els.length||RM||!('IntersectionObserver' in window)) return;
    var io=new IntersectionObserver(function(es){es.forEach(function(en){
      if(!en.isIntersecting) return; io.unobserve(en.target);
      var el=en.target, end=parseInt(el.getAttribute('data-count'),10), t0=performance.now(), D=1500;
      (function step(){
        var p=Math.min(1,(performance.now()-t0)/D), e=1-Math.pow(1-p,3);
        el.textContent=Math.round(end*e).toLocaleString('en-US');
        if(p<1) requestAnimationFrame(step);
      })();
    });},{threshold:.4});
    els.forEach(function(el){io.observe(el);});
  })();

  /* 07 · HERO REEL. Four stories, each with its own film. The photographs sit underneath, so the hero is whole before
          any film arrives and stays whole if none does. Two film layers take turns: the next film starts hidden a few
          seconds early, then the layers crossfade.

          A FILM IS ONLY SHOWN WHILE IT IS PLAYING CLEANLY. The YouTube player draws its own pause mark, spinner and
          scrub line whenever it starts, stalls, or is told to play or pause. So: a layer is revealed only after it
          has played without a break for HOLD ms; it is hidden the moment it stalls; and no command is ever sent to
          a layer that is on screen. What the reader sees is the film or the photograph, never the player.

          A story carries data-yt (a YouTube id) or data-mp4 (a hosted file), data-s (start second), data-n (seconds
          on screen) and data-film (the film's title, shown in the bar). The progress line on the active tab is the
          clock: when its animation ends, the next story comes on. */
  /* Film players are laid out at 1920 by 1080 on screens from tablet width up, so YouTube serves its 1080p stream
     (it picks the stream by the size of the player). Phones keep 1280 by 720. Every film script reads these two. */
  var FILM_W=innerWidth>=700?1920:1280, FILM_H=FILM_W*9/16;
  root.style.setProperty('--pw',FILM_W+'px'); root.style.setProperty('--ph',FILM_H+'px');
  (function(){
    var reel=$('#cover.ysa-reel'); if(!reel) return;
    var sts=$$('.ysa-reel-st',reel), ps=$$('.ysa-reel-p',reel), tabs=$$('.ysa-reel-tab',reel), lay=$$('.ysa-reel-v',reel), n=sts.length;
    var filmEl=$('#ysaReelFilm'), ct=$('#ysaReelCt'), playBtn=$('#ysaReelPlay'), media=$('.ysa-reel-media',reel);
    if(!n||lay.length<2||!media) return;
    var cur=0, paused=false, away=false, pre=0, PRE=8.7, HOLD=4200;   /* HOLD: how long YouTube keeps its own marks up after a start, plus a margin */
    var yt=[null,null], vid=[null,null], kind=['',''], holds=[-1,-1], since=[0,0], timer=[0,0], front=-1;
    var canFilm=!RM && !(navigator.connection&&navigator.connection.saveData) && !/[?&]nofilm\b/.test(location.search);
    function d(i,k){return sts[i].getAttribute('data-'+k)||''}
    function dur(i){return parseFloat(d(i,'n'))||12}

    function paint(){
      if(filmEl) filmEl.textContent=d(cur,root.lang==='ar'?'film-ar':'film');
      if(ct) ct.textContent=(cur+1)+' / '+n;
    }
    function filmOn(on){ reel.classList.toggle('has-film',!!on); }

    /* The player is laid out at a fixed size (FILM_W by FILM_H) and scaled to cover the hero, with a little overscan so
       its own title and logo fall outside the frame. */
    function fit(){ var w=media.clientWidth, h=media.clientHeight; if(w&&h) media.style.setProperty('--reel-k',(Math.max(w/FILM_W,h/FILM_H)*1.3).toFixed(4)); }
    fit(); addEventListener('resize',fit); addEventListener('load',fit);

    function send(L,cmd){
      try{
        if(kind[L]==='yt'){ if(yt[L]&&yt[L][cmd+'Video']) yt[L][cmd+'Video'](); }
        else if(kind[L]==='file'&&vid[L]){ if(cmd==='pause') vid[L].pause(); else { var p=vid[L].play(); if(p&&p.catch) p.catch(function(){}); } }
      }catch(e){}
    }
    function holdOf(L){ return kind[L]==='file'?250:HOLD; }          /* a hosted file has no player chrome to wait out */
    function hide(L){ lay[L].classList.remove('on'); if(front===L){ front=-1; filmOn(false); } }
    function running(L,i){                                            /* the player reports that it is playing */
      if(holds[L]!==i) return;
      if(!since[L]) since[L]=Date.now();
      clearTimeout(timer[L]); timer[L]=setTimeout(function(){ reveal(L); },holdOf(L)+60);
    }
    function broke(L){ since[L]=0; clearTimeout(timer[L]); hide(L); }  /* stalled, paused, ended or failed: back to the photograph */
    function clean(L){ return since[L]>0 && Date.now()-since[L]>=holdOf(L); }
    function reveal(L){
      if(holds[L]!==cur||!clean(L)||paused||away) return;
      var o=L?0:1;
      lay[L].classList.add('on'); lay[o].classList.remove('on'); front=L; filmOn(true);
      /* the old film stops once it has faded out. The layer is left alone if it already carries the next story's film. */
      setTimeout(function(){ if(front===L&&holds[o]!==cur&&holds[o]!==(cur+1)%n){ since[o]=0; send(o,'pause'); } },1300);
    }

    var ytQueue=[], ytAsked=false;
    function ytApi(cb){
      if(window.YT&&YT.Player){ cb(); return; }
      ytQueue.push(cb); if(ytAsked) return; ytAsked=true;
      var prev=window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady=function(){ if(prev) prev(); ytQueue.splice(0).forEach(function(f){f();}); };
      var s=doc.createElement('script'); s.src='https://www.youtube.com/iframe_api'; s.async=true;
      s.onerror=function(){ canFilm=false; };
      doc.head.appendChild(s);
    }
    /* start story i's film in a layer that is not on screen */
    function warm(i){
      if(!canFilm) return;
      var L = holds[0]===i?0 : holds[1]===i?1 : (holds[0]===cur&&i!==cur)?1 : (holds[1]===cur&&i!==cur)?0 : (front===0?1:0);
      if(holds[L]===i){ if(!since[L]) send(L,'play'); return; }
      holds[L]=i; since[L]=0; clearTimeout(timer[L]); hide(L);
      var id=d(i,'yt'), s=parseFloat(d(i,'s'))||0, mp4=d(i,'mp4');
      if(mp4){
        kind[L]='file'; lay[L].setAttribute('data-kind','file');
        var v=vid[L];
        if(!v){ v=vid[L]=doc.createElement('video'); v.muted=true; v.loop=true; v.playsInline=true; v.preload='auto'; v.setAttribute('muted',''); v.setAttribute('playsinline',''); lay[L].appendChild(v); }
        v.onloadedmetadata=function(){ try{ v.currentTime=s; }catch(e){} };
        v.onplaying=function(){ running(L,holds[L]); };
        v.onwaiting=function(){ broke(L); };
        v.onerror=function(){ holds[L]=-1; broke(L); };
        v.src=mp4; send(L,'play');
      }else if(id){
        kind[L]='yt'; lay[L].setAttribute('data-kind','yt');
        ytApi(function(){
          if(holds[L]!==i) return;
          if(yt[L]&&yt[L].loadVideoById){ yt[L].loadVideoById({videoId:id,startSeconds:s}); return; }
          if(yt[L]) return;   /* being built: its onReady reads the layer's current story */
          yt[L]=new YT.Player(lay[L].firstElementChild,{
            width:FILM_W,height:FILM_H,videoId:id,host:'https://www.youtube-nocookie.com',
            playerVars:{autoplay:1,mute:1,controls:0,playsinline:1,rel:0,modestbranding:1,iv_load_policy:3,disablekb:1,fs:0,start:Math.round(s),origin:location.origin},
            events:{
              onReady:function(e){
                e.target.mute();
                var now=holds[L];
                if(now>=0&&d(now,'yt')!==id) e.target.loadVideoById({videoId:d(now,'yt'),startSeconds:parseFloat(d(now,'s'))||0});
                else e.target.playVideo();
              },
              onStateChange:function(e){ if(e.data===1) running(L,holds[L]); else broke(L); },
              onError:function(){ holds[L]=-1; broke(L); }
            }
          });
        });
      }
    }
    /* the story is on: show its film if it is already playing cleanly, otherwise show the photograph and wait for it */
    function bring(i){
      var L=holds[0]===i?0:holds[1]===i?1:-1;
      if(L>=0&&clean(L)){ reveal(L); return; }
      hide(0); hide(1);
      if(L>=0&&since[L]){ clearTimeout(timer[L]); timer[L]=setTimeout(function(){ reveal(L); },Math.max(60,holdOf(L)-(Date.now()-since[L])+60)); return; }
      warm(i);
    }
    function ahead(ms){ clearTimeout(pre); if(n>1) pre=setTimeout(function(){ if(!paused&&!away) warm((cur+1)%n); },ms); }

    function show(i){
      cur=(i+n)%n;
      sts.forEach(function(s,j){ s.classList.toggle('on',j===cur); });
      ps.forEach(function(p,j){ p.classList.toggle('on',j===cur); });
      tabs.forEach(function(t,j){ t.classList.remove('on'); t.classList.toggle('done',j<cur); t.setAttribute('aria-selected',String(j===cur)); });
      reel.style.setProperty('--reel-n',dur(cur)+'s');
      void reel.offsetWidth;                         /* restart the progress line */
      tabs[cur].classList.add('on');
      paint(); bring(cur);
      if(!paused) ahead(Math.max(1000,(dur(cur)-PRE)*1000));
    }
    function quiet(){                                 /* take the films off screen first, stop them once they are out of sight */
      hide(0); hide(1); clearTimeout(pre);
      setTimeout(function(){ if(paused||away){ since[0]=since[1]=0; send(0,'pause'); send(1,'pause'); } },1200);
    }
    function setPaused(p){
      paused=p; reel.classList.toggle('is-paused',p);
      if(playBtn) playBtn.setAttribute('aria-pressed',String(p));
      if(p) quiet(); else if(!away){ bring(cur); ahead(2500); }
    }
    function setAway(a){
      if(a===away) return; away=a; reel.classList.toggle('is-away',a);
      if(a) quiet(); else if(!paused){ bring(cur); ahead(2500); }
    }

    tabs.forEach(function(t,j){
      t.addEventListener('click',function(){ show(j); });
      var bar=$('.p b',t);
      if(bar) bar.addEventListener('animationend',function(e){ if(e.animationName==='ysaReelP'&&j===cur&&!paused) show(cur+1); });
    });
    $$('[data-reel]',reel).forEach(function(b){ b.addEventListener('click',function(){ show(cur+(+b.getAttribute('data-reel'))); }); });
    if(playBtn) playBtn.addEventListener('click',function(){ setPaused(!paused); });
    /* a swipe across the cover changes the story, as the tabs do */
    var sx=0, sy=0;
    reel.addEventListener('touchstart',function(e){ var p=e.touches[0]; sx=p.clientX; sy=p.clientY; },{passive:true});
    reel.addEventListener('touchend',function(e){
      var p=e.changedTouches[0], dx=p.clientX-sx, dy=p.clientY-sy;
      if(Math.abs(dx)>56&&Math.abs(dx)>Math.abs(dy)*1.6) show(cur+(((dx<0)===(root.dir!=='rtl'))?1:-1));
    },{passive:true});
    addEventListener('ysa:lang',paint);
    var inView=true;
    doc.addEventListener('visibilitychange',function(){ setAway(doc.hidden||!inView); });
    if('IntersectionObserver' in window) new IntersectionObserver(function(es){ inView=es[0].isIntersecting; setAway(doc.hidden||!inView); },{threshold:.12}).observe(reel);

    paint();
    if(RM){ reel.classList.add('is-still'); return; }   /* reduced motion: the first story stays, the tabs still switch */
    /* films wait for the page: the photograph is the first paint, the film is the second */
    function begin(){ show(0); }
    if(doc.readyState==='complete') begin(); else addEventListener('load',begin);
  })();

  /* 08 · COVERS. The reader picks an issue by name. The front cover turns like a page and goes to the back of the
          stack until the chosen one is in front. The front cover leans with the pointer and carries a soft light. */
  (function(){
    var box=$('#ysaCovers'); if(!box) return;
    var stage=$('#ysaIssueStage')||box, covers=$$('.ysa-cover',box), picks=$$('[data-issue-pick]'), no=$('#ysaIssueNo'), busy=false, n=covers.length;
    function front(){ return covers.filter(function(c){return c.getAttribute('data-pos')==='0'})[0]; }
    function paint(){
      var f=front(); if(!f) return; var id=f.getAttribute('data-issue');
      picks.forEach(function(b){ var on=b.getAttribute('data-issue-pick')===id; b.classList.toggle('on',on); b.setAttribute('aria-pressed',String(on)); });
      if(no) no.textContent=id;
    }
    function turn(done){
      var f=front();
      var fin=function(){
        covers.forEach(function(c){var p=+c.getAttribute('data-pos'); c.setAttribute('data-pos',String((p-1+n)%n));});
        f.classList.remove('turning'); paint(); done();
      };
      if(RM){ fin(); return; }
      f.classList.add('turning'); setTimeout(fin,640);
    }
    function go(id){
      if(busy) return;
      var target=covers.filter(function(c){return c.getAttribute('data-issue')===id})[0]; if(!target) return;
      var k=+target.getAttribute('data-pos'); if(!k) return;
      busy=true;
      (function next(){ if(k--<=0){ busy=false; return; } turn(next); })();
    }
    picks.forEach(function(b){ b.addEventListener('click',function(){ go(b.getAttribute('data-issue-pick')); }); });
    covers.forEach(function(c){ c.addEventListener('click',function(){ if(c.getAttribute('data-pos')!=='0') go(c.getAttribute('data-issue')); }); });
    if(!RM && window.matchMedia && matchMedia('(hover:hover)').matches){
      stage.addEventListener('pointermove',function(e){
        var r=box.getBoundingClientRect(), x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height;
        if(root.dir==='rtl') x=1-x;
        x=x<-.4?-.4:x>1.4?1.4:x; y=y<-.2?-.2:y>1.2?1.2:y;
        stage.style.setProperty('--ry',(-3-x*9).toFixed(2)+'deg');
        stage.style.setProperty('--rx',((.5-y)*5).toFixed(2)+'deg');
        stage.style.setProperty('--gx',((root.dir==='rtl'?1-x:x)*100).toFixed(1)+'%');
        stage.style.setProperty('--gy',(y*100).toFixed(1)+'%');
      });
      stage.addEventListener('pointerleave',function(){ ['--ry','--rx','--gx','--gy'].forEach(function(p){ stage.style.removeProperty(p); }); });
    }
    paint();
  })();

  /* 09 · CHART. A place card and its pin light together. */
  (function(){
    var pins=$$('.ysa-pin'), cards=$$('.ysa-place'); if(!pins.length||!cards.length) return;
    function pick(id,scroll){
      pins.forEach(function(p){p.classList.toggle('on',p.getAttribute('data-place')===id);});
      cards.forEach(function(c){
        var on=c.getAttribute('data-place')===id; c.classList.toggle('on',on);
        if(on&&scroll&&innerWidth<1040&&c.parentNode.scrollTo){
          var par=c.parentNode; par.scrollTo({left:c.offsetLeft-par.offsetLeft-20,behavior:RM?'auto':'smooth'});
        }
      });
    }
    pins.forEach(function(p){p.addEventListener('click',function(){pick(p.getAttribute('data-place'),true);});});
    cards.forEach(function(c){
      c.addEventListener('mouseenter',function(){pick(c.getAttribute('data-place'),false);});
      c.addEventListener('focusin',function(){pick(c.getAttribute('data-place'),false);});
      c.addEventListener('click',function(){pick(c.getAttribute('data-place'),false);});
    });
  })();

  /* 10 · FORMS. The prototype sends nothing: say so in plain words. */
  $$('form[data-proto]').forEach(function(f){
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var m=$('.ysa-form-msg',f); if(m){m.textContent=t('formMsg');}
    });
    addEventListener('ysa:lang',function(){var m=$('.ysa-form-msg',f); if(m&&m.textContent) m.textContent=t('formMsg');});
  });

  /* 11 · MOBILE ACTION BAR. Shows after the cover, steps aside for the newsletter and the footer. */
  (function(){
    var bar=$('#ysaMab'); if(!bar) return;
    var first=$('main > section'), close=$('#subscribe'), tick=false;
    function run(){
      tick=false;
      var past=first? first.getBoundingClientRect().bottom<innerHeight*.5 : window.scrollY>400;
      var atClose=close? close.getBoundingClientRect().top<innerHeight*.9 : false;
      bar.classList.toggle('show',past&&!atClose);
    }
    addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(run);}},{passive:true});
    run();
  })();

  /* 12 · FILTERS on the section page. Chips show or hide cards by data-type. */
  (function(){
    var btns=$$('.ysa-filters button'); if(!btns.length) return;
    var cards=$$('[data-type]');
    btns.forEach(function(b){b.addEventListener('click',function(){
      var f=b.getAttribute('data-filter');
      btns.forEach(function(x){x.setAttribute('aria-pressed',String(x===b));});
      cards.forEach(function(c){c.hidden=!(f==='all'||c.getAttribute('data-type').split(' ').indexOf(f)>=0);});
    });});
  })();
  /* 13 · FILMS. One screen, four films. A film is a still until the reader presses play; only then does the YouTube
          player load, without its own bar. The site's controls drive it: play, the progress line, sound, full screen.
          The still covers the player whenever the film is not running, so the player's own marks do not show. */
  (function(){
    var cine=$('#ysaCine'); if(!cine) return;
    var stage=$('#ysaCineStage'), mount=$('.ysa-cine-v',cine), poster=$('#ysaCinePoster'), hit=$('#ysaCineHit'), tEl=$('#ysaCineT'), dEl=$('#ysaCineD'),
        nowEl=$('#ysaCineNow'), durEl=$('#ysaCineDur'), seek=$('#ysaCineSeek'), fill=seek?$('i',seek):null, items=$$('.ysa-cine-item',cine);
    if(!stage||!mount||!hit||!items.length) return;
    var pl=null, ready=false, making=false, id=items[0].getAttribute('data-film'), madeId='', state='idle', clock=0, idle=0, showT=0, waiting=[], asked=false;
    function fmt(s){ s=Math.max(0,Math.round(s||0)); return Math.floor(s/60)+':'+('0'+(s%60)).slice(-2); }
    var over=parseFloat(items[0].getAttribute('data-over'))||1.03;      /* more overscan for a film that carries its own black bars */
    function fit(){ var w=stage.clientWidth,h=stage.clientHeight; if(w&&h) stage.style.setProperty('--cine-k',(Math.max(w/FILM_W,h/FILM_H)*over).toFixed(4)); }
    function api(cb){
      if(window.YT&&YT.Player){ cb(); return; }
      waiting.push(cb); if(asked) return; asked=true;
      var prev=window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady=function(){ if(prev) prev(); waiting.splice(0).forEach(function(f){f();}); };
      if(!$('script[src*="youtube.com/iframe_api"]')){ var sc=doc.createElement('script'); sc.src='https://www.youtube.com/iframe_api'; sc.async=true; doc.head.appendChild(sc); }
      else{ var w8=setInterval(function(){ if(window.YT&&YT.Player){ clearInterval(w8); waiting.splice(0).forEach(function(f){f();}); } },200); }
    }
    function set(s){ state=s; stage.classList.toggle('is-loading',s==='loading'); stage.classList.toggle('is-playing',s==='playing'); }
    function wake(){ stage.classList.add('is-active'); clearTimeout(idle); idle=setTimeout(function(){ stage.classList.remove('is-active'); },2600); }
    function tick(){
      if(!pl||!pl.getCurrentTime) return;
      var c=pl.getCurrentTime()||0, d=pl.getDuration()||0;
      if(nowEl) nowEl.textContent=fmt(c);
      if(d&&durEl) durEl.textContent=fmt(d);
      if(fill&&d) fill.style.width=(c/d*100).toFixed(2)+'%';
      if(seek&&d) seek.setAttribute('aria-valuenow',String(Math.round(c/d*100)));
    }
    function onState(e){
      clearTimeout(showT);
      if(e.data===1){ showT=setTimeout(function(){ set('playing'); wake(); },450); clearInterval(clock); clock=setInterval(tick,250); }
      else if(e.data===3){ if(state!=='playing') set('loading'); }
      else{ clearInterval(clock); if(e.data===0||e.data===2||e.data===5) set('idle'); if(e.data===0){ if(fill) fill.style.width='0'; if(nowEl) nowEl.textContent='0:00'; } }
    }
    function make(){
      making=false; madeId=id; fit();
      pl=new YT.Player(mount.firstElementChild,{width:FILM_W,height:FILM_H,videoId:id,host:'https://www.youtube-nocookie.com',
        playerVars:{autoplay:1,controls:0,playsinline:1,rel:0,modestbranding:1,iv_load_policy:3,disablekb:1,fs:0,origin:location.origin},
        events:{
          onReady:function(e){ ready=true; fit(); if(madeId!==id) e.target.loadVideoById({videoId:id}); else e.target.playVideo(); },
          onStateChange:onState,
          onError:function(){ set('idle'); }
        }});
    }
    function play(){
      if(!pl){ set('loading'); if(!making){ making=true; api(make); } return; }
      if(!ready) return;
      set('loading'); pl.playVideo();
    }
    function pause(){
      if(!pl||!ready) return;
      set('idle');                                    /* the still comes back first, then the film stops behind it */
      setTimeout(function(){ try{ pl.pauseVideo(); }catch(e){} },260);
    }
    function pick(b,auto){
      var nid=b.getAttribute('data-film'), same=nid===id, pic=$('img',b), t=$('b',b), dur=b.getAttribute('data-dur')||'';
      if(same&&state==='playing') return;
      items.forEach(function(x){ var on=x===b; x.classList.toggle('on',on); x.setAttribute('aria-pressed',String(on)); });
      if(!same){
        if(poster&&pic) poster.src=pic.src;
        stage.style.setProperty('--crop',b.getAttribute('data-crop')||'1.02'); over=parseFloat(b.getAttribute('data-over'))||1.03; fit();
        if(tEl&&t) tEl.textContent=t.textContent;
        if(dEl) dEl.textContent=dur; if(durEl) durEl.textContent=dur;
        if(nowEl) nowEl.textContent='0:00'; if(fill) fill.style.width='0';
        id=nid;
        if(pl&&ready){ set('loading'); pl.loadVideoById({videoId:id}); return; }
      }
      if(auto) play();
    }
    hit.addEventListener('click',function(){ if(state==='playing') pause(); else play(); });
    items.forEach(function(b){ b.addEventListener('click',function(){
      pick(b,true);
      var r=stage.getBoundingClientRect(); if(r.top<80||r.bottom>innerHeight) window.scrollTo({top:window.scrollY+r.top-110,behavior:RM?'auto':'smooth'});
    }); });
    function seekTo(x){
      if(!pl||!ready||!seek) return;
      var r=seek.getBoundingClientRect(), f=(x-r.left)/r.width, d=pl.getDuration()||0; f=f<0?0:f>1?1:f;
      if(d){ pl.seekTo(f*d,true); if(fill) fill.style.width=(f*100).toFixed(2)+'%'; }
    }
    if(seek){
      seek.addEventListener('pointerdown',function(e){
        e.stopPropagation(); seekTo(e.clientX); if(seek.setPointerCapture) seek.setPointerCapture(e.pointerId);
        var mv=function(ev){ seekTo(ev.clientX); wake(); }, up=function(){ seek.removeEventListener('pointermove',mv); seek.removeEventListener('pointerup',up); };
        seek.addEventListener('pointermove',mv); seek.addEventListener('pointerup',up);
      });
      seek.addEventListener('keydown',function(e){
        if(!pl||!ready) return; var d=pl.getDuration()||0, c=pl.getCurrentTime()||0;
        if(e.key==='ArrowRight'){ e.preventDefault(); pl.seekTo(Math.min(d,c+5),true); wake(); }
        else if(e.key==='ArrowLeft'){ e.preventDefault(); pl.seekTo(Math.max(0,c-5),true); wake(); }
      });
    }
    $$('[data-cine]',cine).forEach(function(b){ b.addEventListener('click',function(){
      var k=b.getAttribute('data-cine');
      if(k==='toggle'){ if(state==='playing') pause(); else play(); }
      else if(k==='mute'&&pl&&ready){ var m=!pl.isMuted(); if(m) pl.mute(); else pl.unMute(); stage.classList.toggle('is-muted',m); b.setAttribute('aria-pressed',String(m)); }
      else if(k==='full'){ if(doc.fullscreenElement) doc.exitFullscreen(); else if(stage.requestFullscreen) stage.requestFullscreen(); }
      wake();
    }); });
    ['pointermove','pointerdown','focusin'].forEach(function(ev){ stage.addEventListener(ev,wake); });
    addEventListener('resize',fit); doc.addEventListener('fullscreenchange',function(){ setTimeout(fit,80); });
    doc.addEventListener('visibilitychange',function(){ if(doc.hidden&&state==='playing') pause(); });
    if('IntersectionObserver' in window) new IntersectionObserver(function(es){ if(!es[0].isIntersecting&&state==='playing'&&!doc.fullscreenElement) pause(); },{threshold:0}).observe(stage);
    addEventListener('ysa:lang',function(){ var on=$('.ysa-cine-item.on b',cine); if(on&&tEl) tEl.textContent=on.textContent; });
    fit();
  })();

  /* 14 · DEMO RIBBON. Brand Method's credit, the same cloth ribbon the IAQ build ends with (ported from its Footer).
          Three sines move the band, the local slope shades it and turns each letter. Runs only while on screen. */
  (function(){
    var cv=$('#ysaRibbon'), fb=$('.ysa-ribbon-fb'), ctx=null;
    try{ ctx=cv&&cv.getContext('2d'); }catch(e){}
    if(!ctx){ if(cv) cv.style.display='none'; if(fb) fb.hidden=false; return; }
    var W=460,H=110,dpr=Math.min(window.devicePixelRatio||1,2);
    cv.width=W*dpr; cv.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    var X0=40,X1=420,BH=32,BY=40,running=false,looping=false,t=0,GLYPHS=null;
    var F='600 12px Inter,sans-serif';
    var SEGS=[{t:'DEMO BY',f:F,sp:3.6,a:1,gap:8},{star:true,w:13,gap:9},{t:'BRAND',f:F,sp:3.6,a:.98},{t:'METHOD.CO',f:F,sp:3.6,a:.98}];
    function buildGlyphs(){
      GLYPHS=[];
      SEGS.forEach(function(s){
        if(s.star){ GLYPHS.push({star:true,w:s.w}); if(s.gap) GLYPHS.push({gap:s.gap}); return; }
        ctx.font=s.f;
        for(var i=0;i<s.t.length;i++){ var ch=s.t[i]; if(ch===' '){ GLYPHS.push({gap:6.5}); continue; } GLYPHS.push({ch:ch,f:s.f,a:s.a,w:ctx.measureText(ch).width+s.sp}); }
        if(s.gap) GLYPHS.push({gap:s.gap});
      });
    }
    function wave(x,tt){return 4*Math.sin(x*.0135+tt*.0011)+2.4*Math.sin(x*.029-tt*.00068)+1.2*Math.sin(x*.055+tt*.0016);}
    function slope(x,tt){return (wave(x+2,tt)-wave(x-2,tt))/4;}
    function lerp(a,b,p){return a+(b-a)*p;}
    function shade(p){return 'rgb('+Math.round(lerp(18,86,p))+','+Math.round(lerp(28,116,p))+','+Math.round(lerp(158,255,p))+')';}
    function tail(xEdge,dir,tt){
      var y=BY+wave(xEdge,tt)*.7+9, x2=xEdge-dir*40;
      ctx.beginPath(); ctx.moveTo(xEdge,y); ctx.lineTo(x2,y+7); ctx.lineTo(x2+dir*13,y+7+BH/2); ctx.lineTo(x2,y+7+BH); ctx.lineTo(xEdge,y+BH); ctx.closePath();
      ctx.fillStyle='#101C96'; ctx.fill(); ctx.fillStyle='rgba(0,0,0,.22)'; ctx.fill();
    }
    function draw(tt){
      if(!GLYPHS) buildGlyphs();
      ctx.clearRect(0,0,W,H);
      tail(X0+6,1,tt); tail(X1-6,-1,tt);
      var x,y,s,p;
      for(x=X0;x<=X1;x+=2){ y=BY+wave(x,tt); s=slope(x,tt); p=Math.max(0,Math.min(1,.52+s*5.5+.14*Math.sin(x*.006-tt*.00042))); ctx.fillStyle=shade(p); ctx.fillRect(x-1,y,2.4,BH); }
      ctx.beginPath(); for(x=X0;x<=X1;x+=4){ y=BY+wave(x,tt); if(x===X0) ctx.moveTo(x,y+.6); else ctx.lineTo(x,y+.6); }
      ctx.strokeStyle='rgba(255,255,255,.28)'; ctx.lineWidth=1.1; ctx.stroke();
      ctx.beginPath(); for(x=X0;x<=X1;x+=4){ y=BY+wave(x,tt)+BH; if(x===X0) ctx.moveTo(x,y-.6); else ctx.lineTo(x,y-.6); }
      ctx.strokeStyle='rgba(0,10,60,.4)'; ctx.lineWidth=1.2; ctx.stroke();
      ctx.textAlign='left'; ctx.textBaseline='middle';
      var total=0; GLYPHS.forEach(function(g){ total+=g.w||g.gap||0; });
      var xs=(X0+X1)/2-total/2;
      GLYPHS.forEach(function(g){
        if(g.gap){ xs+=g.gap; return; }
        var cxx=xs+(g.w||0)/2, yy=BY+wave(cxx,tt)+BH/2+.5, a=Math.atan(slope(cxx,tt));
        ctx.save(); ctx.translate(cxx,yy); ctx.rotate(a);
        if(g.star){
          ctx.strokeStyle='rgba(255,255,255,.97)'; ctx.lineWidth=1.5; ctx.lineCap='round';
          for(var k=0;k<4;k++){ var an=k*Math.PI/4; ctx.beginPath(); ctx.moveTo(-Math.cos(an)*4.6,-Math.sin(an)*4.6); ctx.lineTo(Math.cos(an)*4.6,Math.sin(an)*4.6); ctx.stroke(); }
        }else{
          ctx.font=g.f; ctx.fillStyle='rgba(2,8,40,.4)'; ctx.fillText(g.ch,-((g.w||0)/2)+.7,1.1);
          ctx.fillStyle='rgba(255,255,255,'+g.a+')'; ctx.fillText(g.ch,-((g.w||0)/2),0);
        }
        ctx.restore(); xs+=g.w||0;
      });
    }
    function frame(){ if(!running){ looping=false; return; } looping=true; t+=16; draw(t); requestAnimationFrame(frame); }
    draw(0);
    if(doc.fonts&&doc.fonts.ready) doc.fonts.ready.then(function(){ GLYPHS=null; draw(t); });
    if(RM||!('IntersectionObserver' in window)) return;
    new IntersectionObserver(function(es){ running=es[0].isIntersecting&&!doc.hidden; if(running&&!looping) requestAnimationFrame(frame); }).observe(cv);
    doc.addEventListener('visibilitychange',function(){ if(doc.hidden){ running=false; return; } var r=cv.getBoundingClientRect(); if(r.top<innerHeight&&r.bottom>0){ running=true; if(!looping) requestAnimationFrame(frame); } });
  })();

  /* 15 · AMBIENT FILMS (the charter visual, the boat shows picture, the newsletter band). Each .ysa-amb box streams one
          Yacht Style film behind its block, with no still frame in the loop: two players take turns. The second starts
          hidden a few seconds before the first reaches the end of its window, and the two crossfade once it has played
          cleanly. Same rule as the reel: a player is shown only while it plays cleanly (4.3 s without a break), so the
          player's own marks never show, and no command is sent to a player that is on screen. */
  (function(){
    var boxes=$$('.ysa-amb'); if(!boxes.length||RM||!('IntersectionObserver' in window)) return;
    if((navigator.connection&&navigator.connection.saveData)||/[?&]nofilm\b/.test(location.search)) return;
    var waiting=[], asked=false, HOLD=4300, EARLY=innerWidth>=1040;
    function api(cb){
      if(window.YT&&YT.Player){ cb(); return; }
      waiting.push(cb); if(asked) return; asked=true;
      var prev=window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady=function(){ if(prev) prev(); waiting.splice(0).forEach(function(f){f();}); };
      if(!$('script[src*="youtube.com/iframe_api"]')){ var sc=doc.createElement('script'); sc.src='https://www.youtube.com/iframe_api'; sc.async=true; doc.head.appendChild(sc); }
      else{ var w8=setInterval(function(){ if(window.YT&&YT.Player){ clearInterval(w8); waiting.splice(0).forEach(function(f){f();}); } },200); }
    }
    boxes.forEach(function(box,bi){
      var lay=$$('.l',box); if(lay.length<2) return;
      var id=box.getAttribute('data-yt'), s=parseFloat(box.getAttribute('data-s'))||0, end=parseFloat(box.getAttribute('data-e'))||0, over=parseFloat(box.getAttribute('data-k'))||1.3;
      var P=[null,null], rdy=[false,false], since=[0,0], front=-1, want=0, near=false, built=false, LEAD=HOLD/1000+2.4;
      function fit(){ var w=box.clientWidth,h=box.clientHeight; if(w&&h) box.style.setProperty('--amb-k',(Math.max(w/FILM_W,h/FILM_H)*over).toFixed(4)); }
      function clean(i){ return since[i]>0&&Date.now()-since[i]>=HOLD; }
      function show(i){
        var o=1-i; lay[i].style.zIndex='2'; lay[o].style.zIndex='1'; lay[i].classList.add('on'); front=i; want=i; box.classList.add('on');
        setTimeout(function(){ if(front===i) lay[o].classList.remove('on'); },1750);                                       /* the new film fades in over the old one */
        setTimeout(function(){ if(front===i&&P[o]&&rdy[o]){ since[o]=0; try{ P[o].pauseVideo(); }catch(e){} } },3600);   /* which stops once it is out of sight */
      }
      function hideAll(){ lay[0].classList.remove('on'); lay[1].classList.remove('on'); front=-1; box.classList.remove('on'); }
      function make(i){
        P[i]=new YT.Player(lay[i].firstElementChild,{width:FILM_W,height:FILM_H,videoId:id,host:'https://www.youtube-nocookie.com',
          playerVars:{autoplay:1,mute:1,controls:0,playsinline:1,rel:0,modestbranding:1,iv_load_policy:3,disablekb:1,fs:0,start:Math.round(s),origin:location.origin},
          events:{
            onReady:function(e){ rdy[i]=true; e.target.mute(); if(near&&want===i) e.target.playVideo(); else e.target.pauseVideo(); },
            onStateChange:function(e){
              if(e.data===1){ since[i]=Date.now(); return; }
              since[i]=0;
              if(front===i){ lay[i].classList.remove('on'); front=-1; box.classList.remove('on'); }      /* it stalled or stopped: off screen at once */
              if(e.data===0&&near&&want===i){ try{ e.target.seekTo(s,true); e.target.playVideo(); }catch(x){} }
            }
          }});
      }
      function begin(i){                                  /* start player i, hidden, from the start of the window */
        want=i; since[i]=0;
        if(!P[i]){ api(function(){ if(!P[i]) make(i); }); return; }
        if(!rdy[i]) return;
        try{ P[i].seekTo(s,true); P[i].playVideo(); }catch(e){}
      }
      setInterval(function(){
        if(!near||doc.hidden) return;
        if(front<0){ if(P[want]&&clean(want)) show(want); return; }
        if(!end) return;
        var t=0, o=1-front; try{ t=P[front].getCurrentTime()||0; }catch(e){}
        if(want===front&&t>=end-LEAD) begin(o);                             /* the other player starts behind */
        else if(want===o&&clean(o)&&t>=end-1.7) show(o);                    /* and takes over as this one reaches the end */
      },350);
      new IntersectionObserver(function(es){
        near=es[0].isIntersecting||EARLY;
        if(near){
          if(!built){ built=true; addEventListener('resize',fit); fit(); if(EARLY) setTimeout(function(){ begin(want); },1400+bi*900); else begin(want); return; }
          fit();
          if(P[want]&&rdy[want]){ try{ if(P[want].getPlayerState()!==1) P[want].playVideo(); }catch(e){} }
        }else{
          hideAll();
          setTimeout(function(){ if(near) return; [0,1].forEach(function(i){ if(P[i]&&rdy[i]){ since[i]=0; try{ P[i].pauseVideo(); }catch(e){} } }); },1900);
        }
      },{rootMargin:'2400px 0px'}).observe(box);
    });
  })();

  /* 18 · PARALLAX, restrained. Photographs sit a little large in their frames and drift a few percent against the scroll,
          so the page has depth without anything flying about. Transform only, one rAF per scroll, on screen only,
          desktop only, never under reduced motion. Nothing is hidden by it: with the script off the pictures simply sit still. */
  (function(){
    if(RM||!('IntersectionObserver' in window)||innerWidth<1040) return;
    var els=$$('.ysa-lead .ysa-fig img, .ysa-ldr-lead .ysa-fig img, #reviews .ysa-fig img, .ysa-events .ysa-fig img');
    if(!els.length) return;
    var live=[], tick=false;
    els.forEach(function(el){ el._s=1.14; el._r=el.closest('#reviews')?.05:.07; el.style.willChange='transform'; el.style.transition='scale 1.6s cubic-bezier(.22,1,.36,1),filter 1.2s cubic-bezier(.22,1,.36,1)'; el.style.transform='scale('+el._s+')'; });
    var io=new IntersectionObserver(function(es){ es.forEach(function(en){ var k=live.indexOf(en.target); if(en.isIntersecting){ if(k<0) live.push(en.target); } else if(k>=0) live.splice(k,1); }); move(); },{rootMargin:'120px 0px'});
    els.forEach(function(el){ io.observe(el); });
    function move(){
      tick=false; var vh=innerHeight;
      live.forEach(function(el){
        var fr=el.parentNode.getBoundingClientRect(), p=((fr.top+fr.height/2)-vh/2)/vh;      /* -1 above the fold, 0 centred, 1 below */
        p=p<-1?-1:p>1?1:p;
        el.style.transform='translate3d(0,'+(-p*fr.height*el._r).toFixed(1)+'px,0) scale('+el._s+')';
      });
    }
    addEventListener('scroll',function(){ if(!tick){ tick=true; requestAnimationFrame(move); } },{passive:true});
    addEventListener('resize',move);
  })();

  /* 19 · THE YACHT ON THE CHART. It crosses the Arabian Sea slowly. Under reduced motion it lies at anchor. */
  (function(){
    var y=$('.ysa-chart .yacht'); if(!y||!RM) return;
    $$('animateMotion,animate',y).forEach(function(a){ a.parentNode.removeChild(a); });
    y.setAttribute('transform','translate(840 690)'); y.style.opacity='1';
  })();

  /* 20 · THE SEA, DRAWN LIVE. A water surface rendered in WebGL: a field of waves seen in perspective, lit from one
          side, with the light catching the crests. It is used twice. In the footer it is a white ocean, its waves picked out in soft shadow.
          Under the ambient films it is a full sea, so the band moves from the first moment and nothing on it is ever
          still. One small program per canvas, drawn only while it is on screen and not covered by a film. Reduced
          motion gets one still frame; with no WebGL the canvas steps aside. */
  (function(){
    var list=$$('#ysaWaves, canvas[data-waves]'); if(!list.length) return;
    var VS='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    var FS='#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n'+
      'uniform vec2 r;uniform float t;uniform float tone;uniform float hz;'+
      'float w(vec2 p){float h=sin(p.x*.55+p.y*.38+t*.42)*.55;h+=sin(p.x*1.15-p.y*.82+t*.63)*.28;h+=sin(p.x*.31-p.y*1.27-t*.36)*.42;'+
      'h+=sin(p.x*2.3+p.y*1.9+t*.95+sin(p.y*.7+t*.3)*1.3)*.12;h+=sin(p.x*4.1-p.y*3.3-t*1.25)*.05;return h;}'+
      'void main(){vec2 uv=gl_FragCoord.xy/r;float y=hz-uv.y;if(y<=0.){gl_FragColor=vec4(0.);return;}'+
      'float z=1./(y*1.35+.035);vec2 p=vec2((uv.x-.5)*(r.x/r.y)*z*1.25,z*1.9);'+
      'float e=.06,calm=1./(1.+z*.09);float h=w(p),hx=w(p+vec2(e,0.))-h,hy=w(p+vec2(0.,e))-h;'+
      'float st=mix(1.25,.55,tone)*calm;vec3 n=normalize(vec3(-hx/e*st,1.,-hy/e*st));vec3 L=normalize(vec3(.38,.7,-.6));vec3 V=normalize(vec3(0.,.42,-1.));'+
      'float dif=clamp(dot(n,L),0.,1.);float sp=pow(clamp(dot(n,normalize(L+V)),0.,1.),110.);float fr=pow(1.-clamp(dot(n,V),0.,1.),3.);'+
      'vec3 deep=mix(mix(vec3(.74,.80,.85),vec3(.95,.96,.98),1.-smoothstep(0.,.42,y)),vec3(.06,.25,.34),tone);vec3 lite=mix(vec3(1.,1.,1.),vec3(.40,.66,.73),tone);'+
      'float lo=mix(.52,.3,tone);vec3 col=mix(deep,lite,clamp(smoothstep(lo,.98,dif)+fr*mix(.2,.55,tone),0.,1.));col+=mix(vec3(1.),vec3(1.,.92,.74),tone)*sp*(.7+.3*tone);'+
      'float far=smoothstep(0.,mix(.62,.22,tone),y);gl_FragColor=vec4(col,far);}';
    list.forEach(function(cv){
      var gl=null; try{ gl=cv.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:false}); }catch(e){}
      if(!gl){ cv.style.display='none'; return; }
      function sh(type,src){ var s=gl.createShader(type); gl.shaderSource(s,src); gl.compileShader(s); return gl.getShaderParameter(s,gl.COMPILE_STATUS)?s:null; }
      var vs=sh(gl.VERTEX_SHADER,VS), fs=sh(gl.FRAGMENT_SHADER,FS), pr=gl.createProgram();
      if(!vs||!fs){ cv.style.display='none'; return; }
      gl.attachShader(pr,vs); gl.attachShader(pr,fs); gl.linkProgram(pr);
      if(!gl.getProgramParameter(pr,gl.LINK_STATUS)){ cv.style.display='none'; return; }
      gl.useProgram(pr);
      var buf=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buf); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
      var loc=gl.getAttribLocation(pr,'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
      var uR=gl.getUniformLocation(pr,'r'), uT=gl.getUniformLocation(pr,'t');
      gl.uniform1f(gl.getUniformLocation(pr,'tone'),cv.getAttribute('data-tone')==='sea'?1:0);
      gl.uniform1f(gl.getUniformLocation(pr,'hz'),parseFloat(cv.getAttribute('data-hz'))||.6);
      gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA); gl.clearColor(0,0,0,0);
      var film=cv.parentNode?$('.ysa-amb',cv.parentNode):null, live=false, raf=0, t0=performance.now();
      function size(){
        var cw=cv.clientWidth, ch=cv.clientHeight, d=Math.min(window.devicePixelRatio||1,1.5);
        if(cw*ch*d*d>2400000) d=Math.sqrt(2400000/(cw*ch));                 /* a smooth surface does not need every pixel */
        var W=Math.max(1,Math.round(cw*d)), H=Math.max(1,Math.round(ch*d));
        if(cv.width!==W||cv.height!==H){ cv.width=W; cv.height=H; gl.viewport(0,0,W,H); }
      }
      function draw(now){
        raf=0; if(cv.width<2||cv.height<2) return;
        if(!(film&&film.classList.contains('on'))){                          /* under a film that is showing, it rests */
          gl.clear(gl.COLOR_BUFFER_BIT); gl.uniform2f(uR,cv.width,cv.height); gl.uniform1f(uT,RM?8:(now-t0)/1000); gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
        }
        if(live&&!RM&&!doc.hidden) raf=requestAnimationFrame(draw);
      }
      function wake(){ size(); if(!raf) raf=requestAnimationFrame(draw); }
      if('ResizeObserver' in window) new ResizeObserver(wake).observe(cv); else addEventListener('resize',wake);
      if('IntersectionObserver' in window) new IntersectionObserver(function(es){ live=es[0].isIntersecting; if(live) wake(); },{rootMargin:'160px 0px'}).observe(cv); else live=true;
      doc.addEventListener('visibilitychange',function(){ if(!doc.hidden&&live) wake(); });
      cv.addEventListener('webglcontextlost',function(e){ e.preventDefault(); live=false; });
      wake();
    });
  })();

  /* 21 · THE CHART, DRAWN FROM SURVEY DATA. The schematic in the page is the fallback. When the Natural Earth outline
          arrives (public domain, read from a public library server as the chart nears the screen), the chart is redrawn
          with real coasts and borders, a pale shelf of shallow water along the land, the countries of the edition in a
          warmer sand, and a compass. Resting on a place, or pressing its point, moves the chart in on it; "Whole region" moves it back out. */
  (function(){
    var chart=$('.ysa-chart'), svg=chart?$('svg',chart):null; if(!svg||!window.fetch||!('IntersectionObserver' in window)) return;
    var W=1000, H=760, NS='http://www.w3.org/2000/svg', pins=$$('.ysa-pin',chart), view=null, zoomed='', rose=null;
    var vx=0, vy=0, vw=W, vh=H;                       /* the window on the chart: wider or deeper than the base when the box is */
    var FOCUS={'United Arab Emirates':1,'Saudi Arabia':1,'Qatar':1,'Oman':1,'Egypt':1};
    var NAMES=[['Saudi Arabia','السعودية',44.6,23.4],['Egypt','مصر',31.3,26.6],['Oman','عُمان',56.4,20.6],['UAE','الإمارات',54.0,22.95]];
    var VIEW={dubai:[55.15,25.2,3.6,'uae'],abudhabi:[55.15,25.2,3.6,'uae'],rak:[55.15,25.2,3.6,'uae'],uaq:[55.15,25.2,3.6,'uae'],doha:[51.6,25.4,2.8],galala:[33.0,29.0,2.6],jeddah:[39.4,21.5,2.3],muscat:[58.2,23.5,2.6]};
    function px(lon,lat){ return ((lon-29)*29.41).toFixed(1)+' '+((33-lat)*31.6).toFixed(1); }
    function build(topo){
      var tr=topo.transform, sc=tr?tr.scale:[1,1], tl=tr?tr.translate:[0,0], cache={};
      function arc(i){
        var rev=i<0, id=rev?~i:i, pts=cache[id];
        if(!pts){ var x=0,y=0; pts=cache[id]=topo.arcs[id].map(function(d){ x+=d[0]; y+=d[1]; return [x*sc[0]+tl[0],y*sc[1]+tl[1]]; }); }
        return rev?pts.slice().reverse():pts;
      }
      function ring(ids){ var out=[]; ids.forEach(function(i,n){ var a=arc(i); out=out.concat(n?a.slice(1):a); }); return out; }
      function inView(r){ for(var i=0;i<r.length;i+=3){ var q=r[i]; if(q[0]>18&&q[0]<74&&q[1]>-2&&q[1]<44) return true; } return false; }
      function path(polys){
        var d='';
        polys.forEach(function(poly){ poly.forEach(function(ids){ var r=ring(ids); if(!inView(r)) return; d+='M'+r.map(function(q){ return px(q[0],q[1]); }).join('L')+'Z'; }); });
        return d;
      }
      function polysOf(g){ return g.type==='Polygon'?[g.arcs]:g.type==='MultiPolygon'?g.arcs:[]; }
      var land='', countries='';
      (topo.objects.land.geometries||[topo.objects.land]).forEach(function(g){ land+=path(polysOf(g)); });
      topo.objects.countries.geometries.forEach(function(g){
        var d=path(polysOf(g)); if(d) countries+='<path class="m-c'+(FOCUS[g.properties&&g.properties.name]?' f':'')+'" d="'+d+'"/>';
      });
      if(!land||!countries) return;
      var grat='', lon, lat;
      for(lon=12;lon<84;lon+=4) grat+='M'+px(lon,48)+'L'+px(lon,-8);
      for(lat=-4;lat<48;lat+=4) grat+='M'+px(8,lat)+'L'+px(86,lat);
      var ar=root.lang==='ar';
      var names=NAMES.map(function(nm){ var q=px(nm[2],nm[3]).split(' '); return '<text class="m-n'+(nm[0]==='UAE'?' sm':'')+'" text-anchor="middle" x="'+q[0]+'" y="'+q[1]+'" data-ar="'+nm[1]+'" data-en="'+nm[0]+'">'+(ar?nm[1]:nm[0])+'</text>'; }).join('');
      var keep=$$('text.sea',svg).concat($$('g.yacht',svg));
      view=doc.createElementNS(NS,'g'); view.setAttribute('class','view');
      view.innerHTML='<rect class="m-sea" x="-700" y="-500" width="2400" height="1900"/><path class="m-grat" d="'+grat+'"/><path class="m-shelf" d="'+land+'"/>'+countries+'<path class="m-coast" d="'+land+'"/>'+names;
      var defs=doc.createElementNS(NS,'defs');
      defs.innerHTML='<linearGradient id="ysaSeaG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#DCEBEC"/><stop offset=".55" stop-color="#C6DDE1"/><stop offset="1" stop-color="#A9CBD3"/></linearGradient><filter id="ysaShelf" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="8"/></filter>';
      while(svg.firstChild) svg.removeChild(svg.firstChild);
      svg.appendChild(defs); svg.appendChild(view);
      keep.forEach(function(el){ view.appendChild(el); });
      rose=doc.createElementNS(NS,'g'); rose.setAttribute('class','m-rose'); rose.setAttribute('transform','translate(118 628)');
      rose.innerHTML='<circle r="40"/><circle r="31" class="in"/><path class="tk" d="M0-40V-31M0 40V31M-40 0H-31M40 0H31M-28.3-28.3L-21.9-21.9M28.3-28.3L21.9-21.9M-28.3 28.3L-21.9 21.9M28.3 28.3L21.9 21.9"/><path class="nd" d="M0-27L6 0 0 27-6 0Z"/><path class="nn" d="M0-27L6 0H-6Z"/><text y="-48" text-anchor="middle">N</text>';
      svg.appendChild(rose);
      pins.forEach(function(p){ p._x=parseFloat(p.style.left)/100*W; p._y=parseFloat(p.style.top)/100*H; });
      var out=doc.createElement('button'); out.type='button'; out.className='ysa-chart-out'; out.setAttribute('data-ar','المنطقة كاملة'); out.setAttribute('data-en','Whole region'); out.textContent=ar?'المنطقة كاملة':'Whole region';
      out.addEventListener('click',function(e){ e.stopPropagation(); zoom(''); }); chart.appendChild(out);
      $$('.m-n',svg).concat([out]).forEach(function(el){ el._en=el.getAttribute('data-en'); });   /* the language switch reads this */
      chart.classList.add('is-real');
      fitBox(); if('ResizeObserver' in window) new ResizeObserver(fitBox).observe(chart); else addEventListener('resize',fitBox);
      pins.forEach(function(p){ p.addEventListener('click',function(){ zoom(p.getAttribute('data-place')); }); });
      /* a tile opens its story on a press; resting the pointer on it (or reaching it by keyboard) moves the chart in */
      var hov=0, list=$('.ysa-places');
      $$('.ysa-place').forEach(function(c){
        c.addEventListener('mouseenter',function(){ clearTimeout(hov); hov=setTimeout(function(){ zoom(c.getAttribute('data-place')); },320); });
        c.addEventListener('focusin',function(){ clearTimeout(hov); zoom(c.getAttribute('data-place')); });
      });
      if(list) list.addEventListener('mouseleave',function(){ clearTimeout(hov); hov=setTimeout(function(){ zoom(''); },700); });
      addEventListener('ysa:lang',function(){ var a=root.lang==='ar'; $$('.m-n',svg).concat([out]).forEach(function(el){ el.textContent=el.getAttribute(a?'data-ar':'data-en'); }); });
    }
    /* On wide screens the chart is as tall as the tiles beside it. The window it shows takes the shape of the box:
       deeper to the south when the box is tall, wider east and west when it is broad. */
    /* How many chart units make one screen pixel. The names on the chart read it, so they never draw under 13 px however
       small the chart is on the screen (a phone shows the whole region in a third of its drawn size). */
    function unit(){ var w=chart.clientWidth, vb=svg.viewBox&&svg.viewBox.baseVal; if(w&&vb&&vb.width) svg.style.setProperty('--u',(vb.width/w).toFixed(4)); }
    unit(); addEventListener('resize',unit);
    function fitBox(){
      var cw=chart.clientWidth, ch=chart.clientHeight, side=innerWidth>=1040&&cw>0&&ch>0;
      if(side&&cw/ch>=W/H){ vh=H; vw=H*cw/ch; vx=(W-vw)/2; vy=0; }
      else if(side){ vw=W; vh=W*ch/cw; vx=0; vy=0; }
      else{ vx=0; vy=0; vw=W; vh=H; }
      svg.setAttribute('viewBox',vx.toFixed(1)+' '+vy.toFixed(1)+' '+vw.toFixed(1)+' '+vh.toFixed(1));
      unit();
      if(rose) rose.setAttribute('transform','translate('+(vx+118).toFixed(1)+' '+(vy+vh-132).toFixed(1)+')');
      zoom(zoomed);
    }
    function zoom(id){
      if(!view) return;
      var v=VIEW[id], k=1, tx=0, ty=0;
      if(v){
        k=v[2]; tx=(vx+vw/2)-(v[0]-29)*29.41*k; ty=(vy+vh/2)-(33-v[1])*31.6*k;
        tx=Math.min(vx*(1-k),Math.max((vx+vw)*(1-k),tx)); ty=Math.min(vy*(1-k),Math.max((vy+vh)*(1-k),ty));
      }
      zoomed=v?id:'';
      view.style.transform='translate('+tx.toFixed(1)+'px,'+ty.toFixed(1)+'px) scale('+k+')';
      svg.style.setProperty('--k',String(k));
      pins.forEach(function(p){ p.style.left=((p._x*k+tx-vx)/vw*100).toFixed(2)+'%'; p.style.top=((p._y*k+ty-vy)/vh*100).toFixed(2)+'%'; });
      chart.classList.toggle('is-zoom',!!v); chart.classList.toggle('is-uae',!!(v&&v[3]==='uae'));
    }
    var asked=false;
    new IntersectionObserver(function(es,io){
      if(!es[0].isIntersecting||asked) return; asked=true; io.disconnect();
      fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json').then(function(r){ if(!r.ok) throw 0; return r.json(); }).then(function(t){ try{ build(t); }catch(e){} }).catch(function(){});
    },{rootMargin:'700px 0px'}).observe(chart);
  })();

  /* 22 · THE LOGO SWITCH. A prototype control: our wordmark, or Yacht Style's own logo with Arabia under it. The choice
          is kept on this device, and applied before first paint by the small script in the head. */
  (function(){
    var sw=$$('[data-logo-sw]'); if(!sw.length) return;
    function paint(){ var on=root.getAttribute('data-logo')==='orig'; sw.forEach(function(b){ b.setAttribute('aria-pressed',String(on)); }); }
    sw.forEach(function(b){ b.addEventListener('click',function(){
      var on=root.getAttribute('data-logo')!=='orig';
      if(on) root.setAttribute('data-logo','orig'); else root.removeAttribute('data-logo');
      paint();
    }); });
    paint();
  })();
  /* 16 · SEARCH. Looks through the stories, shows, films and places on this page: titles, kinds, dates and standfirsts.
          Each result carries its picture, the words that match are marked, the sections filter the list, and the arrow
          keys move through it. A slash opens it. The full archive search belongs to the full site. */
  (function(){
    var panel=$('#ysaFind'), q=$('#ysaFindQ'), list=$('#ysaFindList'), kindsEl=$('#ysaFindKinds'), countEl=$('#ysaFindCount'), hd=$('#ysaHd'); if(!panel||!q||!list) return;
    var openers=$$('#ysaFindBtn,[data-find]'), items=null, group='all', quick=$('#ysaFindQuick'), clr=$('#ysaFindClear');
    var GROUPS=[{id:'reviews',en:'Reviews',ar:'المراجعات',re:/^review|مراجع/i},{id:'news',en:'News',ar:'الأخبار',re:/^news|أخبار/i},{id:'leaders',en:'Leaders',ar:'القادة',re:/^leaders|قادة/i},
                {id:'shows',en:'Boat shows',ar:'معارض القوارب',re:/boat show|معرض/i},{id:'films',en:'Films',ar:'الأفلام',re:/^film|فيلم/i},{id:'places',en:'Places',ar:'الأماكن',re:null}];
    function ar(){ return root.lang==='ar'; }
    function clean(s){ return (s||'').replace(/\s+/g,' ').trim(); }
    function groupOf(k){ for(var i=0;i<GROUPS.length;i++) if(GROUPS[i].re&&GROUPS[i].re.test(k)) return GROUPS[i].id; return 'news'; }
    function src(im){ return im?(im.currentSrc||im.src||''):''; }
    function index(){
      items=[]; var seen={};
      function add(o){
        o.t=clean(o.t); if(!o.t||seen[o.t]||!o.href) return; seen[o.t]=1;
        o.k=clean(o.k); o.d=clean(o.d); o.x=clean(o.x); o.g=o.g||groupOf(o.k); o.hay=(o.t+' '+o.k+' '+o.x+' '+o.d).toLowerCase(); items.push(o);
      }
      var reelPics=$$('#cover .ysa-reel-p img');
      $$('#cover .ysa-reel-st').forEach(function(st,i){
        var a=$('h1 a,h2 a',st), k=$('.ysa-reel-facts .k',st), lede=$('.ysa-hero-lede',st), d='';
        $$('.ysa-reel-facts li',st).forEach(function(li){ if(!d&&/\d{4}/.test(li.textContent)) d=li.textContent; });
        if(a) add({t:a.textContent,k:k?k.textContent:'',d:d,x:lede?lede.textContent:'',href:a.getAttribute('href'),ext:a.target==='_blank',img:src(reelPics[i])});
      });
      $$('main a[href]').forEach(function(a){
        if(a.closest('#cover')) return;
        var h=$('h1,h2,h3,h4',a), own=a.parentNode&&/^H[1-4]$/.test(a.parentNode.tagName); if(!h&&!own) return;
        var scope=own?a.parentNode.parentNode:a, meta=$('.ysa-meta',scope), kind=meta?$('b',meta):null, date=meta?$('span',meta):null, p=$('p:not(.ysa-meta)',scope);
        add({t:h?h.textContent:a.textContent,k:kind?kind.textContent:'',d:date&&/\d{4}/.test(date.textContent)?date.textContent:'',x:p?p.textContent:'',href:a.getAttribute('href'),ext:a.target==='_blank',img:src($('img',scope))});
      });
      $$('.ysa-ev').forEach(function(ev){
        var h=$('h3',ev), a=$('a[href]',ev), w=$('.ysa-ev-when',ev), p=$('.ysa-ev-tx>p',ev), fl=$('.ysa-flag',ev);
        if(h&&a) add({t:h.textContent,k:ar()?'معرض قوارب':'Boat show',d:w?w.textContent:'',x:p?p.textContent:'',href:a.getAttribute('href'),ext:a.target==='_blank',img:src(fl),flag:!!fl,g:'shows'});
      });
      $$('.ysa-cine-item').forEach(function(f){
        var b=$('b',f); if(b) add({t:b.textContent,k:ar()?'فيلم':'Film',d:f.getAttribute('data-dur')||'',x:'',href:'#videos',img:src($('img',f)),g:'films',film:f.getAttribute('data-film')});
      });
      $$('.ysa-place').forEach(function(pn){
        var s=$('strong',pn), c=$('.ysa-meta b',pn), em=$('em',pn), a=$('a[href]',pn), fl=$('.ysa-flag',pn), sec=pn.closest('section');
        if(s) add({t:s.textContent,k:c?c.textContent:'',d:'',x:em?em.textContent:'',href:a?a.getAttribute('href'):'#'+(sec?sec.id:'top'),ext:!!a,img:src(fl),flag:!!fl,g:'places'});
      });
    }
    function score(it,terms){
      var s=0, t=it.t.toLowerCase(), k=it.k.toLowerCase();
      for(var i=0;i<terms.length;i++){
        var w=terms[i]; if(it.hay.indexOf(w)<0) return 0;
        var p=t.indexOf(w);
        s+= p===0?6 : (p>0&&/[\s:,’'(|]/.test(t.charAt(p-1)))?4 : p>0?3 : k.indexOf(w)>=0?2 : 1;
      }
      return s;
    }
    function hl(text,terms){                           /* the text, with the matching words marked */
      var f=doc.createDocumentFragment();
      if(!terms.length){ f.appendChild(doc.createTextNode(text)); return f; }
      var re=new RegExp('('+terms.map(function(w){ return w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }).join('|')+')','ig');
      text.split(re).forEach(function(part,i){
        if(!part) return;
        if(i%2){ var m=doc.createElement('mark'); m.textContent=part; f.appendChild(m); } else f.appendChild(doc.createTextNode(part));
      });
      return f;
    }
    function el(tag,cls,txt){ var e=doc.createElement(tag); if(cls) e.className=cls; if(txt!=null) e.textContent=txt; return e; }
    function paint(){
      if(!items) index();
      var raw=clean(q.value), terms=raw.toLowerCase().split(' ').filter(Boolean);
      if(clr) clr.hidden=!raw;
      if(quick){                                         /* quick picks while the field is empty: names that are on this page */
        quick.innerHTML='';
        if(!raw){
          quick.appendChild(el('span','',ar()?'جرّب':'Try'));
          (ar()?['Majesty','Azimut','Sunreef','دبي','موناكو']:['Majesty','Azimut','Sunreef','Dubai','Monaco','Charter']).forEach(function(w){
            var b=el('button','',w); b.type='button'; b.addEventListener('click',function(){ q.value=w; paint(); q.focus(); }); quick.appendChild(b);
          });
        }
      }
      var found=items.map(function(it,i){ return {it:it,s:terms.length?score(it,terms):1,i:i}; }).filter(function(o){ return o.s>0; });
      var counts={all:found.length}; found.forEach(function(o){ counts[o.it.g]=(counts[o.it.g]||0)+1; });
      if(group!=='all'&&!counts[group]) group='all';
      if(kindsEl){
        kindsEl.innerHTML='';
        if(found.length) [{id:'all',en:'All',ar:'الكل'}].concat(GROUPS).forEach(function(g){
          if(!counts[g.id]) return;
          var b=el('button',g.id===group?'on':'',ar()?g.ar:g.en); b.type='button'; b.setAttribute('aria-pressed',String(g.id===group));
          b.appendChild(el('i','',String(counts[g.id])));
          b.addEventListener('click',function(){ group=g.id; paint(); });
          kindsEl.appendChild(b);
        });
      }
      var hits=found.filter(function(o){ return group==='all'||o.it.g===group; });
      if(terms.length) hits.sort(function(a,b){ return b.s-a.s||a.i-b.i; });
      list.innerHTML='';
      if(countEl){
        countEl.innerHTML='';
        if(!found.length){
          countEl.appendChild(doc.createTextNode(ar()?'لا شيء في هذه الصفحة يطابق ':'Nothing on this page matches ')); countEl.appendChild(el('b','',raw)); countEl.appendChild(doc.createTextNode(ar()?'. جرّب: ':'. Try: '));
          (ar()?['Majesty','Azimut','دبي']:['Majesty','Azimut','Dubai','Marina']).forEach(function(w){
            var b=el('button','',w); b.type='button'; b.addEventListener('click',function(){ q.value=w; paint(); q.focus(); }); countEl.appendChild(b);
          });
        }else if(terms.length){
          countEl.appendChild(doc.createTextNode(ar()?(hits.length+' نتيجة عن '):(hits.length+(hits.length===1?' result for ':' results for ')))); countEl.appendChild(el('b','',raw));
        }else countEl.textContent=ar()?('في هذه الصفحة: '+found.length+' من الموضوعات والأفلام والأماكن'):(found.length+' stories, films and places on this page');
      }
      hits.slice(0,(terms.length||group!=='all')?12:8).forEach(function(o){
        var it=o.it, li=el('li'), a=el('a'); a.href=it.href; if(it.ext){ a.target='_blank'; a.rel='noopener'; }
        if(it.film) a.setAttribute('data-film-go',it.film);
        var th=el('span','th'+(it.flag?' th--flag':'')); if(it.img){ var im=el('img'); im.src=it.img; im.alt=''; im.decoding='async'; th.appendChild(im); }
        var tx=el('span','tx'), sm=el('small');
        if(it.k){ var kb=el('b'); kb.appendChild(hl(it.k,terms)); sm.appendChild(kb); }
        if(it.d) sm.appendChild(el('span','',it.d));
        var st=el('strong'); st.appendChild(hl(it.t,terms));
        tx.appendChild(sm); tx.appendChild(st);
        if(it.x){ var em=el('em'); em.appendChild(hl(it.x,terms)); tx.appendChild(em); }
        a.appendChild(th); a.appendChild(tx); li.appendChild(a); list.appendChild(li);
      });
    }
    function set(open){
      var bg=$('#ysaBurger');
      if(open&&$('#ysaMenu.open')&&bg) bg.click();                 /* opened from the menu: the menu steps aside */
      panel.hidden=!open; openers.forEach(function(b){ b.setAttribute('aria-expanded',String(open)); });
      if(hd){ if(open) hd.classList.add('is-solid'); else if(!hd.classList.contains('ysa-hd--solid')&&window.scrollY<=24&&!$('#ysaMenu.open')) hd.classList.remove('is-solid'); }
      if(open){ items=null; group='all'; q.value=''; paint(); setTimeout(function(){ q.focus(); },40); }
    }
    function links(){ return $$('a',list); }
    openers.forEach(function(b){ b.addEventListener('click',function(){ set(panel.hidden); }); });
    var x=$('.ysa-find-x',panel); if(x) x.addEventListener('click',function(){ set(false); });
    var form=$('form',panel); if(form) form.addEventListener('submit',function(e){ e.preventDefault(); var l=links(); if(clean(q.value)&&l.length) l[0].focus(); else q.focus(); });   /* Search moves into the results */
    if(clr) clr.addEventListener('click',function(){ q.value=''; paint(); q.focus(); });
    q.addEventListener('input',paint);
    q.addEventListener('keydown',function(e){
      var l=links();
      if(e.key==='ArrowDown'&&l.length){ e.preventDefault(); l[0].focus(); }
      else if(e.key==='Enter'){ e.preventDefault(); if(l.length&&clean(q.value)) l[0].focus(); }
    });
    list.addEventListener('keydown',function(e){
      var l=links(), i=l.indexOf(doc.activeElement); if(i<0) return;
      if(e.key==='ArrowDown'){ e.preventDefault(); (l[i+1]||l[i]).focus(); }
      else if(e.key==='ArrowUp'){ e.preventDefault(); if(i===0) q.focus(); else l[i-1].focus(); }
    });
    panel.addEventListener('click',function(e){
      var a=e.target.closest('a'); if(!a) return;
      var film=a.getAttribute('data-film-go'); set(false);
      if(film){ e.preventDefault(); var it=$('.ysa-cine-item[data-film="'+film+'"]'); if(it) it.click(); }
    });
    doc.addEventListener('click',function(e){                      /* a press on the page behind closes it */
      if(panel.hidden) return;
      var path=e.composedPath?e.composedPath():[e.target];
      if(path.indexOf(panel)>=0||openers.some(function(b){ return path.indexOf(b)>=0; })) return;
      set(false);
    });
    addEventListener('keydown',function(e){
      if(e.key==='Escape'&&!panel.hidden){ set(false); return; }
      if(e.key==='/'&&panel.hidden&&!e.metaKey&&!e.ctrlKey&&!/^(INPUT|TEXTAREA|SELECT)$/.test((doc.activeElement&&doc.activeElement.tagName)||'')){ e.preventDefault(); set(true); }
    });
    addEventListener('ysa:lang',function(){ items=null; if(!panel.hidden) paint(); });
  })();
  /* 23 · THE PORTAL. What an editor saves in the portal (portal.html) shows here, in this browser, as it would for every
          reader once the site runs on its CMS: a changed headline or standfirst in both languages, and a new story at
          the top of the latest list from its day and slot, Gulf time. Nothing is read unless the portal wrote it, so
          without the portal the page is exactly as built. */
  (function(){
    var rep=null, fresh=null;
    try{ rep=JSON.parse(localStorage.getItem('ysa.cms.live')||'null'); fresh=JSON.parse(localStorage.getItem('ysa.cms.fresh')||'null'); }catch(e){}
    function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]; }); }
    function norm(s){ var d=doc.createElement('div'); d.innerHTML=s; return (d.textContent||'').replace(/\s+/g,' ').trim(); }
    if(rep&&rep.length){
      var map={}; rep.forEach(function(r){ if(r&&r.o) map[norm(r.o)]=r; });
      $$('[data-ar]').forEach(function(el){
        var en=(el._en!==undefined)?el._en:(root.lang==='ar'?null:el.innerHTML); if(en===null) return;
        var r=map[norm(en)]; if(!r) return;
        var e2=esc(r.en), a2=esc(r.ar||r.en);
        if(el._en!==undefined) el._en=e2;
        el.setAttribute('data-ar',a2); el.innerHTML=(root.lang==='ar')?a2:e2;
      });
    }
    var list=$('#ysaLatest');
    if(list&&fresh&&fresh.length){
      var now=new Date(Date.now()+4*3600e3).toISOString().slice(0,16), today=now.slice(0,10);
      var MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], MAR=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
      var due=fresh.filter(function(s){ return s&&s.t&&s.at&&s.at<=now; }).sort(function(a,b){ return a.at<b.at?1:-1; });
      due.slice(0,3).reverse().forEach(function(s){
        var d=s.at.slice(0,10), m=+d.slice(5,7)-1, day=+d.slice(8,10), hm=s.at.slice(11,16);
        var en=d===today?'Today, '+hm:day+' '+MON[m]+' '+d.slice(0,4), ar=d===today?'اليوم، '+hm:day+' '+MAR[m]+' '+d.slice(0,4);
        var li=doc.createElement('li'); li.className='ysa-fresh';
        li.innerHTML='<a class="ysa-lrow" href="'+esc(s.u||'#news')+'"'+(s.u?' target="_blank" rel="noopener"':'')+'><span class="ysa-lrow-tx"><p class="ysa-meta"><b data-ar="'+esc(s.ca||s.c)+'">'+esc(s.c)+'</b><i></i><span data-ar="'+esc(ar)+'">'+esc(en)+'</span></p><h4 data-ar="'+esc(s.ar||s.t)+'">'+esc(s.t)+'</h4></span>'+
          (s.f?'<span class="ysa-fig"><img src="'+esc(s.f)+'" alt="" loading="lazy" decoding="async"></span>':'<span class="ysa-fig"></span>')+'</a>';
        if(root.lang==='ar') $$('[data-ar]',li).forEach(function(el){ el._en=el.innerHTML; el.innerHTML=el.getAttribute('data-ar'); });
        list.insertBefore(li,list.firstChild);
      });
      var rows=$$('li',list); for(var i=5;i<rows.length;i++) rows[i].hidden=true;   /* the list keeps five */
    }
  })();
  /* 24 · THE NEWS SECTIONS AS TABS ON A PHONE ("is this scrollable or something, make sure the mobile, its structure
          well"). Under 700 px the three sections are tabs: one section in full view, the others a tap away, no card cut
          off at the edge. Wider screens show all three side by side and the tabs are not drawn. */
  (function(){
    var bar=$('.ysa-beat-tabs'), beats=$$('.ysa-beat'); if(!bar||!beats.length) return;
    var tabs=$$('[data-beat]',bar);
    function pick(i){
      tabs.forEach(function(t,k){ t.setAttribute('aria-selected',String(k===i)); t.tabIndex=(k===i)?0:-1; });
      beats.forEach(function(b,k){ b.classList.toggle('on',k===i); });
    }
    tabs.forEach(function(t,k){
      t.addEventListener('click',function(){ pick(k); });
      t.addEventListener('keydown',function(e){
        var d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0; if(!d) return;
        if(root.dir==='rtl') d=-d; var n=(k+d+tabs.length)%tabs.length; pick(n); tabs[n].focus(); e.preventDefault();
      });
    });
    pick(0);
  })();
})();
