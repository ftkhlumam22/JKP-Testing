const axios = require("axios");

class internationalOrderIntegration {
  constructor() {
    //
  }

  async createOrderJanio(data) {
    if (data.recipient_state && data.recipient_state !== "") {
      let dev = "https://api.int.janio.asia/api/order/orders/";
      // let production = 'https://api.janio.asia/api/order/orders/';

      let api_key = "jLA3HpW6q987XRvl3wyZflY5PyVvoQzL";
      let service_code = [
        {
          country: "Thailand",
          code: 101,
        },
        {
          country: "Taiwan",
          code: 409,
        },
        {
          country: "Singapore",
          code: 416,
        },
        {
          country: "Vietnam",
          code: 251,
        },
        {
          country: "Malaysia",
          code: 53,
        },
        {
          country: "Philippines",
          code: 100,
        },
        {
          country: "China",
          code: 41,
        },
        {
          country: "Brunei",
          code: 41,
        },
        {
          country: "Japan",
          code: 220,
        },
        {
          country: "US",
          code: 248,
        },
        {
          country: "Hong Kong",
          code: 200,
        },
        {
          country: "South Korea",
          code: 221,
        },
      ];

      let code_country = service_code.find(
        (item) => item.country == data.recipient_destination
      );

      let postData = {
        secret_key: api_key,
        blocking: false,
        orders: [
          {
            service_id: code_country.code,
            tracking_no: data.shipment_number, // shipment_number
            shipper_order_id: data.shipment_number, // shipment_number
            order_length: Number(data.long), // long
            order_width: Number(data.wide), // wide
            order_height: Number(data.height), // height
            order_weight: Number(data.weight), // weight
            payment_type: "prepaid", // null
            cod_amt_to_collect: 1, // null
            incoterm: "DDP", // null
            consignee_name: data.recipient_name, // recipient_name
            consignee_number: data.recipient_phone, // recipient_phone
            consignee_country: data.recipient_destination, // recipient_destination
            consignee_address: data.recipient_address, // recipient_address
            consignee_postal: data.recipient_postal_code, // recipient_postal_code
            consignee_state: data.recipient_state, // null
            consignee_city: "", // null
            consignee_province: "", // null
            consignee_email: "", // null
            pickup_contact_name: "SOFYANA", // pickup_by
            pickup_contact_number: "+62816394209", // null
            pickup_country: "Indonesia", // null
            pickup_address: "CIREBON", // null
            pickup_postal: "45153", // null
            pickup_state: "West Java", // null
            pickup_city: "Kab. Cirebon", // null
            pickup_province: "WEST JAVA", // null
            items: [], // detail_item
          },
        ],
      };

      data.detail_item.map((item) => {
        postData.orders[0].items.push({
          item_desc: item.item_name, // item_name
          item_category: null, // null
          item_product_id: null, // null
          item_sku: item.code, // code
          item_quantity: Number(item.qty), // qty
          item_price_value: Number(item.unit), // unit
          item_price_currency: "IDR", // IDR
        });
      });

      // console.log(JSON.stringify(postData));

      try {
        const response = await axios.post(dev, postData);
        console.log(response.data);
      } catch (error) {
        console.log(error.message);
      }
    }
  }

  async createOrderTGIExpress(data) {
    // failReason: "ORB-88565-1622736569089 - '' does not exist in data store"

    let dev =
      "https://uat.fareye.co/api/v1/process?api_key=5O9F9Z3hELfa5QwRLRrXAFfy2vcUuUv0";
    // let production = 'https://system.tgiexpress.com/api/v1/process?api_key=kDXTe4eJ4lQkDMZtSficnxxJiPjDAVNe';

    let postData = [
      {
        merchantCode: "jaskipin",
        processDefinitionCode: "order_booking",
        processData: {
          order_number: data.shipment_number,
          type_of_pickup: "Drop Off",
          dropoff_place: "Warehouse",
          store_code: "",
          warehouse_location: "",
          origin_name: data.sender_name,
          origin_address_line1: data.sender_address,
          origin_address_line2: "",
          sender_country: "Indonesia",
          sender_city: data.sender_address,
          origin_postal_code: "45153",
          origin_contact_number: data.phone || "0",
          destination_name: data.recipient_name,
          destination_contact_number: data.recipient_phone,
          destination_company: "",
          contact: "886973867824",
          destination_city_filter: "",
          email: "cs.jaskipin@gmail.com",
          destination_address_line1: data.recipient_address.substring(0, 45),
          destination_address_line2: "",
          destination_address_line3: "",
          destination_image: "",
          destination_postal_code: data.recipient_postal_code,
          receiver_country: "Taiwan",
          id_number: data.recipient_no_id,
          cinsignee_id_image: "",
          file_upload: "",
          item_list: [],
          sku_list: [
            {
              sku_code: "",
              sku_item_name: "",
              sku_hsn_code: "",
              sku_quantity: 1,
              sku_value: 1,
              item_ref_number: "12",
              manufacture_code: "ID",
              sku_number: "1",
            },
          ],
          excel_orders: "TRUE",
        },
        processUserMappings: [],
      },
    ];

    data.detail_item.map((item) => {
      postData[0].processData.item_list.push({
        // jika cosmetic = Commercial

        commodity:
          data.service_type == "Cosmetic" ? "Commercial" : data.service_type,
        item_reference_number: "12",
        item_service: "Standard",
        item_description: item.item_name,
        item_value: item.total_value.toString(),
        item_length: "0",
        item_width: "0",
        item_height: "0",
        item_weight: data.weight.toString(),
        item_package_quantity: item.qty.toString(),
        insured_amount: "0",
      });
    });

    try {
      const response = await axios.post(dev, postData);
      console.log(response.data);
    } catch (error) {
      console.log(error.message);
    }
  }
}

module.exports = internationalOrderIntegration;
