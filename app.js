const http = require('http');
const fs = require('fs');
const ws = new require('ws');
//wss에 웹서버를 가져오고
const wss = new ws.Server({noServer: true});
//클라이언트 셋 여러개 
const clients = new Set();

function accept(req, res) {
//                            헤더 업그레이드        소문자로 바꾸는 형태                                     연결시 헤더에 upgrade가 포함이면 웹소켓을 쓴다 
  if (req.url == '/ws' && req.headers.upgrade && req.headers.upgrade.toLowerCase() == 'websocket' && req.headers.connection.match(/\bupgrade\b/i)) 
  {//핸들 업그레이드를 하면서 온소켓커넥트를 함수로 보면 됨
    wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onSocketConnect);
  } 
  else if (req.url == '/') 
  { 
    // index.html
    fs.createReadStream('./index.html').pipe(res);
  } 
  else 
  { 
    // page not found
    res.writeHead(404);
    res.end();
  }
}//혼용해서 사용하고 싶은데 보안하는 형태로

function onSocketConnect(ws) {
  clients.add(ws);//add해서 소켓을 관리 클라이언트를 관리하기위해
  console.log(`new connection`);//새로운것이들어왔으니 뉴 커넥션

  ws.on('message', function(message) {//메시지를주면
    
    const obj = JSON.parse(message);

    console.log("message received: ", obj);
    
    for(let client of clients) {//각각의 클라이언트에 전달을 하기 위해
      client.send(JSON.stringify(obj));
    }
  });

  ws.on('close', function() {
    console.log(`connection closed`);
    clients.delete(ws);//클로즈때 해당 클라이언트를 배열에서 제거
  });
}

http.createServer(accept).listen(8080);