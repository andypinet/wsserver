var log = require('./debug');

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var faker = require('faker');
faker.locale = "zh_CN";

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

// 设置静态文件路径
app.use('/static', express.static('bower_components'));

var nsp = io.of('/my-namespace');

nsp.on('connection', function(socket){
    socket.on('chat message', function(msg){
        nsp.emit('chat message', msg);
    });

    socket.on('disconnect', function(){
        //console.log('user disconnected');
    });

    socket.on('chatroom info', function (msg) {
        //console.dir(arguments);
    });
});

http.listen(3200, function(){
    //console.log('listening on *:3200');
});

var rooms = {};

var Comment = require('./initComment');

app.get('/travel/:user', function(req, res){
    log.info(req);

    var roomname = req.params.user;

    if(roomname && !rooms.hasOwnProperty(roomname)) {

        rooms[roomname] = io.of(roomname);

        var currentRoom = rooms[roomname];

        rooms[roomname].cache = [];

        var initRoom =  function (socket) {
            socket.emit('chat room name', '欢迎进入' + roomname + '房间');

            socket.on('chat message', function(msg){
                rooms[roomname].emit('chat message', msg);
                currentRoom.cache.push({
                    title: faker.name.findName(),
                    description: msg
                });
            });
        };

        currentRoom.on('connection', initRoom);

        setInterval(function saveCache () {
            if(currentRoom.cache.length > 0) {
                currentRoom.cache.forEach(function (item, index, array) {
                    Comment.create(item);
                });
                currentRoom.cache = [];
                log.info('创建数据中');
            }
        }, 30000);
    }
    else {

        log.info('我已经建立过房间');

        var init = function (socket) {

            Comment.findAll({
                limit: 10,
                order: [['createdAt', 'DESC']]
            }).then(function (comments) {
                var commentsData = [];

                comments.forEach(function (item, index, array) {
                    commentsData.push(item.dataValues);
                });

                var chatmsg = {
                    data: commentsData
                };

                socket.emit('init comment', chatmsg);
            }).catch(function(error) {
                // oooh, did you enter wrong database credentials?
                console.log('the db error' + error);
            });

            init = function(){};
        };

        rooms[roomname].once('connection', init);

    }

    res.sendFile(__dirname + '/index.html');

});

var chatcon = {};

io.on('connection', function (socket) {
    socket.on('create of update an nsp', function (msg) {
        log.info('request accept wait');

        if(msg && msg.id && !chatcon.hasOwnProperty(msg.id)) {
            log.info('first create chat');
            chatcon[msg.id] = io.of(msg.id);

            var curchat = chatcon[msg.id];
            curchat.users = {};

            var initRoom =  function (chatsocket) {
                chatsocket.on('chat message myself', function(chatmessage){
                    chatsocket.broadcast.emit('emit chat message', chatmessage);
                });

                chatsocket.on('send user info', function (userinfomessage) {
                    log.info('get user info');
                    curchat.users[userinfomessage.name] = userinfomessage;
                    curchat.emit('current chat user', curchat.users);
                });

                chatsocket.on('disconnect', function () {
                    log.info('one connection lose connect');
                });

                chatsocket.on('lao zi bu wan le', function (chatusermessage) {
                    log.info(chatusermessage);
                    var username = chatusermessage.name;
                    if (curchat.users.hasOwnProperty(username)) {
                        // 用户在聊天室中
                        log.info('ni zou wo bu niu ni');
                        delete curchat.users[username];
                        curchat.emit('current chat user', curchat.users);
                    }
                    else {
                        // 用户不在聊天室中
                    }
                });
            };

            chatcon[msg.id].on('connection', initRoom);
        }
        else {
            log.info('chat is ready');
        }

        socket.emit('nsp '+ msg.id +' is ready connect', {id: msg.id});
    });
});
