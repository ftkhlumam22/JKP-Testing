const BookingDomesticModel = require('../../models/booking/domesticModel');
const apiResponse = require('../../helpers/apiResponse');
const paginateLabel = require('../../helpers/paginateLabel');
require('dotenv').config(); // get library to read env
var MAILERSEND_API_KEY = process.env.MAILERSEND_API_KEY; // get MongoDB URL from env

/**
 * Booking Domestic Class
 */
class BookingDomestic {
    constructor() {
        //
    }

    /* Create BookingDomestic */
    async createBookingDomestic(req, res) {
        /* Send Notif Email */
        const Recipient = require("mailersend").Recipient;
        const EmailParams = require("mailersend").EmailParams;
        const MailerSend = require("mailersend");

        const mailersend = new MailerSend({
            api_key: MAILERSEND_API_KEY,
        });

        /* Modif Variable */
        // let category;
        // let destination;
        // let courier;
        // let etd;
        // let price;
        // if(req.body.category && req.body.destination && req.body.courier && req.body.etd && req.body.price){
        //     category = req.body.category;
        //     destination = req.body.destination;
        //     courier = req.body.courier;
        //     etd = req.body.etd;
        //     price = req.body.price;
        // }else{
        //     category = "-";
        //     destination = "-";
        //     courier = "-";
        //     etd = "-";
        //     price = "-";
        // }

        /* Send Email 1 */
        const recipients = [new Recipient("cs.jaskipin@gmail.com", "CS Jaskipin")];
        const templateId = "yzkq340wjkgd7961";
        const variables = [
            {
                email: "cs.jaskipin@gmail.com",
                substitutions: [
                    {
                        var: "name",
                        value: req.body.name
                    },
                    {
                        var: "phone",
                        value: req.body.phone
                    },
                    {
                        var: "address",
                        value: req.body.address
                    },
                    {
                        var: "content",
                        value: req.body.content
                    },
                    {
                        var: "pickup_date",
                        value: req.body.pickup_date
                    },
                    {
                        var: "weight",
                        value: String(req.body.weight)
                    },
                    {
                        var: "long",
                        value: req.body.long
                    },
                    {
                        var: "wide",
                        value: req.body.wide
                    },
                    {
                        var: "height",
                        value: req.body.height
                    },
                    {
                        var: "area",
                        value: req.body.area
                    },
                    // {
                    //     var: "category",
                    //     value: category
                    // },
                    // {
                    //     var: "destination",
                    //     value: destination
                    // },
                    // {
                    //     var: "courier",
                    //     value: courier
                    // },
                    // {
                    //     var: "etd",
                    //     value: etd
                    // },
                    // {
                    //     var: "price",
                    //     value: price
                    // },
                ]
            }
        ];

        const emailParams = new EmailParams()
            .setFrom("notif@jaskipin.co.id")
            .setFromName("Jaskipin Notification")
            .setRecipients(recipients)
            .setSubject("Ada Booking Baru Masuk")
            .setTemplateId(templateId)
            .setVariables(variables);

        mailersend.send(emailParams);

        /* Send Email 2 */
        const recipients2 = [new Recipient("cs2.jaskipin@gmail.com", "CS Jaskipin")];
        const templateId2 = "yzkq340wjkgd7961";
        const variables2 = [
            {
                email: "cs2.jaskipin@gmail.com",
                substitutions: [
                    {
                        var: "name",
                        value: req.body.name
                    },
                    {
                        var: "phone",
                        value: req.body.phone
                    },
                    {
                        var: "address",
                        value: req.body.address
                    },
                    {
                        var: "content",
                        value: req.body.content
                    },
                    {
                        var: "pickup_date",
                        value: req.body.pickup_date
                    },
                    {
                        var: "weight",
                        value: String(req.body.weight)
                    },
                    {
                        var: "long",
                        value: req.body.long
                    },
                    {
                        var: "wide",
                        value: req.body.wide
                    },
                    {
                        var: "height",
                        value: req.body.height
                    },
                    {
                        var: "area",
                        value: req.body.area
                    },
                    // {
                    //     var: "category",
                    //     value: category
                    // },
                    // {
                    //     var: "destination",
                    //     value: destination
                    // },
                    // {
                    //     var: "courier",
                    //     value: courier
                    // },
                    // {
                    //     var: "etd",
                    //     value: etd
                    // },
                    // {
                    //     var: "price",
                    //     value: price
                    // },
                ]
            }
        ];

        const emailParams2 = new EmailParams()
            .setFrom("notif@jaskipin.co.id")
            .setFromName("Jaskipin Notification")
            .setRecipients(recipients2)
            .setSubject("Ada Booking Baru Masuk")
            .setTemplateId(templateId2)
            .setVariables(variables2);

        mailersend.send(emailParams2);

        await BookingDomesticModel.create(req.body)
            .then(result => {
                return apiResponse.successResponse(res, "Data Berhasil Dibuat");
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }

    /* List BookingDomestic */
    async listBookingDomestic(req, res) {
        if(req.query.pagination === 'false'){
            await BookingDomesticModel.find()
                .then(result => {
                    return apiResponse.successResponseWithDataAndPagination(res, result);
                })
                .catch(error => {
                    return apiResponse.ErrorResponse(res, error);
                });
        }else{
            let sort = JSON.parse(req.query.sort);

            const options = {
                page: req.query.page,
                limit: req.query.limit,
                sort: sort,
                customLabels: paginateLabel,
            };

            /* Add Filter Search */
            // var condition = req.query.search ? { $text: { $search: req.query.search } } : {}
            let condition = {};

            if(req.query.search || req.query.start_date && req.query.end_date){
                condition = {
                    '$and': []
                };
            }

            if(req.query.search){
                condition['$and'].push({
                    '$or': [
                        { 
                            name: { $regex: req.query.search, $options: 'i' } 
                        },
                        { 
                            phone: { $regex: req.query.search, $options: 'i' } 
                        }
                    ]
                });
            }

            if(req.query.start_date && req.query.end_date){
                condition['$and'].push(
                    {
                        "createdAt": {
                            $gte: new Date(req.query.start_date + ' 00:00:00'), 
                            $lt: new Date(req.query.end_date + ' 23:59:59')
                        }
                    }
                );
            }

            await BookingDomesticModel.paginate(condition, options)
                .then(result => {
                    return apiResponse.successResponseWithDataAndPagination(res, result);
                })
                .catch(error => {
                    return apiResponse.ErrorResponse(res, error);
                });
        }
    }

    /* Get BookingDomestic by Id */
    async getBookingDomestic(req, res) {
        await BookingDomesticModel.find({ 
            "_id": req.params.id
        })
            .then(result => {
                return apiResponse.successResponseWithData(res, "Data Berhasil Diambil", result);
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }

    /* Update BookingDomestic by ID */
    async updateBookingDomestic(req, res) {
        await BookingDomesticModel.updateOne({
            "_id": req.params.id
        },{
            $set: req.body
        })
            .then(result => {
                return apiResponse.successResponse(res, "Data Berhasil Diubah");
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }

    /* Delete BookingDomestic by ID */
    async deleteBookingDomestic(req, res) {
        await BookingDomesticModel.deleteOne({ 
            "_id": req.params.id
        })
            .then(result => {
                return apiResponse.successResponse(res, "Data Berhasil Dihapus");
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }
}

module.exports = BookingDomestic