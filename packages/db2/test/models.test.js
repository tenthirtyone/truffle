process.env.NODE_ENV = "test";

const workflowCompile = require("@truffle/workflow-compile");
const models = require("../models");
const { assert } = require("chai");

describe("Models", () => {
  describe("Project", () => {
    const projectName = "Project Name";
    const newName = "New Project Name";
    beforeEach(async () => {
      await models.sequelize.sync({ force: true });
    });

    it("creates a project", async () => {
      const project = await models.Project.create({ name: projectName });

      assert(project.id === 1);
      assert(
        project.name === projectName,
        `Project name does not match ${projectName}`
      );
    });
    it("destructures properties out of the model", async () => {
      await models.Project.create({ name: projectName });

      const { name } = await models.Project.findOne({ where: { id: 1 } });

      assert(name === projectName);
    });
    it("updates the project name", async () => {
      await models.Project.create({ name: projectName });

      let project = await models.Project.findOne({ where: { id: 1 } });

      assert(project.name === projectName);

      project.name = newName;
      await project.save();

      project = await models.Project.findOne({ where: { id: 1 } });

      assert(project.name === newName);
    });
    it("does not allow duplicate project names", async () => {
      await models.Project.create({ name: projectName });
      try {
        await models.Project.create({ name: projectName });
      } catch (e) {
        return assert(e !== null);
      }
      assert.fail(`Project with duplicate name created`);
    });
  });
  describe("Contract", () => {
    const config = {
      contracts_directory: "./test/sources",
      contracts_build_directory: "./test/build",
      logger: {
        log(stringToLog) {
          this.loggedStuff = this.loggedStuff + stringToLog;
        },
        loggedStuff: ""
      }
    };
    let contractData;

    before(async () => {
      const { contracts } = await workflowCompile.compile(config);
      contractData = contracts;
    });
    beforeEach(async () => {
      await models.sequelize.sync({ force: true });
    });
    it("creates a contract from compiler data", async () => {
      assert(contractData.length === 1, "WorkflowCompile failed.");

      const [SimpleStorage] = contractData;

      const simpleStorage = await models.Contract.create({ ...SimpleStorage });

      Object.keys(SimpleStorage).forEach(key => {
        assert(
          SimpleStorage[key] === simpleStorage[key],
          `Key: ${key} value does not match saved contract`
        );
      });
    });
    it("bulk creates contracts", async () => {
      const [SimpleStorage] = contractData;

      const contracts = await models.Contract.bulkCreate([
        SimpleStorage,
        SimpleStorage,
        SimpleStorage,
        SimpleStorage
      ]);

      assert(contracts.length === 4);
    });
    it("adds a contract to a Project", async () => {
      const project = await models.Project.create();
      const [SimpleStorage] = contractData;
      const contract = await models.Contract.create({ ...SimpleStorage });

      project.addContract(contract);
      await project.save();
      await contract.reload();

      await project.reload({ include: models.Contract });

      assert(
        JSON.stringify(project.Contracts[0] === JSON.stringify(contract)),
        `Contract data does not match`
      );
    });
  });
  describe("Network", () => {
    const mainnet = {
      chainId: 1,
      name: "mainnet"
    };

    const forkedNetwork = {
      chainId: 100,
      name: "forkedNetwork",
      forkId: 1
    };

    beforeEach(async () => {
      await models.sequelize.sync({ force: true });
    });
    it("creates a network", async () => {
      const network = await models.Network.create({ ...mainnet });

      assert(network.networkId === mainnet.networkId, "Network id mismatch");
    });
    it("creates a forked network", async () => {
      const network = await models.Network.create({ ...mainnet });

      const forkedChain = await models.Network.create({ ...forkedNetwork });
      network.addFork(forkedChain);

      await network.save();

      await network.reload({ include: "Forks" });
      await forkedChain.reload({
        include: { model: models.Network, as: "Genesis" }
      });
      console.log(network.Forks);
      console.log(forkedChain.Genesis);
    });
  });
});
