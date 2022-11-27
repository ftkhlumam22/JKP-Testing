const CourierModel = require('../../models/shipping_rates/courierModel');
const apiResponse = require('../../helpers/apiResponse');
const paginateLabel = require('../../helpers/paginateLabel');
const csv = require('csvtojson');

/**
 * Courier Class
 */
class Courier {
    constructor() {
        //
    }

    /* Create Courier */
    async createCourier(req, res) {
        await CourierModel.create(req.body)
            .then(result => {
                return apiResponse.successResponse(res, "Data Berhasil Dibuat");
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }

    /* Import Courier */
    async importCourier(req, res) {
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
                            return CourierModel.create( item ) 
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

    /* List Courier */
    async listCourier(req, res) {
        if(req.query.pagination === 'false'){
            await CourierModel.find()
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
                        courier_name: { $regex: req.query.search, $options: 'i' } 
                    },
                ]
            } : {}

            await CourierModel.paginate(condition, options)
                .then(result => {
                    return apiResponse.successResponseWithDataAndPagination(res, result);
                })
                .catch(error => {
                    return apiResponse.ErrorResponse(res, error);
                });
        }
    }

    /* Get Courier by Id */
    async getCourier(req, res) {
        await CourierModel.find({ 
            "_id": req.params.id
        })
            .then(result => {
                return apiResponse.successResponseWithData(res, "Data Berhasil Diambil", result);
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }

    /* Update Courier by ID */
    async updateCourier(req, res) {
        await CourierModel.updateOne({
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

    /* Delete Courier by ID */
    async deleteCourier(req, res) {
        await CourierModel.deleteOne({ 
            "_id": req.params.id
        })
            .then(result => {
                return apiResponse.successResponse(res, "Data Berhasil Dihapus");
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }

    /* Delete Many Courier */
    async deleteManyCourier(req, res) {
        await CourierModel.deleteMany()
            .then(result => {
                return apiResponse.successResponse(res, "Data Berhasil Dihapus");
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }
    
}

module.exports = Courier