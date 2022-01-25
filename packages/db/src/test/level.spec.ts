import { LevelDB } from "../meta/level";
import { expect } from "chai";
import { testContractData, createBatchOps } from "./helpers";

const os = require("os");

describe("LevelDB", () => {
  let db: LevelDB;
  let testConfig = {
    project: "testproject",
    database: "leveldown",
    directory: os.tmpdir()
  };
  let invalidConfig = {
    project: "spaces ,./<>?;':\"[]{}|\\`~!@#$%^&*()_+-=",
    database: "doesNotExist",
    directory: os.tmpdir()
  };

  beforeEach(() => {
    db = new LevelDB();
  });

  afterEach(async () => {
    await db.close();
  });

  describe("Instantiation", () => {
    it("instantiates with default config", () => {
      expect(db.config).to.eql(LevelDB.DEFAULTS);
    });
    it("instantiates with a custom config", () => {
      db = new LevelDB(testConfig);
      expect(db.config).to.eql(testConfig);
    });
    it("instantiates with default database when invalid database is passed", () => {
      const validDatabase = "leveldown";
      const validDBInvalidConfig = {
        ...invalidConfig,
        database: validDatabase
      };
      db = new LevelDB(invalidConfig);
      db = new LevelDB(validDBInvalidConfig);
    });
    it("partitions dbs for each collection", () => {
      expect(Object.keys(db.collectionDBs).length).to.equal(
        db.collectionNames.length
      );
    });
  });
  describe("DB CRUD operations", () => {
    it("puts an object in the database", async () => {
      await db.put("contracts", "metacoin", testContractData);
    });
    it("gets an object in the database", async () => {
      await db.put("contracts", "metacoin", testContractData);
      let data = await db.get("contracts", "metacoin");
      expect(data).to.eql(testContractData);
    });
    it("batch puts 1000 contract direct to the collection", async () => {
      const collection = "contracts";
      let ops = createBatchOps(collection, 1000);
      await db.batchToCollection(collection, ops);

      ops.forEach(async op => {
        let contract = await db.get(collection, op.key);

        expect(contract).to.eql(op.value);
      });
    });
    it("getsMany 1000 contracts from the db", async () => {
      const collection = "contracts";
      let ops = createBatchOps(collection, 1000);
      await db.batchToCollection(collection, ops);

      const keys = ops.reduce((keys: string[], op: { key: string }) => {
        keys.push(op.key);
        return keys;
      }, []);

      await db.batchToCollection(collection, ops);
      const contracts = await db.getMany(collection, keys);

      expect(contracts.length).to.equal(ops.length);
    });
    it("puts 1000 objects and readstreams them out", async () => {
      const collection = "contracts";
      let ops = createBatchOps(collection, 1000);
      await db.batchToCollection(collection, ops);

      const contracts = await db.createReadStream(collection);
      expect(contracts.length).to.equal(ops.length);
    });
  });
});
