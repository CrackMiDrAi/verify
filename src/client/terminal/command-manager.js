

class PromiseModded extends Promise {
  constructor(executor) {
    super((resolve, reject) => {
      return executor(resolve, reject, (progress) => {
        for (const progressCallback of this.progressCallbacks) {
          progressCallback(progress);
        }
      });
    });

    this.progressCallbacks = [];
  }

  onProgress(callback) {
    if (typeof callback === 'function') this.progressCallbacks.push(callback)
    else throw new Error('Callback must be a function');

    return this;
  }
}

const HelpCommandCallback = (stderr/*, { commandName }*/) => new Promise((res) => {
  res('Hello im help message\r\n');
});

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

  run(command) {
    const name = command;
    return new PromiseModded((res, rej, stderr) => {
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