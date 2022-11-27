const axios = require("axios");
const cheerio = require("cheerio");

/**
 * Nice Express Class
 */
class Nice_Express {
  constructor() {
    //
  }

  /* Get Tracking Result */
  async getTracking(req, res) {
    const remark = req.params.remark;
    const response = await axios.get(
      `https://www.ilogen.com/m/personal/trace/${remark}`
    );

    const $ = cheerio.load(response.data);
    // console.log(response.data);
    let parse_ = {
      status: "NICE",
      history: [],
    };
    let tracking_history = [];
    $(".container > .tracking > .horizonTable > tbody > tr").each((i, elem) => {
      tracking_history.push({
        datetime: $(elem).find("td:nth-child(1)").text().trim(),
        location: $(elem).find("td:nth-child(2)").text().trim(),
        shipment_info: $(elem).find("td:nth-child(3)").text().trim(),
        status: $(elem).find("td:nth-child(4)").text().trim(),
      });
    });
    tracking_history.map((item) => {
      parse_.history.push({
        datetime: item.datetime,
        location: item.location,
        shipment_info: item.shipment_info,
        status: item.status,
      });
    });
    return res.status(200).json(parse_);
  }

  /*---------------------*/
  /*----- Versi Lama ----*/
  /*---------------------*/

  /* Get Tracking Result */
  // async getTracking(req, res) {
  //     function cleanDataTable(array) {
  //         let data = [];
  //         let dateModified = array.split("\n ");
  //         let saveDate = dateModified.map(str => str.replace(/\s/g, ''));

  //         saveDate.map((item) => {
  //             if(item.length !== 0){
  //                 data.push(item);
  //             }
  //         });

  //         return data;
  //     }

  //     const url = "http://www.niceexpress.net/billStatusSearch.do";

  //     try {
  //         const response = await axios.post(url, new URLSearchParams({code: req.query.tracking_number}));
  //         // console.log(response.data);
  //         const $ = await cheerio.load(response.data);
  //         let data1 = [];
  //         let data2 = [];

  //         $('body > table:nth-child(4) > tbody > tr').each((i, elem) => {
  //             // if (i <= 3) {
  //                 let date = $(elem).find('td:nth-child(2)').text().trim();
  //                 let time = $(elem).find('td:nth-child(3)').text().trim();
  //                 let location = $(elem).find('td:nth-child(5)').text().trim();
  //                 let detail = $(elem).find('td:nth-child(7)').text().trim();
  //                 let remark = $(elem).find('td:nth-child(9)').text().trim();

  //                 data1.push({
  //                     date: cleanDataTable(date),
  //                     time: cleanDataTable(time),
  //                     location: cleanDataTable(location),
  //                     detail: cleanDataTable(detail),
  //                     remark: cleanDataTable(remark),
  //                 })

  //                 data2.push({
  //                     date: $(elem).find('td > table:nth-child(6) > tbody > tr:nth-child(3) > td:nth-child(2)').text().trim(),
  //                     time: $(elem).find('td > table:nth-child(6) > tbody > tr:nth-child(3) > td:nth-child(3)').text().trim(),
  //                     location: $(elem).find('td > table:nth-child(6) > tbody > tr:nth-child(3) > td:nth-child(5)').text().trim(),
  //                     detail: $(elem).find('td > table:nth-child(6) > tbody > tr:nth-child(3) > td:nth-child(7)').text().trim(),
  //                     remark: $(elem).find('td > table:nth-child(6) > tbody > tr:nth-child(3) > td:nth-child(9)').text().trim(),
  //                 })
  //                 data2.push({
  //                     date: $(elem).find('td > table:nth-child(6) > tbody > tr:nth-child(5) > td:nth-child(2)').text().trim(),
  //                     time: $(elem).find('td > table:nth-child(6) > tbody > tr:nth-child(5) > td:nth-child(3)').text().trim(),
  //                     location: $(elem).find('td > table:nth-child(6) > tbody > tr:nth-child(5) > td:nth-child(5)').text().trim(),
  //                     detail: $(elem).find('td > table:nth-child(6) > tbody > tr:nth-child(5) > td:nth-child(7)').text().trim(),
  //                     remark: $(elem).find('td > table:nth-child(6) > tbody > tr:nth-child(5) > td:nth-child(9)').text().trim(),
  //                 })
  //                 data2.push({
  //                     date: $(elem).find('td > table:nth-child(6) > tbody > tr:nth-child(6) > td:nth-child(2)').text().trim(),
  //                     time: $(elem).find('td > table:nth-child(6) > tbody > tr:nth-child(6) > td:nth-child(3)').text().trim(),
  //                     location: $(elem).find('td > table:nth-child(6) > tbody > tr:nth-child(6) > td:nth-child(5)').text().trim(),
  //                     detail: $(elem).find('td > table:nth-child(6) > tbody > tr:nth-child(6) > td:nth-child(7)').text().trim(),
  //                     remark: $(elem).find('td > table:nth-child(6) > tbody > tr:nth-child(6) > td:nth-child(9)').text().trim(),
  //                 })
  //                 data2.push({
  //                     date: $(elem).find('td > table:nth-child(6) > tbody > tr:nth-child(7) > td:nth-child(2)').text().trim(),
  //                     time: $(elem).find('td > table:nth-child(6) > tbody > tr:nth-child(7) > td:nth-child(3)').text().trim(),
  //                     location: $(elem).find('td > table:nth-child(6) > tbody > tr:nth-child(7) > td:nth-child(5)').text().trim(),
  //                     detail: $(elem).find('td > table:nth-child(6) > tbody > tr:nth-child(7) > td:nth-child(7)').text().trim(),
  //                     remark: $(elem).find('td > table:nth-child(6) > tbody > tr:nth-child(7) > td:nth-child(9)').text().trim(),
  //                 })
  //             // }
  //         });

  //         console.log(data1);

  //         res.send(data2);
  //     } catch (error) {
  //         console.error(error);
  //     }
  // }
}

module.exports = Nice_Express;
