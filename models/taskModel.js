import { sequelize } from '../config/database';
import { DataTypes } from 'sequelize';
import { User } from './userModel';

const Task = () => {
  return sequelize.define('Task', {
    task_id: {
      type: DataTypes.STRING(64),
      primaryKey: true
    },
    task_type: DataTypes.STRING,
    task_details: DataTypes.JSON,
    assigned_node_id: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'failed'),
      defaultValue: 'pending'
    },
    locked_at: DataTypes.DATE
  }, {
    tableName: 'tasks',
    timestamps: true
  });
};

Task.belongsTo(User, {
  foreignKey: 'assigned_node_id',
  targetKey: 'id'
});

export { Task };