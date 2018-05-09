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

<<<<<<< HEAD
=======
    
>>>>>>> 44175839f6f808862f796bc5e74a939d42e7757a
    db.logs.insert(req, function(err){
        if (err) deferred.reject(err);
        deferred.resolve();

        return deferred.promise;
    });
    return deferred.promise;
 }
<<<<<<< HEAD

function deleteAll(req, res){
    var deferred = Q.defer();
    
    return deferred.promise;

    db.logs.remove({},
        function (err) {
            if (err) deferred.reject(err);
 
            deferred.resolve();
        });
 
    return deferred.promise;
}

=======
>>>>>>> 44175839f6f808862f796bc5e74a939d42e7757a
