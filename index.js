const fs = require('fs');
const http = require('http');
const url = require('url');

const staticFiles = ['picker', 'play', 'stream'].map((file) => {
  return ['/' + (file === 'picker' ? '' : file), fs.readFileSync(`${file}.html`, 'utf-8')]
}).reduce((acc, val) => { acc[val[0]] = val[1]; return acc }, {})

const server = http.createServer((req, res) => {
  const u = new url.URL(req.url, `http://${req.headers.host}`);
  if (staticFiles[u.pathname]) {
    res.end(staticFiles[u.pathname])
    return;
  }
  switch (u.path) {
  }
  res.writeHead(404)
  res.end()
});
const port = 8000;
server.listen(port, () => {
  console.log(`server started on port ${port}`)
});
