import { createServer } from 'http';
import next from 'next';
import { setupSocketIO } from './socket';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handle);
  setupSocketIO(httpServer);

  httpServer.listen(port, hostname, () => {
    console.log(`> Ready on http://localhost:${port}`);
    console.log(`> LAN:    http://${getLocalIP()}:${port}`);
  });
});

function getLocalIP() {
  const { networkInterfaces } = require('os');
  for (const nets of Object.values(networkInterfaces())) {
    for (const net of nets as any[]) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return 'localhost';
}
