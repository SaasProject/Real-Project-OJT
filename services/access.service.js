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
    var rolesList = [];

     db.access.find({}, {_id: 0, type : 1}).toArray(function(err, roles){

        if(err) deferred.reject(err);

        if(roles.length > 0) {
            for(var i = 0; i < roles.length; i++){
                rolesList.push(roles[i].type);
            }
            deferred.resolve(rolesList);
        }
        else{
            deferred.resolve([]);
        }
    });
    return deferred.promise;
}

function getAccess(userParam){
    var deferred = Q.defer();
    var types = "";
    var accesses
    types = userParam.query.type;
    db.access.find({type: types},{_id: 0, access: 1}).toArray(function(err, accessList){
        if(err) deferred.reject(err);
        if(accessList[0]){
            accesses = accessList[0].access;
            deferred.resolve(accesses);
        }
        else{
            deferred.resolve([]);
        } 

    });
    return deferred.promise;
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
    var obj = [];
    var valid = true;
    var types = req.body.query.split('+');
    for(var i = 0; i < types.length  && valid != false; i++){
        var accesses = [];
        var parsed = JSON.parse(types[i]);
        var splitted = parsed.access.split(',');
        for(var x = 0; x < splitted.length; x++){
            accesses.push(splitted[x]);
        }
        db.access.updateOne({type: parsed.type}, {$set: {access: accesses}}, function(err, req, res){
            if(err) valid = false;
            else valid = true;
        });
    }
    if(valid) deferred.reject();
    else deferred.resolve([]);
    return deferred.promise;
}

