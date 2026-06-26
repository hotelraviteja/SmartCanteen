const http = require('http');

// React app mock server on [::1]:5173
const reactServer = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('React App Mock');
});
reactServer.listen(5173, '::1', () => {
  console.log('React Mock Server running on [::1]:5173');
});

// Flutter app mock server on 127.0.0.1:8080
const flutterServer = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Flutter App Mock');
});
flutterServer.listen(8080, '127.0.0.1', () => {
  console.log('Flutter Mock Server running on 127.0.0.1:8080');
});
