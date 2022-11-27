const BankModel = require('../../models/master/bankModel');
const apiResponse = require('../../helpers/apiResponse');
const paginateLabel = require('../../helpers/paginateLabel');

/**
 * Bank Class
 */
class Bank {
    constructor() {
        //
    }

    /* Create Bank */
    async createBank(req, res) {
        await BankModel.create(req.body)
            .then(result => {
                return apiResponse.successResponse(res, "Data Berhasil Dibuat");
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }

    /* List Bank */
    async listBank(req, res) {
        if(req.query.pagination === 'false'){
            await BankModel.find()
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

            await BankModel.paginate(condition, options)
                .then(result => {
                    return apiResponse.successResponseWithDataAndPagination(res, result);
                })
                .catch(error => {
                    return apiResponse.ErrorResponse(res, error);
                });
        }
    }

    /* Get Bank by Id */
    async getBank(req, res) {
        await BankModel.find({ 
            "_id": req.params.id
        })
            .then(result => {
                return apiResponse.successResponseWithData(res, "Data Berhasil Diambil", result);
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }

    /* Update Bank by ID */
    async updateBank(req, res) {
        await BankModel.updateOne({
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

    /* Delete Bank by ID */
    async deleteBank(req, res) {
        await BankModel.deleteOne({ 
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

module.exports = Bank