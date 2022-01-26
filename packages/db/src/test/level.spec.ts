import { LevelDB } from "../meta/level";
import { expect } from "chai";
import { createBatchOps } from "./helpers";
import * as Pouch from "../meta/pouch";
import { definitions } from "@truffle/db/resources";
import { Migrations as contractArtifact } from "./utils";

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
      await db.put("contracts", "metacoin", contractArtifact);
    });
    it("deletes an object in the database", async () => {
      await db.put("contracts", "metacoin", contractArtifact);
      await db.del("contracts", "metacoin");
    });
    it("gets an object in the database", async () => {
      await db.put("contracts", "metacoin", contractArtifact);
      let data = await db.get("contracts", "metacoin");
      expect(data).to.eql(contractArtifact);
    });
    it("checks if an object exists", async () => {
      let exists = await db.exists("contracts", "metacoin");
      expect(exists).to.equal(false);

      await db.put("contracts", "metacoin", contractArtifact);
      exists = await db.exists("contracts", "metacoin");
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
    it("gets all objects from a collection (async/await)", async () => {
      const collection = "contracts";
      let ops = createBatchOps(collection, 1000);
      await db.batchToCollection(collection, ops);

      const contracts = await db.all(collection);
      expect(contracts.length).to.equal(ops.length);
    });
  });
  describe("Backwards compatibility", () => {
    let attach;
    let levelDB;
    let pouchDB;

    beforeEach(() => {
      attach = Pouch.forDefinitions(definitions);
      pouchDB = attach({
        adapter: {
          name: "memory"
        }
      });

      levelDB = new LevelDB();
    });

    it("add", async () => {
      const resourceName = "contracts";
      const inputs = {
        contracts: [contractArtifact]
      };

      const pouchRecord = await pouchDB.add(resourceName, inputs);

      const levelRecord = await levelDB.add(resourceName, inputs);

      expect(pouchRecord).to.eql(levelRecord);
    });
    it("get", async () => {
      const resourceName = "contracts";
      const inputs = {
        contracts: [contractArtifact]
      };

      let pouchRecord = await pouchDB.add(resourceName, inputs);
      let levelRecord = await levelDB.add(resourceName, inputs);

      pouchRecord = await pouchDB.get(resourceName, pouchRecord.id);
      levelRecord = await levelDB.get(resourceName, levelRecord.id);

      expect(pouchRecord).to.eql(levelRecord);
    });
    it("delete", async () => {
      const resourceName = "contracts";
      const inputs = {
        contracts: [contractArtifact]
      };

      let pouchRecord = await pouchDB.add(resourceName, inputs);
      let levelRecord = await levelDB.add(resourceName, inputs);

      await pouchDB.remove(resourceName, inputs);
      await levelDB.remove(resourceName, inputs);

      pouchRecord = await pouchDB.get(resourceName, pouchRecord.id);
      levelRecord = await levelDB.get(resourceName, levelRecord.id);

      expect(pouchRecord).to.eql(levelRecord);
    });

    it.todo("find");
    it("update", async () => {
      const resourceName = "contracts";
      const oldInputs = {
        contracts: [{ ...contractArtifact, bytecode: "0x" }]
      };
      const inputs = {
        contracts: [contractArtifact]
      };

      let pouchRecord = await pouchDB.add(resourceName, oldInputs);
      let levelRecord = await levelDB.add(resourceName, oldInputs);

      let oldPouchId = pouchRecord.id;
      let oldLevelId = levelRecord.id;

      expect(pouchRecord).to.eql(levelRecord);

      pouchRecord = await pouchDB.update(resourceName, inputs);
      levelRecord = await levelDB.update(resourceName, inputs);

      expect(pouchRecord).to.eql(levelRecord);
      expect(oldPouchId).to.be.equal(pouchRecord.id);
      expect(oldLevelId).to.be.equal(levelRecord.id);
    });
  });
});
