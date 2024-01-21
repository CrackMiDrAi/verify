import { TerminalCommandManager } from "./command-manager";

export class TerminalManager {
  constructor(terminal) {
    this.terminal = terminal;

    this.allowInput = true;
    this.linePrefix = '$ ';
    this.currentCommand = '';

    // Regist other managers
    this.commandManager = new TerminalCommandManager();

    // Regist listeners for terminal
    this.terminal.onData(data => this.onUserInput(data));

    // Init terminal!
    this.terminal.write(this.linePrefix);
  }

  onUserInput(data) {
    if (!this.allowInput) return;
    
    const { linePrefix, terminal: term } = this;

    const HandleEnter = () => {
      this.allowInput = false;
      term.write('\r\n');

      this.commandManager
        .run(this.currentCommand)
        .then(stdout => {
          term.write(stdout);
          term.write(linePrefix);
          this.allowInput = true;
        })
        .onProgress(stderr => term.write(stderr))
        .catch(e => {
          // handle error here
          this.allowInput = true;
        });
      
      // NOTE: Do logical stuff before these three code below
      this.currentCommand = '';
    }

    const HandleBackspace = () => {
      const cursorPos = term._core.buffer.x - linePrefix.length;
      if (cursorPos <= 0) return;

      this.currentCommand = (
        this.currentCommand.substring(0, cursorPos - 1) +
        this.currentCommand.substring(cursorPos, this.currentCommand.length)
      );

      if (cursorPos === this.currentCommand.length + 1) term.write('\b \b');
      else {
        let bsCommand = '\b' + this.currentCommand.substring(cursorPos - 1, this.currentCommand.length);
        const bsRewriteLength = this.currentCommand.length - cursorPos + 1;
        const bsBackLength = (bsCommand.length - 1) + bsRewriteLength;

        bsCommand += (new Array(bsRewriteLength + 1)).join('\u0020');
        bsCommand += (new Array(bsBackLength + 1)).join('\b');

        term.write(bsCommand);
      }
    }

    const HandleInput = () => {
      if (data === '\u001b[A' || data === '\u001b[B') return; // Up & down arrow key
      if (data === '\u001b[D') { // Left arrow key
        if (term._core.buffer.x <= linePrefix.length) return;
      }
      if (data === '\u001b[C') { // Right arrow key
        if (term._core.buffer.x >= linePrefix.length + this.currentCommand.length) return;
      }

      if (data >= String.fromCharCode(0x20) && data <= String.fromCharCode(0x7E) || data >= '\u00a0') {
        this.currentCommand += data;
      }
      term.write(data);
    }

    switch (data) {
      case '\u0003': { // Ctrl+C
        // Honestly we cannot cancel a Promise in JavaScript
        term.write('^C');
        term.write('\r\n' + linePrefix);
        break;
      }
      case '\r': { // Enter
        HandleEnter();
        break;
      }
      case '\u007F': { // Backspace (DEL)
        HandleBackspace();
        break;
      }
      default: {
        HandleInput();
      }
    }
  }
}
