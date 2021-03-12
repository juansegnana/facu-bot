const moment = require('moment');
const { updatePrefix } = require('../db/dbActions');

module.exports = {
    name: 'new-prefix',
    aliases: ['nuevoprefix', 'newpref'],
    guildOnly: true,
    description: 'Cambia el prefix por defecto (__) al que quieras.',
    args: true,
    usage: '<prefix-nuevo>',
    permissions: 'ADMINISTRATOR',
    cooldown: 5,
    execute( message, args ) {

        if ( message.guild.lastPrefixChange ) {
            if (moment(message.guild.lastPrefixChange).isSame(new Date(), 'hour')) {
                return message.reply(`solo se puede cambiar cada 1 hora 😥.`);
            }
        }
        
        const newPrefix = args[0].trim().toLowerCase();
        if ( newPrefix.length < 1 || newPrefix.includes('‎') ) return message.reply('necesita uno o más caracteres/simbolos 😐.');

        const guildId = message.guild.id;
        
        console.log(`Nuevo prefix: ${newPrefix}, para guildID: #${guildId}.`);

        message.channel.send(`⏱ Ok, cambiando...`).then( async (m) => {
            const now = new Date();
            const isUpdated = await updatePrefix( guildId, newPrefix );
            if (isUpdated) {
                m.edit(`👌 Listo. Nuevo prefix para este server: \`${ newPrefix }\`.`)
                message.guild.readyInit = false;
                message.guild.lastPrefixChange = now;
            } else {
                m.edit(`🔥 Hubo un error, probá más tarde. Mensaje de error:\n\`${ err.message }\`.`);
            };
        });


    }
};