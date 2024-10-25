const socketIO = require("socket.io");
const { updateUserById } = require("./models/user");
const { check_socket_auth } = require("./middlewears/socket_auth");
let io;

exports.io = (server) => {
    io = socketIO(server);
    io.use((socket, next) => {
        check_socket_auth(socket, next);
    }).on("connection", async (socket) => {
        const userObj = await updateUserById(socket.userId, { online: true });
        socket.broadcast.emit('user-connected', userObj);

        socket.on("disconnet", async (socket) => {
            const userObj = await updateUserById(socket.userId, { online: false });
            socket.broadcast.emit('user-disconnected', userObj);
        })
    })
}
