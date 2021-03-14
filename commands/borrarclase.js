const Discord = require("discord.js");
const { Clases, Channels } = require("../db/dbObjects");
const { getChannel } = require('../db/dbActions');

module.exports = {
    name: 'borrarclase',
    aliases: ['borrarcl', 'brcl'],
    guildOnly: true,
    description: 'Borra una clase existente.',
    args: false,
    usage: 'Enviar [prefix]borrarclase y seleccionar materia',
    permissions: 'MANAGE_CHANNELS',
    cooldown: 20,
    async execute( message, args ) {
        
        const guildId = message.guild.id;
        const channelId = message.channel.id
        
        const isExistentChannel = await getChannel(channelId);
        
        if (!isExistentChannel) return message.channel.send('❌ Materia no existente.\nPara crear ver comando: \`[prefix]help crearmateria\`.');

        const resul = await Clases.findAll({
            where: {
                channel_id: channelId
            },
            raw: true
        });

        if (resul.length < 1) return message.channel.send('❌ No existen clases en este canal.\nPara crear ver comando: \`[prefix]help crearclase\`.');
        
        const materiaEditarResumen = {
            color: 'CF6394',
            title: `✍ Borrando clase.`,
            description: '+ Elegir clase a borrar y la palabra "si" separado por coma. Ejemplo: \`1, si\`\n(en 30 segundos deja de esperar).\nPD: Si querés borrar todas las clases de este canal, usá el comando \`editarmateria\`.',
            fields: [
                resul.map(({ clase_repetir, clase_horarep, clase_id, clase_contra, clase_link }, ind) => {
                    ind += 1;
                    return {
                        name: `Clase Nro. \`${ind}\`.`,
                        value: `Info de clase:\n-Cada ${clase_repetir} a las ${clase_horarep}.\n-ID: ${clase_id}, CONTRA: ${clase_contra}.\n-Link: ${clase_link}.\nEnviar \`${ind}, si\` para borrar.`,
                        inline: false
                    };
                })
            ],
            timestamp: new Date(),
            footer: {
                text: '<30seg ...'
            },
        };

        message.channel.send({ embed: materiaEditarResumen });

        const filter = (m) => m.author.id === message.author.id;
        const collector = new Discord.MessageCollector( message.channel, filter, { max: 1, time: 30000} );

        collector.on('end', async (collected) => {

            const commandAllowed = resul.length;

            if ( collected.size === 0) return message.channel.send('💥 No se editó.');
            
            const argsJoined = collected.first().content.split(',').map( arg => arg.trim() );
            const claseIndex = parseInt(argsJoined[0]);

            if (argsJoined.length !== 2) return message.channel.send('💥 No se editó. La respuesta debe ser por ejemplo: \`1, si\`.');
            if (claseIndex > commandAllowed || claseIndex < 1) return message.channel.send('💥 No se editó. Ese número de clase no existe.');
            if (argsJoined[1] !== 'si') return message.channel.send('❌ Falta confirmar!');

            const indexFix = parseInt(argsJoined[0])-1;
            
            message.channel.send('⏱ Borrando materia ...')
            .then( async (msg) => {
                
                const isClaseDeleted = await Clases.destroy({
                    where: { 'id': resul[indexFix].id, 'channel_id': channelId }
                });
                console.log('Que da isClaseDeleted:', isClaseDeleted);
                if (isClaseDeleted) {
                    console.log('Clase has been deleted.');

                    await Channels.decrement('cant_clases', { 
                        by: 1, 
                        where: { 
                            channel_id: channelId
                        }
                    });
                    console.log('Se decreció a -1 el counter de clases x materia.');
                    return msg.edit('👌 Se borró la clase.');

                } else {
                    console.log('Error borrando Clase.')
                    return msg.edit('❌ Error interno al borrar la clase.');
                }
            });

        });

    }
};