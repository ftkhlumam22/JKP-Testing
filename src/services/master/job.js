const JobModel = require('../../models/master/jobModel');
const apiResponse = require('../../helpers/apiResponse');
const paginateLabel = require('../../helpers/paginateLabel');

/**
 * Job Class
 */
class Job {
    constructor() {
        //
    }

    /* Create Job */
    async createJob(req, res) {
        await JobModel.create(req.body)
            .then(result => {
                return apiResponse.successResponse(res, "Data Berhasil Dibuat");
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }

    /* List Job */
    async listJob(req, res) {
        if(req.query.pagination === 'false'){
            await JobModel.find()
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
                        position: { $regex: req.query.search, $options: 'i' } 
                    },
                    { 
                        location: { $regex: req.query.search, $options: 'i' } 
                    }
                ]
            } : {}

            await JobModel.paginate(condition, options)
                .then(result => {
                    return apiResponse.successResponseWithDataAndPagination(res, result);
                })
                .catch(error => {
                    return apiResponse.ErrorResponse(res, error);
                });
        }
    }

    /* Get Job by Id */
    async getJob(req, res) {
        await JobModel.find({ 
            "_id": req.params.id
        })
            .then(result => {
                return apiResponse.successResponseWithData(res, "Data Berhasil Diambil", result);
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }

    /* Update Job by ID */
    async updateJob(req, res) {
        await JobModel.updateOne({
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

    /* Delete Job by ID */
    async deleteJob(req, res) {
        await JobModel.deleteOne({ 
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

module.exports = Job