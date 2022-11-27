const server = require("./app");
server.listen(process.env.PORT || 4000, () => {
  console.log("Server Berjalan pada Port", 4000);
});

module.exports = server;
