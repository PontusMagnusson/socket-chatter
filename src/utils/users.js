const users = []

const addUser = ({id, username, room}) => {

    // Check if user tried bypassing form, since trim will throw exception if value is undefined
    if (!username || !room) {
        return { error: 'Username and room are required!' }
    }

    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Check if values were all whitespaces
    if (!username || !room) {
        return { error: 'Username and room are required!' }
    }

    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    if (existingUser) {
        return { error: 'Username is already in user' }
    }

    const user = { id, username, room }
    users.push(user)
    return { undefined, user }
}

const removeUser = (id) => {
    const userIndex = users.findIndex((user) => user.id === id)

    if (userIndex === -1) {
        return { error: 'No user found with that id' }
    }

    return { undefined, user: users.splice(userIndex, 1)[0] }
}

const getUser = (id) => {
    return users.find(user => user.id === id)
}

const getUsersInRoom = (room) => {
    return users.filter(user => user.room === room.trim().toLowerCase())
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}