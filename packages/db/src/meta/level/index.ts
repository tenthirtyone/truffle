const levelup = require("levelup");
const sublevel = require("subleveldown");

import { Databases } from "./stores";

type LevelDBConfig = {
  database: string;
  directory: string;
};

export class LevelDB {
  config: LevelDBConfig;
  levelDB: typeof levelup;
  collectionDBs: { [name: string]: typeof levelup };
  collectionNames: string[];

  constructor(config?: LevelDBConfig) {
    this.config = { ...LevelDB.DEFAULTS, ...config };
    const { database, directory } = this.config;

    this.collectionDBs = {};
    this.collectionNames = [
      "bytecodes",
      "compilations",
      "contractInstances",
      "contracts",
      "nameRecords",
      "networkGenealogies",
      "networks",
      "projects",
      "projectNames",
      "sources"
    ];

    this.levelDB = this.createDB(database, directory);

    // Partition the db for each collection by collection
    this.collectionNames.forEach(collectionName => {
      this.collectionDBs[collectionName] = sublevel(
        this.levelDB,
        collectionName,
        { valueEncoding: "json" }
      );
    });
  }

  createDB(database: string, directory: string) {
    // LOG - If leveldown adapter passed is invalid, revert to default.
    if (Databases[database]) {
      return levelup(Databases[database](directory, { valueEncoding: "json" }));
    } else {
      return levelup(
        Databases[LevelDB.DEFAULTS.database](LevelDB.DEFAULTS.directory, {
          valueEncoding: "json"
        })
      );
    }
  }

  async close() {
    await this.levelDB.close();

    for (const [_key, db] of Object.entries(this.collectionDBs)) {
      await db.close();
    }
  }

  async put(collectionName: string, key: string, value: object) {
    return await this.collectionDBs[collectionName].put(key, value);
  }

  async get(collectionName: string, key: string) {
    return await this.collectionDBs[collectionName].get(key);
  }

  async getMany(collectionName: string, keys: string[]) {
    return await this.collectionDBs[collectionName].getMany(keys);
  }

  async del(collectionName: string, key: string) {
    return await this.collectionDBs[collectionName].del(key);
  }

  async batchToCollection(
    collectionName: string,
    ops: { type: string; key: string; value?: any }[]
  ) {
    return await this.collectionDBs[collectionName].batch(ops);
  }

  async createReadStream(collectionName: string) {
    const results = [];
    const readStream = this.collectionDBs[collectionName].createReadStream();

    for await (const data of readStream) {
      // @ts-ignore
      results.push(data);
    }

    return results;
  }

  static get DEFAULTS(): LevelDBConfig {
    return {
      database: "memdown",
      directory: "./db"
    };
  }
}
