const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");

const User = require('./schemas/User.js');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

mongoose.connect('', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

db.once('open', () => {
  console.log('Connected to MongoDB');
});

function generateRandomString(length) {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    const parsedMessage = JSON.parse(message);
    const messageType = parsedMessage.type;

    console.log(parsedMessage);

    switch (messageType) {
      case 'caca':
        const idr = generateRandomString(8);
        const idr2 = generateRandomString(8);
        const accountId = idr + '-' + parsedMessage.data.username + '-' + idr2;
        registerUser(parsedMessage.data.username, parsedMessage.data.email, parsedMessage.data.password, accountId, ws, parsedMessage)
        break;
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

function userChecks(ws, message) {

  const parsedUsername = message.data.username;
  const parsedEmail = message.data.email;

  let exists = false;

  const response1 = {
    type: 'reg-error_username-taken',
    data: 'An account with that Username alread exists! Please register with a different Username.',
  };

  const response2 = {
    type: 'reg-error_email-taken',
    data: 'An account with that E-Mail alread exists! Please register with a different E-Mail.',
  };

  if (User.findOne({ parsedUsername })) {
    ws.send(JSON.stringify(response1));
    exists = true;
  } else {
    exists = false;
  }

  if (User.findOne({ parsedEmail })) {
    ws.send(JSON.stringify(response2));
    exists = true;
  } else {
    exists = false;
  }

  return exists
}

async function registerUser(username, email, password, accountId, ws, message) {

  const hashedPassword = await bcrypt.hash(password, 10);
  let created = false;

  await User.create({ username, accountId, email, password: hashedPassword, created: new Date().toISOString() });
  created = true;

  return created;
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/assets/index.html');
});

app.get('/style.css', (req, res) => {
  res.sendFile(__dirname + '/assets/style.css');
});

server.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});