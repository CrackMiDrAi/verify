
export function WebSocketPingHandler(data, sendMsg) {
  sendMsg({
    type: 'PingMessage',
    data: data
  });
}