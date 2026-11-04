/* MyHero · render the explainer storyboard to frames, then to MP4 (23 Oct 2026).
   node tools/explainer/render.cjs <serverBase> <outDir> [fps] [fromFrame] [toFrame]   e.g. http://localhost:8801 /tmp/frames 24
   Frames are captured by stepping window.seek(t); the audio is mixed afterwards by tools/explainer/mux.py. */
const puppeteer=require('/Users/zieel/Bazil Claude 3/Websites/iaq website/node_modules/puppeteer-core');
const fs=require('fs');const BASE=process.argv[2],OUT=process.argv[3],FPS=+(process.argv[4]||24);
fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new',args:['--hide-scrollbars'],protocolTimeout:600000});
const p=await b.newPage();await p.setViewport({width:1280,height:720,deviceScaleFactor:1.5});
await p.goto(BASE+'/tools/explainer/explainer.html',{waitUntil:'networkidle0',timeout:120000});
await p.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.complete?1:new Promise(r=>{i.onload=i.onerror=r})))});
const END=await p.evaluate(()=>END);const N=Math.round(END*FPS);const FROM=+(process.argv[5]||0),TO=Math.min(N,+(process.argv[6]||N));  // optional frame range, to re-render a scene
for(let i=FROM;i<TO;i++){await p.evaluate(t=>seek(t),i/FPS);await p.screenshot({path:`${OUT}/f${String(i).padStart(5,'0')}.jpg`,type:'jpeg',quality:92});if(i%120===0)console.log('frame',i,'of',N)}
console.log('done',N,'frames');await b.close()})();
