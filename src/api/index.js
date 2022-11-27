const express = require("express");
const app = express();

/***************/
/* API v1 Auth */
/***************/

/* Call Route File */
const auth = require("./v1/auth/auth"); // Auth

/* Api Route */
app.use("/v1/auth", auth);

/*******************/
/* End API v1 Auth */
/*******************/
const store = require("./v1/store/products"); // Store
app.use("/v1/store", store);

const carts = require("./v1/store/cart"); // Store
app.use("/v1/cart", carts);

const orders = require("./v1/store/order"); // Store
app.use("/v1/orders", orders);
/*******************/
/* API v1 Tracking */
/*******************/

/* Call Route File */
const tracking = require("./v1/tracking/tracking"); // Tracking
const trackingmore = require("./v1/tracking/trackingmore"); // TrackingMore
const tabitha = require("./v1/tracking/tabitha"); // Tabitha
const cj_century = require("./v1/tracking/cj-century"); // CJ Century
const nice_express = require("./v1/tracking/nice-express"); // Nice Express

/* Api Route */
app.use("/v1/tracking/tracking", tracking);
app.use("/v1/tracking/trackingmore", trackingmore);
app.use("/v1/tracking/tabitha", tabitha);
app.use("/v1/tracking/cj-century", cj_century);
app.use("/v1/tracking/nice-express", nice_express);

/***********************/
/* End API v1 Tracking */
/***********************/

/*************************/
/* API v1 Shipping Rates */
/*************************/

/* Call Route File */
const origin = require("./v1/shipping_rates/origin"); // Origin
const destination = require("./v1/shipping_rates/destination"); // Destination
const courier = require("./v1/shipping_rates/courier"); // Courier
const service = require("./v1/shipping_rates/service"); // Service
const cost = require("./v1/shipping_rates/cost"); // Cost
const check_tariff = require("./v1/shipping_rates/checkTariff"); // Check Tariff
const check_ongkir = require("./v1/shipping_rates/checkOngkir"); // Check Ongkir

/* Api Route */
app.use("/v1/shipping-rates/origin", origin);
app.use("/v1/shipping-rates/destination", destination);
app.use("/v1/shipping-rates/courier", courier);
app.use("/v1/shipping-rates/service", service);
app.use("/v1/shipping-rates/cost", cost);
app.use("/v1/shipping-rates/check-tariff", check_tariff);
app.use("/v1/shipping-rates/check-ongkir", check_ongkir);

/*****************************/
/* End API v1 Shipping Rates */
/*****************************/

/*****************/
/* API v1 Master */
/*****************/

/* Call Route File */
const job = require("./v1/master/job"); // Job
const branch = require("./v1/master/branch"); // Branch
const bank = require("./v1/master/bank"); // Bank
const bank_courier = require("./v1/master/bankCourier"); // Bank Courier
const pickup = require("./v1/master/pickup"); // Pickup
const page_setting = require("./v1/master/pageSetting"); // Page Setting
const backup = require("./v1/master/backup"); // Page Setting
const cost_category = require("./v1/master/costCategory"); // Cost Categorry

/* Api Route */
app.use("/v1/master/job", job);
app.use("/v1/master/branch", branch);
app.use("/v1/master/bank", bank);
app.use("/v1/master/bank-courier", bank_courier);
app.use("/v1/master/pickup", pickup);
app.use("/v1/master/page-setting", page_setting);
app.use("/v1/master/backup", backup);
app.use("/v1/master/cost-category", cost_category);

/*********************/
/* End API v1 Master */
/*********************/

/******************/
/* API v1 Booking */
/******************/

/* Call Route File */
const domestic = require("./v1/booking/domestic"); // Domestic
const international = require("./v1/booking/international"); // International

/* Api Route */
app.use("/v1/booking/domestic", domestic);
app.use("/v1/booking/international", international);

/**********************/
/* End API v1 Booking */
/**********************/

/****************/
/* API v1 Users */
/****************/

/* Call Route File */
const user = require("./v1/users/user"); // User
const role = require("./v1/users/role"); // Role
const agen = require("./v1/users/agen"); // Agen
const member = require("./v1/users/member"); // Member
const karyawan = require("./v1/users/karyawan");

/* Api Route */
app.use("/v1/users/user", user);
app.use("/v1/users/role", role);
app.use("/v1/users/agen", agen);
app.use("/v1/users/member", member);
app.use("/v1/users/karyawan", karyawan);

/********************/
/* End API v1 Users */
/********************/

/**********************/
/* API v1 Transaction */
/**********************/

/* Call Route File */
const international_order = require("./v1/transaction/internationalOrder"); // International Order
const domestic_order = require("./v1/transaction/domesticOrder"); // Domestic Order

/* Api Route */
app.use("/v1/transaction/international-order", international_order);
app.use("/v1/transaction/domestic-order", domestic_order);

/**************************/
/* End API v1 Transaction */
/**************************/

/*****************/
/* API v1 Report */
/*****************/

/* Call Route File */
const income = require("./v1/report/income"); // Income
const user_report = require("./v1/report/user"); // User Report
const finance = require("./v1/report/finance"); // Finance

/* Api Route */
app.use("/v1/report/income", income);
app.use("/v1/report/user", user_report);
app.use("/v1/report/finance", finance);

/*********************/
/* End API v1 Report */
/*********************/

/******************/
/* API v1 Finance */
/******************/

/* Call Route File */
const utang_mitra = require("./v1/finance/utangMitra"); // Utang Mitra
const utang_admin = require("./v1/finance/utangAdmin"); // Utang Admin
const biaya_operasional = require("./v1/finance/biayaOperasional"); // Biaya Operasional
const piutang_agen = require("./v1/finance/piutangAgen"); // Piutang Agen
const piutang_member = require("./v1/finance/piutangMember"); // Piutang Member
const tagihan_agen = require("./v1/finance/tagihanAgen"); // Tagihan Agen
const invoice_agen = require("./v1/finance/invoiceAgen"); // Tagihan Invoice
const hpp = require("./v1/finance/hpp"); // Tagihan HPP

/* Api Route */
app.use("/v1/finance/hpp", hpp);
app.use("/v1/finance/utang-mitra", utang_mitra);
app.use("/v1/finance/utang-admin", utang_admin);
app.use("/v1/finance/biaya-operasional", biaya_operasional);
app.use("/v1/finance/piutang-agen", piutang_agen);
app.use("/v1/finance/piutang-member", piutang_member);
app.use("/v1/finance/invoice-agen", invoice_agen);
app.use("/v1/finance/tagihan-agen", tagihan_agen);

/**********************/
/* End API v1 Finance */
/**********************/

module.exports = app;
