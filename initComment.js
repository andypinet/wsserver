var Sequelize = require('sequelize');
var sequelize = require('./connection');
var faker = require('faker');
faker.locale = "zh_CN";

/**
 *
 * @type {Model}
 */
var Comment = sequelize.define('Comment', {
    title: Sequelize.STRING,
    description: Sequelize.TEXT
});

//Comment.sync({force: true}).then(function() {
//    for (var i = 0; i < 10; i++) {
//        Comment.create({
//            title: faker.name.findName(),
//            description: faker.name.title()
//        });
//    }
//
//    return Comment.findAll();
//}).catch(function(error) {
//    // oooh, did you enter wrong database credentials?
//    console.log('the db error' + error);
//});

module.exports = Comment;
