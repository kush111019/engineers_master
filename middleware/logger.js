const morgan = require('morgan');
const rfs = require('rotating-file-stream');

const generator = (time, index) => {
  if (!time) {
    time = new Date();
  }

  const year = time.getFullYear();
  const month = +String(time.getMonth() + 1).padStart(2, 0);
  const day = String(time.getDate()).padStart(2, 0);

  return `${day}-${month}-${year}.log`;
  // return `${day}-${month}-${year}/file-${index}.log`;
};

morgan.token('custom-token', (req, res) => {
  return JSON.stringify({
    method: req.method,
    path: req.originalUrl,
    time: new Date(),
    status: res.statusCode,
    data: req.body,
    ua: req.headers['user-agent'],
  });
});

const logStream = rfs.createStream(generator, {
  interval: '1d', // rotate daily
  path: './logs/',
});

module.exports = morgan(':custom-token', {stream: logStream});
