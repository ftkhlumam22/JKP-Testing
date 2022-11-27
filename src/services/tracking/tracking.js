const InternationalOrderModel = require("../../models/transaction/internationalOrderModel");
const DomesticOrderModel = require("../../models/transaction/domesticOrderModel");
const apiResponse = require("../../helpers/apiResponse");
const axios = require("axios");
const cheerio = require("cheerio");
const {
  countDocuments,
} = require("../../models/transaction/internationalOrderModel");

/**
 * Tracking Class
 */
class Tracking {
  constructor() {
    //
  }

  /* Get Tracking Lama */
  async getTracking(req, res) {
    // Ambil No Resi
    let shipment_number = req.params.shipment_number;

    try {
      const response = await axios.get(
        "https://api.jaskipin.co.id/index.php?id=" + shipment_number
      );
      console.log(response.data[0].mitra_expedisi);

      /* Cek No Resi */
      const awb_no = awb_check(response.data[0].awb_no);

      if (awb_no === false) {
        return apiResponse.ErrorResponse(res, "No Resi Belum Diinput!");
      }

      /* Cek Kurir */
      let data;

      switch (response.data[0].mitra_expedisi) {
        case "Aramex":
          data = await multi_courier(res, awb_no, "aramex");
          break;

        case "Citylink Express":
          data = await citylink(res, awb_no);
          break;

        case "Tabitha":
          data = await tabitha(res, awb_no);
          break;

        case "Nice":
          data = await nice_express(res, awb_no);
          break;

        case "TLX":
          data = await cj_century(res, awb_no);
          break;

        case "Janio":
          data = await janioTracking(res, awb_no);
          break;
        // data = await multi_courier(res, awb_no, "janio");
        // break;

        case "SF EXPRESS":
          data = await multi_courier(res, awb_no, "sfexpress");
          break;

        case "Fedex":
          data = await multi_courier(res, awb_no, "fedex");
          break;

        case "TNT":
          data = await multi_courier(res, awb_no, "tnt");
          break;

        case "Skynet":
          data = await multi_courier(res, awb_no, "skynetworldwide");
          break;

        case "DPEX":
          data = await multi_courier(res, awb_no, "dpex");
          break;

        case "DHL":
          data = await multi_courier(res, awb_no, "dhl");
          break;

        default:
          break;
      }

      /* Tambah Detail Order */
      data.detail_order = response.data[0];
      console.log(data);

      return apiResponse.successResponseWithData(
        res,
        "Data Berhasil Diambil",
        data
      );
    } catch (error) {
      getTrackingNew(req, res);
      // console.error(error);
      // return apiResponse.ErrorResponse(res, error);
    }
  }
}

/* Get Tracking Baru */
async function getTrackingNew(req, res) {
  /* Ambil No Resi */
  let shipment_number = req.params.shipment_number;

  await InternationalOrderModel.find({
    shipment_number: shipment_number,
  })
    .populate("agen member branch input_by") // Relasi dengan collection Agen
    .then(async (result) => {
      /* Cek No Resi */
      const awb_no = awb_check(result[0].awb_no);
      const jex = result[0].shipment_number;

      // if (awb_no === false) {
      //   return apiResponse.ErrorResponse(res, "No Resi Belum Diinput!");
      // }

      /* Cek Kurir */
      let hasil = result[0];
      let data;
      switch (result[0].courier) {
        case "Aramex":
          data = await multi_courier(res, awb_no, "aramex", hasil);
          break;

        case "Citylink Express":
          data = await citylink(res, awb_no, hasil);
          break;

        case "Tabitha":
          data = await tabitha(res, awb_no, hasil);
          break;

        case "Nice":
          data = await nice_express(res, awb_no, hasil);
          break;

        case "TLX":
          data = await cj_century(res, awb_no, hasil);
          break;

        case "Janio":
          data = await janioTracking(res, awb_no, hasil);
          break;
        // data = await multi_courier(res, awb_no, "janio", hasil);
        // break;

        case "SF EXPRESS":
          data = await multi_courier(res, awb_no, "sfexpress", hasil);
          break;

        case "Fedex":
          data = await multi_courier(res, awb_no, "fedex", hasil);
          break;

        case "TNT":
          data = await multi_courier(res, awb_no, "tnt", hasil);
          break;

        case "Skynet":
          data = await multi_courier(res, awb_no, "skynetworldwide", hasil);
          break;

        case "DPEX":
          data = await multi_courier(res, awb_no, "dpex", hasil);
          break;

        case "DHL":
          data = await multi_courier(res, awb_no, "dhl", hasil);
          break;

        case "Dunia Exim":
          data = await duniaexportimport(res, awb_no, hasil);
          break;

        case "Luwjistik":
          data = await luwjistik(res, jex, hasil);
          break;

        default:
          break;
      }

      /* Tambah Detail Order */
      data.detail_order = result[0];
      console.log("hasil", data);

      return apiResponse.successResponseWithData(
        res,
        "Data Berhasil Di ambil",
        data
      );
    })
    .catch((error) => {
      getTrackingDomestic(req, res);
      //   return apiResponse.ErrorResponse(res, error);
    });
}

