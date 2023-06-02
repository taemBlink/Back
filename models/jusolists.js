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
    }
  }
  JusoLists.init(
    {
      sido: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      sigungu: {
        allowNull: false,
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "JusoLists",
    }
  );
  return JusoLists;
};
