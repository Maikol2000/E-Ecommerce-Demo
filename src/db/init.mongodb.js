const mongoose = require("mongoose");
const appConfig = require("../configs/config.env");

const connectDB = () => {
  const url = appConfig.mongoDB;
  mongoose
    .connect(url)
    .then(() => {
      console.log("Connection success!");
    })
    .catch((err) => {
      console.error(err.message);
    });
};

module.exports = connectDB;
