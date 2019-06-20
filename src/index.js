const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

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
*/

io.on('connection', (socket) => {
    console.log('New socket connection')
    socket.emit('message', 'Welcome user!')
    socket.broadcast.emit('message', 'A new user has joined the channel!')

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        message = filter.clean(message)

        io.emit('message', message)
        callback()
    })

    socket.on('sendLocation', ({latitude, longitude}, callback) => {
        io.emit('message', `https://google.com/maps?q=${latitude},${longitude}`)
        callback()
    })

    socket.on('disconnect', () => {
        io.emit('message', 'A user has left the channel!')
    })
})

server.listen(port, () => {
    console.log(`Server is up and listening on port ${port}`)
})