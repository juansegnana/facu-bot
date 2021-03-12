const { default: validator } = require("validator");

module.exports.isValidMateria = ( cmdToDo, arg ) => {
    let out = true;
    switch (cmdToDo) {
        case 'abrev':
            if (arg.length < 2 || !validator.isAlphanumeric( arg, 'es-ES' )) out = false;

            break;
        case 'nombre':
            if (arg.length < 2) out = false;
                
            break;
        default:
            out = false;
            break;
    }
    /*  BUG: isAlphanumeric detecta false cuando hay un espacio 
    console.log(nombreCompleto.length);
    console.log(validator.isAlphanumeric( nombreCompleto, 'es-ES' ));
    */
    return out;

}