import * as BuiltInCommands from './builtin';

const CommandParamNameReg = /^-{1,2}/;

const getQuotePosition = (text, startPos = 0) => {
  const single = text.indexOf('\'', startPos);
  const double = text.indexOf('"', startPos);
  if (double > -1) return double;
  else if (single > -1) return single;
  else return -1;
}

const buildCommandParam = commandArr => {
  const getFullText = (param, startPos, paramArr) => {
    const result = [ param ];

    if (getQuotePosition(param) === -1) return result;
    if (getQuotePosition(param) > 0) return result;
    if (getQuotePosition(param) + 1 === param.length) return result;

    for (let j = startPos + 1; j < paramArr.length; j++) {
      const textNext = paramArr[j];
      result.push(textNext)
      if (getQuotePosition(textNext) + 1 === textNext.length) break;
    }

    return result;
  }

  let result = [];
  const paramArr = [ ...commandArr ];

  paramArr.shift();
  if (paramArr.length === 0) return result;

  for (let i = 0; i < paramArr.length; i++) {
    const param = paramArr[i];

    if (!param || param == '') continue;

    if (CommandParamNameReg.test(param)) {
      const paramValue = getFullText(paramArr[i + 1], i + 1, paramArr);
      result.push({ name: param, value: paramValue.join(' ') });
      i += paramValue.length;
    } else {
      const fullText = getFullText(param, i, paramArr);
      result.push({ name: null, value: fullText.join(' ') });
      i += fullText.length - 1;
    }
  }

  return result;
}



export class TerminalCommandManager {
  constructor() {
    this.commands = [ // NOTE: Is this too complicated?
      /* {
        name,
        description,
        params: {
          '--param': { // optional, can use '*' if you dont need name
            description,
            alias: [ '-P' ],
            params // Yes you can do it again
          }
        },
        callback: (terminal, ...params) => {} // Return a Promise here please. Resolve value will be used as stdout
      } */
      {
        name: 'help',
        description: 'Show all available commands.',
        params: {
          '*': {
            description: 'Command for showing help message.'
          }
        },
        callback: BuiltInCommands.HelpCommandCallback.bind(this),
      },
      {
        name: 'clear',
        description: 'Clear terminal.',
        callback: BuiltInCommands.ClearCommandCallback.bind(this),
      },
      {
        name: 'refresh',
        description: 'Refresh the page.',
        callback: BuiltInCommands.RefreshCommandCallback.bind(this),
      }
    ];
  }

  add(commandInfo) {
    return this.commands.push(commandInfo);
  }

  run(command, termmgr) {
    const commandArr = command.split(' ');
    const paramArr = buildCommandParam(commandArr);
    const name = commandArr[0];

    return new Promise((res, rej) => {
      if (name == '') {
        res('');
        return;
      }

      for (const command of this.commands) {
        if (command.name === name) {
          // TODO: Params parser
          return command.callback(termmgr, ...paramArr)
            .then(stdout => res(stdout))
            .catch(e => rej(e));
        }
      }

      res(`${name}: command not found\r\n`);
    });
  }
}