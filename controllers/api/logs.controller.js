var config = require('config.json');
var express = require('express');
var nodemailer = require('nodemailer');
var router = express.Router();
var logsService = require('services/logs.service');
 
// routes
router.get('/all', getAllLogs);

module.exports = router;



function getAllLogs(req, res) {
   
    logsService.getAll(req.user.sub)
        .then(function (logs) {
            if (logs) {
                res.send(logs);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
 