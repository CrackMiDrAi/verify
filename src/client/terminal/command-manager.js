import AsciiTable from 'ascii-table';


export class TerminalCommandManager {
  constructor() {
    const HelpCommandCallback = (stderr/*, { commandName }*/) => new Promise((res) => {
      let result = '';
      const resultTable = new AsciiTable().removeBorder();

      if (false) { // commandName != ''
        
      } else {
        result += [
          '',
          'Welcome to use CrackMiDrAi Emulated Terminal',
          'List of all avalilable commands:',
          '', '',
        ].join('\r\n');

        for (const command of this.commands) {
          resultTable.addRow(command.name, command.description);
        }

        result += resultTable.toString().replace(/\n/g, '\r\n') + '\r\n';
      }

      res(result + '\r\n');
    });

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
        callback: (stderr, ...params) => {} // Return a Promise here please. Resolve value will be used as stdout
      } */
      {
        name: 'help',
        description: 'Show all available commands.',
        params: {
          '*': {
            description: 'Command for showing help message.'
          }
        },
        callback: HelpCommandCallback
      }
    ];
  }

  add(commandInfo) {
    return this.commands.push(commandInfo);
  }

  run(command, stderr) {
    const name = command;
    return new Promise((res, rej) => {
      if (name == '') {
        res('');
        return;
      }

      for (const command of this.commands) {
        if (command.name === name) {
          // TODO: Params parser
          return command.callback(stderr)
            .then(stdout => res(stdout))
            .catch(e => rej(e));
        }
      }

      res(`${name}: command not found\r\n`);
    });
  }
}