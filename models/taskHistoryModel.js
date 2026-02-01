import { DataTypes } from 'sequelize';
import { sequelize } from '../config/dbConnection.js';
import taskModel from './taskModel.js';

const taskHistoryModel = sequelize.define(
    'TaskHistory',
    {
        id: {
            type: DataTypes.STRING(64),
            primaryKey: true
        },
        task_id: {
            type: DataTypes.STRING(64),
            allowNull: false
        },
        action_type: {
            type: DataTypes.ENUM(
                'initial_assign',
                'status_change',
                'assignee_change'
            ),
            allowNull: false
        },
        from_value: {
            type: DataTypes.STRING,
            allowNull: true
        },
        to_value: {
            type: DataTypes.STRING,
            allowNull: true
        },
        performed_by: {
            type: DataTypes.STRING(64),
            allowNull: false
        }
    },
    {
        tableName: 'task_histories',
        timestamps: true,
        updatedAt: false
    }
);

taskHistoryModel.belongsTo(taskModel, {
  foreignKey: 'task_id',
  targetKey: 'id'
});

export default taskHistoryModel;