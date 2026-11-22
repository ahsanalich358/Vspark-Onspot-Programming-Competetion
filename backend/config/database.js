const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Sequelize } = require('sequelize');

const isRemote = process.env.DB_HOST && !['localhost', '127.0.0.1'].includes(process.env.DB_HOST);
const useSSL = process.env.DB_SSL === 'true' || isRemote || !!process.env.DATABASE_URL;

const dialectOptions = useSSL
  ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      },
      keepAlive: true,
      keepAliveInitialDelay: 10000
    }
  : { keepAlive: true, keepAliveInitialDelay: 10000 };

const poolConfig = {
  max: 10,
  min: 0,
  acquire: 30000,
  idle: 5000,
  evict: 5000
};

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions,
      logging: false,
      pool: poolConfig
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        dialectOptions,
        logging: false,
        pool: poolConfig
      }
    );

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`PostgreSQL Connected: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    
    // Sync all models (create tables if they don't exist)
    await sequelize.sync();
    console.log('Database synchronized');
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
  }
};

module.exports = { sequelize, connectDB };
