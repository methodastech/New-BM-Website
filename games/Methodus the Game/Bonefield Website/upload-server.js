const http=require('http');const fs=require('fs');const path=require('path');
http.createServer((req,res)=>{
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','*');
  if(req.method==='OPTIONS'){res.writeHead(204);res.end();return;}
  if(req.method==='POST'){
    const url=new URL(req.url,'http://x');
    const name=(url.searchParams.get('name')||'lastframe.jpg').replace(/[^a-zA-Z0-9._-]/g,'');
    const chunks=[];
    req.on('data',c=>chunks.push(c));
    req.on('end',()=>{
      try{
        const b64=Buffer.concat(chunks).toString('utf8');
        const out=Buffer.from(b64,'base64');
        fs.writeFileSync(path.join(__dirname,name),out);
        res.writeHead(200);res.end('ok '+name+' '+out.length);
      }catch(e){res.writeHead(500);res.end(String(e));}
    });
    return;
  }
  res.writeHead(404);res.end();
}).listen(8799,()=>console.log('uploader on 8799'));
