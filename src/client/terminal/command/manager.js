import * as BuiltInCommands from './builtin';

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
    const name = command;
    return new Promise((res, rej) => {
      if (name == '') {
        res('');
        return;
      }

      for (const command of this.commands) {
        if (command.name === name) {
          // TODO: Params parser
          return command.callback(termmgr)
            .then(stdout => res(stdout))
            .catch(e => rej(e));
        }
      }

      res(`${name}: command not found\r\n`);
    });
  }
}