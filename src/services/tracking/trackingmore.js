const axios = require('axios');

/**
 * Tracking More Class
 */
class TrackingMore {
    constructor() {
        //
    }

    /* Get Order from Database Jaskipin */
    async getOrder(req, res) {
        const connection = require('../../config/db/mysql_conn');

        connection.query("SELECT * FROM trackings WHERE id_order = '" + req.params.id + "'", function (error, rows, fields){
            if(error){
                console.log(error)
            } else {
                res.json(rows);
                res.end();
            }
        });
    }

    /* Create Order Shipment */
    async createShipment(req, res) {
        const headers = {
            "Content-Type":"application/json",
            "Trackingmore-Api-Key":"d9636e04-1068-44db-8a55-cfa12742d89e",
        };

        /* Consume API Start */
        const postData = {
            tracking_number: req.body.tracking_number, 
            carrier_code: req.body.carrier_code
        };
        const url = 'https://api.trackingmore.com/v2/trackings/post';

        try {
            const response = await axios.post(url, postData, {headers: headers});
            // console.log(response.data);
            res.send(response.data);
        } catch (error) {
            console.error(error);
        }
    }

    /* Get Tracking Result */
    async getTracking(req, res) {
        const carrier_code = req.query.carrier_code;
        const tracking_number = req.query.tracking_number;
        const headers = {
            "Content-Type":"application/json",
            "Trackingmore-Api-Key":"d9636e04-1068-44db-8a55-cfa12742d89e",
        };

        /* Consume API Start */
        const url = "https://api.trackingmore.com/v2/trackings/" + carrier_code + "/" + tracking_number;

        try {
            const response = await axios.get(url, {headers: headers});
            // console.log(response.data);
            res.send(response.data);
        } catch (error) {
            console.error(error);
        }
    }
}

module.exports = TrackingMore