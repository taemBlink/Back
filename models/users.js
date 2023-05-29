<<<<<<< HEAD
"use strict";
const { Model } = require("sequelize");
=======
'use strict';
const { Model } = require('sequelize');
>>>>>>> 53c819779529ec8229d43a97878cd2aaaa7e7131
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Jobs, {
<<<<<<< HEAD
        sourceKey: "user_id",
        foreignKey: "user_id",
=======
        sourceKey: 'user_id',
        foreignKey: 'user_id',
>>>>>>> 53c819779529ec8229d43a97878cd2aaaa7e7131
      });
    }
  }
  Users.init(
    {
      user_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
<<<<<<< HEAD
=======
      sns_id: {
        type: DataTypes.STRING,
      },
>>>>>>> 53c819779529ec8229d43a97878cd2aaaa7e7131
      email: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      password: {
        allowNull: false,
        type: DataTypes.STRING,
      },
<<<<<<< HEAD
      company: {
        type: DataTypes.STRING,
      },
=======
>>>>>>> 53c819779529ec8229d43a97878cd2aaaa7e7131
      user_type: {
        allowNull: false,
        type: DataTypes.STRING,
      },
<<<<<<< HEAD
=======
      company: {
        type: DataTypes.STRING,
      },
>>>>>>> 53c819779529ec8229d43a97878cd2aaaa7e7131
      provider: {
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
<<<<<<< HEAD
      modelName: "Users",
=======
      modelName: 'Users',
>>>>>>> 53c819779529ec8229d43a97878cd2aaaa7e7131
    }
  );
  return Users;
};
