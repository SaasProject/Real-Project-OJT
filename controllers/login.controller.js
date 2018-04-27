var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('config.json');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, {native_parser: true});
db.bind('language');
db.bind('warehouses');
db.bind('assets');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var nodemailer = require('nodemailer');
var fs=require('fs');

function getWarehouses(){
    var wh = [];
        db.warehouses.find({}, {name: 1, quantity: 1, capacity: 1}).toArray(function(err, warehouses){
        if(err) return err;
        else{ 
            wh = warehouses;
        }
    });
        return wh;
}

function getAssets(){
    var asset = [];
    db.assets.find({}, {asset_tag:1, updated_date: 1, location: 1}).toArray(function(err, assets){
        if(err) return err;
        else{
            asset = assets;
        }
    });
    return asset;
}

function getEnglish(){
    var file=fs.readFileSync(__dirname + '/../languages/english.json', 'utf8');
    var languages=JSON.parse(file);
    return languages;
}

function addToLogs(){
    var warehouseData = [];
    var assetsData = [];
    warehouseData = getWarehouses();
    assetsData = getAssets();
    console.log(warehouseData);
    console.log(assetsData);
}

function getNihongo(){
    var file=fs.readFileSync(__dirname + '/../languages/nihongo.json', 'utf8');
    var languages=JSON.parse(file);
    return languages;
}
 
router.get('/', function (req, res) {
    MongoClient.connect(url, function(err, db) {
        var number1;
        if (err) throw err;
        var dbo = db.db("SaasDatabaseRealProj");
        dbo.collection("users").count(function(err, result) {
            if (err){
                number1 = 0;
            }
            else{
                number1 = result;
            }
            if(number1 == 0){
                return res.redirect('register');
            }
            console.log(number1);
        });
    });
    db.language.findOne({ name: 'defaultLanguage' }, function (err, results) {
        if (err) res.json({message: err});

        if (results) {
            // log user out
            delete req.session.token;
            delete req.session.user;

            var selectedLanguage = getEnglish().english;
            if(results.value == 'nihongo'){
                selectedLanguage = getNihongo().nihongo;
            }
         
            // move success message into local variable so it only appears once (single read)
            var viewData = { success: req.session.success, languages: selectedLanguage};
            delete req.session.success;
            
            
            if(req.query.expired){
                return res.render('login', {error: 'Your session has expired'});
            }
            else{
                addToLogs();
                //success
                return res.render('login', viewData);
            }
        } else {
            //not found
            res.json({message: 'Error no default language is found'});
        }
    });
});
 
router.post('/', function (req, res) {
    db.language.findOne({ name: 'defaultLanguage' }, function (err, results) {
        if (err) res.json({message: err});

        if (results) {
            var selectedLanguage = getEnglish().english;
            if(results.value == 'nihongo'){
                selectedLanguage = getNihongo().nihongo;
            }

            //start
            if (req.body.formType == 'login'){
                // authenticate using api to maintain clean separation between layers
                request.post({
                    url: config.apiUrl + '/users/authenticate',
                    form: req.body,
                    json: true
                }, function (error, response, body) {
                    if (error) {
                        return res.render('login', { error: 'An error occurred' });
                    }
            
                    if (!body.token) {
                        return res.render('login', { error: selectedLanguage.loginPage.flash.wrongEmailPass, email: req.body.email, forgotPassEmail: req.body.email, languages: selectedLanguage});
                    }
            
                    // save JWT token in the session to make it available to the angular app
                    req.session.token = body.token.token;
                    req.session.user = body.token.user;
                    // redirect to returnUrl
                    var returnUrl = req.query.returnUrl && decodeURIComponent(req.query.returnUrl) || '/';
                    console.log(returnUrl);
                    res.redirect(returnUrl);
                });
            }
            else {
                var crypto = require("crypto");
                var tempPass = crypto.randomBytes(4).toString('hex');
                req.body.tempPass = tempPass;
            
                // authenticate using api to maintain clean separation between layers
                request.post({
                    url: config.apiUrl + '/users/emailOn',
                    form: req.body,
                    json: true
                }, function (error, response, body) {
                    if (error) {
                        return res.render('login', { error: 'An error occurred' });
                    }
             
                    if (!response.body) {
                        return res.render('login', { error: selectedLanguage.loginPage.flash.emailNotReg, email: req.body.email, modal: true, languages: selectedLanguage });
                    }
            
                   sendingMail(response.body) ;
            
                    // return to login page with success message
                    req.session.success = selectedLanguage.loginPage.flash.emailSent;
             
                    // redirect to returnUrl
                    var returnUrl = req.query.returnUrl && decodeURIComponent(req.query.returnUrl) || '/';
                    res.redirect(returnUrl);
            
            
            
                    //sending the email
                    function sendingMail(temp){
                        const output = `
                            <p>This mail is sent to recover your account</p>
                            <h3> Account Details</h3>
                            <ul>
                                <li>Email: ${req.body.email}</li>
                                <li>New Password: ${temp}</li>
                            </ul>
                            <h3>Message</h3>
                            <p>Please change your password to your convenience.</p>
                        `;
                    
                        // create reusable transporter object using the default SMTP transport
                        let transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: 'saasteamaws@gmail.com', // generated ethereal user
                                pass: '12angDum^^y'  // generated ethereal password
                            }
                        });
                    
                        // setup email data with unicode symbols
                        let mailOptions = {
                            from: '"SaaS Team 👻" <saasteamaws@gmail.com>', // sender address
                            to: req.body.email, // list of receivers
                            subject: 'Recover Account', // Subject line
                            text: 'Your Password Request Recovery', // plain text body
                            html: output // html body
                        };
                    
                        // send mail with defined transport object
                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                return console.log(error);
                            }
                        });
                    }
            
                });
            }
            //end
        } else {
            //not found
            res.json({message: 'Error no default language is found'});
        }
    });
    
});

 
module.exports = router;