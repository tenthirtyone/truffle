"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ContractInstance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ContractInstance.belongsTo(models.Contract, { foreignKey: "contractId" });
      ContractInstance.belongsTo(models.Network, { foreignKey: "networkId" });
    }
  }
  ContractInstance.init(
    {
      address: DataTypes.STRING,
      txHash: DataTypes.STRING,
      links: DataTypes.STRING,
      networkId: DataTypes.NUMBER,
      contractId: DataTypes.NUMBER
    },
    {
      sequelize,
      modelName: "ContractInstance"
    }
  );
  return ContractInstance;
};
