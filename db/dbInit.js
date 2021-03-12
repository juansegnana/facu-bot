
const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', '', '', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

require('./models/Guilds')(sequelize, Sequelize.DataTypes);
require('./models/Channels')(sequelize, Sequelize.DataTypes);
require('./models/Clases')(sequelize, Sequelize.DataTypes);

// if force in terminal => delete all data.
const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then( async () => {

    console.log('Database synced');
    sequelize.close();

})
.catch( console.error );

// execute: node dbInit.js
// if you want to reset model-> node dbInit.js --force or -f