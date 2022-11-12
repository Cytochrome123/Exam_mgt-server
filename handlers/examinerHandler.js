const { default: mongoose } = require('mongoose');
const {queries} = require('../db') ;
const { DefaultCourse, ExaminerCourse, User, Exam, Assign } = require('../model') ;

class Examiner {
    loadDefaultCourses = async () => {
        try {
            let projections = { name:1, description:1  };
            let options = { lean: true };

            let defCourse = await queries.find( DefaultCourse, {}, projections, options );

            return {
                status: 200,
                data: {msg: 'Default courses loaded!', defCourse}
            }
        } catch(err) {
            throw err;
        }
    };

    getCourses = async (my_details) => {
        try {
            let aggregatePipeline = [
                {
                    $match: {
                        $and: [
                            {examinerId: mongoose.Types.ObjectId(my_details._id)},
                            {status: 'active'}
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'defaultcourses',
                        // localField: '_id',
                        // foreignField: 'examinerId',
                        //                              No FOREIGN FIELD IN DEF.   so..... this |>
                        let: { courseId: '$courseId' },
                        pipeline: [
                            { $match: { $and: [{ $expr: { $eq: ['$$courseId', '$_id'] } }] } },
                        ],
                        as: 'defaultCourses'
                    }
                },
                { $unwind: '$defaultCourses' },
                {
                    $project: {
                        name: 1,
                        description: 1,
                        'defaultCourses.name': 1,
                        'defaultCourses.description': 1,
                    }
                },
                { $sort: { modifiedDate: 1 } }
            ];

            const condition = aggregatePipeline[0].$match;

            const totalCourse = await queries.countDocuments( ExaminerCourse, condition );

            const courseDetails = await queries.aggregateData( ExaminerCourse, aggregatePipeline );

            return {
                status: 200,
                data: { msg: 'Examiner course compiled!', totalCourse, courseDetails }
            }

        } catch(err) {
            throw err;
        }
    };

    createCourse = async (my_details, courseDetails) => {
        try {
            let condition = {
                $and: [
                    {examinerId: mongoose.Types.ObjectId(my_details._id)},
                    {courseId: mongoose.Types.ObjectId(courseDetails.courseId)}
                ]
            };
            let projection = {};
            let option = {lean: true};

            let existed = await queries.findOne( ExaminerCourse, condition, projection, option );

            if(!existed) {
                courseDetails.examinerId = my_details._id;
                console.log(courseDetails)
                await queries.create( ExaminerCourse, courseDetails );

                return {
                    status: 200, 
                    data: { msg: 'Your course has been successfully created!!!' }
                }
            } else {
                return {
                    status: 409,
                    data: { msg: 'Oops! The course already exists' }
                }
            }
        } catch(err) {
            throw err;
        }
    }

    getStudents = async (my_details, examId) => {
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
    }

    assignStudents = async (my_details, examId, selectedStudents) => {
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
    }
    
    viewAssignedStudents = async (examId) => {
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

module.exports = new Examiner();