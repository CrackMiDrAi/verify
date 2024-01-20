import express from "express";
import expressWs from 'express-ws';

const ws = express.Router();
expressWs(ws);

ws.ws('/', (ws, req) => {
  ws.send('Connected');
  
  ws.on('message', msg => {
    console.log(msg);
    ws.send(msg);
  });
});

export { ws as RouterWebsocket };