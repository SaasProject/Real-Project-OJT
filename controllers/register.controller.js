var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('config.json');

var fs=require('fs');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, {native_parser: true});
db.bind('language');
db.bind('access');
db.bind('fields');
var language = getEnglish().english;
var roles = [];
var selectedLanguage;



function getEnglish(){
    var file=fs.readFileSync(__dirname + '/../languages/english.json', 'utf8');
    var languages=JSON.parse(file);
    return languages;
}

function getNihongo(){
    var file=fs.readFileSync(__dirname + '/../languages/nihongo.json', 'utf8');
    var languages=JSON.parse(file);
    return languages;
}

function checkIfAvailable(requestList){
    var splitted = requestList.split(',');
        for(var i = 0; i < splitted.length; i++){
            for(var x = 0; x < roles.length; x ++){
                if(splitted[i].toLowerCase() == roles[x].type.toLowerCase()){
                    return true;
                }
                    
            }
        }

}


router.get('/', function (req, res) {

    db.access.find({}, {_id: 0, type: 1}).toArray(function(err, rolesList){
        if (err){
            res.json({message: err});
        }else{
            roles = rolesList;
        }
    });
    db.language.findOne({ name: 'defaultLanguage' }, function (err, results) {
        if (err) res.json({message: err});

        if (results) {
            language = getEnglish().english;
            if(results.value == 'nihongo'){
                language = getNihongo().nihongo;
            }
        }
    });
    res.render('register', {next:0, languages:language, role: roles});
});

 
router.post('/', function (req, res, next){

//-------------------------------------------------------------------------------------------------------


    if(req.body.formType == 'registeruser'){
        request.post({
            url: config.apiUrl + '/users/register',
            form: {
                role: req.body.role,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                setLanguage: req.body.language,
                password: req.body.password
            },
            json: true
        }, function (error, response, body) {
            if (error) {
                return res.render('register', {next: 1, error: 'An error occurred', languages: language });
            }
     
            if (response.statusCode !== 200) {
                return res.render('register', {
                    error: 'Error: Invalid E-mail Address',
                    role: req.body.role,
                    email: req.body.email,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    languages: language,
                    next : 1
                });
            }

            // return to login page with success message
            req.session.success = 'Registration successful';
            return res.render('register',{next: 2, languages: language, role: []});
        });
    }

//-------------------------------------------------------------------------------------------------------

    else if(req.body.formType == 'languageselect'){
        request.post({
            url: config.apiUrl + '/languages/saveDefaultLanguage',
            form: req.body,
            json: true
        }, function (error, response, body) {
            if(req.body.option == 'nihongo') language = getNihongo().nihongo;
            else language = getEnglish().english;
            if (error) {
                console.log(error);
                return res.render('register', { error: 'An error occurred' , languages:language, role: roles });
            }
     
            if (response.statusCode !== 200) {
                return res.render('register', {next: 0, error: "Error", languages:language , role: roles});
            }

            
            return res.render('register.ejs',{next: 1, languages:language, role: roles, chosenLanguage: req.body.option});
            
        });

    }
    
//-------------------------------------------------------------------------------------------------------

    else if(req.body.formType == 'addRole'){
        if(req.body.roles == ''){
            return res.render('register.ejs',{next: 2, error: 'No Role/s Added', languages:language, role: []});
        }else if(checkIfAvailable(req.body.roles)){
            return res.render('register.ejs',{next: 2, error: 'Role Already Available', languages:language, role: []});
        }else{
            var split = req.body.roles.split(',');
            var body = "";
            for(var i = 0; i < split.length; i++){
                if(i == split.length - 1){
                    body += '{"type":"'+split[i]+'"}';
                }else{
                   body += '{"type":"'+split[i]+'"},'; 
                }   
            }
    
            request.post({
                url: config.apiUrl + '/access/saverole',
                form: {
                    query: body
                },
                json: true
            }, function(error, response, body){
                if(error) console.log(error);
                if(response.statusCode !== 200){
                    console.log(response.statusCode);
                }
                db.access.find({}).toArray(function(err, accessroles){
                    if(err) deferred.reject(err);
                    if(accessroles.length > 0) {
                        accessroles.splice(0,2);
                        roles = accessroles;
                        res.render('register.ejs',{next: 2, languages:language, role: accessroles});
                    }
                    else{
                        res.render('register.ejs',{next: 2, languages:language, role: []});
                    }
                });
            });
        }
    }
    
//-------------------------------------------------------------------------------------------------------

    else if(req.body.formType == 'addAccess'){
        var body = "";
        var arrayType = [], arrayAccess = [], newType = [];
        arrayType = req.body.type;
        //Checks if the user clicked only one type
        if(typeof arrayType == 'string'){
            newType.push(arrayType);
        }
        //Checks if the user clicked anything
        else if(!arrayType){ 
            return res.render('register.ejs',{next: 3, languages:language, role: roles});
        }
        //Multiple Accesses per Role
        else{
            for(var i = 0; i < arrayType.length; i++){
                var name = arrayType[i];
                if(req.body[name]){
                    newType.push(name);   
                }
            }
        }

        for(var i = 0; i < newType.length; i++){
            var name = newType[i];
            if(i == newType.length - 1){
                body += '{"type":"'+name+'", "access":"'+req.body[name]+'"}';
            }else{
                body += '{"type":"'+name+'", "access":"'+req.body[name]+'"}+';
            }
        }
        request.post({
            url: config.apiUrl + '/access/saveaccess',
            form: {
                query: body
            },
            json: true
        }, function(error, response, body){
            if(error) console.log(error);
            if(response.statusCode !== 200){
                console.log(response.statusCode);
            }
            db.access.find({}).toArray(function(err, accessroles){
                if(err) deferred.reject(err);
                else{
                    res.render('register.ejs',{next: 3, languages:language, role: roles});
                }
            });
        });
    }

//-------------------------------------------------------------------------------------------------------

    else if(req.body.formType == 'success'){
        res.redirect('login');
    }
});
 
module.exports = router;