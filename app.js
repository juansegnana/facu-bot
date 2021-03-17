const Discord = require('discord.js');
const fs = require('fs');
const CronJob = require('cron').CronJob;

const moment = require('moment-timezone');
moment.tz.setDefault("America/Argentina/Buenos_Aires");

require('dotenv').config();
const { newGuild, deleteGuild, getPrefix, getGuilds, restartIsSended } = require('./db/dbActions');
const { sendAlerts } = require('./jobs/sendAlerts');
const { Clases } = require('./db/dbObjects');

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.prefixes = new Discord.Collection();

let prefixDb;

const commandFiles = fs.readdirSync('./commands').filter( file => file.endsWith('.js') );

for ( const file of commandFiles ) {
    const command = require(`./commands/${file}`);
    client.commands.set( command.name, command );
}

const coolDowns = new Discord.Collection();

const createNewGuild = async ( guildId ) => {
    const isCreated = await newGuild(guildId);
    if (isCreated) {
        console.log('Nuevo guild fue agregado a DB.');
    } else {
        console.log('Nuevo guild no se pudo crear.')
    }
};

const deleteGuildFunction = async(guildId) => {
    const isDeleted = await deleteGuild(guildId);
    if (isDeleted) {
        console.log('Guild borrado de DB.');
    } else {
        console.log('Guild no pudo ser borrado por error.');
    }
}

client.once('ready', async() => {
    const arrBotGuilds = client.guilds.cache.map(guild => guild.id);
    const arrDb = await getGuilds();
    
    arrBotGuilds.forEach(guildBot => {
        // Check if some guild were added while bot is offline.
        if (!arrDb.includes(guildBot)) {
            createNewGuild(guildBot);
        }
    });
    arrDb.forEach(guildDb => {
        // Check if some guild were deleted while bot is offline.
        if (!arrBotGuilds.includes(guildDb)) {
            deleteGuildFunction(guildDb);
        };
    })

    client.user.setPresence({
        status: 'online',
        activity: {
            name: "__help",
            type: "LISTENING"
        }
    });
    
    console.log(`Bot listo. Fecha: ${ moment().locale('es').format('LL, h:mm:ss a') }`);
    clasesJob();
});

// Eventos on guildCreate and guildDelete...
client.on('guildCreate', ({ id, name }) => {
    console.log(`Me unieron a "${ name }", ID: "${ id }" \nCreando guild en DB...`);
    createNewGuild(id);
});

client.on('guildDelete', async ({ id, name }) => {
    console.log(`Me borraron de: "${ name }" ID:#${id} \nBorrando datos de DB...`);
    deleteGuildFunction(id);
});

client.on('message', async (message) => {
    
    if (message.channel.type === 'dm' || message.author.bot ) return;
    if (!message.guild.readyInit) {
        console.log('Pasando por readyInit')
        const guildIdMsg = message.guild.id;
        const prefixFromDb = await getPrefix(guildIdMsg);
        client.prefixes.set( guildIdMsg, prefixFromDb );
        message.guild.readyInit = true;
    };
    prefixDb = await client.prefixes.get( message.guild.id );
    
    if ( !message.content.startsWith(prefixDb) ) return;
    
    const args = message.content.slice( prefixDb.length ).trim().split(/ +/);
    const commandName = args.shift().toLocaleLowerCase();

    const command = client.commands.get( commandName ) || client.commands.find( cmd => cmd.aliases && cmd.aliases.includes(commandName) );

    if ( !command ) return;

    if ( command.guildOnly && message.channel.type !== 'text' ) {
        return message.reply('no se puede ejecutar este comando por privado.')
    }

    if ( command.permissions ) {
        const authorPerms = message.channel.permissionsFor( message.author );
        if ( !authorPerms || !authorPerms.has( command.permissions )) {
            return message.reply('no tenés los permisos para usar el comando.');
        }
    }

    if ( command.args && !args.length ) {
        
        const reply = `Este comando necesita argumentos ${message.author}.\n${ command.usage && `La manera de usarlo es: \`${ prefixDb }${ command.name } ${ command.usage } \`` }`;
        return message.channel.send( reply );

    }

    if ( !coolDowns.has( command.name ) ) {
        coolDowns.set( command.name, new Discord.Collection() );
    }

    const now = Date.now();
    const timestamps = coolDowns.get( command.name );
    const coolDownAmount = ( command.cooldown || 3 ) * 1000;

    if ( timestamps.has( message.author.id ) ) {
        const expirationTime = timestamps.get( message.author.id ) + coolDownAmount;

        if ( now < expirationTime ) {
            const timeLeft = ( expirationTime - now ) / 1000;
            return message.reply(`esperá ${ timeLeft.toFixed(1) } segundo(s) para volver a usar el comando \`${ command.name }\``);
        }

    } else {

        timestamps.set( message.author.id, now );
        setTimeout(() => {
            timestamps.delete( message.author.id)
        }, coolDownAmount );

    }

    try {
        command.execute( message, args );
    } catch ( err ) {
        console.log( err );
        message.channel.send('🔥 Hubo un error al ejecutar ese comando.');
    }

});

client.login( process.env.TOKEN_BOT );

const clasesJob = async() => {
    const each5Minutes = '*/5 7-23 * 2-11 1-6';
    const eachMidnight = '00 00 * * *';
    // Clases Job
    const clasesJob = new CronJob(
        each5Minutes,
        async() => {
        
            const resul = await sendAlerts();
            console.log(resul);
            if (resul.length < 1) return console.log('Length es 0. No hay clases para avisar.');
            
            await resul.forEach(async ({clId, chId, embData}) => {
                const channelToSend = await client.channels.fetch(chId);
                
                await channelToSend.send({ embed: embData });
                console.log('Se envió alerta.')
                await Clases.update({ 'isSended': 1 }, { where: { id: clId } });
                console.log('Se actualizó isSended a "1".')
            });
        },
        null,
        true,
        'America/Argentina/Buenos_Aires'
    );
    clasesJob.start();

    // RestartJob -> midnight
    const restartJob = new CronJob(
        eachMidnight,
        () => {
            restartIsSended();
        },
        null,
        true,
        'America/Argentina/Buenos_Aires'
    );
    restartJob.start();
}