/* Get Tracking Domestik */
async function getTrackingDomestic(req, res) {
  /* Check Order */
  try {
    await DomesticOrderModel.findOne({
      shipment_number: req.params.shipment_number,
    })
      .then(async (result) => {
        /* Tracking AWB Rajaongkir */
        try {
          let data = {
            waybill: result.awb_no,
            courier: result.courier.toLowerCase(),
          };

          const response = await axios.post(
            "https://pro.rajaongkir.com/api/waybill",
            data,
            {
              headers: {
                key: "b8e8319e054dc660e3fbfc41a2cb04f4",
              },
            }
          );

          parse_ = {
            status: response.data.rajaongkir.result.delivery_status.status,
            history: [],
            detail_order: result,
          };

          if (response.status === 200) {
            response.data.rajaongkir.result.manifest.map((item) => {
              parse_.history.push({
                datetime: item.manifest_date + " " + item.manifest_time,
                location: item.city_name,
                shipment_info: item.manifest_description,
                status: item.manifest_code,
              });
            });
          }

          return apiResponse.successResponseWithData(
            res,
            "Data Berhasil Diambil",
            parse_
          );
        } catch (error) {
          console.log(error);
          return apiResponse.ErrorResponse(res, error);
        }
      })
      .catch((error) => {
        return apiResponse.ErrorResponse(res, error);
      });
  } catch (error) {
    return apiResponse.ErrorResponse(res, error);
  }
}

function awb_check(awb) {
  let awb_no;
  if (awb !== "") {
    awb_no = awb;
  } else {
    awb_no = false;
  }
  return awb_no;
}

async function multi_courier(res, awb, courier, hasil) {
  // const url = `https://www.tracktry.com/tracking.php?tracknumber=${awb}&express=${courier}&validate=dxx`;
  const url = `https://tracker.100parcels.com/v2/id/${awb}?tz=Asia/Jakarta`;

  try {
    const response = await axios.get(url);
    console.log(response.data);

    let parse_ = {
      status:
        response.data.data.status_path[
          parseInt(response.data.data.status_path.length) - 1
        ].name,
      history: [
        {
          datetime: formatDate(hasil.createdAt),
          location:
            hasil.input_by.city !== null && hasil.input_by.city !== undefined
              ? hasil.input_by.city.replace("Kabupaten", "").replace("Kota", "")
              : "Cirebon",
          shipment_info:
            hasil.position_order === "Mitra"
              ? "Shipment Ready to Manifest"
              : hasil.position_order === "Agen"
              ? "Shipment Acceptance at Agen"
              : hasil.position_order === "Kurir"
              ? "Shipment information received"
              : hasil.status_order === "Hold"
              ? "Shipment received at warehous Jaskipin"
              : "Shipment received at warehous Jaskipin",
          status:
            hasil.position_order === "Mitra"
              ? "Shipment Ready to Manifest"
              : hasil.position_order === "Agen"
              ? "Shipment Acceptance at Agen"
              : hasil.position_order === "Kurir"
              ? "Shipment information received"
              : hasil.status_order === "Hold"
              ? "Shipment received at warehous Jaskipin"
              : "Shipment received at warehous Jaskipin",
        },
      ],
    };

    /* Proses */
    response.data.data.events
      .slice(0)
      .reverse()
      .map((item) => {
        /* Filter Nama Ekspedisi */
        let filter;
        switch (courier) {
          case "aramex":
            filter = item.description.replace("Aramex", "");
            break;

          case "janio":
            filter = item.description.split("Janio").join("");
            break;

          case "sfexpress":
            filter = item.description.replace("SF Express", "");
            break;

          case "fedex":
            filter = item.description.replace("Fedex", "");
            break;

          case "dhl":
            filter = item.description.replace("DHL", "");
            break;

          case "tnt":
            filter = item.description.replace("TNT", "");
            break;

          case "skynetworldwide":
            filter = item.description.replace("Skynet", "");
            break;

          default:
            break;
        }

        parse_.history.push({
          datetime: formatDate(item.datetime),
          location: item.place,
          shipment_info: filter,
          status: "",
        });
      });

    return parse_;
  } catch (e) {
    // console.error(error);
    // return apiResponse.ErrorResponse(res, error);
    // return res.json({ hello: "hello" });
    return {
      history: [
        {
          datetime: formatDate(hasil.createdAt),
          location:
            hasil.input_by.city !== null && hasil.input_by.city !== undefined
              ? hasil.input_by.city.replace("Kabupaten", "").replace("Kota", "")
              : "Cirebon",
          shipment_info:
            hasil.position_order === "Mitra"
              ? "Shipment Ready to Manifest"
              : hasil.position_order === "Agen"
              ? "Shipment Acceptance at Agen"
              : hasil.position_order === "Kurir"
              ? "Shipment information received"
              : hasil.status_order === "Hold"
              ? "Shipment received at warehous Jaskipin"
              : "Shipment received at warehous Jaskipin",
          status:
            hasil.position_order === "Mitra"
              ? "Shipment Ready to Manifest"
              : hasil.position_order === "Agen"
              ? "Shipment Acceptance at Agen"
              : hasil.position_order === "Kurir"
              ? "Shipment information received"
              : hasil.status_order === "Hold"
              ? "Shipment received at warehous Jaskipin"
              : "Shipment received at warehous Jaskipin",
        },
      ],
    };
  }
}

