const fs = require('fs');
const http = require('http');
const url = require('url');

let waitingStreamers = {};
let streamerWaitingForAnswer = {}
const staticFiles = ['picker', 'player', 'streamer'].map((file) => {
  return [(file === 'picker' ? '' : file), fs.readFileSync(`${file}.html`, 'utf-8')]
}).reduce((acc, val) => { acc[val[0]] = val[1]; return acc }, {})

const server = http.createServer((req, res) => {
  const u = new url.URL(req.url, `http://${req.headers.host}`);
  const segments = u.pathname.split('/')
  const firstSegment = segments[1]
  if (req.method === 'GET' && firstSegment === 'robots.txt') {
    res.end('User-agent: *\nDisallow: /')
    return;
  }
  if (req.method === 'GET' && staticFiles[firstSegment]) {
    res.end(staticFiles[firstSegment])
    return;
  }
  if (req.method === 'POST' && firstSegment === 'stream' && segments.length === 3) {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', chunk => {
        body += chunk;
    });
    req.on('end', () => {
      waitingStreamers[segments[2]] = body;
      res.writeHead(204)
      res.end()
    });
    return;
  }

  if (req.method === 'GET' && firstSegment === 'stream' && waitingStreamers[segments[2]] && segments.length === 3) {
    res.writeHead(200, {'content-type': 'application/json'})
    res.end(waitingStreamers[segments[2]])
    delete waitingStreamers[segments[2]]
    return;
  }
  if (req.method === 'POST' && firstSegment === 'stream' && segments.length === 4 && segments[3] === 'answer' && streamerWaitingForAnswer[segments[2]]) {
    const otherRes = streamerWaitingForAnswer[segments[2]]
    otherRes.writeHead(200, {'content-type': 'application/json'})
    req.pipe(otherRes)
    res.writeHead(204)
    res.end()
    return;
  }
  if (req.method === 'GET' && firstSegment === 'stream' && segments.length === 4 && segments[3] === 'answer') {
    streamerWaitingForAnswer[segments[2]] = res;
    return;
  }
  res.writeHead(404)
  res.end()
});
const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log(`server started on port ${port}`)
});
