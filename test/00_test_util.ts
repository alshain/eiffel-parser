function check(condition, msg, ...log: any[]) {
  if (!condition) {
    console.group(msg);
    console.error.apply(console, log);
    ok(condition, msg);
    console.groupEnd();
  }
  else {
    ok(condition, msg);
  }
}
