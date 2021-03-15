const moment = require('moment');
require('moment/locale/es');
moment.locale('es');
const { getNearestClases } = require("../db/dbActions");

const findClasesToAlert = async() => {
    const now = moment();
    const dayNow = now.format('dddd');
    const hourNow = now.add('10', 'minutes').format('HH:mm');

    const output = await getNearestClases(dayNow, hourNow);
    return output;
}

const colors = [
    '73C6B6', '7DCEA0', 
    'DC7633', '964613',
    '630436', '8eb8ad',
    'd0a1a1', 'e19e1e',
    'c148a2', 'c14865',
    'c16748', 'c1a348',
    'a2c148', '65c148'
];

module.exports.sendAlerts = async () => {

    const results = await findClasesToAlert();
    let out = [];
    if (results.length < 1) return out;
    
    results.forEach( (clase) => {

        const random = Math.floor(Math.random() * colors.length);
        const colorRandom = colors[random];
        
        let claseEmbed = {
            color: colorRandom,
            title: '⏰ Una clase está por comenzar',
            url: `${ clase.clase_link }`,
            description: `Hora de inicio: ${clase.clase_horarep} hrs.`,
            fields: [
                {
                    name: 'ID de clase',
                    value: clase.clase_id,
                    inline: true
                },
                {
                    name: 'Contraseña de clase',
                    value: clase.clase_contra,
                    inline: true,
                },
                {
                    name: 'Link de clase',
                    value: clase.clase_link,
                    inline: false
                }
            ],
            timestamp: new Date()
        };

        if (clase.notas) {
            claseEmbed.fields = [ 
                {
                    name: 'Notas',
                    value: clase.notas,
                    inline: true
                },
                ...claseEmbed.fields
            ];
        };

        out.push({clId: clase.id, chId: clase.channel_id, embData: claseEmbed});

    });
    
    return out;

};