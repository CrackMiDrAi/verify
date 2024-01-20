import 'xterm/css/xterm.css';
import './style.css';

import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

import { CreateNewCaptcha } from './captcha';

const termAddon = {
  fit: new FitAddon()
};

const term = new Terminal({
  cursorBlink: true,
  fontFamily: '"Cascadia Code", Consolas, Menlo, Monaco, "Courier New", monospace',
});

for (const name in termAddon) {
  term.loadAddon(termAddon[name]);
}

term.open(document.querySelector('#terminal'));
term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ');

term.onData(data => {
  switch (data) {
    case '\u0003': // Ctrl+C
      term.write('^C');
      break;
    case '\r': // Enter
      term.writeln('');
      break;
    case '\u007F': // Backspace (DEL)
      if (term._core.buffer.x > 0) {
        term.write('\b \b');
      }
      break;
    default:
      term.write(data);
  }
});

window.addEventListener('resize', () => termAddon.fit.fit());
termAddon.fit.fit();

document.querySelector('#create-recaptcha').addEventListener('click', () => {
  CreateNewCaptcha(document.querySelector('#recaptcha'))
    .then(e => console.log(e))
    .catch(e => console.error(e));
});