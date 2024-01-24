
export function ClearCommandCallback(termmgr) {
  return new Promise(res => {
    termmgr.terminal.clear();
    res('');
  });
}