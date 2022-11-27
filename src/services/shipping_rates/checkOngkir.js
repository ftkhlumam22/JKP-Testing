const axios = require("axios");

/**
 * CheckOngkir Class
 */
class CheckOngkir {
  constructor() {
    //
  }

  /* Get City */
  async getCity(req, res) {
    /* Consume API Start */
    const url = "https://pro.rajaongkir.com/api/city";

    try {
      const response = await axios.get(url, {
        headers: {
          key: "b8e8319e054dc660e3fbfc41a2cb04f4",
        },
      });
      // console.log(response.data);
      res.send(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  /* POST Check Cost */
  async checkCost(req, res) {
    /* Consume API Start */
    const url = "https://pro.rajaongkir.com/api/cost";

    let data = {
      origin: req.body.origin,
      originType: "city",
      destination: req.body.destination,
      destinationType: "city",
      weight: req.body.weight,
      courier: "sicepat",
    };

    try {
      const response = await axios.post(url, data, {
        headers: {
          key: "b8e8319e054dc660e3fbfc41a2cb04f4",
        },
      });
      // console.log(response.data);
      res.send(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  /* Get Province */
  async getProvince(req, res) {
    /* Consume API Start */
    const url = "https://pro.rajaongkir.com/api/province";

    try {
      const response = await axios.get(url, {
        headers: {
          key: "b8e8319e054dc660e3fbfc41a2cb04f4",
        },
      });
      // console.log(response.data);
      res.send(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  /* Get City By Province */
  async getCityByProvince(req, res) {
    /* Consume API Start */
    const url = `https://pro.rajaongkir.com/api/city?province=${req.params.id}`;

    try {
      const response = await axios.get(url, {
        headers: {
          key: "b8e8319e054dc660e3fbfc41a2cb04f4",
        },
      });
      // console.log(response.data);
      res.send(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  /* Get District By City */
  async getSubDistrict(req, res) {
    /* Consume API Start */
    const url = `https://pro.rajaongkir.com/api/subdistrict?city=${req.params.id}`;

    try {
      const response = await axios.get(url, {
        headers: {
          key: "b8e8319e054dc660e3fbfc41a2cb04f4",
        },
      });
      // console.log(response.data);
      res.send(response.data);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = CheckOngkir;
