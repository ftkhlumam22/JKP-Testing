const ServiceModel = require('../../models/shipping_rates/serviceModel');
const apiResponse = require('../../helpers/apiResponse');
const paginateLabel = require('../../helpers/paginateLabel');
const csv = require('csvtojson');

/**
 * Service Class
 */
class Service {
    constructor() {
        //
    }

    /* Create Service */
    async createService(req, res) {
        await ServiceModel.create(req.body)
            .then(result => {
                return apiResponse.successResponse(res, "Data Berhasil Dibuat");
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }

    /* Import Service */
    async importService(req, res) {
        importCsvData2MongoDB(String(req.file.buffer));

        // -> Import CSV File to MongoDB database
        function importCsvData2MongoDB(filePath){
            csv()
                .fromString(filePath)
                .then((jsonObj)=>{
                    // console.log(jsonObj);
                    
                    // Insert Json-Object to MongoDB
                    Promise
                        .all( jsonObj.map( item => {
                            return ServiceModel.create( item ) 
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
            
                })
        }
    }

    /* List Service */
    async listService(req, res) {
        if(req.query.pagination === 'false'){
            await ServiceModel.find()
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
                        service_name: { $regex: req.query.search, $options: 'i' } 
                    },
                ]
            } : {}

            await ServiceModel.paginate(condition, options)
                .then(result => {
                    return apiResponse.successResponseWithDataAndPagination(res, result);
                })
                .catch(error => {
                    return apiResponse.ErrorResponse(res, error);
                });
        }
    }

    /* Get Service by Id */
    async getService(req, res) {
        await ServiceModel.find({ 
            "_id": req.params.id
        })
            .then(result => {
                return apiResponse.successResponseWithData(res, "Data Berhasil Diambil", result);
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }

    /* Update Service by ID */
    async updateService(req, res) {
        await ServiceModel.updateOne({
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

    /* Delete Service by ID */
    async deleteService(req, res) {
        await ServiceModel.deleteOne({ 
            "_id": req.params.id
        })
            .then(result => {
                return apiResponse.successResponse(res, "Data Berhasil Dihapus");
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }

    /* Delete Many Service */
    async deleteManyService(req, res) {
        await ServiceModel.deleteMany()
            .then(result => {
                return apiResponse.successResponse(res, "Data Berhasil Dihapus");
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }
    
}

module.exports = Service