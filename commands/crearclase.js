const Discord = require("discord.js");
const { getChannel, getDataChannel, newClase } = require("../db/dbActions");
const { Channels } = require("../db/dbObjects");
const { LIMIT_PER_MATERIA } = require('../config.json');

const moment = require("moment");
require('moment/locale/es');

module.exports = {
    name: 'crearclase',
    aliases: ['newclass', 'agcl', 'agregarclase'],
    guildOnly: true,
    description: 'Agrega nueva clase a una materia existente.',
    args: true,
    usage: '<dia-semana (3 caracteres): ej: lun>, <hora-inicio. Ej: 14:20>, <id>, <contraseña-clase>, <link-clase> [, nota (opcional)]',
    permissions: 'MANAGE_CHANNELS',
    cooldown: 10,
    async execute( message, args ) {
        
        moment.locale('es');
        
        const guildId = message.guild.id;
        const channelId = message.channel.id;

        const isExistentChannel = await getChannel(channelId);
        console.log('Data de isExistent:', isExistentChannel);
        if (!isExistentChannel) return message.channel.send('❌ No existe una materia en este canal.\nPara crear ver comando: \`[prefix]help crearmateria\`.');
            
        const { cant_clases } = await getDataChannel(channelId);
        console.log('Cant clases:', cant_clases);
        if (cant_clases >= LIMIT_PER_MATERIA) return message.channel.send(`✋ Este server llegó al limite de ${ FREE_LIMIT_PER_MATERIA } clases por materia.`);

        const argsJoined = args.join(' ').split(',').map( arg => arg.trim() );
        if (argsJoined.length < 5) return message.channel.send('Faltan parámetros! Ver comando [prefix]help crearmateria') 
        const daysAllowed = ['lun','mar','mie','jue','vie','sab'];
        const [ dayName, hourStart, id, contra, link, nota ] = argsJoined;
        
        let isValid = true;

        if ( !daysAllowed.includes(dayName) ) isValid = false;
        if ( !moment(hourStart, 'HH:mm', true).isValid() ) isValid = false;
        if ( id.length > 20 ) isValid = false;
        if ( contra.length > 20 ) isValid = false;
        if ( link.length > 60 ) isValid = false;
        if ( nota ) {
            if ( nota.length > 30 ) isValid = false;
        }

        const msgNotValid = '1)Qué día de la semana es la clase? Ejemplo: \`lun, mar, mie, jue, vie, sab\`.\n2)A que hora comienza? Ej: \`14:20\`.\n3)A que hora termina? Ej:\`16:40\`.\nResponder en 1 mensaje, separando cada argumento por una coma. Ejemplo: \`lun, 13:30, 15:40\`.';
        if (!isValid) return message.channel.send(`No válido. Fijate que cumple el siguiente formato:\n ${msgNotValid}`)

        const number_dayClass = daysAllowed.indexOf(dayName); 
        const nombreCompletoDia = ['lunes','martes','miércoles','jueves','viernes','sábado'];

        const claseResumen = {
            color: '8EB8AD',
            title: `🆕 Agregando clase Nro. ${cant_clases+1}`,
            description: '🚨 Confirmar clase nueva. Escribir "si"/"no" (en 30 segundos deja de esperar).',
            fields: [
                {
                    name: '1) Día',
                    value: `Cada ${ nombreCompletoDia[number_dayClass] }.`,
                    inline: true
                },
                {
                    name: '2) Hora de inicio',
                    value: hourStart,
                    inline: false,
                },
                {
                    name: '3) Id de clase',
                    value: id,
                    inline: true
                },
                {
                    name: '4) Contraseña de clase',
                    value: contra,
                    inline: true
                },
                {
                    name: '5) Link de clase',
                    value: link,
                    inline: false
                },
                {
                    name: '6) Nota',
                    value: `${(nota) ? nota : 'Sin nota.'}`,
                    inline: false
                }
            ],
            timestamp: new Date(),
            footer: {
                text: '<30seg ...'
            },
        };

        message.channel.send({ embed: claseResumen });
        
        const filter = (m) => m.author.id === message.author.id;
        const collector = new Discord.MessageCollector( message.channel, filter, { max: 1, time: 30000} );

        collector.on('end', async (collected) => {

            if (collected.size === 0 || collected.first().content.toLowerCase() !== 'si')
                return message.channel.send('No se guardó la clase.');

            message.channel.send('⏱ Agregando clase y nueva notificación ...')
            .then( async (msg) => {
                
                const newClaseData = {
                    guildId: guildId,
                    channelId: channelId,
                    diaRep: nombreCompletoDia[number_dayClass],
                    horaRep: hourStart,
                    clasId: id,
                    clasContra: contra,
                    clasLink: link,
                    nota: `${(nota) ? nota : false}`
                } 
                await newClase( newClaseData );

                const isUpdated = await Channels.update({ 'cant_clases': cant_clases + 1 },{
                    where: { 'channel_id': channelId }
                });
                
                if (isUpdated[0] !== 1) return msg.edit('❌ Error interno al agregar clase.');

                return msg.edit('👌 Se agregó nueva clase!');

            });

        });

    }
};