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
      ContractInstance.belongsTo(models.Contract);
      ContractInstance.hasOne(models.Network);
    }
  }
  ContractInstance.init(
    {
      address: DataTypes.STRING,
      txHash: DataTypes.STRING,
      blockHeight: DataTypes.NUMBER,
      links: DataTypes.JSON
    },
    {
      sequelize,
      modelName: "ContractInstance"
    }
  );
  return ContractInstance;
};
