'use strict';

import { v4 as uuidv4 } from 'uuid';

export default {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const futureTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // +1 day

    // Fetch node user
    const [nodeUser] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = 'node' LIMIT 1`
    );

    if (!nodeUser.length) {
      throw new Error('No node user found. Seed users first.');
    }

    const nodeId = nodeUser[0].id;

    await queryInterface.bulkInsert('tasks', [
      {
        id: uuidv4(),
        task_name: 'Process Daily Reports',
        task_details: 'Generate and upload daily reports',
        assigned_node_id: nodeId,
        status: 'pending',
        locked_at: futureTime,
        active: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        task_name: 'Sync External API',
        task_details: 'Sync data from third-party API',
        assigned_node_id: nodeId,
        status: 'pending',
        locked_at: futureTime,
        active: true,
        createdAt: now,
        updatedAt: now
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tasks', null);
  }
};
