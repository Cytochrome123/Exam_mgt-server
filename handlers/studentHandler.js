const { default: mongoose } = require("mongoose");
const { queries } = require("../db");
const { User, Exam, Assign } = require("../model");

const student = {
    getStudents: async (my_details, examId) => {
        try {
            let condition = { _id: mongoose.Types.ObjectId(examId) };
            let projections = { examCode: 1, subject: 1 };
            let options = { lean: true };

            const examDetails = await queries.findOne( Exam, condition, projections, options )
            // const examinerDetails = await queries.findOne( User, condition, projections, options );

            let aggregatePipeline = [
                {
                    $match: {
                        $and: [
                            { subAdmin: mongoose.Types.ObjectId(my_details.subAdmin) },
                            { userType: 'student' },
                            { status: 'active' }
                        ],
                    },
                },
                {
                    $lookup: {
                        from: 'students',
                        localField: '_id',
                        foreignField: 'userId',
                        as: 'studentDetails'
                    },
                },
                { $unwind: '$studentDetails' },
                { $sort: {'studentDetails.studentId': 1} },
                {
                    $project: {
                        firstName: 1,
						lastName: 1,
						image: 1,
						'studentDetails.studentId': 1,
						'studentDetails.dob': 1,
                        'studentDetails.state': 1,
                        'studentDetails.gender': 1,
                    }
                }
            ];

            let students = await queries.aggregateData( User, aggregatePipeline, options);

            return {
                status: 200,
                data: { msg: 'Students compiled', examDetails, students }
            }
        } catch (err) {
            throw err;
        }
    },

    assignStudents: async (my_details, examId, selectedStudents) => {
        try {
            for (let studentId of selectedStudents) {
                let conditions = {
                    $and: [
                        { examinerId: mongoose.Types.ObjectId(my_details._id) },
                        { examId: mongoose.Types.ObjectId(examId) },
                        { studentId: mongoose.Types.ObjectId(studentId) }
                    ]
                };
                let projections = {  };
                let options = { lean: true };
    
                let assigned = await queries.findOne( Assign, conditions, projections, options );
    
                if (!assigned) {
                    let assignObj = {
                        examinerId: my_details._id,
                        examId: examId,
                        studentId
                    }
                    await queries.create( Assign, assignObj );
                }

            }

            return {
                status: 200,
                data: {msg: 'The selected students have been assign to an exam!'}
            }
        } catch (err) {
            throw err;
            // new BSONTypeError(`Mongo error, => ${err}`);
        }
    },
    
    viewAssignedStudents: async (examId) => {
        try {
            let aggregatePipeline = [
                {
                    $match: {
                        $and: [
                            { examId: mongoose.Types.ObjectId(examId)},
                            { status: { $ne: 'deleted ' } }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'studentId',
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                },
                { $unwind: '$userDetails' },
                {
                    $lookup: {
                        from: 'students',
                        localField: 'userDetails._id',
                        foreignField: 'userId',
                        as: 'studentDetails'
                    }
                },
                { $unwind: '$studentDetails' },
                {
					$project: {
						status: 1,
						'userDetails.firstName': 1,
						'userDetails.lastName': 1,
						'userDetails._id': 1,
						'userDetails.email': 1,
						'studentDetails.studentId': 1,
						'studentDetails._id': 1,
					},
				},
            ];

            let options = { lean: true };

            const assignedStudents = await queries.aggregateData( Assign, aggregatePipeline, options );

            const count = await queries.countDocuments( Assign, aggregatePipeline[0].$match );

            let condition = { _id: mongoose.Types.ObjectId(examId) };
            let projections = { examDate: 1, startTime: 1 }

            const examDetails = await queries.findOne( Exam, condition, projections, options );

            return {
                status: 200,
                data: { msg: 'The assigned student have been compiled successfully!!', assignedStudents, count, examDetails }
            };

        } catch (err) {
            throw err;
        }
    }
}

module.exports = student;