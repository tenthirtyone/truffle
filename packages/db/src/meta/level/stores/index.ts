const leveldown = require("leveldown");
const sqldown = require("sqldown");
const memdown = require("memdown");

export const Databases: { [store: string]: typeof leveldown } = {
  leveldown,
  sqldown,
  memdown
};
