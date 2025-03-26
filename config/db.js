import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('MySQL Connected...');
    } catch (error) {
        console.error('MySQL Connection Failed:', error.message);
        process.exit(1);
    }
};

export { sequelize, connectDB };
