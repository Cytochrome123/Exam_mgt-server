const {examinerHandler} = require('../handlers');

class Examiner {
    loadDefaultCourses = async (req, res) => {
        try {
            const response = await examinerHandler.loadDefaultCourses();

            res.status(response.status).json({...response.data})
            
        } catch(err) {
            throw err;
        }
    };

    getCourses = async (req,res) => {
        try {
            const my_details = req.user;

            const response = await examinerHandler.getCourses(my_details);
            
            res.status(response.status).json({...response.data});
            
        } catch (err) {
            throw err;
        }
    }

    createCourse = async (req, res) => {
        try {
            const my_details = req.user;
            const courseDetails = req.body;
            const response = await examinerHandler.createCourse(my_details, courseDetails);

            res.status(response.status).json(response.data.msg);
        } catch(err) {
            throw err;
        }
    }

    getStudents = async (req, res) => {
        try {
            const my_details = req.user;
            const {0: examId} = req.query
            // console.log(examId)
            const response = await examinerHandler.getStudents(my_details, examId);

            res.status(response.status).json({...response.data});

        } catch (err) {
            throw err;
        }
    }

    assignStudents = async (req, res) => {
        try {
            const my_details = req.user;
            const {0: examId} = req.query
            // const payload = req.body;
            const { selectedStudents } = req.body;

            const response = await examinerHandler.assignStudents(my_details, examId, selectedStudents);

            res.status(response.status).json({...response.data});

        } catch (err) {
            throw err;
        }
    }

    viewAssignedStudents = async (req, res) => {
        try {
            const { examId } = req.params;

            const response = await examinerHandler.viewAssignedStudents(examId);

            res.status(response.status).json({...response.data})
        } catch (err) {
            throw err;
        }
    }
}

module.exports = new Examiner()