async function citylink(res, awb, hasil) {
  const url = `https://www.citylinkexpress.com/wp-json/wp/v2/getTracking`;
  try {
    let Promise = require("bluebird");
    let rest = require("restler-promise")(Promise);

    return new Promise((resolve, reject) => {
      rest
        .post(url, {
          data: {
            tracking: awb,
            xr_option: false,
          },
        })
        .then(function (response) {
          console.log(response.data);

          let status;

          switch (response.data.req.data.progress) {
            case 1:
              status = "Picked Up";
              break;

            case 2:
              status = "Transit";
              break;

            case 3:
              status = "Out for Delivery";
              break;

            case 4:
              status = "Delivered";
              break;

            default:
              break;
          }

          let parse_ = {
            status: status,
            history: [
              {
                datetime: formatDate(hasil.createdAt),
                location:
                  hasil.input_by.city !== null &&
                  hasil.input_by.city !== undefined
                    ? hasil.input_by.city
                        .replace("Kabupaten", "")
                        .replace("Kota", "")
                    : "Cirebon",
                shipment_info:
                  hasil.position_order === "Mitra"
                    ? "Shipment Ready to Manifest"
                    : hasil.position_order === "Agen"
                    ? "Shipment Acceptance at Agen"
                    : hasil.position_order === "Kurir"
                    ? "Shipment information received"
                    : hasil.status_order === "Hold"
                    ? "Shipment received at warehous Jaskipin"
                    : "Shipment received at warehous Jaskipin",
                status:
                  hasil.position_order === "Mitra"
                    ? "Shipment Ready to Manifest"
                    : hasil.position_order === "Agen"
                    ? "Shipment Acceptance at Agen"
                    : hasil.position_order === "Kurir"
                    ? "Shipment information received"
                    : hasil.status_order === "Hold"
                    ? "Shipment received at warehous Jaskipin"
                    : "Shipment received at warehous Jaskipin",
              },
            ],
          };

          if (response.data.req.status === 200) {
            /* Proses */
            response.data.req.data.trackDetails.map(async (item) => {
              parse_.history.push({
                datetime: item.detDate,
                location: item.location.replace(
                  "Pt Citylink Express Indo,",
                  ""
                ),
                shipment_info: item.CP_Code,
                status: item.status.replace("City-Link", ""),
              });
            });
            const res = response.data.req.data.trackDetails;
            console.log(res);
          }

          setTimeout(function () {
            resolve(parse_); // After 3 seconds, resolve the promise with value data
          }, 3000);
        })
        .catch(function (errorResult) {
          // Note, the errorResult is an object containing an "error" property holding
          // the Error object and an optional "response" property holding the the response
          // object (if any). The response object will be missing, for example, if there is
          // no response from server.
          reject(errorResult);
          console.log(errorResult);
        });
    });
  } catch (error) {
    // console.error(error);
    // return apiResponse.ErrorResponse(res, error);
    return {
      history: [
        {
          datetime: formatDate(hasil.createdAt),
          location:
            hasil.input_by.city !== null && hasil.input_by.city !== undefined
              ? hasil.input_by.city.replace("Kabupaten", "").replace("Kota", "")
              : "Cirebon",
          shipment_info:
            hasil.position_order === "Mitra"
              ? "Shipment Ready to Manifest"
              : hasil.position_order === "Agen"
              ? "Shipment Acceptance at Agen"
              : hasil.position_order === "Kurir"
              ? "Shipment information received"
              : hasil.status_order === "Hold"
              ? "Shipment received at warehous Jaskipin"
              : "Shipment received at warehous Jaskipin",
          status:
            hasil.position_order === "Mitra"
              ? "Shipment Ready to Manifest"
              : hasil.position_order === "Agen"
              ? "Shipment Acceptance at Agen"
              : hasil.position_order === "Kurir"
              ? "Shipment information received"
              : hasil.status_order === "Hold"
              ? "Shipment received at warehous Jaskipin"
              : "Shipment received at warehous Jaskipin",
        },
      ],
    };
  }
}

