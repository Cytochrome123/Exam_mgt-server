const express = require('express');
const passport = require('passport');

const { studentController } = require('../controllers');

module.exports = () => {
    const router = express.Router();

    router.get('/exams', passport.authenticate('jwt'), studentController.getExams);
    router.get('/exam/:id/:subject/question', passport.authenticate('jwt'), studentController.getExamQuestion);
    router.post('/exam/:id/:subject/question', passport.authenticate('jwt'), studentController.saveAnswer);
    router.put('/exam/:id/submit', passport.authenticate('jwt'), studentController.submitExam);
    
    return router;
}