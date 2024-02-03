
export class TerminalWebSocketManager {
  constructor(termmgr) {
    this.manager = termmgr;
    this.ws = null;

    this._isConnected = false;
    this._isVerifyPassed = 0; // -1=Failed, 0=Pending, 1=Passed
  }

  connect(qqId, captchaToken) {
    return new Promise((res, rej) => {
      const { location } = window;
      this.ws = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws');

      this.ws.onopen = () => this._onOpen();
      this.ws.onerror = (e) => this._onError(e);
      this.ws.onclose = () => this._onClose();
      this.ws.onmessage = (e) => this._onMessage(e);

      let connectFailedCount = 0;
      let isSendCaptcha = false;
      const checkConnectClock = setInterval(() => {
        if (connectFailedCount >= 30) {
          rej('Failed to connect to the server');
          clearInterval(checkConnectClock);
          return;
        }

        if (this._isConnected && !isSendCaptcha) {
          this.send({
            type: 'InitializeMessage',
            data: {
              qq: qqId,
              token: captchaToken
            }
          });
          isSendCaptcha = true;
          return;
        }

        if (this._isVerifyPassed === -1) {
          rej('Failed to pass CAPTCHA');
          clearInterval(checkConnectClock);
          return;
        }

        if (!this._isConnected || this._isVerifyPassed !== 1) {
          connectFailedCount++;
          return;
        }

        res('Connected to the server');
        clearInterval(checkConnectClock);
      }, 100);
    });
  }

  send(data) {
    if (!this.ws || !this._isConnected) return;
    if (this.ws.readyState !== this.ws.OPEN) return;

    return this.ws.send(JSON.stringify(data));
  }

  close() {
    if (!this.ws) return;
    if (!this._isConnected) return;

    this.ws.close();
    this.ws = null;
    this._isConnected = false;
    this._isVerifyPassed = 0;
  }

  _onError(e) {
    this.ws = null;
    this._isConnected = false;
    this._isVerifyPassed = 0;

    console.log('[WS] Disconnected from server');
    console.error(e)
  }

  _onOpen() {
    this._isConnected = true;

    console.log('[WS] Connected to server');
  }

  _onMessage({ data }) {
    const msg = JSON.parse(data);

    if (!this._isVerifyPassed && msg.type === 'InitializeMessage') {
      if (msg.data.result) this._isVerifyPassed = 1;
      else this._isVerifyPassed = -1;
    }

    console.log(msg);
  }

  _onClose() {
    this.ws = null;
    this._isConnected = false;
    this._isVerifyPassed = 0;

    console.log('[WS] Connection closed');
  }
}