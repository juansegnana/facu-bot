const { getNearestClases } = require("../db/dbActions");
/* Example:
const dayNow = 'miércoles';
const hourNow = '15:20';
*/

const moment = require('moment-timezone');
moment.locale('es');
moment.tz.setDefault("America/Argentina/Buenos_Aires");
require('moment/locale/es');

module.exports.findClasesToAlert = async() => {
    const now = moment();
    const dayNow = now.format('dddd');
    const hourNow = now.add('10', 'minutes').format('HH:mm');
    
    return await getNearestClases(dayNow, hourNow);
}
