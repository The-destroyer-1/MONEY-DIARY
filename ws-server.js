const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Set();

// Broadcast message to all connected clients
function broadcast(message) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

wss.on('connection', (ws) => {
  console.log('New client connected');
  clients.add(ws);

  // Notify all clients about the new connection
  broadcast({
    type: 'user-joined',
    timestamp: new Date().toISOString(),
    userCount: clients.size,
  });

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log('Received:', message.type);

      // Broadcast the message to all clients
      broadcast({
        ...message,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);

    // Notify remaining clients
    broadcast({
      type: 'user-left',
      timestamp: new Date().toISOString(),
      userCount: clients.size,
    });
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error.message);
  });
});

const PORT = process.env.WS_PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`WebSocket server running on ws://0.0.0.0:${PORT}`);
  console.log(`Local network accessible at ws://[YOUR_IP]:${PORT}`);
});
