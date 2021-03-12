
module.exports = (sequelize, DataTypes) => {

    return sequelize.define('clases', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        guild_id: DataTypes.TEXT,
        channel_id: DataTypes.TEXT,
        clase_repetir: DataTypes.TEXT, // ejemplo: "lunes"
        clase_horarep: DataTypes.TEXT, // ejemplo: "13:40"
        clase_id: DataTypes.TEXT,
        clase_contra: DataTypes.TEXT,
        clase_link: DataTypes.TEXT,
        isSended: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    });

};