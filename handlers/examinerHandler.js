const { default: mongoose } = require('mongoose');
const {queries} = require('../db') ;
const { DefaultCourse, ExaminerCourse } = require('../model') ;

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
                        //                              No LLOCAL FIELD IN DEF.   so..... this |>
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
}

module.exports = new Examiner();