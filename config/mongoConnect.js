const mongoose = require("mongoose");

const DataBaseConnect = () => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log("Connected mongoose successfully");
    })
    .catch((e) => {
      console.log("Failed to connect");
    });
};
module.exports = DataBaseConnect;
