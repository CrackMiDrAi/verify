
export function CDCommandCallback (termmgr, { value: path }) {
  return new Promise((res, rej) => {
    if (termmgr.fileManager.cd(path) !== null) res('');
    else rej(`${path}: no such path`);
  });
}
