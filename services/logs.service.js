var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
var multer = require('multer');
var fs=require('fs');
db.bind('logs');
var fs = require('fs');
var service = {};

//Added by Glenn
service.getAll = getAll;
//added by Sherine
service.insertOverLimit = insertOverLimit;
service.deleteAll = deleteAll;

module.exports = service;


function getAll() {
    var deferred = Q.defer();
 
    //db.users.find({role:  {$ne : "Admin"}}).toArray(function(err, user) {
    db.logs.find({}).toArray(function(err, logs) {
        if (err) deferred.reject(err);
 
        if (logs) {
            // return user (without hashed password)
            deferred.resolve(logs);
        } else {
            // user not found
            deferred.resolve();
        }
    });
    
    return deferred.promise;
    var config = require('config.json');
}


function insertOverLimit(req, res){
    var deferred = Q.defer();

    db.logs.insert(req, function(err){
        if (err) deferred.reject(err);
        deferred.resolve();

        return deferred.promise;
    });
    return deferred.promise;
 }

function deleteAll(req, res){
    var deferred = Q.defer();

    db.logs.remove({},
        function (err) {
            if (err) deferred.reject(err);
 
            deferred.resolve();
        });
 
    return deferred.promise;
}

