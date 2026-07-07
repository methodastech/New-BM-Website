/* RubexPay EN/CN language toggle — runtime dictionary swap (translations in i18n-cn.js as window.RBX_CN) */
(function(){
  var DICT = window.RBX_CN || {};
  var KEY = 'rbx-lang';
  var SEL = 'h1,h2,h3,h4,p,li,.btn,.nav-cta,.nav-links a,.foot-col a,.fk,.flow-k,.hero-2nd,.hero-note,.eyebrow,.op-area,.metric .mk,.sol-mod-k,.sol-mod-tag,.sol-trust-body h3,.ros-open,.cform-head,label,.cform-label,.mnav-links a,.mnav-cta,.solx-k,.solx-foot,.solx-ft';
  function norm(t){ return (t||'').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,'-').replace(/\s+/g,' ').trim(); }
  function keyOf(el){
    if(el.hasAttribute && el.hasAttribute('data-split')){
      var lns = el.querySelectorAll('.ln i');
      if(lns.length) return norm([].map.call(lns,function(i){return i.textContent;}).join(' '));
    }
    if(el.querySelector && el.querySelector('.arr,.ros-open span,.res-more span,.cform-head b')){
      var c = el.cloneNode(true);
      [].forEach.call(c.querySelectorAll('.arr,.ros-open span,.res-more span'),function(x){x.remove();});
      return norm(c.textContent);
    }
    return norm(el.textContent);
  }
  function apply(lang){
    [].forEach.call(document.querySelectorAll(SEL), function(el){
      if(el.getAttribute('data-en') === null && el.querySelector('.btn,button,input,textarea,form,h1,h2,h3,h4,li')) return;
      var k = keyOf(el);
      if(lang === 'zh'){
        if(Object.prototype.hasOwnProperty.call(DICT, k) && DICT[k]){
          if(el.getAttribute('data-en') === null) el.setAttribute('data-en', el.innerHTML);
          var v = DICT[k];
          if(/<br/i.test(v)) el.innerHTML = v; else el.textContent = v;
        }
      } else {
        var h = el.getAttribute('data-en');
        if(h !== null){ el.innerHTML = h; el.removeAttribute('data-en'); }
      }
    });
    /* SEO: swap <title> + meta description like the live site */
    function swapMeta(el, attr){
      if(!el) return;
      var cur = attr ? el.getAttribute(attr) : el.textContent;
      if(lang === 'zh'){
        var k = norm(cur);
        if(Object.prototype.hasOwnProperty.call(DICT, k) && DICT[k]){
          if(!el.__rbxEn) el.__rbxEn = cur;
          if(attr) el.setAttribute(attr, DICT[k]); else el.textContent = DICT[k];
        }
      } else if(el.__rbxEn){
        if(attr) el.setAttribute(attr, el.__rbxEn); else el.textContent = el.__rbxEn;
        el.__rbxEn = null;
      }
    }
    swapMeta(document.querySelector('title'), null);
    swapMeta(document.querySelector('meta[name="description"]'), 'content');
    try{ document.documentElement.lang = (lang === 'zh' ? 'zh-CN' : 'en'); }catch(e){}
    try{ localStorage.setItem(KEY, lang); }catch(e){}
    [].forEach.call(document.querySelectorAll('[data-lang]'), function(b){
      var on = b.getAttribute('data-lang') === lang;
      b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  document.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('[data-lang]');
    var sw = e.target.closest && e.target.closest('.lang-switch');
    /* phone: the header switch collapses to the active lang — first tap opens the dropdown, any other tap closes it */
    if(window.matchMedia && matchMedia('(max-width:760px)').matches){
      var open = document.querySelector('.lang-switch.is-open');
      if(sw && !sw.classList.contains('is-open') && b && b.classList.contains('is-active')){
        sw.classList.add('is-open');
        return;
      }
      if(open) open.classList.remove('is-open');
    }
    if(!b) return;
    e.preventDefault(); apply(b.getAttribute('data-lang') === 'zh' ? 'zh' : 'en');
  });
  window.RBX_applyLang = apply;
  function init(){ var l = 'en'; try{ l = localStorage.getItem(KEY) || 'en'; }catch(e){} apply(l === 'zh' ? 'zh' : 'en'); }
  if(document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
})();
