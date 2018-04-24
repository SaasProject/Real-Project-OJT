var config = require('config.json');
var Q = require('q');
var _ = require('lodash');
//var mongoose = require('mongoose');
//var Device = mongoose.model('Device');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('access');

var service = {};

service.getRoles = getRoles;
service.getAccess = getAccess;
service.saveRole = saveRole;
service.saveAccess = saveAccess;


module.exports = service;

function getRoles(){
    var deferred = Q.defer();

    db.access.find({}).toArray(function(err, roles){

        if(err) deferred.reject(err);

        if(assets.length > 0) {
            deferred.resolve(roles);
        }
        else{
            deferred.resolve([]);
        }
    });
}

function getAccess(){
    var deferred = Q.defer();

    db.access.find({}).toArray(function(err, types){

        if(err) deferred.reject(err);

        if(assets.length > 0) {
            deferred.resolve(types);
        }
        else{
            deferred.resolve([]);
        }
    });
}

function saveRole(req){
    var deferred = Q.defer();
    var obj = [];
    var split = req.body.query.split(',');

    for(var i = 0; i < split.length; i++){
        var parsed = JSON.parse(split[i]);
        obj.push(parsed);
    }

    console.log(obj);


    db.access.insertMany(obj, function(err, req, res){
        if(err) {
            console.log(err);
            deferred.reject(err);
        }

        deferred.resolve([]);
    });
    return deferred.promise;
}

function saveAccess(req){
    var deferred = Q.defer();
    console.log(req.body.type[0]);
    // db.access.updateOne({type: req.type}, {$set: {access: req.access}}, function(req, res){
    //     if(err) deferred.reject(err);
    //     deferred.resolve(res);
    // });
    return deferred.promise;
}

