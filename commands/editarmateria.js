const Discord = require("discord.js");
const { getChannel, deleteChannel, updateChannel, getDataChannel } = require("../db/dbActions");
const { Guilds } = require("../db/dbObjects");
const { isValidMateria } = require("../helpers/isValidMateria");


module.exports = {
    name: 'editarmateria',
    aliases: ['editmat', 'edma'],
    guildOnly: true,
    description: 'Edita una materia existente.',
    args: false,
    usage: 'Enviar [prefix]editarmateria y elegir campo a editar',
    permissions: 'MANAGE_CHANNELS',
    cooldown: 10,
    async execute( message ) {
        
        const guildId = message.guild.id;
        const channelId = message.channel.id
        
        const isExistentChannel = await getChannel(channelId);
        console.log('Data de isExistent:', isExistentChannel);
        if (!isExistentChannel) return message.channel.send('❌ Materia no existente.\nPara crear ver comando: \`__help crearmateria\`.');
        
        const { abrev, nombre } = await getDataChannel(channelId);
        
        const materiaEditarResumen = {
            color: 'CF6394',
            title: `✍ Editando materia.`,
            description: '+ Elegir campo a editar y valor nuevo separado por coma. Ejemplo: \`1, AM2\` (se edita abreviatura a AM2)\nPara eliminar: \`3, si\`.\n(en 30 segundos deja de esperar).',
            fields: [
                {
                    name: '\`1\`) Id / Abreviatura',
                    value: `${ abrev }.`,
                    inline: false
                },
                {
                    name: '\`2\`) Nombre completo',
                    value: `${ nombre }`,
                    inline: false,
                },
                {
                    name: '\`3\`) Eliminar?',
                    value: 'Elimina esta materia y las notificaciones. Enviar: 3, si',
                    inline: false
                }
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

            const commandAllowed = [0,1,2];

            if ( collected.size === 0) return message.channel.send('💥 Error. No se editó.');
            
            const argsJoined = collected.first().content.split(',').map( arg => arg.trim() );

            const commandChoose = parseInt(argsJoined[0])-1;

            if (argsJoined.size <= 1 || !commandAllowed.includes(commandChoose) ) return message.channel.send('💥 Error. No se editó.');

            const arrCommand = ['abrev', 'nombre', 'delete' ];
            const commandToDo = arrCommand[ commandChoose ];
            
            if ( commandChoose === 2 ) {
                
                message.channel.send('⏱ Borrando materia ...')
                .then( async (msg) => {
                    if ( argsJoined[1].trim() !== 'si' ) return msg.edit('❌ No se confirmó.');
                    
                    const isChannelDeleted = deleteChannel(channelId);
                    if (isChannelDeleted) {
                        console.log('Channel has been deleted.');

                        await Guilds.decrement('cant_materias', { 
                            by: 1, 
                            where: { 
                                guild_id: guildId
                            }
                        });

                        return msg.edit('👌 Se borró la materia.');

                    } else {
                        console.log('Error borrando materia.')
                        return msg.edit('❌ Error interno al borrar materia.');
                    }
                });

            } else {
                const updFunction = async() => {
                    const updateData = {
                        ChannelToUpdate: channelId,
                        optChange: commandToDo,
                        valChange: argsJoined[1]
                    };
                    return await updateChannel(updateData);
                }
                // Update ...
                message.channel.send('⏱ Editando materia ...')
                .then( async (msg) => {
                    
                    if (!isValidMateria(commandToDo, argsJoined[1])) return msg.edit('❌ La entrada no es valida!');
                    const isChannelUpdated = await updFunction();
                    if (isChannelUpdated) {
                        console.log('Updated.');
                        return msg.edit('👌 Se editó la materia!');
                    } else {
                        console.log('Error editando materia.')
                        return msg.edit('❌ Error interno al editar materia.');
                    };
    
                });
                
            }

        });

    }
};