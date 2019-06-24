const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

// Configure static resources
const publicPath = path.join(__dirname, '../public')
app.use(express.static(publicPath))

/*
    io.emit -> send event to all connected sockets
    socket.emit -> send to that connection
    socket.broadcast.emit -> send to everyone but that connection
    io.to(<room>).emit ->  send to everyone in a room
    socket.broadcast.to(<room>).emit -> send to everyone in a room except the broadcasting connection
*/

io.on('connection', (socket) => {
    console.log('New socket connection')

    socket.on('join', ({username, room}, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('message', generateMessage(`Welcome, ${user.username} to the "${user.room}" chatroom`, '<server>'))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined the room!`, '<server>'))
        io.to(user.room).emit('updateUserList', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })


    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)

        const filter = new Filter()
        message = filter.clean(message)

        io.to(user.room).emit('message', generateMessage(message, user.username))
        callback()
    })

    socket.on('sendLocation', ({latitude, longitude}, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${latitude},${longitude}`, user.username))
        callback()
    })

    socket.on('disconnect', () => {
        const { error, user } = removeUser(socket.id)

        if ( user ) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has left ${user.room}`, '<server>'))
            io.to(user.room).emit('updateUserList', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

    })
})

server.listen(port, () => {
    console.log(`Server is up and listening on port ${port}`)
})