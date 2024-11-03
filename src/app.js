const express = require("express");
const dotenv = require("dotenv");
const routes = require("./routes");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./db/init.mongodb");
const compression = require("compression");
const errorHandle = require("./middleware/ErrorHandle");
const ErrorResponse = require("./core/ErrorResponse");
const { CONFIG_MESSAGE_ERRORS } = require("./configs");

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

// error handler
app.use((req, res, next) => {
  const err = new ErrorResponse(
    "Internal Server Error",
    CONFIG_MESSAGE_ERRORS.INTERNAL_ERROR.status,
    CONFIG_MESSAGE_ERRORS.INTERNAL_ERROR.type,
    "Error"
  );
  next(err);
});

app.use(errorHandle);

module.exports = app;
