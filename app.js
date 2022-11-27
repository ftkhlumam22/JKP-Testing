/*
 * Jaskipin Express Backend
 *
 * Author By Zakiy Fadhil Muhsin.
 * http://zafamu.blogspot.com
 *
 */

// ========================
// Deklarasi
// ========================
const express = require("express"); // Memanggil Library Express JS
const app = express(); // Inisiasi Express JS
const bodyParser = require("body-parser");
const cors = require("cors"); // Memanggil Library CORS

// const indexRouter = require('./src/routers/index'); // Index Router
const apiRouter = require("./src/api/index"); // API Router

const InitiateMongoServer = require("./src/config/db/mongodb");
// >>>>>>>>>>>>>>>>>>>>>|||

// ========================
// Database Connect
// ========================
InitiateMongoServer();

// ========================
// Middlewares
// ========================
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors()); // To allow cross-origin requests
// >>>>>>>>>>>>>>>>>>>>>|||

// ========================
// Routers
// ========================
// app.use('/', indexRouter);
app.use("/api/", apiRouter);
// >>>>>>>>>>>>>>>>>>>>>|||

// ========================
// Static File
// ========================
app.use("/uploads", express.static(__dirname + "/uploads")); //Serves resources from public folder
// >>>>>>>>>>>>>>>>>>>>>|||

module.exports = app;
