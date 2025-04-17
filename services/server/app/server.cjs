const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const possibleNames = require('./names.cjs');

const app = express();
const server = http.createServer(app);

const systemId = 'system';

app.use(
    cors({
        methods: ['GET', 'POST'],
        credentials: true
    })
);

const io = require('socket.io')(server, {
    cors: {
      methods: ["GET", "POST"],
      credentials: true
    }
});

const users = new Map();
const usedNames = new Map();

function getRandomUnusedName() {
    const availableNames = possibleNames.filter((name) => !usedNames.has(name));

    if (0 === availableNames.length) return null;

    const randomIndex = Math.floor(Math.random() * availableNames.length);
    return availableNames[randomIndex];
}

io.on('connection', (socket) => {
    const randomName = getRandomUnusedName();
    if (!randomName) {
        console.error('No user names left! Cannot let in new user...');
        console.log('Connection denied: no available names left');
        socket.emit('connectionDenied', {
            userId: systemId,
            message: 'Server is at maximum capacity. Please try again later.'
        });
        socket.disconnect(true);
        return;
    }

    console.log('New client connected:', socket.id);

    users.set(socket.id, randomName);
    usedNames.set(randomName, socket.id);

    console.log(`Assigned name "${randomName}" to user ${socket.id}`);

    socket.emit('welcome', {
        message: 'Welcome to Socket.IO server!',
        userId: systemId,
        userName: randomName
    });

    socket.broadcast.emit('userJoined', {
        userId: systemId,
        message: 'A new user joined',
        userName: randomName
    });

    socket.on('clientMessage', (data) => {
        console.log('Received message from', randomName, ':', data);

        io.emit('serverMessage', {
            userId: randomName,
            message: data.message,
            timestamp: new Date().toISOString()
        });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);

        const userName = users.get(socket.id);
        if (!userName) return;

        usedNames.delete(userName);
        users.delete(socket.id);

        socket.broadcast.emit('userLeft', {
            userId: systemId,
            message: 'User disconnected',
            userName: randomName
        });
    });
});

app.get('/', (req, res) => {
    res.send('Server Socket.IO active and listening');
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
