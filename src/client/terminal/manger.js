import { TerminalCommandManager } from "./command/manager";
import { TerminalFileManager } from "./file-manager";

export class TerminalManager {
  constructor(terminal) {
    this.terminal = terminal;

    this.allowInput = true;
    this.currentCommand = '';
    this.currentCommandCache = null;
    this.commandHistory = [];
    this.commandHistoryIndex = -1;

    // Regist other managers
    this.commandManager = new TerminalCommandManager();
    this.fileManager = new TerminalFileManager();

    // Regist listeners for terminal
    this.terminal.onData(data => this.onUserInput(data));

    // Init terminal!
    this.terminal.write(this.getMOTD() + '\r\n');
    this.terminal.write(this.linePrefix);
  }

  get linePrefix() {
    return `[root@linux ${this.fileManager.currentPathText}]# `;
  }

  getMOTD() {
    const result = [
      '',
      '  Welcome to CrackMiDrAi Emulated Terminal v0.0.0!  ',
      '          Current time: ' + (new Date()).toLocaleString(),
      '',
      '* Found any bugs? Report it on https://github.com/CrackMiDrAi/verify/issues/new',
      '',
    ];

    if (import.meta.env.VITE_TERMINAL_MOTD && import.meta.env.VITE_TERMINAL_MOTD != '') {
      result.push(
        import.meta.env.VITE_TERMINAL_MOTD.replace(/[\r\n]+/g, '\r\n'),
        ''
      );
    }

    return result.join('\r\n');
  }

  onUserInput(data) {
    if (!this.allowInput) return;
    
    const { linePrefix, terminal: term } = this;

    const HandleEnter = () => {
      this.allowInput = false;
      term.write('\r\n');

      if (this.currentCommand != '' && this.commandHistory.indexOf(this.currentCommand) <= -1) this.commandHistory.push(this.currentCommand);
      this.commandHistoryIndex = this.commandHistory.length;

      this.commandManager
        .run(
          this.currentCommand,
          this
        )
        .then(stdout => {
          term.write(stdout);
        })
        .catch(e => {
          // handle error here
          console.error(e);
          term.writeln([
            '',
            '**************************** ERROR ****************************',
            '   An error has just occured, if you believe that this is not',
            ' your fault, please report it on GitHub.',
            '',
            '   Error message:',
            e.toString(),
            ''
          ].join('\r\n'));
        })
        .finally(() => {
          term.write(linePrefix);
          this.allowInput = true;
        });
      
      // NOTE: Do logical stuff before these three code below
      this.currentCommand = '';
      this.currentCommandCache = null;
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

    const HandleCommandHistory = next => {
      if (this.commandHistory.length <= 0) return;

      this.commandHistoryIndex += (next ? 1 : -1);
      if (this.commandHistoryIndex < 0) this.commandHistoryIndex = 0;

      // Clear user input
      term.write((new Array(term._core.buffer.x - linePrefix.length + 1)).join('\b'));
      term.write((new Array(this.currentCommand.length + 1)).join('\u0020'));
      term.write((new Array(this.currentCommand.length + 1)).join('\b'));

      if (this.currentCommandCache === null) this.currentCommandCache = this.currentCommand;

      if (this.commandHistoryIndex < this.commandHistory.length) {
        this.currentCommand = this.commandHistory[this.commandHistoryIndex];
      } else {
        if (this.currentCommandCache) this.currentCommand = this.currentCommandCache;
        else this.currentCommand = '';
        this.commandHistoryIndex = this.commandHistory.length;
      }

      term.write(this.currentCommand);
    }

    const HandleInput = () => {
      if (data === '\u001b[A') { // Up arrow key
        return HandleCommandHistory(false);
      }
      if (data === '\u001b[B') { // Down arrow key
        return HandleCommandHistory(true);
      }
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
