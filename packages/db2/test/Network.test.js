process.env.NODE_ENV = "test";

const { Op } = require("sequelize");
const models = require("../models");
const { assert } = require("chai");

describe("Network", () => {
  const mainnet = {
    chainId: 1,
    name: "mainnet"
  };

  const forkedNetwork = {
    chainId: 100,
    name: "forkedNetwork"
  };

  const networkData = [
    mainnet,
    { chainId: 2, name: "network2", historicBlock: 2000 },
    { chainId: 3, name: "network3", historicBlock: 3000 },
    { chainId: 4, name: "network4", historicBlock: 4000 },
    { chainId: 5, name: "network5", historicBlock: 5000 },
    { chainId: 6, name: "network6", historicBlock: 6000 },
    { chainId: 7, name: "network7", historicBlock: 7000 },
    { chainId: 8, name: "network8", historicBlock: 8000 },
    { chainId: 9, name: "network9", historicBlock: 9000 }
  ];

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

    assert(
      network.Forks[0].chainId === forkedNetwork.chainId,
      `Forked chainId does not match mainnet fork`
    );
    assert(
      forkedChain.Genesis.chainId === mainnet.chainId,
      `Genesis chainId does not match mainnet chainId`
    );
  });
  it("creates a network genealogy, BFS traversal of forks", async () => {
    const queue = [];
    const networks = await Promise.all(
      networkData.map(async data => {
        return await models.Network.create({ ...data });
      })
    );
    const [
      network1,
      network2,
      network3,
      network4,
      network5,
      network6,
      network7,
      network8,
      network9
    ] = networks;

    // BFS will traverse in this order
    network1.addFork(network2);
    network1.addFork(network3);
    network1.addFork(network4);

    network3.addFork(network5);
    network3.addFork(network6);

    network4.addFork(network8);
    network4.addFork(network9);

    network6.addFork(network7);

    const traversalOrder = [
      "mainnet",
      "network2",
      "network3",
      "network4",
      "network5",
      "network6",
      "network8",
      "network9",
      "network7"
    ];

    await Promise.all(
      networks.map(async network => {
        await network.save();
      })
    );

    queue.push(network1);

    while (queue.length > 0) {
      const network = queue.shift();
      assert(
        network.name === traversalOrder.shift(),
        "BFS Traversal is out of order"
      );
      const forks = await network.getForks();

      if (forks.length > 0) {
        queue.push(...forks);
      }
    }
  });
  it("traces a fork through it's ancestors", async () => {
    const networks = await Promise.all(
      networkData.map(async data => {
        return await models.Network.create({ ...data });
      })
    );
    const [
      network1,
      network2,
      network3,
      network4,
      network5,
      network6,
      network7,
      network8,
      network9
    ] = networks;

    // Same as BFS genealogy above.
    network1.addFork(network2);
    network1.addFork(network3);
    network1.addFork(network4);

    network3.addFork(network5);
    network3.addFork(network6);

    network4.addFork(network8);
    network4.addFork(network9);

    network6.addFork(network7);

    await Promise.all(
      networks.map(async network => {
        await network.save();
        await network.reload({ include: "Genesis" });
      })
    );

    const traversalOrder = ["network7", "network6", "network3", "mainnet"];

    let currentNetwork = network7;
    while (currentNetwork) {
      assert(
        traversalOrder.shift() === currentNetwork.name,
        `Genesis traversal failed`
      );
      currentNetwork = await currentNetwork.getGenesis();
    }
  });
  it("gets network forks above a certain block height", async () => {
    const historicBlockNumber = 2000;

    const networks = await Promise.all(
      networkData.map(async data => {
        return await models.Network.create({ ...data });
      })
    );
    const [network1, network2, network3, network4] = networks;

    network1.addFork(network2);
    network1.addFork(network3);
    network1.addFork(network4);

    await Promise.all(
      networks.map(async network => {
        await network.save();
      })
    );

    const forks = await network1.getForks({
      where: { historicBlock: { [Op.gt]: historicBlockNumber } }
    });

    forks.forEach(fork => {
      assert(
        fork.historicBlock > historicBlockNumber,
        `Fork historicBlock is below where clause`
      );
    });
  });
  it("generates a massive genealogy! (1,010 networks)", async () => {
    const rootNetwork = await models.Network.create({ ...mainnet });
    for (let i = 0; i < 10; i++) {
      await rootNetwork.createFork({
        chainId: i,
        name: i,
        historicBlock: i
      });
    }
    await rootNetwork.save();

    const rootForks = await rootNetwork.getForks();
    assert(rootForks.length === 10, `Create forks of root network failed`);

    const forksOfRootForks = [];

    for (let i = 0; i < rootForks.length; i++) {
      const network = rootForks[i];

      for (let j = 0; j < 100; j++) {
        await network.createFork({
          chainId: j,
          name: j,
          historicBlock: j
        });
      }
      await network.save();
      const forks = await network.getForks();
      forksOfRootForks.push(...forks);
    }

    assert(forksOfRootForks.length === 1000, `Create fork of forks failed`);

    await rootNetwork.reload({
      include: {
        model: models.Network,
        as: "Forks",
        include: { model: models.Network, as: "Forks" }
      }
    });

    let count = rootNetwork.Forks.length;

    rootNetwork.Forks.forEach(fork => {
      count += fork.Forks.length;
    });

    assert(count === 1010, `Forked network count incorrect`);
  }).timeout(20000);
});
