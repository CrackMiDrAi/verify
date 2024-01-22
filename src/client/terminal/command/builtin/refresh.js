
export function RefreshCommandCallback() {
  return new Promise((res) => {
    history.go(0);
    res('');
  });
}