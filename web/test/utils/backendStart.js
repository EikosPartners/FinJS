const cp = require("child_process");
const ret = cp.exec("node ../server/app");
console.error(ret);
process.exit(0);