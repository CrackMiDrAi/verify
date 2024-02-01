import express from "express";
import expressWs from 'express-ws';

const ws = express.Router();
expressWs(ws);

ws.ws('/', (ws, req) => {
  const sendMsg = data => ws.send(JSON.stringify(data));
  sendMsg({ type: 'ConnectMessage', msg: 'Connected' });
  
  ws.on('message', msg => {
    let data = null;

    try {
      data = JSON.parse(msg);
    } catch (e) {
      data = msg;
    }

    console.log(data);
    sendMsg({
      type: 'EchoMessage',
      msg: 'ok',
      data: data,
    });
  });
});

export { ws as RouterWebsocket };