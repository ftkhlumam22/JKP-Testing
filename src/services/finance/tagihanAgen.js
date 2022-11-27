const InternationalOrderModel = require('../../models/transaction/internationalOrderModel');
const apiResponse = require('../../helpers/apiResponse');
const paginateLabel = require('../../helpers/paginateLabel');
const mongoose = require('mongoose'); // Import Library Mongoose
const ObjectId = mongoose.Types.ObjectId;

/**
 * Tagihan Agen Class
 */
class TagihanAgen {
    constructor() {
        //
    }

    /* List Tagihan Agen */
    async listTagihanAgen(req, res) {
        if(req.query.pagination === 'false'){
            await InternationalOrderModel.find().populate("agen").populate("member") // Relasi dengan collection Agen
                .then(result => {
                    return apiResponse.successResponseWithDataAndPagination(res, result);
                })
                .catch(error => {
                    return apiResponse.ErrorResponse(res, error);
                });
        }else{
            const options = {
                page: req.query.page,
                limit: req.query.limit,
                populate: "agen member", // Relasi dengan collection Agen
                customLabels: paginateLabel,
            };

            /* Add Advance Filter Search */
            let condition = {};

            if(req.query.search || req.query.input_by || req.query.master_agen){
                condition = {
                    '$and': []
                };
            }

            if(req.query.input_by && req.query.master_agen == undefined){
                condition['$and'].push(
                    {
                        "input_by": ObjectId(req.query.input_by)
                    }
                );
            }

            if(req.query.master_agen) {
                condition['$and'].push({
                    '$or': [
                        {
                            "input_by": ObjectId(req.query.input_by)
                        },
                        {
                            master_agen: ObjectId(req.query.master_agen)
                        }
                    ]
                })
            }

            if(req.query.search){
                condition['$and'].push(
                    {
                        '$or': [
                            { 
                                shipment_number: { $regex: req.query.search, $options: 'i' } 
                            },
                            { 
                                sender_name: { $regex: req.query.search, $options: 'i' } 
                            },
                            { 
                                recipient_name: { $regex: req.query.search, $options: 'i' } 
                            },
                            { 
                                recipient_destination: { $regex: req.query.search, $options: 'i' } 
                            },
                            { 
                                awb_no: { $regex: req.query.search } 
                            },
                        ]
                    }
                );
            }

            await InternationalOrderModel.paginate(condition, options)
                .then(result => {
                    return apiResponse.successResponseWithDataAndPagination(res, result);
                })
                .catch(error => {
                    return apiResponse.ErrorResponse(res, error);
                });
        }
    }

    /* Get International Order by Id */
    async getTagihanAgen(req, res) {
        await InternationalOrderModel.find({ 
            "_id": req.params.id
        }).populate("agen member") // Relasi dengan collection Agen
            .then(result => {
                return apiResponse.successResponseWithData(res, "Data Berhasil Diambil", result);
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }
}

module.exports = TagihanAgen