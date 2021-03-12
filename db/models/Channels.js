/*
    Por cada canal del server habrá solo 1 materia,
    Cada Channel es una Materia. 
*/
module.exports = (sequelize, DataTypes) => {

    return sequelize.define('channels', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        guild_id: {
            type: DataTypes.TEXT,
            unique: false,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        channel_id: {
            type: DataTypes.TEXT,
            unique: true,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        abrev: DataTypes.TEXT,
        nombre: DataTypes.TEXT,
        perfom_at: DataTypes.DATE,
        clase_id: DataTypes.INTEGER,
        cant_clases: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        } // cantidad clases por semana
    });

};