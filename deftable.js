var Sequelize = require('sequelize');
var sequelize = require('./connection');

/**
 *
 * @type {Model}
 */
var Project = sequelize.define('Project', {
    title: Sequelize.STRING,
    description: Sequelize.TEXT
});

var Task = sequelize.define('Task', {
    title: Sequelize.STRING,
    description: Sequelize.TEXT,
    deadline: Sequelize.DATE
});

Project.sync({force: true}).then(function() {
    return Project.create({
        title: 'sdsds',
        description: 'sdsdsds'
    });
}).then(function () {
    return Project.findAll();
}).then(function (projects) {
    return Project.update({
        title: 'update with nodejs'
    }, {
        where: {
            id: 1
        }
    })
}).then(function (updateInfoArr) {
    return Project.findById(1);
}).then(function (ins) {
    return Project.destroy({
        where: {
            id: 1
        }
    });
}).catch(function(error) {
    // oooh, did you enter wrong database credentials?
    console.log('the db error' + error);
});
