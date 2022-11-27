const DestinationModel = require('../../models/shipping_rates/destinationModel');
const apiResponse = require('../../helpers/apiResponse');
const paginateLabel = require('../../helpers/paginateLabel');
const csv = require('csvtojson');
const fs = require('fs');

/**
 * Destination Class
 */
class Destination {
    constructor() {
        //
    }

    /* Create Destination */
    async createDestination(req, res) {
        await DestinationModel.create(req.body)
            .then(result => {
                return apiResponse.successResponse(res, "Data Berhasil Dibuat");
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }

    /* List Destination */
    async listDestination(req, res) {
        if(req.query.pagination === 'false'){
            await DestinationModel.find()
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
                        country_name: { $regex: req.query.search, $options: 'i' } 
                    },
                ]
            } : {}

            await DestinationModel.paginate(condition, options)
                .then(result => {
                    return apiResponse.successResponseWithDataAndPagination(res, result);
                })
                .catch(error => {
                    return apiResponse.ErrorResponse(res, error);
                });
        }
    }

    /* Import Destination */
    async importDestination(req, res) {
        importCsvData2MongoDB('./uploads/destination/' + req.file.filename);

        // -> Import CSV File to MongoDB database
        function importCsvData2MongoDB(filePath){
            csv()
                .fromFile(filePath)
                .then((jsonObj)=>{
                    // console.log(jsonObj);
                    
                    // Insert Json-Object to MongoDB
                    Promise
                        .all( jsonObj.map( item => {
                            return DestinationModel.create( item ) 
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

module.exports = Destination