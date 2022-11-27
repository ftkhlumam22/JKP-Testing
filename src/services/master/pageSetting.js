const PageSettingModel = require('../../models/master/pageSettingModel');
const apiResponse = require('../../helpers/apiResponse');
// const paginateLabel = require('../../helpers/paginateLabel');

/**
 * Page Setting Class
 */
class PageSetting {
    constructor() {
        //
    }

    /* Create Page Setting */
    async createPageSetting(req, res) {
        await PageSettingModel.create(req.body)
            .then(result => {
                return apiResponse.successResponse(res, "Data Berhasil Dibuat");
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }

    /* Get Page Setting by Id */
    async getPageSetting(req, res) {
        await PageSettingModel.find()
            .then(result => {
                return apiResponse.successResponseWithData(res, "Data Berhasil Diambil", result);
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }

    /* Update Bank by ID */
    async updatePageSetting(req, res) {
        await PageSettingModel.updateOne({
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
}

module.exports = PageSetting