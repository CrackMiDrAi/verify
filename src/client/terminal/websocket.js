
export class TerminalWebSocketManager {
  constructor(termmgr) {
    this.manager = termmgr;
    this.ws = null;

    this._isConnected = false;
  }

  connect() {
    const { location } = window;
    this.ws = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws');

    this.ws.onopen = () => this._onOpen();
    this.ws.onerror = (e) => this._onError(e);
    this.ws.onclose = () => this._onClose();
    this.ws.onmessage = (e) => this._onMessage(e);
  }

  send(data) {
    if (!this.ws || !this._isConnected) return;
    if (this.ws.readyState !== this.ws.OPEN) return;

    return this.ws.send(JSON.stringify(data));
  }

  _onError(e) {
    this.ws = null;
    this._isConnected = false;

    console.log('[WS] Disconnected from server');
    console.error(e)
  }

  _onOpen() {
    this._isConnected = true;

    console.log('[WS] Connected to server');
  }

  _onMessage({ data }) {
    const msg = JSON.parse(data);
    console.log(msg);
  }

  _onClose() {
    this.ws = null;
    this._isConnected = false;

    console.log('[WS] Connection closed');
  }
}