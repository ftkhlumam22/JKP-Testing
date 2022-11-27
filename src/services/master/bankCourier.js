const BankCourierModel = require('../../models/master/bankCourierModel');
const apiResponse = require('../../helpers/apiResponse');
const paginateLabel = require('../../helpers/paginateLabel');

/**
 * Bank Courier Class
 */
class BankCourier {
    constructor() {
        //
    }

    /* Create Bank Courier */
    async createBankCourier(req, res) {
        await BankCourierModel.create(req.body)
            .then(result => {
                return apiResponse.successResponse(res, "Data Berhasil Dibuat");
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }

    /* List Bank Courier */
    async listBankCourier(req, res) {
        if(req.query.pagination === 'false'){
            await BankCourierModel.find()
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
            };

            /* Add Filter Search */
            var condition = req.query.search ? {
                '$or': [
                    { 
                        bank_name: { $regex: req.query.search, $options: 'i' } 
                    },
                    { 
                        account_name: { $regex: req.query.search, $options: 'i' } 
                    }
                ]
            } : {}

            await BankCourierModel.paginate(condition, options)
                .then(result => {
                    return apiResponse.successResponseWithDataAndPagination(res, result);
                })
                .catch(error => {
                    return apiResponse.ErrorResponse(res, error);
                });
        }
    }

    /* Get Bank Courier by Id */
    async getBankCourier(req, res) {
        await BankCourierModel.find({ 
            "_id": req.params.id
        })
            .then(result => {
                return apiResponse.successResponseWithData(res, "Data Berhasil Diambil", result);
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }

    /* Update Bank Courier by ID */
    async updateBankCourier(req, res) {
        await BankCourierModel.updateOne({
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

    /* Delete Bank Courier by ID */
    async deleteBankCourier(req, res) {
        await BankCourierModel.deleteOne({ 
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

module.exports = BankCourier