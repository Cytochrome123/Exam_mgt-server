const express = require('express');
const passport = require('passport');

const { subAdminController } = require('../controllers');
// const { autM } = require('../auth');

module.exports = () => {
    const router = express.Router();

    // router.get('/examiners', passport.authenticate('jwt'), subAdminController.getMyExaminersData);
    // router.get('/examiners', autM, subAdminController.getMyExaminersData);

    router.get('/examiners', passport.authenticate('jwt'), subAdminController.getMyExaminersData);

    router.post('/examiner/new', passport.authenticate('jwt'), subAdminController.requestNewExaminer);
    router.delete('/examiner/:id', passport.authenticate('jwt'), subAdminController.removeExaminer);
    router.get('/students', passport.authenticate('jwt'), subAdminController.getStudents);
    router.get('/student/:id', passport.authenticate('jwt'), subAdminController.viewStudent);
    router.post('/student/new', passport.authenticate('jwt'), subAdminController.addNewStudent);
    router.patch('/student/:id/edit', passport.authenticate('jwt'), subAdminController.updateStudent);
    router.delete('/student/:studentId', passport.authenticate('jwt'), subAdminController.removeStudent);
    
    return router;
}