var mysql = require('mysql');

var con = mysql.createConnection({
    host: "45.130.230.90",
    user: "u1035350_jaskipin_front",
    password: "jaskipin123",
    database: "u1035350_jaskipin_front"
});

con.connect(function (err){
    if(err) throw err;
});

function keepalive() {
    con.query('select 1', [], function(err, result) {
        if(err) return console.log(err);
        // Successul keepalive
    });
}
setInterval(keepalive, 1000*60*5);

module.exports = con;