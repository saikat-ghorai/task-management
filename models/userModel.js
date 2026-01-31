import { sequelize } from '../config/database';
import { DataTypes } from 'sequelize';

const User = () => {
  return sequelize.define('User', {
    id: {
      type: DataTypes.STRING(64),
      primaryKey: true
    },
    role: {
      type: DataTypes.ENUM('admin', 'node'),
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    secret: {
      type: DataTypes.STRING,
      allowNull: false
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'users',
    timestamps: true
  });
};

export { User };