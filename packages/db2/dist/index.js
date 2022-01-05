"use strict";
const path = require("path");
class DB {
  constructor(config) {
    const { working_directory, db } = config;
    this.config = Object.assign(Object.assign({}, DB.DEFAULTS), {
      working_directory,
      db
    });
    console.log(path.basename(working_directory));
  }
  save({ contracts, sources, compilations }) {
    console.log(Object.keys(contracts[0]));
    console.log(Object.keys(sources[0]));
    console.log(Object.keys(compilations[0]));
  }
  static get DEFAULTS() {
    return {
      working_directory: process.cwd(),
      db: {
        enabled: false
      }
    };
  }
}
module.exports = DB;
