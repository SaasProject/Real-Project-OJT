var config = require('config.json');
var express = require('express');
var nodemailer = require('nodemailer');
var router = express.Router();
var accessService = require('services/access.service');
 
// routes
router.post('/saverole', saveRole);
router.post('/saveaccess', saveAccess);
router.get('/getrole', getRole);
router.get('/getaccess', getAccess);

 
module.exports = router;


/*
    Function name: Save Role
    Author(s): Bobiles, Rother Jon
    Date Modified: 2018/04/20
    Description: Saves the role from the user
    Parameter(s): none
    Return: none
*/
function saveRole(req, res) {
    accessService.saveRole(req)
    .then(function(){
        res.sendStatus(200);
    })
    .catch(function (err) {
        res.status(400).send(err);
    });
}

/*
    Function name: Save Access
    Author(s): Bobiles, Rother Jon
    Date Modified: 2018/04/20
    Description: Base on the role, will save the specific access
    Parameter(s): none
    Return: none
*/
function saveAccess(req, res) {
    accessService.saveAccess(req)
    .then(function(){
        res.sendStatus(200);
    })
    .catch(function (err) {
        res.status(400).send(err);
    });
}

/*
    Function name: Get Role
    Author(s): Bobiles, Rother Jon
    Date Modified: 2018/04/20
    Description: Gets the Roles from the collection
    Parameter(s): none
    Return: none
*/
function getRole(req, res) {
    accessService.getRoles().then(function(roles){
        if(assets){
            res.send(roles);
        }
        else{
            res.send(404);
        }
    }).catch(function(err){
        res.status(400).send(err);
    });
}

/*
    Function name: Get Role Access
    Author(s): Bobiles, Rother Jon
    Date Modified: 2018/04/20
    Description: Gets the access right based on the role
    Parameter(s): none
    Return: none
*/
function getAccess(req, res) {

}