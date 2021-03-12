const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', '', '', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: `${__dirname}/database.sqlite`,
});

const Guilds = require('./models/Guilds')(sequelize, Sequelize.DataTypes);
const Channels = require('./models/Channels')(sequelize, Sequelize.DataTypes);
const Clases = require('./models/Clases')(sequelize, Sequelize.DataTypes);

module.exports = { Guilds, Channels, Clases };