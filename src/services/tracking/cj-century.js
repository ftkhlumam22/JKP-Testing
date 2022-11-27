const axios = require("axios");

/**
 * CJ Century Class
 */
class CJ_Century {
  constructor() {
    //
  }

  /* Get Tracking Result */

  async getTracking(req, res) {
    const tracking_number = req.query.tracking_number;

    /* Consume API Start */
    const url = "http://api-customers.tlx.co.id/track-trace/" + tracking_number;

    try {
      const response = await axios.get(url);
      // console.log(response.data);
      res.send(response.data);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = CJ_Century;