async function luwjistik(res, awb, hasil) {
  /* Consume API Start */
  const url = `https://v2.luwjistik.io/api/order/status/${awb}`;
  try {
    const response = await axios.get(url);
    let parse_ = {
      status: response.data.trackings[0].serviceType,
      history: [
        {
          datetime: formatDate(hasil.createdAt),
          location:
            hasil.input_by.city !== null && hasil.input_by.city !== undefined
              ? hasil.input_by.city.replace("Kabupaten", "").replace("Kota", "")
              : "Cirebon",
          shipment_info:
            hasil.position_order === "Mitra"
              ? "Shipment Ready to Manifest"
              : hasil.position_order === "Agen"
              ? "Shipment Acceptance at Agen"
              : hasil.position_order === "Kurir"
              ? "Shipment information received"
              : hasil.status_order === "Hold"
              ? "Shipment received at warehous Jaskipin"
              : "Shipment received at warehous Jaskipin",
          status:
            hasil.position_order === "Mitra"
              ? "Shipment Ready to Manifest"
              : hasil.position_order === "Agen"
              ? "Shipment Acceptance at Agen"
              : hasil.position_order === "Kurir"
              ? "Shipment information received"
              : hasil.status_order === "Hold"
              ? "Shipment received at warehous Jaskipin"
              : "Shipment received at warehous Jaskipin",
        },
      ],
    };

    /* Proses */
    response.data.trackings[0].updates
      .slice(0)
      .reverse()
      .map((item) => {
        parse_.history.push({
          datetime: formatDate(item.updateTimestamp),
          location: item.comments,
          shipment_info: "-",
          status: item.status,
        });
      });
    response.data.trackings[1].updates
      .slice(0)
      .reverse()
      .map((item) => {
        parse_.history.push({
          datetime: formatDate(item.updateTimestamp),
          location: item.comments,
          shipment_info: "-",
          status: item.status,
        });
      });

    response.data.trackings[2].updates
      .slice(0)
      .reverse()
      .map((item) => {
        parse_.history.push({
          datetime: formatDate(item.updateTimestamp),
          location: item.comments,
          shipment_info: "-",
          status: item.status,
        });
      });
    return parse_;
  } catch (error) {
    return {
      history: [
        {
          datetime: formatDate(hasil.createdAt),
          location:
            hasil.input_by.city !== null && hasil.input_by.city !== undefined
              ? hasil.input_by.city.replace("Kabupaten", "").replace("Kota", "")
              : "Cirebon",
          shipment_info:
            hasil.position_order === "Mitra"
              ? "Shipment Ready to Manifest"
              : hasil.position_order === "Agen"
              ? "Shipment Acceptance at Agen"
              : hasil.position_order === "Kurir"
              ? "Shipment information received"
              : hasil.status_order === "Hold"
              ? "Shipment received at warehous Jaskipin"
              : "Shipment received at warehous Jaskipin",
          status:
            hasil.position_order === "Mitra"
              ? "Shipment Ready to Manifest"
              : hasil.position_order === "Agen"
              ? "Shipment Acceptance at Agen"
              : hasil.position_order === "Kurir"
              ? "Shipment information received"
              : hasil.status_order === "Hold"
              ? "Shipment received at warehous Jaskipin"
              : "Shipment received at warehous Jaskipin",
        },
      ],
    };
  }
}

