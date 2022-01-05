"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Contract extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Contract.belongsTo(models.Project);
      Contract.hasMany(models.ContractInstance);
    }
  }
  Contract.init(
    {
      name: DataTypes.STRING,
      contractName: {
        type: DataTypes.VIRTUAL,
        get() {
          const rawValue = this.getDataValue("name");
          return rawValue ? rawValue : null;
        },
        set(value) {
          this.setDataValue("name", value);
        }
      },
      abi: DataTypes.JSON,
      metadata: DataTypes.STRING,
      devdoc: DataTypes.JSON,
      userdoc: DataTypes.JSON,
      sourcePath: DataTypes.STRING,
      source: DataTypes.STRING,
      sourceMap: DataTypes.STRING,
      deployedSourceMap: DataTypes.STRING,
      ast: DataTypes.JSON,
      legacyAST: DataTypes.JSON,
      bytecode: DataTypes.JSON,
      deployedBytecode: DataTypes.JSON,
      immutableReferences: DataTypes.STRING,
      generatedSources: DataTypes.STRING,
      deployedGeneratedSources: DataTypes.STRING,
      compiler: DataTypes.JSON
    },
    {
      sequelize,
      modelName: "Contract"
    }
  );
  return Contract;
};
