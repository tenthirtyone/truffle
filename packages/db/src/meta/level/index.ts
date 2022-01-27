const levelup = require("levelup");
const sublevel = require("subleveldown");

import { Databases } from "./stores";

// For backwards compatibility

import type {
  CollectionName,
  Collections,
  MutationInput,
  MutationPayload,
  MutableCollectionName,
  SavedInput
} from "@truffle/db/meta/collections";
import type { Workspace } from "@truffle/db/meta/data";
import * as Id from "@truffle/db/meta/id";
import { definitions } from "@truffle/db/resources"; // @ import make it harder to use the cli
const generateId = Id.forDefinitions(definitions);

type LevelDBConfig = {
  database: string;
  directory: string;
};

export class LevelDB<C extends Collections> implements Workspace<C> {
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

    this.partitionDBCollections();
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

  partitionDBCollections() {
    this.collectionNames.forEach(collectionName => {
      this.collectionDBs[collectionName] = sublevel(
        this.levelDB,
        collectionName,
        { valueEncoding: "json" }
      );
    });
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

  async _get(collectionName: string, key: string) {
    try {
      return await this.collectionDBs[collectionName].get(key);
    } catch (e) {
      return undefined; // Matches pouch
    }
  }

  async exists(collectionName: string, key: string) {
    return !!(await this._get(collectionName, key));
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

  // These functions map to the workspace interface
  // These can be further optimized. It will refactor when
  // I get the API.

  async all<N extends CollectionName<C>>(
    collectionName: N
  ): Promise<SavedInput<C, N>[]> {
    const results: SavedInput<C, N>[] = [];

    return new Promise((resolve, reject) => {
      this.collectionDBs[collectionName]
        .createReadStream()
        .on("data", function (data) {
          results.push(data);
        })
        .on("error", function (err) {
          reject(err);
        })
        .on("end", function () {
          resolve(results);
        });
    });
  }

  public async find(collectionName, options) {
    // allows searching with `id` instead of pouch's internal `_id`,
    // since we call the field `id` externally, and this approach avoids
    // an extra index
    const fixIdSelector = selector =>
      Object.entries(selector)
        .map(([field, predicate]) =>
          field === "id" ? { _id: predicate } : { [field]: predicate }
        )
        .reduce((a, b) => ({ ...a, ...b }), {});

    // handle convenient interface for getting a bunch of IDs while preserving
    // order of input request
    const savedRecords = Array.isArray(options)
      ? await this.adapter.retrieve(
          collectionName,
          options.map(reference =>
            reference ? { _id: reference.id } : undefined
          )
        )
      : await this.adapter.search(collectionName, {
          ...options,
          selector: fixIdSelector(options.selector)
        });

    return savedRecords;
  }

  async get<N extends CollectionName<C>>(
    collectionName: N,
    id: string | undefined
  ): Promise<SavedInput<C, N> | undefined> {
    try {
      return await this.collectionDBs[collectionName].get(id);
    } catch (e) {
      return undefined; // Matches pouch
    }
  }

  // Does not overwrite existing records
  async add<N extends CollectionName<C>>(
    collectionName: N,
    input: MutationInput<C, N>
  ): Promise<MutationPayload<C, N>> {
    // Add id to each record, filter out existing records
    const records = input[collectionName]
      .map(record => {
        return {
          id: generateId(collectionName, record),
          ...record
        };
      })
      .filter(async record => {
        // @ts-ignore
        return await this.exists(collectionName, record.id);
      });

    for (let i = 0; i < records.length; i++) {
      const data = records[i];
      const { id } = data;

      // @ts-ignore
      await this.put(collectionName, id, data);
    }

    return {
      [collectionName]: records
    } as MutationPayload<C, N>;
  }

  // identical to add, but does not filter existing
  async update<M extends MutableCollectionName<C>>(
    collectionName: M,
    input: MutationInput<C, M>
  ): Promise<MutationPayload<C, M>> {
    const records = input[collectionName].map(record => {
      return {
        id: generateId(collectionName, record),
        ...record
      };
    });

    for (let i = 0; i < records.length; i++) {
      const data = records[i];
      const { id } = data;

      // @ts-ignore
      await this.put(collectionName, id, data);
    }

    return {
      [collectionName]: records
    } as MutationPayload<C, M>;
  }

  async remove<M extends MutableCollectionName<C>>(
    collectionName: M,
    input: MutationInput<C, M>
  ): Promise<void> {
    const ids = input[collectionName].map(input => {
      return generateId(collectionName, input);
    });

    for (let i = 0; i < ids.length; i++) {
      // @ts-ignore
      await this.del(collectionName, ids[i]);
    }
  }

  static get DEFAULTS(): LevelDBConfig {
    return {
      database: "memdown",
      directory: "./db"
    };
  }
}
