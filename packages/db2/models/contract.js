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
      Contract.belongsTo(models.Project, { foreignKey: "projectId" });
      Contract.hasMany(models.ContractInstance);
    }
  }
  Contract.init(
    {
      projectId: DataTypes.NUMBER,
      name: DataTypes.STRING,
      abi: DataTypes.STRING,
      metadata: DataTypes.STRING,
      devDoc: DataTypes.STRING,
      userDoc: DataTypes.STRING,
      sourcePath: DataTypes.STRING,
      source: DataTypes.STRING,
      sourceMap: DataTypes.STRING,
      deployedSourceMap: DataTypes.STRING,
      ast: DataTypes.STRING,
      legacyAst: DataTypes.STRING,
      bytecode: DataTypes.STRING,
      deployedBytecode: DataTypes.STRING,
      immutableReferences: DataTypes.STRING,
      generatedSources: DataTypes.STRING,
      deployedGeneratedSources: DataTypes.STRING,
      compiler: DataTypes.STRING
    },
    {
      sequelize,
      modelName: "Contract"
    }
  );
  return Contract;
};
