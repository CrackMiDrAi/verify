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

    switch (data) {
      case '\u0003': { // Ctrl+C
        // Honestly we cannot cancel a Promise in JavaScript
        term.write('^C');
        term.write('\r\n' + linePrefix);
        break;
      }
      case '\r': { // Enter
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
        break;
      }
      case '\u007F': { // Backspace (DEL)
        if (term._core.buffer.x <= linePrefix.length) return;
        term.write('\b \b');
        break;
      }
      default: {
        // if (data < '\u00a0') return;

        this.currentCommand += data;
        term.write(data);
      }
    }

    console.log(this.currentCommand);
  }
}
