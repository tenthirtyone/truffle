"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("ContractInstances", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      address: {
        type: Sequelize.STRING
      },
      txHash: {
        type: Sequelize.STRING
      },
      blockHeight: {
        type: Sequelize.NUMBER
      },
      links: {
        type: Sequelize.JSON
      },
      networkId: {
        type: Sequelize.NUMBER,
        references: {
          model: "Networks",
          key: "id"
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async queryInterface => {
    await queryInterface.dropTable("ContractInstances");
  }
};
