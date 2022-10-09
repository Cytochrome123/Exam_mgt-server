const { queries } = require('../db');
const { User } = require('../model');

const admin = {
    getDashboardDetails: async () => {
        try {
            let aggregatePipeline = [
                { $match: { userType: { $ne: 'admin'} }},
                { $group: { _id: '$userType', count: { $sum: 1}}}
            ];

            let options = { lean: true };

            let countDetails = await queries.aggregateData(User, aggregatePipeline, options);

            aggregatePipeline = [
                { $match: { userType: 'examiner'}},
                { $group: { _id: '$status', count: { $sum: 1}}},
                { $sort: { _id: 1}}
            ]

            let examinerDetails = await queries.aggregateData(User, aggregatePipeline, options)

            return {
                status: 200,
                msg: 'Succesfully gotten the required data !!!',
                data: {
                    // totalExaminers: countDetails.length !== 0 ? countDetails[0].count : 0

                    // user: req.user,
                    countDetails,
                    examinerDetails
                }
            }

            // let condition = {};
        } catch (err) {
            throw err;
        }
    },

    getSubAdminData: async (payload) => {
       
        try {

			let populateOptions = {
				path: 'collegeId',
				select: 'name',
			};

			let aggregatePipeline = [
				{ $match: { userType: 'subAdmin' } },
                { $sort: { createdDate: -1 } },
                { $project: {
                    firstName: 1,
                    lastName: 1,
                    email: 1,
                    collegeId: 1,
                    status: 1,
                    createdDate:1
                }}
            ];
			


			let count = await queries.countDocuments(
				User,
				aggregatePipeline[0].$match
			);

			let subAdminList = await queries.aggregateDataAndPopulate(
				User,
				aggregatePipeline,
				populateOptions
			);

			return {
				status: 200,
                msg: 'Compiled',
				data: { subAdminList, count },
			};
        } catch (err) {
            throw err;
        }
    },

    getExaminerData: async () => {
       try {
            let aggregatePipeline = [
                { $match: { userType: 'examiner' }},
                { $sort: { modifiedDate: -1 }},
                { $project: {
                    firstName: 1,
                    lastName: 1,
                    email: 1,
                    status: 1,
                    createdDate:1
                }}
            ];

            let options = { lean: true};

            let count = await queries.countDocuments( User, aggregatePipeline[0].$match);

            let examinerData = await queries.aggregateData( User, aggregatePipeline, options)

            return {
                status: 200,
                msg: 'Compiled examine',
                data: { examinerData, count }
            }
       } catch (err) {
            throw err;
       }
    },

    updateStatus: async (updating) => {
        const { id, status } = updating

        let condition = { _id: id};
        let update = { status: status }
        let options = { lean: true, new: true }

        let updated = await queries.update( User, condition, update, options);

        return updated
    }
}

module.exports = admin;