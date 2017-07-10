var bunyan = require('bunyan');
exports.log = bunyan.createLogger({
  name: 'myapp',
  streams: [
    {
      level: 'info',
      stream: process.stdout            // log INFO and above to stdout
    },
    {
      level: 'error',
      path: './logs/myapp-error.log'  // log ERROR and above to a file
    }
  ]
});