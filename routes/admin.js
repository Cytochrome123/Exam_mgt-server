const express = require('express');

const { adminController } = require('../controllers');

module.exports = () => {
    const router = express.Router();

    router.get('/dashboard', adminController.getDashboardDetails);
    router.get('/subAdmin', adminController.getSubAdminData);
    router.get('/examiner', adminController.getExaminerData);
    router.patch('/status', adminController.updateStatus);

    return router;
}