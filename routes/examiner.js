const express = require('express');
const passport = require('passport');

const { examinerController, examController, questionController, studentController } = require('../controllers')
// const { autM } = require('../auth');

module.exports = () => {
    const router = express.Router();

    router.get('/default-courses', passport.authenticate('jwt'), examinerController.loadDefaultCourses);
    router.get('/course', passport.authenticate('jwt'), examinerController.getCourses);
    router.post('/course', passport.authenticate('jwt'), examinerController.createCourse);

    router.get('/exam', passport.authenticate('jwt'), examController.getAllExams);
    router.post('/exam', passport.authenticate('jwt'), examController.createExam);
    router.get('/exam/:id', passport.authenticate('jwt'), examController.viewExam);
    router.patch('/exam/:id', passport.authenticate('jwt'), examController.updateExam);
    router.delete('/exam/:id', passport.authenticate('jwt'), examController.deleteExam);
    
    router.post('/exam/:examId/question', passport.authenticate('jwt'), questionController.addNewQuestion);
    router.get('/exam/:examId/questions', passport.authenticate('jwt'), questionController.viewExamQuestions);
    router.get('/exam/:examId/question/:id', passport.authenticate('jwt'), questionController.viewEachQuestion);

    // router.get('/students', autM, studentController.getStudents);
    // router.post('/student/assign', autM, studentController.assignStudents);
    // // uodate and delte

    // router.get('/exam/:examId/students', autM, studentController.viewAssignedStudents);

    router.get('/students', passport.authenticate('jwt'), examinerController.getStudents);
    router.post('/student/assign', passport.authenticate('jwt'), examinerController.assignStudents);
    // uodate and delte

    router.get('/exam/:examId/students', passport.authenticate('jwt'), examinerController.viewAssignedStudents);
    // 571758
    return router;
}