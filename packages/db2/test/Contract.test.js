process.env.NODE_ENV = "test";

const workflowCompile = require("@truffle/workflow-compile");
const models = require("../models");
const { assert } = require("chai");

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
  it("bulk creates/finds 1000 contracts", async () => {
    const contractsToCreate = 1e3;
    const [SimpleStorage] = contractData;
    let bulkContracts = [];
    for (let i = 0; i < contractsToCreate; i++) {
      bulkContracts.push(SimpleStorage);
    }

    const contracts = await models.Contract.bulkCreate(bulkContracts);

    const contractCount = await models.Contract.findAll();

    assert(
      contracts.length === contractsToCreate,
      "bulkCreate failed to create the contracts"
    );
    assert(
      contractCount.length === contractsToCreate,
      "Did not return all contracts from the db"
    );
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
  it("returns the a project with it's associated contracts", async () => {
    const project = await models.Project.create();
    const [SimpleStorage] = contractData;

    const contract1 = await models.Contract.create({ ...SimpleStorage });
    const contract2 = await models.Contract.create({ ...SimpleStorage });
    const contract3 = await models.Contract.create({ ...SimpleStorage });

    project.addContract(contract1);
    project.addContract(contract2);
    project.addContract(contract3);
    await project.save();
    await project.reload({ include: models.Contract });

    assert(
      project.Contracts.length === 3,
      `Number of returned contracts does not match`
    );
  });
});
