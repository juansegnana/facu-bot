# Facu Bot - Discord.js

## ¿Qué hace?

Es un bot de Discord el cual avisa cuando tu clase está por comenzar. Facilitandote el link de Zoom / clase virtual con su ID y Contraseña. Olvidate de anotar todos los links de nuevo!

## ¿Cómo funciona?

Los usuarios usan su servidor de Discord como una `carpeta` donde cada canal es una `materia`. Dentro de cada canal puede crearse `clases`. Cada clase necesita los siguientes datos:
- Día de clase de forma abreviada. Por ejemplo: `lun, mar, mie, jue, vie, sab`. No se habilita los domingos.
- Hora de inicio de clase. Ejemplo: `09:00`. Se admite de 07:00 a 23:00 hrs.
- Link directo a la clase.
- ID y Contraseña para ingresar a la clase (de ser necesario).

## Configurar

- Clonar este repositorio con `git clone https://github.com/juansegnana/facu-bot.git`
- Ir a la carpeta raíz e instalar dependencias con `npm install`
- Crear archivo `.env` en raíz. Solo necesitas colocar: `TOKEN_BOT=tu_discord_bot_token`.
- Ir a la carpeta `db/` y ejecutar `node dbInit -f`, el parámetro `-f` es opcional por si querés borrar toda la base de datos. Este comando solo lo realizas una vez o cada vez que cambies los `Models/` de la DB.
- Ejecutar `npm run dev` en desarrollo, o bien `npm run start`
