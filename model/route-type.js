'use strict';

module.exports = function(sequelize, DataTypes) {
    const RouteType = sequelize.define('RouteType', {
        code: {
            type: DataTypes.STRING,
            allowNull: false,
            set: function(val) {
                this.setDataValue('code', val.trim().toLowerCase());
            }
        }
    });

    return RouteType;
};
