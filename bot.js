const mc = require('minecraft-protocol');
const { Chat } = require('prismarine-chat');

// Configuration
const options = {
  host: 'localhost',     // Change to your server IP
  port: 25565,
  username: 'MyBot',
  version: '1.21',       // Specify your MC version
  auth: 'offline'        // 'microsoft' for online mode
};

const client = mc.createClient(options);

client.on('connect', () => {
  console.log('Connected to server!');
});

client.on('login', () => {
  console.log('Logged in as', options.username);
  // Send a chat message
  client.write('chat', { message: 'Hello from the bot!' });
});

// Handle incoming chat
client.on('packet', (data, meta) => {
  if (meta.name === 'chat') {
    const chat = new Chat(data.message);
    console.log('Chat:', chat.toString());
    
    // Simple echo bot
    if (chat.toString().includes('hello')) {
      client.write('chat', { message: 'Hi there!' });
    }
  }
});

// Basic position handling
let currentPos = null;
client.on('packet', (data, meta) => {
  if (meta.name === 'position') {
    currentPos = { x: data.x, y: data.y, z: data.z };
    console.log('Position updated:', currentPos);
    
    // Confirm teleport if needed (important for 1.17+)
    if (data.teleportId !== undefined) {
      client.write('teleport_confirm', { teleportId: data.teleportId });
    }
  }
});

// Example movement function
function moveTo(x, y, z) {
  if (!currentPos) return;
  client.write('position', {
    x: x,
    y: y,
    z: z,
    onGround: true
  });
  console.log(`Moving to ${x}, ${y}, ${z}`);
}

// Keep alive
client.on('packet', (data, meta) => {
  if (meta.name === 'keep_alive') {
    client.write('keep_alive', { keepAliveId: data.keepAliveId });
  }
});

client.on('error', (err) => console.error('Error:', err));
client.on('end', () => console.log('Disconnected'));

// Example: Move after 5 seconds
setTimeout(() => {
  moveTo(0, 64, 0); // Adjust coordinates
}, 5000);
