var express = require('express');
var router = express.Router();
var assetService = require('services/asset.service');

//declare all routes that are to be called from client (angular)
router.get('/getAll', getAllAssets);
router.post('/addAsset', addAsset);
router.put('/:_id', updateAsset);
router.delete('/:_id', deleteAsset);
router.get('/getAssetType', getAssetType);

module.exports = router;
/*
        Function name: get all assets
        Author(s): Reccion, Jeremy
        Date Modified: 02/27/2018
        Description: getter function for retrieving all assets
        Parameter(s):
        Return: none
    */
function getAllAssets(req, res){
    assetService.getAll().then(function(assets){
        //console.log('assets.controller');
        //console.log(assets);
        if(assets){
            res.send(assets);
        }
        else{
            res.send(404);
        }
    }).catch(function(err){
        res.status(400).send(err);
    });
}
/*
        Function name: get all asset types
        Author(s): Ortaleza, Sherine
        Date Modified: 02/27/2018
        Description: getter function for retrieving all asset types
        Parameter(s):
        Return: none
    */
function getAssetType(req, res){
    assetService.getAssetType().then(function(types){
        //console.log('assets.controller');
        console.log(types);
        if(types){
            res.send(types);
        }
        else{
            res.send(404);
        }
    }).catch(function(err){
        res.status(400).send(err);
    });
}


/*
        Function name: add asset
        Author(s): Reccion, Jeremy
        Date Modified: 02/27/2018
        Description: setter function for adding an asset
        Parameter(s): 
        Return: none
    */
function addAsset(req, res){
    assetService.addAsset(req.body).then(function(){

            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
/*
        Function name: update asset
        Author(s): Reccion, Jeremy
        Date Modified: 02/27/2018
        Description: setter function for updating an asset
        Parameter(s): 
        Return: none
    */
function updateAsset(req, res){
    assetService.updateAsset(req.params._id, req.body).then(function(){
        res.sendStatus(200);
    }).catch(function(err){
        res.status(400).send(err);
    });
}
/*
        Function name: delete asset
        Author(s): Reccion, Jeremy
        Date Modified: 02/27/2018
        Description: setter function for deleting an asset
        Parameter(s): 
        Return: none
    */
function deleteAsset(req, res) {
    var assetId = req.params._id
 
 
    assetService.delete(assetId)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}