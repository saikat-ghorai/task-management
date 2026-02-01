'use strict';

import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';

export default {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const saltRounds = 10;

    const adminPassword = await argon2.hash('Admin@123', 10);
    const nodePassword = await argon2.hash('Node@123', 10);

    await queryInterface.bulkInsert('users', [
      {
        id: uuidv4(),
        role: 'admin',
        name: 'System Admin',
        username: 'admin@example.com',
        secret: adminPassword,
        active: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        role: 'node',
        name: 'Worker Node 1',
        username: 'node1@example.com',
        secret: nodePassword,
        active: true,
        createdAt: now,
        updatedAt: now
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      username: ['admin@example.com', 'node1@example.com']
    });
  }
};
