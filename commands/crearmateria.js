const Discord = require("discord.js");
const { default: validator } = require("validator");
const { getChannel, newChannel } = require("../db/dbActions");
const { Guilds } = require("../db/dbObjects");

const ARGS_REQUIRED = 2;

const isValid = ([ abreviatura, nombreCompleto ]) => {
    if (abreviatura.length < 2 || !validator.isAlphanumeric( abreviatura, 'es-ES' )) return false;
    if (nombreCompleto.length < 2) return false;
    return true;
}

module.exports = {
    name: 'crearmateria',
    aliases: ['crma', 'cm', 'nuevamateria', 'materianueva', 'nuemat'],
    guildOnly: true,
    description: 'Crear nueva materia',
    args: true,
    usage: '<abreviatura_materia. Ej.: aed>, <nombre_completo. Ej: Algoritmos>',
    permissions: 'MANAGE_CHANNELS',
    cooldown: 10,
    execute( message, args ) {

        const msgUsed = [];
        msgUsed.push( message );

        const argsJoined = args.join(' ').split(',').map( arg => arg.trim() );
        
        if (argsJoined.length < ARGS_REQUIRED ) return message.reply(`faltan argumentos! Ver uso con __help crearmateria`);
        
        if (!isValid( argsJoined )) return message.reply(`1 o más datos no son validos. Cumplir los tipos:\n \`\`\`js\nabreviatura_materia: Alfanumerico. Minimo 2 caracteres.\nnombreCompleto: Alfanumerico. Minimo 2 caracteres.\ncomision_nombre: Caracteres. Minimo 1 caracter.\nClasesxSemana: Numero entero. Minimo: >=1.\nEJEMPLO: __crearmateria AED, Algoritmos, A, 2\`\`\``);

        const [ abreviatura, nombreCompleto ] = argsJoined;

        const channelName = message.channel.name;
        const channelId = message.channel.id;
        const guildId = message.guild.id;
        
        const materiaResumen = {
            color: 'BB2167',
            title: 'Nueva materia',
            description: '🚨 Confirmar materia nueva. Escribir "si"/"no" (en 30 segundos deja de esperar).',
            fields: [
                {
                    name: 'Abreviatura',
                    value: abreviatura,
                    inline: false
                },
                {
                    name: 'Nombre completo',
                    value: nombreCompleto,
                    inline: false,
                },
                {
                    name: 'Info del canal',
                    value: `Nombre: ${channelName}\n Id: #${channelId}`,
                    inline: false
                }
            ],
            timestamp: new Date(),
            footer: {
                text: '<30seg ...'
            },
        };
    
        message.channel.send({ embed: materiaResumen })
        .then( m => msgUsed.push( m ));
        
        const filter = (m) => m.author.id === message.author.id;
        const collector = new Discord.MessageCollector( message.channel, filter, { max: 1, time: 30000} );
        
        collector.on( 'collect', (msg) => {
            msgUsed.push( msg );
        })
        
        collector.on('end', async (collected) => {
            if (collected.size === 0 || collected.first().content.toLowerCase() !== 'si') {
                return message.channel.send('No se guardó la materia.')
                .then(m => {
                    msgUsed.push( m );
                    
                    setTimeout(() => {
                        Promise.all(msgUsed.map( msg => msg.delete() ))
                        .then(()=> console.log(`Se borraron ${ msgUsed.length }.`) )
                        .catch((err)=> console.log('Error borrando msg de crearMateria:', err.message));
                    }, 5000);
                    
                });
            } 
            
            const isExistentChannel = await getChannel(channelId);
            console.log('Data de isExistent:', isExistentChannel);
            if (isExistentChannel) return message.channel.send('❌ Materia ya existente.\nPara modificar ver comando: \`__help editarmateria\`.');
            
            const channelData = {
                channelId: channelId,
                guildId: guildId,
                abr: abreviatura,
                name: nombreCompleto
            }
            const isChannelCreated = await newChannel(channelData);
            if (isChannelCreated) {
                await Guilds.increment('cant_materias', { 
                    by: 1, 
                    where: { 
                        guild_id: guildId
                    }
                });
                return message.channel.send('👍 Nueva materia agregada. Las alertas de clase se van a mandar a este canal.');
            } else {
                return message.channel.send('🔥 Hubo un error. No se guardó la materia.');
            }
        
        });


        
    }
};