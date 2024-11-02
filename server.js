const app = require("./src/app");
const appConfig = require("./src/configs/config.env");

app.listen(appConfig.portServer, () => {
  console.info(
    `server listening on: http://${appConfig.host}:${appConfig.portServer}`
  );
});

// process.on("SIGINT", () => {
//   server.close(() => console.log("server closed!"));
// });
