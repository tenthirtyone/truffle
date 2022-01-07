process.env.NODE_ENV = "test";

const { Op } = require("sequelize");
const workflowCompile = require("@truffle/workflow-compile");
const models = require("../models");
const { assert } = require("chai");

describe("Contract Instance", () => {
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

  const mainnet = {
    chainId: 1,
    name: "mainnet"
  };

  const links = {
    ConvertLib: "0x6ca86ac1F9460a3e5e3575b932aD10601fB045dC"
  };
  const address = "0xa22296A268b1B76DC08891C5A8e413F106CE0302";
  const txHash =
    "0x41497aeaf457e45106aaae1137683764951261d7ddc5a641366f61cbafc9022a";

  before(async () => {
    const { contracts } = await workflowCompile.compile(config);
    contractData = contracts;
  });

  beforeEach(async () => {
    await models.sequelize.sync({ force: true });
  });
  it("creates an instance of a deployed contract", async () => {
    const [SimpleStorage] = contractData;

    const simpleStorage = await models.Contract.create({ ...SimpleStorage });
    const network = await models.Network.create({ ...mainnet });

    const simpleStorageInstance = await models.ContractInstance.create({
      address,
      txHash,
      links
    });

    simpleStorage.addContractInstance(simpleStorageInstance);
    simpleStorageInstance.setNetwork(network);

    await simpleStorageInstance.save();
    await simpleStorageInstance.reload({ include: ["Contract"] });

    const instanceContract = simpleStorageInstance.Contract;
    const instanceNetwork = await simpleStorageInstance.getNetwork();

    assert(
      instanceContract.name === simpleStorage.name,
      `Instance contract name does not match`
    );

    assert(
      instanceNetwork.name === network.name,
      `Instance network name does not match`
    );
  });

  it("returns all networks forked from the contracts network after it deployed", async () => {
    const [SimpleStorage] = contractData;

    const blockHeight = 1000;

    const simpleStorage = await models.Contract.create({ ...SimpleStorage });
    const network = await models.Network.create({ ...mainnet });

    const simpleStorageInstance = await models.ContractInstance.create({
      address,
      txHash,
      links,
      blockHeight
    });

    simpleStorage.addContractInstance(simpleStorageInstance);
    simpleStorageInstance.setNetwork(network);

    await simpleStorageInstance.save();

    const forkedNetwork1 = await models.Network.create({
      ...mainnet,
      chainId: 100,
      historicBlock: 100
    });
    const forkedNetwork2 = await models.Network.create({
      ...mainnet,
      chainId: 2000,
      historicBlock: 2000
    });
    const forkedNetwork3 = await models.Network.create({
      ...mainnet,
      chainId: 3000,
      historicBlock: 3000
    });

    network.addForks([forkedNetwork1, forkedNetwork2, forkedNetwork3]);

    await network.save();

    //console.log(await network.getForks());
    const simpleStorageNetwork = await simpleStorageInstance.getNetwork();

    const forkedNetworks = await simpleStorageNetwork.getForks({
      where: {
        historicBlock: { [Op.gt]: simpleStorageInstance.blockHeight }
      }
    });

    assert(forkedNetworks.length === 2, "Forked network lengths do not match");

    forkedNetworks.forEach(network => {
      assert(
        network.historicBlock > simpleStorageInstance.blockHeight,
        "Forked network is before contract deployed block"
      );
    });
  });
});
