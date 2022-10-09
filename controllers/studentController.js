const { studentHandler } = require("../handlers");

const student = {
    getStudents: async (req, res) => {
        try {
            const my_details = req.user;
            const {0: examId} = req.query
            // console.log(examId)
            const response = await studentHandler.getStudents(my_details, examId);

            res.status(response.status).json({...response.data});

        } catch (err) {
            throw err;
        }
    },

    assignStudents: async (req, res) => {
        try {
            const my_details = req.user;
            const {0: examId} = req.query
            // const payload = req.body;
            const { selectedStudents } = req.body;

            const response = await studentHandler.assignStudents(my_details, examId, selectedStudents);

            res.status(response.status).json({...response.data});

        } catch (err) {
            throw err;
        }
    },

    viewAssignedStudents: async (req, res) => {
        try {
            const { examId } = req.params;

            const response = await studentHandler.viewAssignedStudents(examId);

            res.status(response.status).json({...response.data})
        } catch (err) {
            throw err;
        }
    }
}

module.exports = student