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
      Network.hasOne(models.Network, { foreignKey: "forkId" });
    }
  }
  Network.init(
    {
      name: DataTypes.STRING,
      forkId: DataTypes.NUMBER
    },
    {
      sequelize,
      modelName: "Network"
    }
  );
  return Network;
};
