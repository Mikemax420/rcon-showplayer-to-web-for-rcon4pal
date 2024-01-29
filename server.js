const express = require('express');
const http = require('http');
const io = require('socket.io');
const path = require('path');  // Import the path module

const app = express();
const server = http.createServer(app);
const socketServer = io(server);

const rconOptions = {
  host: '127.0.0.1',
  port: 25666,//CHANGE TO YOUR RCON PORT
  password: 'CHANGE TO YOUR RCON PW',
};

const { Rcon } = require('srcds-rcon');

const executeRconCommand = async (command) => {
  const rcon = new Rcon({
    host: rconOptions.host,
    port: rconOptions.port,
    password: rconOptions.password,
  });

  try {
    await rcon.connect();
    const response = await rcon.command(command);
    console.log('Response from RCON:', response);
  } catch (error) {
    console.error('Error executing RCON command:', error.message);
  } finally {
    rcon.disconnect();
  }
};
// Serve HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));  // Specify the path to your HTML file
});

// Socket.io connection
socketServer.on('connection', (socket) => {
  // Initial request to get showplayers data
  socket.on('getPlayers', async () => {
    try {
      const players = await executeRconCommand('showplayers');
      socket.emit('playersData', players);
    } catch (error) {
      console.error('Error executing RCON command:', error.message);
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});