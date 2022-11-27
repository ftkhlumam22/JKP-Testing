const OriginModel = require('../../models/shipping_rates/originModel');
const DestinationModel = require('../../models/shipping_rates/destinationModel');
const CostModel = require('../../models/shipping_rates/costModel');

/**
 * CheckTariff Class
 */
class CheckTariff {
    constructor() {
        //
    }

    /* check Cost */
    async checkCost(req, res) {
        const origin = await OriginModel.find({"_id": req.query.origin})
            .then(result => {
                console.log('Success')
                return result[0]
            })
            .catch(error => {
                console.log(error)
            });
        
        const destination = await DestinationModel.find({"_id": req.query.destination})
            .then(result => {
                console.log('Success')
                console.log(result)
                return result[0]
            })
            .catch(error => {
                console.log(error)
            });

        const cost = await CostModel.find({
                $and: [
                    {"destination": destination.country_name}, 
                    {"weight": req.query.weight}, 
                    {"category": req.query.category}, 
                ],
            })
            .then(result => {
                console.log('Success')
                return result
            })
            .catch(error => {
                console.log(error)
            });

        let query;
        if(origin && origin.city_name) {
            query = {
                origin: origin.city_name,
                destination: destination.country_name,
                weight: req.query.weight,
                courier: req.query.courier
            }
        }else {
            query = {
                origin: origin,
                destination: destination.country_name,
                weight: req.query.weight,
                courier: req.query.courier
            }
        }

        res.json({
            query: query,
            origin_detail: origin,
            destination_detail: destination,
            results: cost
        });
    }
}

module.exports = CheckTariff