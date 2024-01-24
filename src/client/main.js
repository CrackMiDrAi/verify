import 'xterm/css/xterm.css';
import './style.css';

import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

import { CreateNewCaptcha } from './captcha';

import { TerminalManager } from './terminal/manger';

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
// term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ');

const termManager = new TerminalManager(term);
termManager.commandManager.add({
  name: 'captcha',
  description: 'Create a Google reCAPTCHA v2 checkbox',
  callback: (termmgr) => new Promise((res, rej) => {
    termmgr.terminal.write('Please verify you are a human...');
    CreateNewCaptcha()
      .then(token => {
        res('\r\nFinished, your token: ' + token + '\r\n');
      })
      .catch(e => rej(e));
  })
});

window.addEventListener('resize', () => termAddon.fit.fit());
termAddon.fit.fit();
