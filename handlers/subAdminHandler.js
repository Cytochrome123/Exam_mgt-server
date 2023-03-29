const mongoose = require('mongoose');

const crypto = require('crypto');

const { queries } = require('../db');
const { User, Student } = require('../model')
const { factory } = require('../config');

const subAdmin = {
    getMyExaminersData: async (my_details) => {
        try {
            let condition = {
                $and: [
                    { userType: 'examiner'},
                    { subAdmin: mongoose.Types.ObjectId(my_details._id)},
                    {status: {$ne: 'deleted'}}
                ]
            }

            let projection = {
                firstName: 1,
                lastName: 1,
                email: 1,
                status:1,
            }

            let options = { lean: true }

            let count = await queries.countDocuments( User, condition );

            let examinersList = await queries.find( User, condition, projection, options);

            return {
                status: 200,
                msg: 'The examiners under me has been successfully compiled!',
                data: { examinersList, count }
            }

        } catch (err) {
            throw err;
        }
    },

    // viewExaminer: lookup from the examiner model and populate .....also add more to the schema

    requestNewExaminer: async (my_details, examinerDetails) => {
        try {
            let condition = {
                $and: [
                    {email : examinerDetails.email},
                    {subAdmin: mongoose.Types.ObjectId(my_details._id)}
                ]
            };

            let projection = {}
            let option = {lean: true};

            let existed = await queries.findOne(User, condition, projection,option);

            if(!existed) {
                examinerDetails.userType = 'examiner';
                examinerDetails.status = 'pending'
                // let subAdminExisted = examinerDetails.subAdmin.includes(my_details._id);

                // if(!subAdminExisted) {
                //     examinerDetails.subAdmin.push(my_details);
                // }
                examinerDetails.subAdmin = my_details._id;
				examinerDetails.collegeId = my_details.collegeId;


                await queries.create(User, examinerDetails);

                return {
                    status: 200,
                    data: { msg: 'Examiner signup success' }
                }
            } else {
                return {
                    status: 400,
                    data: { msg: 'Duplicate examiner' }
                };
            }



        } catch (err) {
            throw err;
        }

        
    },

    removeExaminer: async (removalId) => {
        try {
            let condition = {_id: mongoose.Types.ObjectId(removalId)};
            let options = {};

            let deleted = await queries.delete(User, condition, options);

            if(deleted) {
                return {
                    status: 200,
                    data: {msg: 'Examiner deleted succesfully'}
                }
            } else {
                return {
                    status: 400,
                    data: {msg: 'Failed to delete examiner, try again later!'}
                }
            }
        } catch (err) {
            throw err;
        }
    },

    getStudents: async (my_details) => {
        try {
            let condition = {
                $and: [
                    {subAdmin: mongoose.Types.ObjectId(my_details._id)},
                    {userType: 'student'}
                ]
            };

            let  studentCount = await queries.countDocuments( User, condition );


            let aggregatePipeline = [
                { $match: {
                    $and: [
                        {subAdmin: mongoose.Types.ObjectId(my_details._id)},
                        {userType: 'student'}
                    ]
                }},
                { $lookup: {
                    from: 'students',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'studentData'
                }},
                { $unwind: '$studentData' },
                { $project: {
                    firstName:1,
                    lastName: 1,
                    email: 1,
                    phoneNumber: 1,
                    'studentData._id': 1,
                    'studentData.studentId': 1
                }}
            ]

            let option = {}

            let studentsList = await queries.aggregateData( User, aggregatePipeline, option );

            return {
                status: 200,
                data: { studentCount, studentsList }
            }
        } catch (err) {
            throw err;
        }
    },

    viewStudent: async (payload) => {
        try {
            let aggregatePipeline = [
                {
                    $match: {
                        $and: [
                            {_id: mongoose.Types.ObjectId(payload.id)},
                            {userType: 'student'}
                        ]
                    }
                },

                {
                    $lookup: {
                        from: 'students',
                        localField: '_id',
                        foreignField: 'userId',
                        as: 'allOtherData'
                    }
                },

                {$unwind: '$allOtherData' },

                {
                    $project: {
						firstName: 1,
						lastName: 1,
                        email: 1,
						phoneNumber: 1,
						'allOtherData.fatherName': 1,
						'allOtherData.motherName': 1,
						'allOtherData.dob': 1,
						'allOtherData.address': 1,
						'allOtherData.gender': 1,
						'allOtherData.state': 1,
						'allOtherData.city': 1,
						'allOtherData.studentId': 1,
                    }
                }
            ]

            const option = {}

            let studentDetails = await queries.aggregateData( User, aggregatePipeline, option );

            studentDetails = studentDetails.length !== 0 ? studentDetails[0] : {};

            if(studentDetails) {
                return {
                    status: 200,
                    data: { studentDetails }
                }

            }
            return {
                status: 404,
                data : {msg: 'Invalid Id'}
            }
        } catch(err) {
            throw err;
        }
    },

    addNewStudent: async (my_details, student_details) => {
        try {
            // console.log('adding')
            let condition = { email: student_details.email };

            let projection = {};
            let option = { lean: true };

            let existingUser = await queries.findOne( User, condition, projection, option );
            
            condition = { studentId: student_details.studentId }
            // console.log('processing')
            // await queries.create( Student, student_details )
            let existingStudent = await queries.findOne( Student, condition, projection, option );

            if(existingUser) {
                if(existingStudent) {
                    return {
                        status: 400,
                        msg: 'The student with the ID specified already exists'
                    }
                } else {
                    let newStudentData = {
                        userId: existingUser._id,
                		fatherName: student_details.fatherName,
                		motherName: student_details.motherName,
                		dob: parseInt(student_details.dob, 10),
                        // dob: student_details.dob,
                		address: student_details.address,
                		studentId: student_details.studentId,
                		gender: student_details.gender,
                		state: student_details.state,
                		city: student_details.city,
                    };
    
                    await queries.create( Student, newStudentData );

                    return {
                        status: 200,
                        msg: 'The user exists but the student has just been created'
                    }
                }
            } else {
                if(student_details.password == '' || student_details.password == null ) {
                    student_details.password = crypto.randomBytes(6).toString("hex");
                }
                let newUserData = {
                    firstName: student_details.firstName,
                	lastName: student_details.lastName,
                	email: student_details.email,
                	password: factory.generateHashPassword(student_details.password),
                	phoneNumber: student_details.phoneNumber,
                	subAdmin: my_details._id,
                	userType: 'student',
                	status: 'active',
                	// image: my_details.id,
                }

                let newUser = await queries.create( User, newUserData );

                let newStudentData = {
                    userId: newUser._id,
                	fatherName: student_details.fatherName,
                	motherName: student_details.motherName,
                	dob: parseInt(student_details.dob, 10),
                    // dob: student_details.dob,
                	address: student_details.address,
                	studentId: student_details.studentId,
                	gender: student_details.gender,
                	state: student_details.state,
                	city: student_details.city,
                };

                await queries.create( Student, newStudentData );

                return {
                    status: 200,
                    msg: 'A new user and student has been created successfully!'
                }
            }
        } catch(err) {
            // console.log('notadding')
            throw err;
        }
    },

    updateStudent: async ( payload, updateDetails ) => {
        try {
            let condition = { _id: mongoose.Types.ObjectId(payload.id) }
            let options = { new: true, lean: true };

            let updatedUserDetails = await queries.findByIdAndUpdate( User, condition, updateDetails, options );

            if(updatedUserDetails) {
                condition = { userId: mongoose.Types.ObjectId(payload.id) };

                await queries.findByIdAndUpdate( Student, updateDetails, options );

                return {
                    status: 200,
                    msg: `Successfully updated ${updatedUserDetails.firstName}`
                }
            } else {
                return {
                    status: 400,
                    msg: `User doesnt exist`
                }
            }

        } catch(err) {
            throw err;
        }
    },

    removeStudent: async (payload) => {
        try {
            // let condition = { _id: mongoose.Types.ObjectId(payload.id) };
            let condition = { _id: payload.studentId };

            await queries.delete( Student, condition );

            // after deleteing student, dont delete user just turn their accountStatus to deleted

            return {
                status: 200,
                data: { msg: 'The user has been removed as a student and ready for another role'}
            }
        } catch(err) {
            throw err;
        }
    }
}

module.exports = subAdmin;