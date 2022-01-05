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
      abi: {
        type: DataTypes.STRING,
        get() {
          const rawValue = this.getDataValue("abi");
          return rawValue ? JSON.parse(rawValue) : null;
        },
        set(value) {
          this.setDataValue("abi", JSON.stringify(value));
        }
      },
      metadata: DataTypes.STRING,
      devDoc: {
        type: DataTypes.STRING,
        get() {
          const rawValue = this.getDataValue("devDoc");
          return rawValue ? JSON.parse(rawValue) : null;
        },
        set(value) {
          this.setDataValue("devDoc", JSON.stringify(value));
        }
      },
      userDoc: {
        type: DataTypes.STRING,
        get() {
          const rawValue = this.getDataValue("userDoc");
          return rawValue ? JSON.parse(rawValue) : null;
        },
        set(value) {
          this.setDataValue("userDoc", JSON.stringify(value));
        }
      },
      sourcePath: DataTypes.STRING,
      source: DataTypes.STRING,
      sourceMap: DataTypes.STRING,
      deployedSourceMap: DataTypes.STRING,
      ast: {
        type: DataTypes.STRING,
        get() {
          const rawValue = this.getDataValue("ast");
          return rawValue ? JSON.parse(rawValue) : null;
        },
        set(value) {
          this.setDataValue("ast", JSON.stringify(value));
        }
      },
      legacyAst: {
        type: DataTypes.STRING,
        get() {
          const rawValue = this.getDataValue("legacyAst");
          return rawValue ? JSON.parse(rawValue) : null;
        },
        set(value) {
          this.setDataValue("legacyAst", JSON.stringify(value));
        }
      },
      bytecode: {
        type: DataTypes.STRING,
        get() {
          const rawValue = this.getDataValue("bytecode");
          return rawValue ? JSON.parse(rawValue) : null;
        },
        set(value) {
          this.setDataValue("bytecode", JSON.stringify(value));
        }
      },
      deployedBytecode: {
        type: DataTypes.STRING,
        get() {
          const rawValue = this.getDataValue("deployedBytecode");
          return rawValue ? JSON.parse(rawValue) : null;
        },
        set(value) {
          this.setDataValue("deployedBytecode", JSON.stringify(value));
        }
      },
      immutableReferences: DataTypes.STRING,
      generatedSources: DataTypes.STRING,
      deployedGeneratedSources: DataTypes.STRING,
      compiler: {
        type: DataTypes.STRING,
        get() {
          const rawValue = this.getDataValue("compiler");
          return rawValue ? JSON.parse(rawValue) : null;
        },
        set(value) {
          this.setDataValue("compiler", JSON.stringify(value));
        }
      }
    },
    {
      sequelize,
      modelName: "Contract"
    }
  );
  return Contract;
};
