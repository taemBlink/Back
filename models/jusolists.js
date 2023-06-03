"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class JusoLists extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Jobs, {
        sourceKey: "juso_id",
        foreignKey: "juso_id",
        onDelete: "cascade",
        onUpdate: "cascade",
      });
    }
  }
  JusoLists.init(
    {
      juso_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      sido: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      sigungu: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "JusoLists",
    }
  );
  return JusoLists;
};
