const { getNearestClases } = require("../db/dbActions");
/* Example:
const dayNow = 'miércoles';
const hourNow = '15:20';
*/
const moment = require('moment');
require('moment/locale/es');
moment.locale('es');

module.exports.findClasesToAlert = async() => {
    const now = moment();
    const dayNow = now.format('dddd');
    const hourNow = now.add('10', 'minutes').format('HH:mm');
    // console.log(dayNow, hourNow);
    return await getNearestClases(dayNow, hourNow);
}
