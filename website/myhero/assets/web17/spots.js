/* MyHero spot illustrations, 6 October 2026. Zieel: "more like duolingo ui but more white" and "those gradients without
   visuals look very bad". Each hero card now carries one flat object instead of an empty glow. Drawn the Duolingo way:
   a flat shape, the same shape a few pixels lower in a darker shade as its lip, one white highlight, a soft floor shadow.
   Teal and rose only, so the colour caps on each screen still hold. No gradients and no ids, so a spot can repeat on a page. */
(function(){
 var T='#18B4C1',T1='#5AD6E0',TS='#0A8E9A',R='#FF4F6B',RS='#D81F3F',W='#FFFFFF',GL='#F3F7F9',G1='#E6ECEF',G2='#D2DBE0',G3='#A9B6BF',FL='#EEF2F4';
 function d3(d,b,s,o){return '<path d="'+d+'" fill="'+s+'" transform="translate(0 '+(o||6)+')"/><path d="'+d+'" fill="'+b+'"/>';}
 function hl(d,w,op){return '<path d="'+d+'" fill="none" stroke="#fff" stroke-opacity="'+(op||.6)+'" stroke-width="'+(w||5)+'" stroke-linecap="round" stroke-linejoin="round"/>';}
 function ln(d,c,w){return '<path d="'+d+'" fill="none" stroke="'+c+'" stroke-width="'+(w||5)+'" stroke-linecap="round" stroke-linejoin="round"/>';}
 function floor(rx){return '<ellipse cx="60" cy="111" rx="'+(rx||32)+'" ry="5.5" fill="'+FL+'"/>';}
 function star(c){return '<path d="M60.0 35.0L63.9 44.7L74.3 45.4L66.3 52.0L68.8 62.1L60.0 56.6L51.2 62.1L53.7 52.0L45.7 45.4L56.1 44.7Z" fill="'+(c||W)+'"/>';}
 var S={
  heart:floor(30)+d3('M60 98C38 84 18 68 18 46C18 32 28 22 41 22C50 22 56 27 60 34C64 27 70 22 79 22C92 22 102 32 102 46C102 68 82 84 60 98Z',R,RS,7)
   +ln('M30 58H46L52 46L60 72L67 52L72 58H90',W,6)+hl('M29 42C30 36 34 32 40 32'),
  drop:floor(28)+d3('M60 10C60 10 28 48 28 70C28 88 42 100 60 100C78 100 92 88 92 70C92 48 60 10 60 10Z',R,RS,7)
   +hl('M42 74C42 64 45 56 50 49',6)+'<circle cx="72" cy="80" r="5" fill="#fff" fill-opacity=".35"/>',
  tube:floor(26)+'<g transform="rotate(18 60 60)">'+d3('M44 30V84A16 16 0 0 0 76 84V30Z',GL,G2,6)+d3('M44 58H76V84A16 16 0 0 1 44 84Z',T,TS,0)
   +'<rect x="44" y="56" width="32" height="5" fill="'+T1+'"/>'+d3('M40 14H80Q84 14 84 18V24Q84 28 80 28H40Q36 28 36 24V18Q36 14 40 14Z',G1,G2,4)
   +'<circle cx="54" cy="74" r="3.2" fill="#fff" fill-opacity=".7"/><circle cx="64" cy="86" r="2.6" fill="#fff" fill-opacity=".7"/><circle cx="62" cy="67" r="2" fill="#fff" fill-opacity=".7"/></g>',
  tubeR:floor(26)+'<g transform="rotate(18 60 60)">'+d3('M44 30V84A16 16 0 0 0 76 84V30Z',GL,G2,6)+d3('M44 58H76V84A16 16 0 0 1 44 84Z',R,RS,0)
   +'<rect x="44" y="56" width="32" height="5" fill="#FF8C9E"/>'+d3('M40 14H80Q84 14 84 18V24Q84 28 80 28H40Q36 28 36 24V18Q36 14 40 14Z',G1,G2,4)
   +'<circle cx="54" cy="74" r="3.2" fill="#fff" fill-opacity=".7"/><circle cx="64" cy="86" r="2.6" fill="#fff" fill-opacity=".7"/></g>',
  scale:floor(36)+d3('M22 34Q22 22 34 22H86Q98 22 98 34V86Q98 98 86 98H34Q22 98 22 86Z',GL,G2,7)
   +d3('M40 32H80Q86 32 86 38V50Q86 56 80 56H40Q34 56 34 50V38Q34 32 40 32Z',T,TS,3)+ln('M46 44H52M58 44H64M70 44H74',W,4.5)
   +'<rect x="32" y="66" width="22" height="22" rx="7" fill="'+G1+'"/><rect x="66" y="66" width="22" height="22" rx="7" fill="'+G1+'"/>',
  pill:floor(34)+'<g transform="rotate(-35 56 56)">'+d3('M40 40H58V72H40A16 16 0 0 1 40 40Z',T,TS,6)+d3('M58 40H76A16 16 0 0 1 76 72H58Z',GL,G2,6)
   +hl('M36 49H50',4.5)+'</g>'+d3('M88 76A14 14 0 1 1 87.9 76Z',GL,G2,5)+ln('M80 90H96',G2,3.5),
  cal:floor(34)+d3('M24 32Q24 24 32 24H88Q96 24 96 32V92Q96 100 88 100H32Q24 100 24 92Z','#F7FAFB',G2,7)
   +'<path d="M24 32Q24 24 32 24H88Q96 24 96 32V46H24Z" fill="'+R+'"/>'+'<rect x="40" y="14" width="9" height="20" rx="4.5" fill="'+G3+'"/><rect x="71" y="14" width="9" height="20" rx="4.5" fill="'+G3+'"/>'
   +[[34,56],[53,56],[72,56],[34,75],[53,75]].map(function(p){return '<rect x="'+p[0]+'" y="'+p[1]+'" width="14" height="14" rx="4" fill="'+G1+'"/>';}).join('')
   +d3('M76 75H82Q86 75 86 79V85Q86 89 82 89H76Q72 89 72 85V79Q72 75 76 75Z',T,TS,3)+ln('M75.5 82L78.5 85L83 79.5',W,2.8),
  shield:floor(30)+d3('M60 12L96 24V54C96 78 80 96 60 104C40 96 24 78 24 54V24Z',T,TS,7)
   +'<path d="M60 20L32 29.5V54C32 73 44 88 60 95.5Z" fill="#fff" fill-opacity=".16"/>'
   +'<rect x="45" y="52" width="30" height="24" rx="6" fill="'+W+'"/>'+ln('M51 52V46A9 9 0 0 1 69 46V52',W,5)+'<circle cx="60" cy="62" r="3.4" fill="'+TS+'"/><rect x="58.4" y="62" width="3.2" height="7" rx="1.6" fill="'+TS+'"/>',
  medal:floor(26)+'<path d="M46 66L36 104L48 97L56 106L62 72Z" fill="'+R+'"/><path d="M74 66L84 104L72 97L64 106L58 72Z" fill="'+RS+'"/>'
   +d3('M60 20A30 30 0 1 1 59.9 20Z',T,TS,6)+'<circle cx="60" cy="50" r="21" fill="'+T1+'" fill-opacity=".55"/>'+star()+hl('M38 40C40 33 45 28 51 25',4.5,.5),
  doc:floor(32)+d3('M36 16H74L90 32V94Q90 100 84 100H36Q30 100 30 94V22Q30 16 36 16Z','#F7FAFB',G2,7)+'<path d="M74 16V28Q74 32 78 32H90Z" fill="'+G2+'"/>'
   +ln('M40 34H58',T,5)+ln('M40 48H74M40 60H80M40 72H64',G1,5)+d3('M86 72A16 16 0 1 1 85.9 72Z',T,TS,5)+ln('M80 94L92 82M84 82H92V90',W,4),
  steth:floor(32)+ln('M38 20V42C38 58 50 68 60 68C70 68 82 58 82 42V20',G3,7)+ln('M60 68V80C60 94 70 100 82 98',G3,7)
   +'<rect x="31" y="12" width="14" height="10" rx="5" fill="#5D6A75"/><rect x="75" y="12" width="14" height="10" rx="5" fill="#5D6A75"/>'
   +d3('M86 82A14 14 0 1 1 85.9 82Z',T,TS,5)+'<circle cx="86" cy="96" r="6.5" fill="'+T1+'"/>'+hl('M77 92C78 88 80 86 83 85',3.5,.55),
  bell:floor(30)+d3('M60 20C44 20 34 32 34 48V66L26 80H94L86 66V48C86 32 76 20 60 20Z',T,TS,6)+'<circle cx="60" cy="18" r="6" fill="'+TS+'"/>'
   +d3('M60 82A9 9 0 1 1 59.9 82Z',R,RS,3)+hl('M44 50C44 40 49 33 55 31',5,.5),
  trophy:floor(28)+ln('M38 30H27V38C27 46 33 52 41 52',T,6)+ln('M82 30H93V38C93 46 87 52 79 52',T,6)
   +d3('M36 20H84V44C84 60 74 70 60 70C46 70 36 60 36 44Z',T,TS,6)+'<rect x="53" y="70" width="14" height="14" fill="'+TS+'"/>'
   +d3('M40 84H80Q84 84 84 88V94Q84 98 80 98H40Q36 98 36 94V88Q36 84 40 84Z',T,TS,5)
   +'<path d="M60.0 29.0L62.8 36.1L70.5 36.6L64.6 41.5L66.5 48.9L60.0 44.8L53.5 48.9L55.4 41.5L49.5 36.6L57.2 36.1Z" fill="#fff"/>'+hl('M42 30V42',4,.5),
  sos:floor(32)+d3('M26 30Q26 20 36 20H84Q94 20 94 30V86Q94 96 84 96H36Q26 96 26 86Z',R,RS,7)+'<path d="M52 36H68V50H82V66H68V80H52V66H38V50H52Z" fill="#fff"/>',
  /* list rows, from the Duolingo pins Zieel sent on 6 Oct: every row leads with a small coloured picture */
  help:floor(30)+d3('M22 30Q22 18 34 18H86Q98 18 98 30V70Q98 82 86 82H54L38 98V82H34Q22 82 22 70Z',T,TS,6)+ln('M50 40Q50 30 60 30Q70 30 70 40Q70 47 60 50V55',W,7)+'<circle cx="60" cy="67" r="4.6" fill="#fff"/>',
  chat:floor(30)+d3('M22 30Q22 18 34 18H86Q98 18 98 30V70Q98 82 86 82H54L38 98V82H34Q22 82 22 70Z',T,TS,6)+'<circle cx="42" cy="50" r="6" fill="#fff"/><circle cx="60" cy="50" r="6" fill="#fff"/><circle cx="78" cy="50" r="6" fill="#fff"/>',
  track:floor(34)+d3('M30 22H90Q100 22 100 32V88Q100 98 90 98H30Q20 98 20 88V32Q20 22 30 22Z',GL,G2,7)+ln('M32 80H88',G1,4)+ln('M32 74L50 56L64 64L86 38',T,7)+d3('M86 31A7 7 0 1 1 85.9 31Z',R,RS,2),
  phone:floor(28)+'<g transform="translate(13 10) scale(3.9)"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="'+TS+'" transform="translate(0 1.5)"/><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="'+T+'"/></g>'+hl('M28 30C28 26 30 24 33 23',4,.55),
  user:floor(30)+d3('M24 100C24 78 40 66 60 66C80 66 96 78 96 100Z',T,TS,6)+d3('M60 20A20 20 0 1 1 59.9 20Z',T,TS,5)+hl('M48 34C49 30 52 27 56 26',4.5,.55),
  users:floor(36)+d3('M58 98C58 82 68 72 82 72C96 72 106 82 106 98Z',R,RS,6)+d3('M82 38A15 15 0 1 1 81.9 38Z',R,RS,4)
   +d3('M14 100C14 80 28 68 46 68C64 68 78 80 78 100Z',T,TS,6)+d3('M46 24A19 19 0 1 1 45.9 24Z',T,TS,5),
  mail:floor(36)+d3('M20 34Q20 26 28 26H92Q100 26 100 34V86Q100 94 92 94H28Q20 94 20 86Z',GL,G2,7)+'<path d="M20 34Q20 26 28 26H92Q100 26 100 34L60 64Z" fill="'+T+'"/>'+ln('M24 88L50 62M96 88L70 62',G2,4),
  lock:floor(30)+ln('M40 56V42A20 20 0 0 1 80 42V56',G3,9)+d3('M28 60Q28 52 36 52H84Q92 52 92 60V92Q92 100 84 100H36Q28 100 28 92Z',T,TS,6)+'<circle cx="60" cy="72" r="6" fill="#fff"/><rect x="57" y="72" width="6" height="14" rx="3" fill="#fff"/>',
  globe:floor(30)+d3('M60 18A40 40 0 1 1 59.9 18Z',T,TS,6)+'<g fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="4"><ellipse cx="60" cy="58" rx="16" ry="40"/><path d="M20 58H100M26 38Q60 48 94 38M26 78Q60 68 94 78"/></g>',
  gear:floor(32)+d3('M92.3 51.4L101.6 52.6L101.6 63.4L92.3 64.6L87.5 76.2L93.3 83.6L85.6 91.3L78.2 85.5L66.6 90.3L65.4 99.6L54.6 99.6L53.4 90.3L41.8 85.5L34.4 91.3L26.7 83.6L32.5 76.2L27.7 64.6L18.4 63.4L18.4 52.6L27.7 51.4L32.5 39.8L26.7 32.4L34.4 24.7L41.8 30.5L53.4 25.7L54.6 16.4L65.4 16.4L66.6 25.7L78.2 30.5L85.6 24.7L93.3 32.4L87.5 39.8Z',G3,'#8E9AA3',6)+'<circle cx="60" cy="58" r="14" fill="#fff"/>',
  clock:floor(30)+d3('M60 18A40 40 0 1 1 59.9 18Z',T,TS,6)+'<circle cx="60" cy="58" r="31" fill="#fff"/>'+ln('M60 58V38M60 58L74 66','#3C4650',6)+'<circle cx="60" cy="58" r="5" fill="'+R+'"/>',
  clip:floor(30)+d3('M34 22H86Q94 22 94 30V96Q94 104 86 104H34Q26 104 26 96V30Q26 22 34 22Z',G3,'#8E9AA3',6)+'<rect x="34" y="32" width="52" height="64" rx="5" fill="#fff"/>'+d3('M46 14H74Q78 14 78 18V30Q78 34 74 34H46Q42 34 42 30V18Q42 14 46 14Z',T,TS,3)+ln('M42 50H76M42 62H76M42 74H64',G1,5),
  clinic:floor(38)+d3('M24 50L60 24L96 50V98H24Z',GL,G2,7)+'<path d="M18 52L60 20L102 52" fill="none" stroke="'+T+'" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>'+d3('M52 74H68V98H52Z',T,TS,0)+d3('M60 38A11 11 0 1 1 59.9 38Z',R,RS,3)+'<path d="M58 43H62V47H66V51H62V55H58V51H54V47H58Z" fill="#fff"/>',
  star:floor(30)+d3('M60.00 22.00L69.64 46.48L95.53 47.73L75.36 64.02L82.63 90.27L60.00 76.00L37.37 90.27L44.64 64.02L24.47 47.73L50.36 46.48Z',T,TS,7)+hl('M44 52L52 50',4.5,.55),
  flame:floor(26)+d3('M60 14C60 14 34 40 34 66A26 26 0 0 0 86 66C86 54 78 44 72 38C70 48 64 52 64 52C66 40 60 26 60 14Z','#F2A516','#B8730A',6)+'<path d="M60 58C60 58 48 70 48 80A12 12 0 0 0 72 80C72 72 64 66 60 58Z" fill="#FFD166"/>'+hl('M44 66C44 58 48 50 52 46',4.5,.5),
  photo:floor(36)+d3('M28 24H92Q100 24 100 32V88Q100 96 92 96H28Q20 96 20 88V32Q20 24 28 24Z',GL,G2,7)+'<rect x="28" y="32" width="64" height="52" rx="5" fill="#DDF3F6"/><path d="M28 84L50 56L66 74L76 64L92 84Z" fill="'+T+'"/><circle cx="76" cy="46" r="7" fill="'+R+'"/>'
 };
 /* language flags, the way Duolingo lists courses; drawn plain, the row rounds the corners */
 window.FLAG={
  bm:'<svg viewBox="0 0 28 14" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'+[0,1,2,3,4,5,6,7,8,9,10,11,12,13].map(function(i){return '<rect y="'+i+'" width="28" height="1" fill="'+(i%2?'#fff':'#CC0001')+'"/>';}).join('')
   +'<rect width="14" height="8" fill="#010066"/><circle cx="5.6" cy="4" r="3" fill="#FFCC00"/><circle cx="6.5" cy="4" r="2.45" fill="#010066"/>'
   +'<path d="M10.40 1.30L10.66 2.88L11.57 1.57L11.12 3.10L12.51 2.32L11.44 3.50L13.03 3.40L11.55 4.00L13.03 4.60L11.44 4.50L12.51 5.68L11.12 4.90L11.57 6.43L10.66 5.12L10.40 6.70L10.14 5.12L9.23 6.43L9.68 4.90L8.29 5.68L9.36 4.50L7.77 4.60L9.25 4.00L7.77 3.40L9.36 3.50L8.29 2.32L9.68 3.10L9.23 1.57L10.14 2.88Z" fill="#FFCC00"/></svg>',
  en:'<svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="60" height="30" fill="#012169"/><path d="M0 0L60 30M60 0L0 30" stroke="#fff" stroke-width="6"/><path d="M0 0L60 30M60 0L0 30" stroke="#C8102E" stroke-width="2"/><path d="M30 0V30M0 15H60" stroke="#fff" stroke-width="10"/><path d="M30 0V30M0 15H60" stroke="#C8102E" stroke-width="6"/></svg>'
 };
 var MAP={bp:'heart',heart:'heart',track:'heart',drop:'drop',tube:'tube',artery:'tubeR',scale:'scale',pill:'pill',cal:'cal',shield:'shield',card:'medal',
  share:'doc',doc:'doc',rec:'doc',file:'doc',camera:'doc',steth:'steth',bell:'bell',check:'trophy',sos:'sos',allergy:'sos'};
 /* the icons a list row may swap for a picture; anything not named here keeps its tile */
 var ROW={pill:'pill',doc:'doc',share:'doc',file:'doc',steth:'steth',cal:'cal',bell:'bell',heart:'heart',bp:'heart',drop:'drop',tube:'tube',scale:'scale',
  shield:'shield',sos:'sos',allergy:'sos',check:'trophy',card:'medal',help:'help',chat:'chat',track:'track',phone:'phone',user:'user',users:'users',mail:'mail',
  lock:'lock',globe:'globe',gear:'gear',clock:'clock',clip:'clip',clinic:'clinic',star:'star',photo:'photo'};
 window.blRowSpots=function(h){return h.replace(/<span class="bl-rk([^"]*)"><svg data-i="([\w-]+)"[^>]*>[\s\S]*?<\/svg><\/span>/g,function(m,c,k){return ROW[k]?'<span class="bl-rk sp'+c+'">'+window.blSpot(ROW[k])+'</span>':m;});};
 /* the tab bar, 7 Oct 2026, from the Duolingo league screen Zieel sent: five coloured picture icons, each a flat shape
    on a darker lip, in place of the line icons. Upload keeps its red circle. */
 window.TABPIC={
  home:'<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 15.5 16 6l11 9.5V26a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z" fill="#0A8E9A" transform="translate(0 2)"/><path d="M5 15.5 16 6l11 9.5V26a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z" fill="#18B4C1"/><path d="M3.2 15.4 16 4.3l12.8 11.1" fill="none" stroke="#D81F3F" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 1.6)"/><path d="M3.2 15.4 16 4.3l12.8 11.1" fill="none" stroke="#FF4F6B" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/><rect x="12.6" y="17.5" width="6.8" height="10.5" rx="1.8" fill="#fff"/><circle cx="18.1" cy="23" r=".9" fill="#0A8E9A"/></svg>',
  rec:'<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="6" y="6" width="20" height="23" rx="3" fill="#B9C6CE" transform="translate(0 2)"/><rect x="6" y="6" width="20" height="23" rx="3" fill="#EEF3F6"/><rect x="10.5" y="3.5" width="11" height="6" rx="2.2" fill="#2F6FD1"/><rect x="10.5" y="3.5" width="11" height="2.6" rx="1.3" fill="#5B93E8"/><path d="M10.5 15h11M10.5 19.5h11M10.5 24h6" fill="none" stroke="#2F6FD1" stroke-width="2.4" stroke-linecap="round"/></svg>',
  camera:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8.5A2 2 0 0 1 6 6.5h2.2l1.3-2h5l1.3 2H18a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><circle cx="12" cy="12.5" r="3.4"/></svg>',
  steth:'<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="7" width="24" height="22" rx="3.5" fill="#D9E1E6" transform="translate(0 2)"/><rect x="4" y="7" width="24" height="22" rx="3.5" fill="#F7F9FA"/><path d="M4 10.5A3.5 3.5 0 0 1 7.5 7h17A3.5 3.5 0 0 1 28 10.5V14H4Z" fill="#F2A516"/><rect x="9" y="3.5" width="4" height="7" rx="2" fill="#B8730A"/><rect x="19" y="3.5" width="4" height="7" rx="2" fill="#B8730A"/><path d="M10.5 22.2l3.4 3.3 7.6-7.8" fill="none" stroke="#18B4C1" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  user:'<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="12.5" fill="#0A8E9A" transform="translate(0 2)"/><circle cx="16" cy="16" r="12.5" fill="#18B4C1"/><path d="M16 8.2c-4.3 0-7 3.3-7 7.7 0 3.6 2.2 6.3 4.5 7.5h5c2.3-1.2 4.5-3.9 4.5-7.5 0-4.4-2.7-7.7-7-7.7Z" fill="#F6D2B0"/><path d="M11.6 14.2c.9-.9 2.1-.9 3 0M17.4 14.2c.9-.9 2.1-.9 3 0" fill="none" stroke="#4A2E1C" stroke-width="1.5" stroke-linecap="round"/><circle cx="13.2" cy="17" r="1.3" fill="#4A2E1C"/><circle cx="18.8" cy="17" r="1.3" fill="#4A2E1C"/><path d="M13.3 20.6c1.6 1.7 3.8 1.7 5.4 0" fill="none" stroke="#D81F3F" stroke-width="1.8" stroke-linecap="round"/><circle cx="24.5" cy="9" r="2.6" fill="#FF4F6B"/></svg>'
 };
 window.SPOT=S;
 window.blSpot=function(k,cls){var n=S[k]?k:(MAP[k]||'doc');return '<svg class="bl-spot'+(cls?' '+cls:'')+'" viewBox="0 0 120 120" aria-hidden="true" data-spot="'+n+'">'+S[n]+'</svg>';};
})();
