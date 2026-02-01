'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('task_histories', {
      id: {
        type: Sequelize.STRING(64),
        primaryKey: true,
        allowNull: false
      },
      task_id: {
        type: Sequelize.STRING(64),
        allowNull: false,
        references: {
          model: 'tasks',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      action_type: {
        type: Sequelize.ENUM(
          'initial_assign',
          'status_change',
          'assignee_change'
        ),
        allowNull: false
      },
      from_value: {
        type: Sequelize.STRING,
        allowNull: true
      },
      to_value: {
        type: Sequelize.STRING,
        allowNull: true
      },
      performed_by: {
        type: Sequelize.STRING(64),
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('task_histories');
  }
};