async function tabitha(res, awb, hasil) {
  /* Consume API Start */
  const url =
    "https://system.tgiexpress.com/api/v1/process_track_api?api_key=kDXTe4eJ4lQkDMZtSficnxxJiPjDAVNe&referenceNumber=" +
    awb +
    "&processMasterCode=shipment_tracking";

  try {
    const response = await axios.get(url);
    console.log(response.data[0].processTimeLineLogsList);

    let parse_ = {
      status: response.data[0].processTimeLineLogsList[0].status,
      history: [
        {
          datetime: formatDate(hasil.createdAt),
          location:
            hasil.input_by.city !== null && hasil.input_by.city !== undefined
              ? hasil.input_by.city.replace("Kabupaten", "").replace("Kota", "")
              : "Cirebon",
          shipment_info:
            hasil.position_order === "Mitra"
              ? "Shipment Ready to Manifest"
              : hasil.position_order === "Agen"
              ? "Shipment Acceptance at Agen"
              : hasil.position_order === "Kurir"
              ? "Shipment information received"
              : hasil.status_order === "Hold"
              ? "Shipment received at warehous Jaskipin"
              : "Shipment received at warehous Jaskipin",
          status:
            hasil.position_order === "Mitra"
              ? "Shipment Ready to Manifest"
              : hasil.position_order === "Agen"
              ? "Shipment Acceptance at Agen"
              : hasil.position_order === "Kurir"
              ? "Shipment information received"
              : hasil.status_order === "Hold"
              ? "Shipment received at warehous Jaskipin"
              : "Shipment received at warehous Jaskipin",
        },
      ],
    };

    if (response.status === 200) {
      /* Proses */
      response.data[0].processTimeLineLogsList
        .slice(0)
        .reverse()
        .map((item) => {
          parse_.history.push({
            datetime: formatDate(item.statusTime),
            location: item.remarks.replace("by edo_tgi", ""),
            shipment_info: "-",
            status: item.status,
          });
        });
    }

    return parse_;
  } catch (error) {
    // console.error(error);
    return {
      history: [
        {
          datetime: formatDate(hasil.createdAt),
          location:
            hasil.input_by.city !== null && hasil.input_by.city !== undefined
              ? hasil.input_by.city.replace("Kabupaten", "").replace("Kota", "")
              : "Cirebon",
          shipment_info:
            hasil.position_order === "Mitra"
              ? "Shipment Ready to Manifest"
              : hasil.position_order === "Agen"
              ? "Shipment Acceptance at Agen"
              : hasil.position_order === "Kurir"
              ? "Shipment information received"
              : hasil.status_order === "Hold"
              ? "Shipment received at warehous Jaskipin"
              : "Shipment received at warehous Jaskipin",
          status:
            hasil.position_order === "Mitra"
              ? "Shipment Ready to Manifest"
              : hasil.position_order === "Agen"
              ? "Shipment Acceptance at Agen"
              : hasil.position_order === "Kurir"
              ? "Shipment information received"
              : hasil.status_order === "Hold"
              ? "Shipment received at warehous Jaskipin"
              : "Shipment received at warehous Jaskipin",
        },
      ],
    };
  }
}

