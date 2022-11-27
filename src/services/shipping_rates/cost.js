const CostModel = require('../../models/shipping_rates/costModel');
const apiResponse = require('../../helpers/apiResponse');
const paginateLabel = require('../../helpers/paginateLabel');
const csv = require('csvtojson');
const fs = require('fs');

/**
 * Cost Class
 */
class Cost {
    constructor() {
        //
    }

    /* Create Cost */
    async createCost(req, res) {
        await CostModel.create(req.body)
            .then(result => {
                return apiResponse.successResponse(res, "Data Berhasil Dibuat");
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }

    /* Get Cost by Id */
    async getCost(req, res) {
        await CostModel.find({ 
            "_id": req.params.id
        })
            .then(result => {
                return apiResponse.successResponseWithData(res, "Data Berhasil Diambil", result);
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }

    /* Delete Cost by ID */
    async deleteCost(req, res) {
        await CostModel.deleteOne({ 
            "_id": req.params.id
        })
            .then(result => {
                return apiResponse.successResponse(res, "Data Berhasil Dihapus");
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }

    /* Delete Many Cost */
    async deleteManyCost(req, res) {
        await CostModel.deleteMany()
            .then(result => {
                return apiResponse.successResponse(res, "Data Berhasil Dihapus");
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }

    /* Update Cost by ID */
    async updateCost(req, res) {
        await CostModel.updateOne({
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

    /* List Cost */
    async listCost(req, res) {
        if(req.query.pagination === 'false'){
            await CostModel.find()
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
                        courier: { $regex: req.query.search, $options: 'i' } 
                    },
                    { 
                        destination: { $regex: req.query.search, $options: 'i' } 
                    },
                    { 
                        category: { $regex: req.query.search, $options: 'i' } 
                    }
                ]
            } : {}

            await CostModel.paginate(condition, options)
                .then(result => {
                    return apiResponse.successResponseWithDataAndPagination(res, result);
                })
                .catch(error => {
                    return apiResponse.ErrorResponse(res, error);
                });
        }
    }

    /* Import Cost */
    async importCost(req, res) {
        importCsvData2MongoDB('./uploads/cost/' + req.file.filename);

        // -> Import CSV File to MongoDB database
        function importCsvData2MongoDB(filePath){
            csv()
                .fromFile(filePath)
                .then((jsonObj)=>{
                    // console.log(jsonObj);
                    
                    // Insert Json-Object to MongoDB
                    Promise
                        .all( jsonObj.map( item => {
                            return CostModel.create( item ) 
                                        .catch( error => ( { error } ) )
                        }) )
                        .then( items => {

                            items.forEach( item => {
                                if ( item.error ) {
                                    return apiResponse.ErrorResponse(res, item.error);
                                } else {
                                    return apiResponse.successResponse(res, "Data Berhasil Dibuat");
                                }
                            } );

                        } );
            
                    fs.unlinkSync(filePath);
                })
        }
    }
}

module.exports = Cost