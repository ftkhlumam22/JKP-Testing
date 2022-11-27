const OriginModel = require('../../models/shipping_rates/originModel');
const apiResponse = require('../../helpers/apiResponse');
const paginateLabel = require('../../helpers/paginateLabel');
const csv = require('csvtojson');
const fs = require('fs');

/**
 * Origin Class
 */
class Origin {
    constructor() {
        //
    }

    /* Create Origin */
    async createOrigin(req, res) {
        await OriginModel.create(req.body)
            .then(result => {
                return apiResponse.successResponse(res, "Data Berhasil Dibuat");
            })
            .catch(error => {
                return apiResponse.ErrorResponse(res, error);
            });
    }

    /* List Origin */
    async listOrigin(req, res) {
        if(req.query.pagination === 'false'){
            await OriginModel.find()
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
                        city_name: { $regex: req.query.search, $options: 'i' } 
                    },
                ]
            } : {}

            await OriginModel.paginate(condition, options)
                .then(result => {
                    return apiResponse.successResponseWithDataAndPagination(res, result);
                })
                .catch(error => {
                    return apiResponse.ErrorResponse(res, error);
                });
        }
    }

    /* Import Origin */
    async importOrigin(req, res) {
        importCsvData2MongoDB('./uploads/origin/' + req.file.filename);

        // -> Import CSV File to MongoDB database
        function importCsvData2MongoDB(filePath){
            csv()
                .fromFile(filePath)
                .then((jsonObj)=>{
                    // console.log(jsonObj);

                    // Insert Json-Object to MongoDB
                    Promise
                        .all( jsonObj.map( item => {
                            return OriginModel.create( item ) 
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

module.exports = Origin