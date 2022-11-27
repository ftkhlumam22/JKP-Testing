const axios = require('axios');

/**
 * Tabitha Class
 */
class Tabitha {
    constructor() {
        //
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
        const tracking_number = req.query.tracking_number;

        /* Consume API Start */
        const url = "https://system.tgiexpress.com/api/v1/process_track_api?api_key=kDXTe4eJ4lQkDMZtSficnxxJiPjDAVNe&referenceNumber=" + tracking_number + "&processMasterCode=shipment_tracking";

        try {
            const response = await axios.get(url);
            // console.log(response.data);
            res.send(response.data);
        } catch (error) {
            console.error(error);
        }
    }
}

module.exports = Tabitha