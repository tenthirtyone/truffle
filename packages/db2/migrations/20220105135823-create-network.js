"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Networks", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      forkId: {
        allowNull: true,
        type: Sequelize.NUMBER,
        references: {
          model: "Networks",
          key: "id"
        }
      },
      name: {
        type: Sequelize.STRING
      },
      forkId: {
        type: Sequelize.NUMBER
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
    await queryInterface.dropTable("Networks");
  }
};
