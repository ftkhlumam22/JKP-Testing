const MemberModel = require('../../models/users/memberModel');
const apiResponse = require('../../helpers/apiResponse');
const paginateLabel = require('../../helpers/paginateLabel');

/**
 * Member Class
 */
class Member {
    constructor() {
        //
    }

    /* Create Member */
    async createMember(req, res) {
        await MemberModel.create(req.body)
            .then(result => {
                return apiResponse.successResponse(res, "Data Berhasil Dibuat");
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }

    /* List Member */
    async listMember(req, res) {
        if(req.query.pagination === 'false'){
            await MemberModel.find()
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
                        full_name: { $regex: req.query.search, $options: 'i' } 
                    },
                    { 
                        email: { $regex: req.query.search, $options: 'i' } 
                    }
                ]
            } : {}

            await MemberModel.paginate(condition, options)
                .then(result => {
                    return apiResponse.successResponseWithDataAndPagination(res, result);
                })
                .catch(error => {
                    return apiResponse.ErrorResponse(res, error);
                });
        }
    }

    /* Get Member by Id */
    async getMember(req, res) {
        await MemberModel.find({ 
            "_id": req.params.id
        })
            .then(result => {
                return apiResponse.successResponseWithData(res, "Data Berhasil Diambil", result);
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }

    /* Update Member by ID */
    async updateMember(req, res) {
        await MemberModel.updateOne({
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

    /* Delete Member by ID */
    async deleteMember(req, res) {
        await MemberModel.deleteOne({ 
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

module.exports = Member