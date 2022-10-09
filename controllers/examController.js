const { examHandler } = require('../handlers');


class Exam {
    getAllExams = async (req, res) => {
        try {
            let my_details = req.user;

            const response = await examHandler.getAllExams(my_details)

            res.status(response.status).json({...response.data});
        } catch (err) {
            throw err;
        }
    };

    createExam = async (req, res) => {
        try {
            const my_details = req.user;
            const examDetails = req.body;

            const response = await examHandler.createExam(my_details, examDetails);

            res.status(response.status).json(response.data);
        } catch(err) {
            throw err;
        }
    };

    viewExam = async (req, res) => {
        try {
            const my_details = req.user;
            const { examId } = req.params;

            const response = await examHandler.viewExam(my_details, examId);
            
        } catch (err) {
            throw err;
        }
    };

    updateExam = async (req, res) => {
        try {
            const { examId } = req.params;
            const updateDetails = req.body;

            const response = await examHandler.updateExam(examId, updateDetails);

            res.status(response.status).json(response.data.msg)
        } catch (err) {
            throw err;
        }
    };

    deleteExam = async (req, res) => {
        try {
            const { examId } = req.params;

            const response = await examHandler.deleteExam(examId);

            res.status(response.status).json(response.data.msg);
        } catch(err) {
            throw err;
        }
    }

    getExamQuestionDetails
}


module.exports = new Exam()