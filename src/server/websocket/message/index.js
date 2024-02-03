import { WebSocketPingHandler } from './ping.js';
import { WebSocketInitialzeHandler } from './initialize.js';

export function WebSocketMessageTypeHandler(e, cli) {
  const sendMsg = msg => cli.send(JSON.stringify(msg));

  switch (e.type) {
    case 'PingMessage': {
      WebSocketPingHandler(e.data. sendMsg);
      break;
    }
    case 'InitializeMessage': {
      WebSocketInitialzeHandler(e.data, sendMsg);
      break;
    }
    default: {
      console.warn('[W] Unknown message type: ' + e.type);
    }
  }
}
