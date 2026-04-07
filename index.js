const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const initialRouter = require("./router");
const DataBaseConnect = require("./config/mongoConnect");
var cookieParser = require("cookie-parser");
const connect = require("./config/redisConnect");
const socketIo = require("./config/socket.config");
const app = express();
const server = http.createServer(app);
require("dotenv").config();
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Debug middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

initialRouter(app);
const PORT = process.env.PORT;
server.listen(PORT || 8000, () => {
  console.log("listening on port " + process.env.PORT);
});
DataBaseConnect();
socketIo(server);
