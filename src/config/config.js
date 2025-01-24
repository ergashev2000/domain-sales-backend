import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('domain_sell', 'postgres', '1234', {
  host: 'localhost',
  dialect: 'postgres',
  dialectOptions: {
    useUTC: false, 
  },
  timezone: '-05:00',
});

export default sequelize;