async function nice_express(res, awb, hasil) {
  /* Consume API Start */
  const url = "http://www.niceexpress.net/billStatusSearch.do";

  const response = await axios.post(url, new URLSearchParams({ code: awb }));
  // console.log(response.data);
  const $ = await cheerio.load(response.data);
  let header_track_info = null;
  let tracking_info = [];
  let header_history = null;
  let tracking_history = [];
  let data = [];

  $("body > table > tbody > tr").each((i, elem) => {
    /* Get Tracking Information */
    header_track_info = {
      // Header
      date: $(elem)
        .find(
          "td > table:nth-child(5) > tbody > tr:nth-child(1) > td:nth-child(3)"
        )
        .text()
        .trim(),
      time: $(elem)
        .find(
          "td > table:nth-child(5) > tbody > tr:nth-child(1) > td:nth-child(5)"
        )
        .text()
        .trim(),
      location: $(elem)
        .find(
          "td > table:nth-child(5) > tbody > tr:nth-child(1) > td:nth-child(7)"
        )
        .text()
        .trim(),
      detail: $(elem)
        .find(
          "td > table:nth-child(5) > tbody > tr:nth-child(1) > td:nth-child(9)"
        )
        .text()
        .trim(),
      remark: $(elem)
        .find(
          "td > table:nth-child(5) > tbody > tr:nth-child(1) > td:nth-child(11)"
        )
        .text()
        .trim(),
    };
    tracking_info = {
      // Data Body
      date: $(elem)
        .find(
          "td > table:nth-child(5) > tbody > tr:nth-child(3) > td:nth-child(3)"
        )
        .text()
        .trim(),
      time: $(elem)
        .find(
          "td > table:nth-child(5) > tbody > tr:nth-child(3) > td:nth-child(5)"
        )
        .text()
        .trim(),
      location: $(elem)
        .find(
          "td > table:nth-child(5) > tbody > tr:nth-child(3) > td:nth-child(7)"
        )
        .text()
        .trim(),
      detail: $(elem)
        .find(
          "td > table:nth-child(5) > tbody > tr:nth-child(3) > td:nth-child(9)"
        )
        .text()
        .trim(),
      remark: $(elem)
        .find(
          "td > table:nth-child(5) > tbody > tr:nth-child(3) > td:nth-child(11)"
        )
        .text()
        .trim(),
    };

    /* Get Tracking History */
    header_history = {
      // Header
      date: $(elem)
        .find(
          "td > table:nth-child(6) > tbody > tr:nth-child(3) > td:nth-child(2)"
        )
        .text()
        .trim(),
      time: $(elem)
        .find(
          "td > table:nth-child(6) > tbody > tr:nth-child(3) > td:nth-child(3)"
        )
        .text()
        .trim(),
      location: $(elem)
        .find(
          "td > table:nth-child(6) > tbody > tr:nth-child(3) > td:nth-child(5)"
        )
        .text()
        .trim(),
      detail: $(elem)
        .find(
          "td > table:nth-child(6) > tbody > tr:nth-child(3) > td:nth-child(7)"
        )
        .text()
        .trim(),
      remark: $(elem)
        .find(
          "td > table:nth-child(6) > tbody > tr:nth-child(3) > td:nth-child(9)"
        )
        .text()
        .trim(),
    };
    tracking_history.push({
      // Data Body
      date: $(elem)
        .find(
          "td > table:nth-child(6) > tbody > tr:nth-child(5) > td:nth-child(2)"
        )
        .text()
        .trim(),
      time: $(elem)
        .find(
          "td > table:nth-child(6) > tbody > tr:nth-child(5) > td:nth-child(3)"
        )
        .text()
        .trim(),
      location: $(elem)
        .find(
          "td > table:nth-child(6) > tbody > tr:nth-child(5) > td:nth-child(5)"
        )
        .text()
        .trim(),
      detail: $(elem)
        .find(
          "td > table:nth-child(6) > tbody > tr:nth-child(5) > td:nth-child(7)"
        )
        .text()
        .trim(),
      remark: $(elem)
        .find(
          "td > table:nth-child(6) > tbody > tr:nth-child(5) > td:nth-child(9)"
        )
        .text()
        .trim(),
    });
    tracking_history.push({
      // Data Body
      date: $(elem)
        .find(
          "td > table:nth-child(6) > tbody > tr:nth-child(6) > td:nth-child(2)"
        )
        .text()
        .trim(),
      time: $(elem)
        .find(
          "td > table:nth-child(6) > tbody > tr:nth-child(6) > td:nth-child(3)"
        )
        .text()
        .trim(),
      location: $(elem)
        .find(
          "td > table:nth-child(6) > tbody > tr:nth-child(6) > td:nth-child(5)"
        )
        .text()
        .trim(),
      detail: $(elem)
        .find(
          "td > table:nth-child(6) > tbody > tr:nth-child(6) > td:nth-child(7)"
        )
        .text()
        .trim(),
      remark: $(elem)
        .find(
          "td > table:nth-child(6) > tbody > tr:nth-child(6) > td:nth-child(9)"
        )
        .text()
        .trim(),
    });
    tracking_history.push({
      // Data Body
      date: $(elem)
        .find(
          "td > table:nth-child(6) > tbody > tr:nth-child(7) > td:nth-child(2)"
        )
        .text()
        .trim(),
      time: $(elem)
        .find(
          "td > table:nth-child(6) > tbody > tr:nth-child(7) > td:nth-child(3)"
        )
        .text()
        .trim(),
      location: $(elem)
        .find(
          "td > table:nth-child(6) > tbody > tr:nth-child(7) > td:nth-child(5)"
        )
        .text()
        .trim(),
      detail: $(elem)
        .find(
          "td > table:nth-child(6) > tbody > tr:nth-child(7) > td:nth-child(7)"
        )
        .text()
        .trim(),
      remark: $(elem)
        .find(
          "td > table:nth-child(6) > tbody > tr:nth-child(7) > td:nth-child(9)"
        )
        .text()
        .trim(),
    });
  });

  data.push({
    header_track_info: header_track_info,
    data_track_info: tracking_info,
    header_history: header_history,
    data_history: tracking_history,
  });

  // console.log(tracking_history);

  let parse_ = {
    status: tracking_history[2].detail,
    history: [
      {
        datetime: formatDate(hasil.createdAt),
        location:
          hasil.input_by.city !== null && hasil.input_by.city !== undefined
            ? hasil.input_by.city.replace("Kabupaten", "").replace("Kota", "")
            : "Cirebon",
        shipment_info:
          hasil.position_order === "Mitra"
            ? "Shipment Ready to Manifest"
            : hasil.position_order === "Agen"
            ? "Shipment Acceptance at Agen"
            : hasil.position_order === "Kurir"
            ? "Shipment information received"
            : hasil.status_order === "Hold"
            ? "Shipment received at warehous Jaskipin"
            : "Shipment received at warehous Jaskipin",
        status:
          hasil.position_order === "Mitra"
            ? "Shipment Ready to Manifest"
            : hasil.position_order === "Agen"
            ? "Shipment Acceptance at Agen"
            : hasil.position_order === "Kurir"
            ? "Shipment information received"
            : hasil.status_order === "Hold"
            ? "Shipment received at warehous Jaskipin"
            : "Shipment received at warehous Jaskipin",
      },
    ],
  };

  /* Proses */
  tracking_history.map((item) => {
    parse_.history.push({
      datetime: item.time + " " + item.date,
      location: item.location,
      shipment_info: item.remark,
      status: item.detail.replace("Nice depot", item.location),
      remark: item.remark,
    });
  });

  return parse_;
}

