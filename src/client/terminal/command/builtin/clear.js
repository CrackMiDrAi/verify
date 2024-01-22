
export function ClearCommandCallback(term) {
  return new Promise(res => {
    term.clear();
    res('');
  });
}