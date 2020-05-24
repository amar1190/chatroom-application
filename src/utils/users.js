const Users = []

const addUser = ({id, username, room}) => {
    // Clean data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate data
    if ( !username || !room) {
        return {
            error: 'Username and Room is required!'
        }
    }

    // check existing user
    const existingUser = Users.find( (user) => {
        return user.room === room && user.username === username
    })

    // Validate user
    if(existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    // Store user
    const user = {id, username, room}
    Users.push(user)
    return {user}
}

const removeUser = (id) => {
    const index = Users.findIndex((user) => user.id === id)

    // remove user
    if( index != -1) {
        return Users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return Users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return Users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}