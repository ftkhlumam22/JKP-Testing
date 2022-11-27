const mongoose = require("mongoose"); // Memanggil Library Mongoose
require("dotenv").config(); // get library to read env
var MONGODB_URL = process.env.MONGODB_URL; // get MongoDB URL from env

// ========================
// Database Connect
// ========================
const InitiateMongoServer = async () => {
  try {
    await mongoose.connect(MONGODB_URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false,
    });
    console.log("Berhasil Terhubung ke Database MongoDB");
  } catch (e) {
    console.log(e);
    throw e;
  }
};

mongoose.set("useCreateIndex", true); // Enable Indexes

module.exports = InitiateMongoServer;
// >>>>>>>>>>>>>>>>>>>>>|||
