
module.exports = {
    name: 'help',
    aliases: ['ayuda', 'listar', 'comandos'],
    guildOnly: false,
    description: 'Lista todos los comandos de FacuBot',
    args: false,
    cooldown: 5,
    permissions: false,
    usage: '<comando(opcional)>',
    execute( message, args ) {

        const data = [];
        const { commands } = message.client;
        // Si no hay argumentos, listar todo.
        if ( !args.length ) {

            data.push('Lista de todos los comandos:');
            data.push('```');
            data.push( commands.map( cmd => `-> ${cmd.name}` ).join('\n') );
            data.push('```');
            data.push( `Podés mandar \`[prefix]help [nombre_Del_Comando]\` para más info de cada uno.` );
            
            return message.channel.send( data, { split: true } );
            /* return message.author.send( data, { split: true } )
                .then( () => {
                    if ( message.channel.type === 'dm' ) return;
                })
                .catch( err => {
                    console.log(`No se pudo mandar DM a ${ message.author.tag }.\nError: ${ err }`);
                    message.channel.send( data, { split: true } );
                }); */
        }
        // Si hay argumentos ...
        const name = args[0].toLowerCase();
        const command = commands.get( name ) || commands.find( c => c.aliases && c.aliases.includes( name ) );

        if ( !command ) {
            return message.reply('ese comando no existe');
        }
        // Sigue acá si existe comando ...
        /*
        data.push(`**Nombre:** \`${ command.name }\``);
        if ( command.aliases ) data.push(`**Alias:** \`${ command.aliases.join(', ')}\``);
        if ( command.description ) data.push(`**Descripción:** ${ command.description }`);
        if ( command.usage ) data.push(`**Uso:** \`${ prefix }${ command.name } ${ command.usage }\``);
        data.push(`**Tiempo de espera:** \`${ command.cooldown || 3 } segundos\``);
        // message.channel.send( data, { split: true });
        */
        const embData = {
            color: 'E9ECED',
            title: 'Info. del comando',
            description: `${command.description}`,
            fields: [
                {
                    name: 'Abreviaturas',
                    value: `Podés llamar al comando con estas abreviaturas: \`${command.aliases.join(', ')}\`.`,
                    inline: false
                },
                {
                    name: 'Modo de uso',
                    value: `\`${command.usage}\`.`,
                    inline: false,
                },
                {
                    name: 'Tiempo de espera',
                    value: `Para volver a usar el comando hay que esperar: ${ command.cooldown || 3 } segundos.`,
                    inline: false
                },
                {
                    name: 'Permisos',
                    value: (command.permissions) ? `Este comando necesita permisos de ${command.permissions}` : `Este comando puede usarlo todo el server.`,
                    inline: false
                }
            ],
            timestamp: new Date()
        };
        message.channel.send({ embed: embData });

    }
};