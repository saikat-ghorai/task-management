import { Sequelize } from 'sequelize';
import logger from './logger.js';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectDB = async() => {
  try {
    await sequelize.authenticate();
  } catch (err) {
    logger.error('Database connection failed', err);
    process.exit(1);
  }
}

export { sequelize, connectDB };
