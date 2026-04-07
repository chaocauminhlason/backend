const { Server } = require("socket.io");
require("dotenv").config();
console.log(process.env.CLIENT_URL)
const socketIo = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
        },
    });

    io.on("connection", (socket) => {

        socket.on("addproduct", (data) => {

            io.emit("getproduct", data);
        });

        socket.on("disconnect", () => {

        });
    });
}

module.exports = socketIo