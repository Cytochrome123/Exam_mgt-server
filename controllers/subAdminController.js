const { subAdminHandler } = require('../handlers');

const subAdmin = {
    getMyExaminersData: async (req, res) => {
        try {
			let my_details = req.user;
			console.log(my_details);
			
			const response = await subAdminHandler.getMyExaminersData(my_details);
			// new Error("No user found");

			const fullData = { msg: response.msg, ...response.data}
			res.status(response.status).json(fullData);

        } catch (err) {
            throw err;
        }
    },

	requestNewExaminer: async (req, res) => {
		try {
			let my_details = req.user;
			console.log(my_details)
			let examinerDetails = req.body;

			let response = await subAdminHandler.requestNewExaminer(my_details, examinerDetails);

			res.status(response.status).json({...response.data})
		} catch (err) {
			throw err;
		}
	},

	removeExaminer: async (req, res)=> {
		try {
			let removalId = req.params;
			console.log(removalId);

			let response = await subAdminHandler.removeExaminer(removalId);

			res.status(response.status).send(response.data);
		} catch (err) {
			throw err;
		}
	},

	getStudents: async (req, res) => {
		try {
			const my_details = req.user;
			// console.log(my_details);
			let response =  await subAdminHandler.getStudents(my_details);

			res.status(response.status).json(response.data);
		} catch (err) {
			throw err;
		}
	},

	viewStudent: async (req,res) => {
		try {
			const payload = req.params;
			console.log(payload)

			const response = await subAdminHandler.viewStudent(payload);

			res.status(response.status).json(response.data);
		} catch (err) {
			throw err;
		}
	},

	addNewStudent: async (req, res) => {
		try {
			console.log('adding')
			const my_details = req.user;
			const student_details = req.body;
			console.log(student_details)

			const response = await subAdminHandler.addNewStudent(my_details, student_details);

			res.status(response.status).json(response.msg);
		} catch (err) {
			throw err;
		}
	},

	updateStudent: async (req, res) => {
		try {
			const payload = req.params;
			const updateDetails = req.body;

			const response = await subAdminHandler.updateStudent( payload, updateDetails );

			res.status(response.status).json(response.msg);
		} catch(err) {
			throw err;
		}
	},

	removeStudent: async (req, res) => {
		try {
			const payload = req.params;

			const response = await subAdminHandler.removeStudent(payload);

			res.status(response.status).json(response.data.msg);
		} catch(err) {
			throw err;
		}
	}
}

module.exports = subAdmin;