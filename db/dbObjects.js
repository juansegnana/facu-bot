// const { Channel } = require('discord.js');
const Sequelize = require('sequelize');
// const UserItems = require('../db-testing/models/UserItems');

const sequelize = new Sequelize('database', '', '', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: `${__dirname}/database.sqlite`,
});

const Guilds = require('./models/Guilds')(sequelize, Sequelize.DataTypes);
const Channels = require('./models/Channels')(sequelize, Sequelize.DataTypes);
const Clases = require('./models/Clases')(sequelize, Sequelize.DataTypes);
/*
Clases.belongsTo(Channels);
Channels.hasMany(Clases);

Channels.belongsTo(Guilds);
Guilds.hasMany(Channels);
*/
// Channels.belongsTo( Guilds, { foreignKey: 'guild_id' } );
// Clases.belongsTo( Channels, { foreignKey: 'clase' } );
/*
Guilds.prototype.addMateria = async (materia) => {

    const materiaItem = await Channels.findOne({
        where: { guild_id: materia.id }
    })

}
*/

module.exports = { Guilds, Channels, Clases };