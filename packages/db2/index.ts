require("dotenv").config();

const path = require("path");

type DBConfig = {
  working_directory: string;
  db: object;
};

class DB {
  public config: DBConfig;

  constructor(config: DBConfig) {
    const { working_directory, db } = config;
    this.config = { ...DB.DEFAULTS, working_directory, db };

    console.log(path.basename(working_directory));
  }
  save({ contracts, sources, compilations }: any) {
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
