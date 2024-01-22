import AsciiTable from 'ascii-table';

export function HelpCommandCallback (stderr/*, { commandName }*/) {
  return new Promise((res) => {
    let result = '';
    const resultTable = new AsciiTable().removeBorder();

    if (false) { // commandName != ''
      
    } else {
      result += [
        '',
        '  Welcome to CrackMiDrAi Emulated Terminal  ',
        '      List of all avalilable commands:      ',
        '', '',
      ].join('\r\n');

      for (const command of this.commands) {
        resultTable.addRow(command.name, command.description);
      }

      result += resultTable.toString().replace(/\n/g, '\r\n') + '\r\n';
    }

    res(result + '\r\n');
  });
};
