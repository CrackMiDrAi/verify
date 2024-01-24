import AsciiTable from 'ascii-table';

export function LSCommandCallback (termmgr, pathObj) {
  const path = pathObj && pathObj.value ? pathObj.value : '';

  return new Promise((res) => {
    const resultTable = new AsciiTable().removeBorder();
    const fileArr = termmgr.fileManager.ls(path);
    
    for (let i = 0, l = Math.ceil(fileArr.length / 6); i < l; i++) {
      const row = [];
      for (let j = 0, jl = Math.min(fileArr.length - i * 6, 6); j < jl; j++) {
        const file = fileArr[j + i * 6];
        let fileName = file.name;
        if (file.isDir) fileName = '\x1b[36m' + fileName + '\x1b[0m';
        row.push(fileName);
      }
      resultTable.addRow(row);
    }

    res(resultTable.toString().replace(/\n/g, '\r\n') + '\r\n');
  });
};
