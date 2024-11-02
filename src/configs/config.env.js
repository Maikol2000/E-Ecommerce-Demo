const appConfig = {
  host: process.env.HOST || "localhost",
  portServer: process.env.PORT || "3000",
  portDb: process.env.PORT_DB || "27027",
  mongoDB: process.env.MONGO_DB || "",
};

module.exports = appConfig;
