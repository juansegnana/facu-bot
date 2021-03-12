/*
    A partir de un array con el valor de que dia de la semana debe repetirse
    ej: "lunes 10:20". Esta funcion lo que hace es ordenar, siendo siempre la
    posición "[0]" la más cercana a la fecha de "hoy".
    - console.log comentados para testing.
*/

const moment = require('moment');
require('moment/locale/es');
moment.locale('es');

module.exports.formatDates = ( originData ) => {
    const arrayData = originData;
    // console.log('Iniciando...');
    const MOMENT_FORMAT = 'dddd HH:mm';
    
    
    const max = arrayData.length;
    // console.log('ArrayData (original):', arrayData);
    // console.log('Max. tamaño:', max);
    
    const now = moment();
    let newDateUpdate;
    
    if ( max > 1 ) {
    
        // console.log('Premap:',arrayData);
        arrayData.forEach((day) => {
            day.repeat_day = moment(day.repeat_day, MOMENT_FORMAT);
            if ( day.repeat_day.isBefore(now) ) day.repeat_day.add(1, 'week');
            return day.repeat_day;
        })
    
        // console.log('Posmap', arrayData);
        arrayData.sort( (a, b) => {
            return a.repeat_day - b.repeat_day;
        });
    
        // console.log('formated:', arrayData);
        
        newDateUpdate = moment( arrayData[0].repeat_day ).toDate();

        arrayData.forEach((day) => {
            return day.repeat_day = moment( day.repeat_day ).format(MOMENT_FORMAT);
        })
        
        const object = {
            arrayData: arrayData, 
            newDateUpdate: newDateUpdate
        }
        return object;
    
    } else {
        return newDateUpdate = moment( arrayData[0].repeat_day, MOMENT_FORMAT ).add(1, 'week').toDate();
    }

}
