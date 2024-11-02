const express = require("express");
const dotenv = require("dotenv");
const routes = require("./routes");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./db/init.mongodb");
const compression = require("compression");

dotenv.config();

const app = express();

// init middleware
app.use(compression());
app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// init DB
connectDB();

// add page router
routes(app);

module.exports = app;
