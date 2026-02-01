import { sequelize } from '../config/dbConnection.js';
import { DataTypes } from 'sequelize';

const userModel = sequelize.define('User', {
  id: {
    type: DataTypes.STRING(64),
    primaryKey: true
  },
  role: {
    type: DataTypes.ENUM('admin', 'node'),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  secret: {
    type: DataTypes.STRING(500),
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

export default userModel;