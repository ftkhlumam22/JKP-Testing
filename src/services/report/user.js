const UserModel = require('../../models/users/userModel');
const AgenModel = require('../../models/users/agenModel');
const MemberModel = require('../../models/users/memberModel');
const apiResponse = require('../../helpers/apiResponse');

/**
 * User Report Class
 */
class UserReport {
    constructor() {
        //
    }

    /* Get Total New Agen */
    async getTotalNewAgen(req, res) {
        await AgenModel.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(req.query.start_date + ' 00:00:00'), 
                            $lt: new Date(req.query.end_date + ' 23:59:59')
                        },
                    }
                },
                { $group: { _id: null, count: { $sum: 1 } } }
            ])
                .then(result => {
                    return apiResponse.successResponseWithData(res, "Data Berhasil Diambil", result);
                })
                .catch(error => {
                    return apiResponse.ErrorResponse(res, error);
                });
    }

    /* Get Total New Member */
    async getTotalNewMember(req, res) {
        await MemberModel.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(req.query.start_date + ' 00:00:00'), 
                            $lt: new Date(req.query.end_date + ' 23:59:59')
                        },
                    }
                },
                { $group: { _id: null, count: { $sum: 1 } } }
            ])
                .then(result => {
                    return apiResponse.successResponseWithData(res, "Data Berhasil Diambil", result);
                })
                .catch(error => {
                    return apiResponse.ErrorResponse(res, error);
                });
    }

    /* Get Total New User */
    async getTotalNewUser(req, res) {
        await UserModel.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(req.query.start_date + ' 00:00:00'), 
                            $lt: new Date(req.query.end_date + ' 23:59:59')
                        },
                    }
                },
                { $group: { _id: null, count: { $sum: 1 } } }
            ])
                .then(result => {
                    return apiResponse.successResponseWithData(res, "Data Berhasil Diambil", result);
                })
                .catch(error => {
                    return apiResponse.ErrorResponse(res, error);
                });
    }

    /* Get Agen Statistics */
    async getAgenStatistics(req, res) {
        await AgenModel.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(req.query.start_date + ' 00:00:00'), 
                            $lt: new Date(req.query.end_date + ' 23:59:59')
                        },
                    }
                },
                { $unwind:'$createdAt' },
                { 
                    $group: {
                        _id: {
                            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Jakarta" } }
                        }, 
                        count: {
                            $sum:1
                        }
                    }
                },
                {
                    $sort: {"_id":1}
                }
            ])
                .then(result => {
                    let data = [];
                    result.map(item => {
                        data.push({
                            date: item._id.date,
                            order_count: item.count
                        });
                    });

                    return apiResponse.successResponseWithData(res, "Data Berhasil Diambil", data);
                })
                .catch(error => {
                    return apiResponse.ErrorResponse(res, error);
                });
    }

    /* Get Member Statistics */
    async getMemberStatistics(req, res) {
        await MemberModel.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(req.query.start_date + ' 00:00:00'), 
                            $lt: new Date(req.query.end_date + ' 23:59:59')
                        },
                    }
                },
                { $unwind:'$createdAt' },
                { 
                    $group: {
                        _id: {
                            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Jakarta" } }
                        }, 
                        count: {
                            $sum:1
                        }
                    }
                },
                {
                    $sort: {"_id":1}
                }
            ])
                .then(result => {
                    let data = [];
                    result.map(item => {
                        data.push({
                            date: item._id.date,
                            order_count: item.count
                        });
                    });

                    return apiResponse.successResponseWithData(res, "Data Berhasil Diambil", data);
                })
                .catch(error => {
                    return apiResponse.ErrorResponse(res, error);
                });
    }
}

module.exports = UserReport