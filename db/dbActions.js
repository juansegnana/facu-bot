const { Guilds, Channels, Clases } = require('./dbObjects');
const { Op } = require('sequelize');

// --- Guilds actions --- //
const newGuild = async( guildId ) => {
    let output = true;
    await Guilds.findOne({
        where: {
            guild_id: guildId
        }
        }).then(function(favorite) {
            
        if (favorite !== null) {
            console.log('Este guild ya existe.');
            return output = false;
        };

        Guilds.create({
            guild_id: guildId,
            cant_materias: 0
        })
        .then(() => {
            console.log('Guild creado.')
            return output = true;
        })
        .catch(err => console.log('Err creando guild:', err.message));
        
    })
    .catch(err => {
        console.log(err.message);
        output = false;
    });

    return output;

}

const deleteGuild = async (guildId) => {
    let out = true;
    await Guilds.findOne({
        where: {
            guild_id: guildId
        }
        }).then(function(favorite) {
        
        if (favorite === null) return console.log('No existe tal guild.');

        Guilds.destroy({
            where: {
                guild_id: guildId
            }
        }).then(()=> {
            console.log('Guild eliminado.');
            Channels.destroy({
                where: {
                    guild_id: guildId
                }
            }).then(() => {
                Clases.destroy({
                    where: {
                        guild_id: guildId
                    }
                });
            });
            return;
        })
        .catch(err=> {
            console.log('Err eliminando guild:', err.message);
            out = false;
        });
    })
    .catch(err => {
        console.log(err.message);
        out = false;
    });

    return out;

};

const getGuilds = async() => {
    let out = [];
    await Guilds.findAll({
        attributes: ['guild_id'],
        raw : true
    }).then( data => {
        if (data.length < 1) console.log('Empty.');   
        data.forEach(el => {
            out.push(`${el.guild_id}`);
        });
    });
    return out;
};

const getPrefix = async( guildId ) => {
    let output = '__';
    await Guilds.findOne({
        where: {
            guild_id: guildId
        },
        attributes: ['prefix'],
        raw: true
    })
    .then( (data) => {
        if ( data.length < 1 ) return console.log('Error encontrando prefix guild.')

        output = data.prefix;
    })
    .catch(err => console.log(err.message));
    return output;
};

const updatePrefix = async( guildId, newPref ) => {
    let output = true;
    await Guilds.update({ prefix: newPref }, 
        { 
            where: { guild_id: guildId }
        }
    )
    .then(() => {
        console.log('Se actualizo un prefix.');
    })
    .catch((err)=> {
        console.log(err.message);
        output = false;
    });
    return output;
}

const getChannel = async( channelId ) => {
    let out = false;
    // Checks if channel/materia exists.
    await Channels.findOne({
        where: {
            channel_id: channelId
        }
        }).then(function(favorite) {
        
        if (favorite === null) {
            console.log('No existe channel.');
            return;
        } else {
            console.log('Si existe channel.');
            return out = true;
        };

    })
    .catch(err => console.log('Err catch getting channel:', err.message));
    return out;

};

const getDataChannel = async( channelId ) => {
    let out = {};
    // Checks if channel/materia exists.
    await Channels.findOne({
        where: {
            channel_id: channelId
        },
        attributes: ['abrev', 'nombre', 'cant_clases'],
        raw: true
    }).then((data) => 
        {
            out = data;
        })
    .catch(err => console.log('Err catch getting channel:', err.message));
    return out;

};

const newChannel = async({ channelId, guildId, abr, name }) => {
    let out = true;
    Channels.create({
        channel_id: channelId,
        guild_id: guildId,
        abrev: abr,
        nombre: name,
        cant_clases: 0
    })
    .then(() => {
        console.log('Channel creado.');
        return;
    })
    .catch(err => {
        console.log('Err creando channel:', err.message);
        return out = false;
    });
    return out;
};

const updateChannel = async({ ChannelToUpdate, optChange, valChange }) => {
    let out = true;
    Channels.update({
        [optChange]: valChange
    }, {
        where: {
            channel_id: ChannelToUpdate
        }
    })
    .then(() => {
        console.log('Updated!');
    })
    .catch(err => {
        console.log('Error updating channel:', err.message);
        out = false;
    });
    return out;
};

const deleteChannel = async(channelId) => {
    let out = true;
    Channels.destroy({
        where: {
            channel_id: channelId
        }
    }).then(() => {
        Clases.destroy({
            where: {
                channel_id: channelId
            }
        }).catch(() => out = false);
    }).catch(() => out = false);
    return out;
}

const newClase = async({ guildId, channelId, diaRep, horaRep, clasId, clasContra, clasLink }) => {

    Clases.create({
        guild_id: guildId,
        channel_id: channelId,
        clase_repetir: diaRep,
        clase_horarep: horaRep,
        clase_id: clasId,
        clase_contra: clasContra,
        clase_link: clasLink
    })
    .then(() => console.log('Se creó clase.'))
    .catch((err) => console.log('Error al crear clase. Err:', err.message));

};

const getNearestClases = async( dayName, hourToSearch ) => {
    let out = [];
    await Clases.findAll({
        where: {
            clase_repetir: { [Op.eq]: dayName }, // clase_repetir = 'miércoles'
            clase_horarep: { [Op.lte]: hourToSearch }, // clase_horarep <= '12:30'
            isSended: { [Op.eq]: 0 }
        },
        attributes: ['id', 'channel_id', 'clase_horarep', 'clase_id', 'clase_contra', 'clase_link'],
        raw: true
    }).then( (data) => {
        
        if (data.length < 1) {
            return out;
        };   
        data.forEach((el) => {
            
            out.push(el);

        });    
    });
    
    return out;
};

const restartIsSended = async() => {

    await Clases.findAll({ 
        where: { 'isSended': 1 },
        attributes: ['id'],
        raw: true
    })
    .then(async(data) => {
        
        data.forEach(async(el) => await Clases.update({ isSended: 0 }, { where: { id: el.id } }));
    });
    console.log('Se reiniciaron los isSended');

}

module.exports = {
    // Guilds
    newGuild,
    deleteGuild,
    getGuilds,
    // Prefix
    getPrefix,
    updatePrefix,
    // Channels-Materias
    getChannel,
    getDataChannel,
    newChannel,
    deleteChannel,
    updateChannel,
    // Clases
    newClase,
    getNearestClases,
    restartIsSended
};