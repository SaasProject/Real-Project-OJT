/*
    Name: Home Controller
    Date Created: ??/??/2018
    Author(s):
               Omugtong, Jano
               Reccion, Jeremy
    
 */

(function () {
    'use strict';
 
    angular
        .module('app')
        .controller('Home.IndexController', Controller);
 
     function Controller($window, AssetService, $scope, $interval, $filter, socket, WarehouseService, LogsService, FieldsService) {
 
        //initialization
        $scope.assets = [];
        $scope.warehouses = [];
        
        $scope.myData=[1,4,5,5,10,9,19,10,18];
        
        $scope.current_warehouse = {};
        var isModalOpened = false;
        
		$scope.loading = true;
        
        // function to convert object to array
        Object.size = function(obj) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        };
        
        $scope.name = 'user';
      function getLogs(){
            LogsService.getAllLogs($scope.name).then(function(response){
                
               console.log(response);
               $scope.logss = response;
                
            }).catch(function(err){
                alert(err.msg_error);
            });
        }
        getLogs();


        function getAssetType(asset_types){
            var a_type = asset_types;
            AssetService.GetAll().then(function(assets){

                
                if(assets.length > 0){               
                        //store to array
                    a_type = a_type.replace(/\s/g,'');
                    $scope.assets = assets;
                    $scope.assets_types = asset_types;
                    var types = a_type.split(',');
                    $scope.assetsLength = Object.size(assets);
                    $scope.assetsTypeQuantityLength = Object.size(asset_types);
                    console.log(types);
                    $scope.quantityOfAssetTypes= [];
                    $scope.types = [];
                    var count = 0;
                    
                    var typeCount = 0;
                    var container ="";
                    var numberOfAssetTypes =1;
                    var typeQuantity = 0;
                    var assetCount = 0;
                     $scope.myJson = {
                        type: "pie",
                        title: {
                          textAlign: 'center',
                          text: "Types of Assets",
                          fontSize: 15,
                          fontStyle: 'normal',
                          fontFamily: "Verdana",
                          fontWeight: "100"

                        },
                        legend:{
                        },
                        series: []
                      };

                      console.log($scope.myJson);  
                        //get all asset types
                    for (var typeCount = 0; typeCount < types.length; typeCount++){
                         typeQuantity = 0;
                        for (assetCount = 0; assetCount < $scope.assetsLength; assetCount++){
                                if (types[typeCount] == $scope.assets[assetCount].type){
                                    typeQuantity += 1;
                                }       
                        }
                        $scope.quantityOfAssetTypes[typeCount] = typeQuantity;

                        console.log(types[typeCount]);
                        $scope.myJson['series'].push({values:[$scope.quantityOfAssetTypes[typeCount]],text: types[typeCount]});
                    }
                    console.log($scope.myJson);
                        
                }                                          
                              
            }).catch(function(err){
                alert(err.msg_error);
            });
        }
        getAssetType();

        /*
            Author: Jano, Jeremy
			Function name: getAllWHInfo
			Date modified: 2-13-2018
			Description: get all warehouse data for dashboard
		*/
        $scope.current_warehouse;
		function getAllWHInfo() {
            WarehouseService.getAllWarehouse().then(function (warehouse) {
                $scope.warehouses = warehouse;
                $scope.warehouseLength = Object.size(warehouse);
                
                //loop warehouse
                for (var warehouseQnty = 0; warehouseQnty<$scope.warehouseLength; warehouseQnty++){
                    $scope.warehouses[warehouseQnty].quantity = 0;
                    $scope.warehouses[warehouseQnty].color = "green";
                    $scope.warehouses[warehouseQnty].icon = "glyphicon-ok-sign";
                }

                //get all assets
                AssetService.GetAll().then(function(assets){
                    if(assets.length > 0){               
                        //store to array
                        $scope.assets = assets;
                        $scope.assetsLength = Object.size(assets);

                    
                        //loop warehouse
                        for (var warehouseQnty = 0; warehouseQnty<$scope.warehouseLength; warehouseQnty++){
                            var quantity = 0;
                            var color = "green";
                            var icon = "glyphicon-ok-sign";

                            //NOTE: can use $filter to search assets on a specific warehouse 

                            //loop assets then filter by warehouse
                            for (var assetCount = 0; assetCount<$scope.assetsLength; assetCount++){
                                if ($scope.assets[assetCount].location == $scope.warehouses[warehouseQnty].name){
                                    quantity++;
                                }
                            }
                            //check percentage
                            if (quantity > ($scope.warehouses[warehouseQnty].capacity)){
                                color = "red";
                                icon = "glyphicon-remove-sign";
                            }
                            else if (quantity >= ($scope.warehouses[warehouseQnty].capacity * 0.90)){
                                color = "orangered";
                                icon = "glyphicon-exclamation-sign";
                            }
                            else if (quantity >= ($scope.warehouses[warehouseQnty].capacity * 0.80)){
                                color = "orange";
                                icon = "glyphicon-exclamation-sign";
                            }
                            //assign new value
                            $scope.warehouses[warehouseQnty].quantity = quantity;
                            $scope.warehouses[warehouseQnty].color = color;
                            $scope.warehouses[warehouseQnty].icon = icon;
                        }

                        //perform these only when a modal is opened
                        if(isModalOpened){
                            //update the warehouse for the icon change. since $eval returns an array, and it is assumed that there are no duplicates, get the first element
                            $scope.current_warehouse = $scope.$eval('warehouses | filter: current_warehouse.name')[0];
                            console.log($scope.current_warehouse);
                            
                            getAssetsByWarehouse();
                        }
                    }
                })
            }).catch(function(error){
                FlashService.Error(error);
            }).finally(function() {
				$scope.loading = false;
			});
        }
        getAllWHInfo();

       

       

        /*
            Function name: Get all assets
            Author(s): 
                        Omugtong, Jano
                        Reccion, Jeremy
            Date Modified: 02/26/2018
            Description: Gets all asset whenever an asset is updated
            Parameter(s): none
            Return: none
        */
        function getAssetUpdate(){
            //get all assets
            AssetService.GetAll().then(function(assets){
                if(assets.length > 0){               
                    //store to array
                    $scope.assets = assets;
                    $scope.assetsLength = Object.size(assets);

                    //loop warehouse
                    for (var warehouseQnty = 0; warehouseQnty<$scope.warehouseLength; warehouseQnty++){
                        var quantity = 0;
                        var color = "green";
                        var icon = "glyphicon-ok-sign";

                        //NOTE: can use $filter to search assets on a specific warehouse 

                        //loop assets then filter by warehouse
                        for (var assetCount = 0; assetCount<$scope.assetsLength; assetCount++){
                            if ($scope.assets[assetCount].location == $scope.warehouses[warehouseQnty].name){
                                quantity++;
                            }
                        }
                        //check percentage
                        if (quantity > ($scope.warehouses[warehouseQnty].capacity)){
                            color = "red";
                            icon = "glyphicon-remove-sign";
                        }
                        else if (quantity >= ($scope.warehouses[warehouseQnty].capacity * 0.90)){
                            color = "orangered";
                            icon = "glyphicon-exclamation-sign";
                        }
                        else if (quantity >= ($scope.warehouses[warehouseQnty].capacity * 0.80)){
                            color = "orange";
                            icon = "glyphicon-exclamation-sign";
                        }
                        //assign new value
                        $scope.warehouses[warehouseQnty].quantity = quantity;
                        $scope.warehouses[warehouseQnty].color = color;
                        $scope.warehouses[warehouseQnty].icon = icon;
                    }

                    //perform this only when a modal is opened
                    if(isModalOpened){
                        //update the warehouse for the icon change. since $eval returns an array, and it is assumed that there are no duplicates, get the first element
                        $scope.current_warehouse = $scope.$eval('warehouses | filter: current_warehouse.name')[0];
                        getAssetsByWarehouse();
                    }
                }
            }).catch(function(error){
                FlashService.Error(error);
            })
        };


        // get realtime changes
        socket.on('assetChange', function(){
            getAssetUpdate();
        });
        socket.on('whouseChange', function(){
            getAllWHInfo();
        });

        /*
            Function name: Open Modal
            Author(s): Reccion, Jeremy
            Date Modified: 02/26/2018
            Description: prepare parameters for information in modal
            Parameter(s): none
            Return: none
        */
        //set variables globally in order to be used in 'assetChange' event
        $scope.openModal = function(warehouse){
            $scope.current_warehouse = warehouse;
            //console.log($scope.current_warehouse.icon);
            isModalOpened = true;
            getAssetsByWarehouse();
        };

        //reset variables just to be sure
        $scope.closeModal = function(){
            $scope.current_warehouse = {};
            isModalOpened = false;
        };

        /*
            Function name: Warehouse Modal information
            Author(s): Reccion, Jeremy
            Date Modified: 03/13/2018
            Description: Gets assets per warehouse then determine other information
            Parameter(s): none
            Return: none
        */

        //run this ALSO inside 'assetChange' event for real time update
        function getAssetsByWarehouse(){
            $scope.myJson = ("[{}]");
            //console.log($scope.current_warehouse);
            //
            //getAllAssets();
            //filter by warehouse and updated_date (desc)
            $scope.latest_assets = $scope.$eval("assets | filter: current_warehouse.name | orderBy: '-updated_date'");
            //console.log($scope.latest_assets);

            //get number of assets in warehouse
            $scope.current_warehouse.quantity = $scope.latest_assets.length;
            //console.log($scope.current_warehouse.quantity);

            //get asset types
            $scope.current_warehouse.asset_types = $scope.latest_assets.map(function(x){
                //assuming 'type' is a default field
                return x['type'];
            });

            //remove duplicates and null values, convert array to string, and append spaces after commas
            $scope.current_warehouse.asset_types = $scope.current_warehouse.asset_types.filter(function(value, index, self){
                return (self.indexOf(value) == index && value != null && value != '');
            }).sort().toString().replace(/,/g, ', ');
            //console.log($scope.current_warehouse.asset_types);

            getAssetType($scope.current_warehouse.asset_types);
            //display only the first 5 elements
            $scope.latest_assets = $scope.latest_assets.slice(0, 5);
            //console.log($scope.latest_assets);            
        };
    };

})();