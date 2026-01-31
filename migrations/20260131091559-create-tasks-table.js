'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tasks', {
      task_id: {
        type: Sequelize.STRING(64),
        primaryKey: true
      },
      task_type: Sequelize.STRING,
      task_details: Sequelize.JSON,
      assigned_node_id: {
        type: Sequelize.STRING(64),
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      status: {
        type: Sequelize.ENUM(
          'pending',
          'in_progress',
          'completed',
          'failed'
        ),
        defaultValue: 'pending'
      },
      locked_at: Sequelize.DATE,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tasks');
  }
};
