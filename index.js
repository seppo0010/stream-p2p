const fs = require('fs');
const http = require('http');
const url = require('url');

let waitingStreamers = {};
const staticFiles = ['picker', 'play', 'stream'].map((file) => {
  return [(file === 'picker' ? '' : file), fs.readFileSync(`${file}.html`, 'utf-8')]
}).reduce((acc, val) => { acc[val[0]] = val[1]; return acc }, {})

const server = http.createServer((req, res) => {
  const u = new url.URL(req.url, `http://${req.headers.host}`);
  const segments = u.pathname.split('/')
  const firstSegment = segments[1]
  if (req.method === 'GET' && staticFiles[firstSegment]) {
    res.end(staticFiles[firstSegment])
    return;
  }
  if (req.method === 'POST' && firstSegment === 'stream') {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', chunk => {
        body += chunk;
    });
    req.on('end', () => {
      waitingStreamers[segments[2]] = body;
      res.end()
    });
    return;
  }
  res.writeHead(404)
  res.end()
});
const port = 8000;
server.listen(port, () => {
  console.log(`server started on port ${port}`)
});