async function cj_century(res, awb, hasil) {
  /* Consume API Start */
  const url = "https://api-customers.tlx.co.id/track-trace/" + awb;

  try {
    const response = await axios.get(url);
    console.log(response.data.data);

    let parse_ = {
      status: response.data.data.track_trace[0].status_eng.replace("TLX", ""),
      history: [
        {
          datetime: formatDate(hasil.createdAt),
          location:
            hasil.input_by.city !== null && hasil.input_by.city !== undefined
              ? hasil.input_by.city.replace("Kabupaten", "").replace("Kota", "")
              : "Cirebon",
          shipment_info:
            hasil.position_order === "Mitra"
              ? "Shipment Ready to Manifest"
              : hasil.position_order === "Agen"
              ? "Shipment Acceptance at Agen"
              : hasil.position_order === "Kurir"
              ? "Shipment information received"
              : hasil.status_order === "Hold"
              ? "Shipment received at warehous Jaskipin"
              : "Shipment received at warehous Jaskipin",
          status:
            hasil.position_order === "Mitra"
              ? "Shipment Ready to Manifest"
              : hasil.position_order === "Agen"
              ? "Shipment Acceptance at Agen"
              : hasil.position_order === "Kurir"
              ? "Shipment information received"
              : hasil.status_order === "Hold"
              ? "Shipment received at warehous Jaskipin"
              : "Shipment received at warehous Jaskipin",
        },
      ],
    };

    /* Proses */
    response.data.data.track_trace
      .slice(0)
      .reverse()
      .map((item) => {
        parse_.history.push({
          datetime: formatDate(item.view_date_time),
          location: "-",
          shipment_info: item.status_idn.replace("TLX", ""),
          status: item.status_eng.replace("TLX", ""),
        });
      });

    return parse_;
  } catch (error) {
    // console.error(error);
    return {
      history: [
        {
          datetime: formatDate(hasil.createdAt),
          location:
            hasil.input_by.city !== null && hasil.input_by.city !== undefined
              ? hasil.input_by.city.replace("Kabupaten", "").replace("Kota", "")
              : "Cirebon",
          shipment_info:
            hasil.position_order === "Mitra"
              ? "Shipment Ready to Manifest"
              : hasil.position_order === "Agen"
              ? "Shipment Acceptance at Agen"
              : hasil.position_order === "Kurir"
              ? "Shipment information received"
              : hasil.status_order === "Hold"
              ? "Shipment received at warehous Jaskipin"
              : "Shipment received at warehous Jaskipin",
          status:
            hasil.position_order === "Mitra"
              ? "Shipment Ready to Manifest"
              : hasil.position_order === "Agen"
              ? "Shipment Acceptance at Agen"
              : hasil.position_order === "Kurir"
              ? "Shipment information received"
              : hasil.status_order === "Hold"
              ? "Shipment received at warehous Jaskipin"
              : "Shipment received at warehous Jaskipin",
        },
      ],
      detail_order: hasil,
    };
  }
}

async function duniaexportimport(res, awb, hasil) {
  /* Consume API Start */
  const url = "https://api.abangexpress.id/shipment/tw/";

  try {
    const response = await axios.post(url, {
      akun: "CAX0147",
      key: "66d43a72aaa92745dffc5a47c3f804b0",
      awb: awb,
    });
    console.log("hasile", awb);

    let parse_ = {
      status: "response.data.trackresult[0].status,",
      history: [
        {
          datetime: formatDate(hasil.createdAt),
          location:
            hasil.input_by.city !== null && hasil.input_by.city !== undefined
              ? hasil.input_by.city.replace("Kabupaten", "").replace("Kota", "")
              : "Cirebon",
          shipment_info:
            hasil.position_order === "Mitra"
              ? "Shipment Ready to Manifest"
              : hasil.position_order === "Agen"
              ? "Shipment Acceptance at Agen"
              : hasil.position_order === "Kurir"
              ? "Shipment information received"
              : hasil.status_order === "Hold"
              ? "Shipment received at warehous Jaskipin"
              : "Shipment received at warehous Jaskipin",
          status:
            hasil.position_order === "Mitra"
              ? "Shipment Ready to Manifest"
              : hasil.position_order === "Agen"
              ? "Shipment Acceptance at Agen"
              : hasil.position_order === "Kurir"
              ? "Shipment information received"
              : hasil.status_order === "Hold"
              ? "Shipment received at warehous Jaskipin"
              : "Shipment received at warehous Jaskipin",
        },
      ],
    };

    /* Proses */
    response.data.trackresult
      .slice(0)
      .reverse()
      .map((item) => {
        parse_.history.push({
          datetime: item.date + " " + item.time,
          location: item.location,
          shipment_info: item.desc,
          status: item.status,
        });
      });
    // console.log(response.data.trackresult);

    return parse_;
  } catch (error) {
    // console.error(error);
    return {
      history: [
        {
          datetime: formatDate(hasil.createdAt),
          location:
            hasil.input_by.city !== null && hasil.input_by.city !== undefined
              ? hasil.input_by.city.replace("Kabupaten", "").replace("Kota", "")
              : "Cirebon",
          shipment_info:
            hasil.position_order === "Mitra"
              ? "Shipment Ready to Manifest"
              : hasil.position_order === "Agen"
              ? "Shipment Acceptance at Agen"
              : hasil.position_order === "Kurir"
              ? "Shipment information received"
              : hasil.status_order === "Hold"
              ? "Shipment received at warehous Jaskipin"
              : "Shipment received at warehous Jaskipin",
          status:
            hasil.position_order === "Mitra"
              ? "Shipment Ready to Manifest"
              : hasil.position_order === "Agen"
              ? "Shipment Acceptance at Agen"
              : hasil.position_order === "Kurir"
              ? "Shipment information received"
              : hasil.status_order === "Hold"
              ? "Shipment received at warehous Jaskipin"
              : "Shipment received at warehous Jaskipin",
        },
      ],
      detail_order: hasil,
    };
  }
}

