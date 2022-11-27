const RoleModel = require('../../models/users/roleModel');
const apiResponse = require('../../helpers/apiResponse');
const paginateLabel = require('../../helpers/paginateLabel');

/**
 * Role Class
 */
class Role {
    constructor() {
        //
    }

    /* Create Role */
    async createRole(req, res) {
        await RoleModel.create(req.body)
            .then(result => {
                return apiResponse.successResponse(res, "Data Berhasil Dibuat");
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }

    /* List Role */
    async listRole(req, res) {
        if(req.query.pagination === 'false'){
            await RoleModel.find()
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
                        role_name: { $regex: req.query.search, $options: 'i' } 
                    },
                ]
            } : {}

            await RoleModel.paginate(condition, options)
                .then(result => {
                    return apiResponse.successResponseWithDataAndPagination(res, result);
                })
                .catch(error => {
                    return apiResponse.ErrorResponse(res, error);
                });
        }
    }

    /* Get Role by Id */
    async getRole(req, res) {
        await RoleModel.find({ 
            "_id": req.params.id
        })
            .then(result => {
                return apiResponse.successResponseWithData(res, "Data Berhasil Diambil", result);
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }

    /* Update Role by ID */
    async updateRole(req, res) {
        await RoleModel.updateOne({
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

    /* Delete Role by ID */
    async deleteRole(req, res) {
        await RoleModel.deleteOne({ 
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

module.exports = Role