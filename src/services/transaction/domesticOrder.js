const DomesticOrderModel = require('../../models/transaction/domesticOrderModel');
const apiResponse = require('../../helpers/apiResponse');
const paginateLabel = require('../../helpers/paginateLabel');
const mongoose = require('mongoose'); // Import Library Mongoose
const ObjectId = mongoose.Types.ObjectId;

/**
 * Domestic Order Class
 */
class DomesticOrder {
    constructor() {
        //
    }

    /* Create Domestic Order */
    async createDomesticOrder(req, res) {
        await DomesticOrderModel.create(req.body)
            .then(result => {
                return apiResponse.successResponse(res, "Data Berhasil Dibuat");
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }

    /* List Domestic Order */
    async listDomesticOrder(req, res) {
        if(req.query.pagination === 'false'){
            await DomesticOrderModel.find()
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
                customLabels: paginateLabel,
                populate: 'input_by',
                sort: { createdAt: -1 }
            };

            /* Add Advance Filter Search */
            let condition = {};

            if(req.query.search || req.query.start_date && req.query.end_date || req.query.shipment_date || req.query.admin){
                condition = {
                    '$and': []
                };
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
                            }
                        ]
                    }
                );
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

            if(req.query.shipment_date){
                condition['$and'].push(
                    {
                        "shipment_date": {
                            $gte: new Date(req.query.shipment_date + ' 00:00:00'), 
                            $lt: new Date(req.query.shipment_date + ' 23:59:59')
                        }
                    }
                );
            }

            if(req.query.admin){
                condition['$and'].push(
                    {
                        "input_by": ObjectId(req.query.admin)
                    }
                );
            }

            await DomesticOrderModel.paginate(condition, options)
                .then(result => {
                    return apiResponse.successResponseWithDataAndPagination(res, result);
                })
                .catch(error => {
                    return apiResponse.ErrorResponse(res, error);
                });
        }
    }

    /* Get Domestic Order by Id */
    async getDomesticOrder(req, res) {
        await DomesticOrderModel.find({ 
            "_id": req.params.id
        }).populate('branch')
            .then(result => {
                return apiResponse.successResponseWithData(res, "Data Berhasil Diambil", result);
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }

    /* Update Domestic Order by ID */
    async updateDomesticOrder(req, res) {
        await DomesticOrderModel.updateOne({
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

    /* Delete Domestic Order by ID */
    async deleteDomesticOrder(req, res) {
        await DomesticOrderModel.deleteOne({ 
            "_id": req.params.id
        })
            .then(result => {
                return apiResponse.successResponse(res, "Data Berhasil Dihapus");
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }

    /* Get Last Record */
    async getLastRecordDomesticOrder(req, res) {
        await DomesticOrderModel.findOne({}, {}, { sort: { 'createdAt' : -1 } }, function(err, item) {
            return apiResponse.successResponseWithData(res, "Data Berhasil Diambil", item)
        });
    }

    /* Update Position Order */
    async updatePositionOrderDomesticOrder(req, res) {
        await DomesticOrderModel.findByIdAndUpdate({ 
            "_id": req.params.id
        },{
            position_order: req.body.position_order
        })
            .then(result => {
                return apiResponse.successResponse(res, "Status Order Berhasil Diupdate");
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }

    /* List Domestic Order Agen */
    async listDomesticOrderAgen(req, res) {
        if(req.query.pagination === 'false'){
            await DomesticOrderModel.find({ 
                "input_by": req.params.agen
            })
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
                customLabels: paginateLabel,
                sort: { createdAt: -1 }
            };

            /* Add Advance Filter Search */
            let condition = {
                '$and': [{
                    "input_by": req.params.agen
                }]
            };

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
                            }
                        ]
                    }
                );
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

            await DomesticOrderModel.paginate(condition, options)
                .then(result => {
                    return apiResponse.successResponseWithDataAndPagination(res, result);
                })
                .catch(error => {
                    return apiResponse.ErrorResponse(res, error);
                });
        }
    }

    /* List Domestic Order */
    async listDomesticOrderMember(req, res) {
        if(req.query.pagination === 'false'){
            await DomesticOrderModel.find({ 
                "member": req.params.member
            })
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
                customLabels: paginateLabel,
                sort: { createdAt: -1 }
            };

            /* Add Advance Filter Search */
            let condition = {
                "member": req.params.member
            };

            if(req.query.search || req.query.start_date && req.query.end_date || req.params.member){
                condition = {
                    '$and': [{
                        "member": req.params.member
                    }]
                };
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
                            }
                        ]
                    }
                );
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

            await DomesticOrderModel.paginate(condition, options)
                .then(result => {
                    return apiResponse.successResponseWithDataAndPagination(res, result);
                })
                .catch(error => {
                    return apiResponse.ErrorResponse(res, error);
                });
        }
    }

    /* Get Domestic Order by Field */
    async getDomesticOrderSearchByField(req, res) {
        let condition;

        if(req.query.sender_name) {
            condition = { "sender_name": { '$regex' : req.query.sender_name } }
        }

        if(req.query.recipient_name) {
            condition = { "recipient_name": { '$regex' : req.query.recipient_name } }
        }

        await DomesticOrderModel.find(condition) // Relasi dengan collection Agen
            .then(result => {
                return apiResponse.successResponseWithData(res, "Data Berhasil Diambil", result);
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }

    /* Get Domestic Order by Field */
    async getDomesticOrderByField(req, res) {
        let condition;

        if(req.query.sender_name) {
            condition = { "sender_name": req.query.sender_name }
        }

        if(req.query.recipient_name) {
            condition = { "recipient_name": req.query.recipient_name }
        }

        await DomesticOrderModel.find(condition) // Relasi dengan collection Agen
            .then(result => {
                return apiResponse.successResponseWithData(res, "Data Berhasil Diambil", result);
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }
}

module.exports = DomesticOrder