async function janioTracking(res, awb, hasil) {
  /* Consume API Start */
  const url =
    "https://tracker.janio.asia/api/v2/tracker/related-updates/?tracking_nos=" +
    awb;
  try {
    const response = await axios.get(url);
    let parse_ = {
      status: response.data[0].status_updates[0].status,
      history: [
        {
          datetime: formatDate(hasil.createdAt),
          location:
            hasil.input_by.city !== null && hasil.input_by.city !== undefined
              ? hasil.input_by.city.replace("Kabupaten", "").replace("Kota", "")
              : "Cirebon",
          shipment_info:
            hasil.position_order === "Mitra"
              ? "Shipment Ready to Manifest"
              : hasil.position_order === "Agen"
              ? "Shipment Acceptance at Agen"
              : hasil.position_order === "Kurir"
              ? "Shipment information received"
              : hasil.status_order === "Hold"
              ? "Shipment received at warehous Jaskipin"
              : "Shipment received at warehous Jaskipin",
          status:
            hasil.position_order === "Mitra"
              ? "Shipment Ready to Manifest"
              : hasil.position_order === "Agen"
              ? "Shipment Acceptance at Agen"
              : hasil.position_order === "Kurir"
              ? "Shipment information received"
              : hasil.status_order === "Hold"
              ? "Shipment received at warehous Jaskipin"
              : "Shipment received at warehous Jaskipin",
        },
      ],
    };

    /* Proses */
    response.data[0].status_updates
      .slice(0)
      .reverse()
      .map((item) => {
        parse_.history.push({
          datetime: formatDate(item.updated_on),
          location: item.address,
          shipment_info: item.description,
          status: item.status,
        });
      });

    return parse_;
  } catch (error) {
    console.log(error);
    return {
      history: [
        {
          datetime: formatDate(hasil.createdAt),
          location:
            hasil.input_by.city !== null && hasil.input_by.city !== undefined
              ? hasil.input_by.city.replace("Kabupaten", "").replace("Kota", "")
              : "Cirebon",
          shipment_info:
            hasil.position_order === "Mitra"
              ? "Shipment Ready to Manifest"
              : hasil.position_order === "Agen"
              ? "Shipment Acceptance at Agen"
              : hasil.position_order === "Kurir"
              ? "Shipment information received"
              : hasil.status_order === "Hold"
              ? "Shipment received at warehous Jaskipin"
              : "Shipment received at warehous Jaskipin",
          status:
            hasil.position_order === "Mitra"
              ? "Shipment Ready to Manifest"
              : hasil.position_order === "Agen"
              ? "Shipment Acceptance at Agen"
              : hasil.position_order === "Kurir"
              ? "Shipment information received"
              : hasil.status_order === "Hold"
              ? "Shipment received at warehous Jaskipin"
              : "Shipment received at warehous Jaskipin",
        },
      ],
      detail_order: hasil,
    };
  }
}

function formatDate(value) {
  let options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  };
  let date = new Date(value).toLocaleString("id-ID", options);
  return date;
}

function formatTanggal(value) {
  let options = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  let date = new Date(value).toLocaleString("id-ID", options);
  return date;
}

/* Tracking DPEX */
// https://tracking.frontierforce.com/tracking.aspx?stid=dpexwwe&cn=374900071626&option=,8,

module.exports = Tracking;
