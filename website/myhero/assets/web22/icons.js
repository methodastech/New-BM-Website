/* MyHero · clean line icons (23 Oct 2026). Replaces the illustrated spots: one weight, one colour, crisp at any size.
   window.blSpot(name, cls) returns an inline SVG with class "bl-spot", as spots.js did, so every data-spot call keeps working.
   The stroke never scales (vector-effect), so a 30 px icon and a 72 px tile share the same 2 px line. */
(function(){
var P={
 heart:'<path d="M12 20.3 4.6 13a4.4 4.4 0 0 1 6.2-6.2L12 8l1.2-1.2a4.4 4.4 0 0 1 6.2 6.2z"/>',
 drop:'<path d="M12 3.5c3.6 4.3 5.5 7.3 5.5 10a5.5 5.5 0 0 1-11 0c0-2.7 1.9-5.7 5.5-10z"/>',
 tube:'<path d="M9 3h6M10 3v10.2a2 2 0 1 0 4 0V3M10 10h4"/>',
 pill:'<rect x="3.5" y="8.5" width="17" height="7" rx="3.5" transform="rotate(-35 12 12)"/><path d="m8.8 6.8 6.4 10.4"/>',
 cal:'<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="m9.5 15.2 1.8 1.8 3.4-3.6"/>',
 shield:'<path d="M12 3.5 5 6v5.2c0 4.3 2.9 7.6 7 9.3 4.1-1.7 7-5 7-9.3V6z"/><path d="m9.2 12 1.9 1.9 3.7-3.8"/>',
 lock:'<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3M12 14.5v2.5"/>',
 doc:'<path d="M7 3.5h6.5L18 8v11a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5a1.5 1.5 0 0 1 1-1.5z"/><path d="M13.5 3.5V8H18M9 12h6M9 15.5h6"/>',
 share:'<path d="M12 14V4M8.5 7.5 12 4l3.5 3.5"/><path d="M5.5 12v6A1.5 1.5 0 0 0 7 19.5h10a1.5 1.5 0 0 0 1.5-1.5v-6"/>',
 users:'<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/><path d="M15 5.6a3.2 3.2 0 0 1 0 5.8M17 14.3c2.1.6 3.5 2.4 3.5 4.7"/>',
 user:'<circle cx="12" cy="8.5" r="3.5"/><path d="M5 19.5c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5"/>',
 steth:'<path d="M6 4v5.5a4 4 0 0 0 8 0V4"/><path d="M5 3.5h2M13 3.5h2"/><path d="M10 13.5v2a4.5 4.5 0 0 0 9 0v-2.3"/><circle cx="19" cy="11" r="2.2"/>',
 clinic:'<path d="M4.5 20.5v-11l7.5-5.5 7.5 5.5v11"/><path d="M3 20.5h18M12 11.5v5M9.5 14h5"/>',
 home:'<path d="M4.5 11 12 4.5l7.5 6.5"/><path d="M6.5 10v9.5a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V10"/><path d="M10 20.5v-5h4v5"/>',
 track:'<path d="M4 18.5h16"/><path d="m5 14 4-4.5 3.5 3L19 6"/><path d="M15.5 6H19v3.5"/>',
 star:'<path d="m12 3.8 2.5 5.2 5.7.7-4.2 3.9 1.1 5.6L12 16.4l-5.1 2.8 1.1-5.6-4.2-3.9 5.7-.7z"/>',
 phone:'<rect x="7" y="3" width="10" height="18" rx="2.2"/><path d="M10.5 6h3M11 18h2"/>',
 chat:'<path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5h-8L7 20v-3.5H5A1.5 1.5 0 0 1 3.5 15V7A1.5 1.5 0 0 1 5 5.5z"/><path d="M8 9.5h8M8 12.5h5"/>',
 globe:'<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.6 3.8 5.4 3.8 8.5s-1.2 5.9-3.8 8.5c-2.6-2.6-3.8-5.4-3.8-8.5S9.4 6.1 12 3.5z"/>',
 clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
 help:'<circle cx="12" cy="12" r="8.5"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.1.9-1.1 1.8"/><path d="M12 17h.01"/>',
 rec:'<rect x="9" y="3.5" width="6" height="10.5" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v3.5M9 20.5h6"/>',
 camera:'<path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.3l1.4-2h5.6l1.4 2h2.3A1.5 1.5 0 0 1 20 8.5V18a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18z"/><circle cx="12" cy="13" r="3.3"/>',
 mail:'<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4 7 8 6 8-6"/>',
 bell:'<path d="M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 1.5h-14z"/><path d="M10 20.5h4"/>',
 gear:'<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.3M12 18.2v2.3M3.5 12h2.3M18.2 12h2.3M6 6l1.6 1.6M16.4 16.4 18 18M6 18l1.6-1.6M16.4 7.6 18 6"/>',
 clip:'<path d="m16.5 8.5-6.6 6.6a2 2 0 0 1-2.8-2.8l7-7a3.5 3.5 0 0 1 5 5l-7.4 7.4a5 5 0 0 1-7.1-7.1L10.5 4.7"/>',
 flame:'<path d="M12 3.5c1 3 3.5 4.5 3.5 8.2a3.5 3.5 0 0 1-7 0c0-1.1.3-2 .8-2.8.3 1 .9 1.6 1.7 1.8C10.6 8.3 10 6 12 3.5z"/><path d="M7 13.5a5 5 0 1 0 10 0"/>',
 photo:'<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m4 17 5-5 4 4 2.5-2.5L20 17"/>',
 medal:'<circle cx="12" cy="14.5" r="5"/><path d="m8.5 10.5-2-7h4l1.5 5M15.5 10.5l2-7h-4L12 8.5"/>',
 trophy:'<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4.5a3 3 0 0 0 3 3M17 6h2.5a3 3 0 0 1-3 3M12 14v3M8.5 20.5h7M9.5 17h5v3.5h-5z"/>',
 sos:'<circle cx="12" cy="12" r="8.5"/><path d="M12 8v5M12 16h.01"/>',
 scale:'<path d="M12 4v16M4 20h16"/><path d="M4.5 10 7 5l2.5 5a2.5 2.5 0 0 1-5 0zM14.5 10 17 5l2.5 5a2.5 2.5 0 0 1-5 0z"/><path d="M7 5h10"/>'
};
P.bm=P.globe;P.en=P.globe;P.scan=P.camera;P.visit=P.cal;
window.blSpot=function(k,cls){var n=P[k]?k:'doc';return '<svg class="bl-spot'+(cls?' '+cls:'')+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" aria-hidden="true" data-spot="'+n+'">'+P[n].replace(/<(path|circle|rect)/g,'<$1 vector-effect="non-scaling-stroke"')+'</svg>';};
})();
