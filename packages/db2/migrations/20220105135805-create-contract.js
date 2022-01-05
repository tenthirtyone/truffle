"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Contracts", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      abi: {
        type: Sequelize.JSON
      },
      metadata: {
        type: Sequelize.STRING
      },
      devdoc: {
        type: Sequelize.JSON
      },
      userdoc: {
        type: Sequelize.JSON
      },
      sourcePath: {
        type: Sequelize.STRING
      },
      source: {
        type: Sequelize.STRING
      },
      sourceMap: {
        type: Sequelize.STRING
      },
      deployedSourceMap: {
        type: Sequelize.STRING
      },
      ast: {
        type: Sequelize.JSON
      },
      legacyAST: {
        type: Sequelize.JSON
      },
      bytecode: {
        type: Sequelize.JSON
      },
      deployedBytecode: {
        type: Sequelize.JSON
      },
      immutableReferences: {
        type: Sequelize.STRING
      },
      generatedSources: {
        type: Sequelize.STRING
      },
      deployedGeneratedSources: {
        type: Sequelize.STRING
      },
      compiler: {
        type: Sequelize.JSON
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
    await queryInterface.dropTable("Contracts");
  }
};
