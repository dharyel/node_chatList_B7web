const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});

app.use(express.static(path.join(__dirname, 'public')));

let connectedUsers = [];


io.on('connection', (socket) => {
    //cada conexão terá seu próprio socket
    console.log('Conexão detectada...');

    //sempre quando se utiliza o 'socket', está se criando um listener
    socket.on('join-request', (username) => {
        socket.username = username;
        connectedUsers.push(username);
        console.log(connectedUsers);

        //envia para o cliente a lista de usuários
        socket.emit('user-ok', connectedUsers);
        //envia a lista de usuários conectados atualizada para todos os outros usuários, exceto este
        socket.broadcast.emit('list-update', {
            joined: username,
            list: connectedUsers
        });
    });

    socket.on('disconnect', () => {
        //remove o usuário que saiu da lista connectedUsers
        connectedUsers = connectedUsers.filter(user => user != socket.username);
        console.log(connectedUsers);

        //atualiza a lista dos usuários conectados para todo mundo
        socket.broadcast.emit('list-update', {
            left: socket.username,
            list: connectedUsers
        });
    });

    socket.on('send-msg', (txt) => {
        let obj = {
            username: socket.username,
            message: txt
        };

        //envia a mensagem para quem a digitou
        socket.emit('show-msg', obj);
        //envia a mensagem para todos os outros
        socket.broadcast.emit('show-msg', obj);
    })
});
