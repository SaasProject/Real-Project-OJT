var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('config.json');

var fs=require('fs');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, {native_parser: true});
db.bind('language');
db.bind('access');
var language = getEnglish().english;
var roles = [];



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

router.get('/', function (req, res) {
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
    // register using api to maintain clean separation between layers
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
                return res.render('register', { error: 'An error occurred', languages: language });
            }
     
            if (response.statusCode !== 200) {
                return res.render('register', {
                    error: response.body,
                    role: req.body.role,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    username: req.body.username, 
                    languages: language
                });
            }

            // return to login page with success message
            req.session.success = 'Registration successful';
            return res.render('register',{next: 2, languages: language, role: roles});
        });
    }else if(req.body.formType == 'languageselect'){
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
                return res.render('register', { error: "Error", languages:language , role: roles});
            }

            
            return res.render('register.ejs',{next: 1, languages:language, role: roles});
            
        });

    }
    else if(req.body.formType == 'addRole'){
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
                    res.render('register.ejs',{next: 2, languages:language, role: roles});
                }
                else{
                    res.render('register.ejs',{next: 2, languages:language, role: roles});
                }
            });
        });
    }
    else if(req.body.formType == 'addAccess'){
        request.post({
            url: config.apiUrl + '/access/saveaccess',
            form: req.body,
            json: true
        }, function (error, response, body) {
            if (error) {
                console.log(error);
            }
            if (response.statusCode !== 200) {

            }
            
            res.render('register.ejs',{next: 1, languages:language, role: roles});
            
        });
        console.log(req.body);
        res.render('register.ejs',{next: 3, languages:language, role: roles});
    }else if(req.body.formType == 'success'){
        res.redirect('login');
    }
});
 
module.exports = router;