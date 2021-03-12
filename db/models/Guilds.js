
module.exports = (sequelize, DataTypes) => {

    return sequelize.define('guilds', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        guild_id: {
            type: DataTypes.TEXT,
            unique: true,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        cant_materias: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        prefix: {
            type: DataTypes.TEXT,
            defaultValue: '__'
        }
    });

};