import { sequelize } from '../config/dbConnection.js';
import { DataTypes } from 'sequelize';
import userModel from './userModel.js';

const taskModel = sequelize.define('Task', {
  id: {
    type: DataTypes.STRING(64),
    primaryKey: true
  },
  task_name: DataTypes.STRING,
  task_details: DataTypes.JSON,
  assigned_node_id: {
    type: DataTypes.STRING(64),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  locked_at: DataTypes.DATE,
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'tasks',
  timestamps: true
});

taskModel.belongsTo(userModel, {
  foreignKey: 'assigned_node_id',
  targetKey: 'id'
});

export default taskModel;