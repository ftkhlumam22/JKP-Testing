const server = require("./app");
const http = require("http");
const https = require("https");
const fs = require("fs");

// Certificate Api Backend
const api_backend = {
  key: fs.readFileSync(
    "/etc/letsencrypt/live/api-backend.jaskipin.com/privkey.pem",
    "utf8"
  ),
  cert: fs.readFileSync(
    "/etc/letsencrypt/live/api-backend.jaskipin.com/cert.pem",
    "utf8"
  ),
  ca: fs.readFileSync(
    "/etc/letsencrypt/live/api-backend.jaskipin.com/chain.pem",
    "utf8"
  ),
};

http.createServer(server).listen(process.env.PORT || 80, () => {
  console.log("Server Berjalan pada Port", 80);
});

https.createServer(api_backend, server).listen(process.env.PORT || 443, () => {
  console.log("Server Berjalan pada Port", 443);
});

//https.createServer(jaskipin,server).listen(process.env.PORT || 443, () => {
//    console.log('Server Berjalan pada Port', 443);
//});

module.exports = server;
