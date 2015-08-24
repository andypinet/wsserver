var nomo = require('node-monkey').start({port: 56000}),
    bunyan = require('bunyan');

var log = bunyan.createLogger({
    name: 'app',
    streams: [
        {
            level: 'info',
            stream: nomo.stream
        }
    ]
});

log.info('enable debug ');

module.exports = log;
