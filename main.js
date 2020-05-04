const http = require('http');
const port = 8000;
http.createServer(require('./api/index')).listen(port, () => {
  console.log(`server started on port ${port}`)
});

