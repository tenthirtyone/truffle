"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Network extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Network.hasMany(models.Network, { as: "Forks", foreignKey: "ForkId" });
      Network.belongsTo(models.Network, {
        as: "Genesis",
        foreignKey: "ForkId"
      });
      Network.belongsToMany(models.ContractInstance, {
        through: "ContractInstanceNetworks"
      });
    }
  }
  Network.init(
    {
      chainId: DataTypes.NUMBER,
      name: DataTypes.STRING
    },
    {
      sequelize,
      modelName: "Network"
    }
  );
  return Network;
};
