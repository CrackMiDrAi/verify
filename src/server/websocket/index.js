import express from "express";
import expressWs from 'express-ws';
import { WebSocketMessageTypeHandler } from './message/index.js';

const ws = express.Router();
expressWs(ws);

ws.ws('/', (ws, req) => {
  const sendMsg = data => ws.send(JSON.stringify(data));
  sendMsg({ type: 'ConnectMessage', data: { msg: 'Connected' }});
  
  ws.on('message', e => {
    let msg = null;

    try {
      msg = JSON.parse(e);
      WebSocketMessageTypeHandler(msg, ws);
    } catch (e) {
      console.log('[E] A error occured when handling WebSocket messages');
      console.error(e);
      return; // Not gonna proceed
    }
  });
});

export { ws as RouterWebsocket };