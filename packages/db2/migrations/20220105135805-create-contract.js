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
        type: Sequelize.STRING
      },
      metadata: {
        type: Sequelize.STRING
      },
      devDoc: {
        type: Sequelize.STRING
      },
      userDoc: {
        type: Sequelize.STRING
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
        type: Sequelize.STRING
      },
      legacyAst: {
        type: Sequelize.STRING
      },
      bytecode: {
        type: Sequelize.STRING
      },
      deployedBytecode: {
        type: Sequelize.STRING
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
        type: Sequelize.STRING
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
