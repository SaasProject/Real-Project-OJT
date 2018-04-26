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
        $scope.years = [];
        $scope.current_warehouse = {};
        var isModalOpened = false;
		$scope.loading = true;
        $scope.name = 'user';
        
        // function to convert object to array
        Object.size = function(obj) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        }; 

        

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
            $scope.quantity = [];  
            $scope.capacity = [];
            $scope.myJson = ("[{}]");
            $scope.latest_assets =[];

            //filter by warehouse and updated_date (desc)
            $scope.latest_assets = $scope.$eval("assets | filter: current_warehouse.name | orderBy: '-updated_date'");

            //get all asset dates
             $scope.latest_assets_permonth = $scope.latest_assets.map(function(x){
                return x['updated_date'];
            });

            //get number of assets in warehouse
            $scope.current_warehouse.quantity = $scope.latest_assets.length;

            //get asset types
            $scope.current_warehouse.asset_types = $scope.latest_assets.map(function(x){
                //assuming 'type' is a default field
                return x['type'];
            });

            //get warehouse capacity
            $scope.latest_capacity = $scope.$eval("warehouses | filter: current_warehouse.name");

            //remove duplicates and null values, convert array to string, and append spaces after commas
            $scope.current_warehouse.asset_types = $scope.current_warehouse.asset_types.filter(function(value, index, self){
                return (self.indexOf(value) == index && value != null && value != '');
            }).sort().toString().replace(/,/g, ', ');

            //pass types of assets array to getAssetType method
            getAssetType($scope.current_warehouse.asset_types);

            //pass warehouse capacity and asset dates array to getCapacityAndQuantity method
            getCapacityAndQuantity($scope.latest_assets_permonth, $scope.current_warehouse.capacity);
            //display only the first 5 elements
            $scope.latest_assets = $scope.latest_assets.slice(0, 5);
            //console.log($scope.latest_assets);            
        };

        /*
            Function name: Notifications
            Author(s): Ortaleza, Sherine Marie
            Date Modified: 04/24/2018
            Description: Gets all notification messages from logs collection
            Parameter(s): none
            Return: none
        */

        function getLogs(){
                LogsService.getAllLogs($scope.name).then(function(response){
                $scope.logss = response;
                
            }).catch(function(err){
                alert(err.msg_error);
            });
        }
        getLogs();

        /*
            Function name: Pie Chart
            Author(s): Ortaleza, Sherine Marie
            Date Modified: 04/24/2018
            Description: Gets all current warehouse asset types and transforms information to pie chart
            Parameter(s): none
            Return: none
        */

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
                    $scope.quantityOfAssetTypes= [];
                    $scope.quantityData = [];
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
                            highlightPlot :true,
                            values: {}
                        },
                        series: []
                      };

                        //get all asset types
                    for (var typeCount = 0; typeCount < types.length; typeCount++){
                         typeQuantity = 0;
                        for (assetCount = 0; assetCount < $scope.assetsLength; assetCount++){
                                if (types[typeCount] == $scope.assets[assetCount].type){
                                    typeQuantity += 1;
                                }       
                        }
                        $scope.quantityOfAssetTypes[typeCount] = typeQuantity;
                        $scope.myJson['series'].push({values:[$scope.quantityOfAssetTypes[typeCount]],text: types[typeCount]});
                        $scope.quantityData.push({values:$scope.quantityOfAssetTypes[typeCount],text: types[typeCount]});
                    }
                }                                          
                              
            }).catch(function(err){
                alert(err.msg_error);
            });
        }

        /*
            Function name: Line Chart
            Author(s): Ortaleza, Sherine Marie
            Date Modified: 04/24/2018
            Description: Gets  information of assets from current warehouse and creates line chart with filters
            Parameter(s): none
            Return: none
        */

        function getCapacityAndQuantity(pm_warehouse, c_warehouse){
            var monthQuantity = 0;
            var containerYear = 0;
            var yearQuantity =0;
            var date = "";
            var month ="";
            var year =0;
            var qtyPerMonth = [];
            var years = [];
            var qtyPerYear = [];
            var toYear = "";
            var fromYear = "";
            var monthNameList = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            var rangeOfYears = [];
            $scope.quantity = [];  
            $scope.capacity = [];
            $scope.ngShowYearly = false;
            $scope.ngShowMonthly = false;
            $scope.cp_warehouse  = c_warehouse;
            $scope.pmm_warehouse = pm_warehouse;
            var myConfig = {  
            type: 'line',
            title: {
                  textAlign: 'center',
                  fontSize: 20,
                  fontStyle: 'normal',
                  fontFamily: "Verdana",
                  fontWeight: "100"
            },

            legend:{
                layout: "float",
                backgroundColor: "none",
                borderWidth: 0,
                shadow: 0,
                paddingTop: 0,
                align:"left"

            },
            series: []
            };

            for(var y=1; y<=12; y++){
                    monthQuantity =0;
                    for(var x=0; x<=pm_warehouse.length; x++){
                        date = new Date(pm_warehouse[x]);
                        month = date.getMonth()+1;
                        year = date.getFullYear();
                        if (month==y && year == (new Date()).getFullYear()){
                            monthQuantity++;
                        }
                    }
                    qtyPerMonth.push(monthQuantity);

                }

                 for (var x = 0; x < monthNameList.length; x++){
                    $scope.quantity.push([monthNameList[x], qtyPerMonth[x]]); 
                }


                for (var x = 0; x < monthNameList.length; x++){
                    $scope.capacity.push([monthNameList[x], parseInt($scope.cp_warehouse)]); 
                }
            
                myConfig['series'].push({values:$scope.quantity,text: 'Quantity'});
                myConfig['series'].push({values:$scope.capacity,text: 'Capacity'});
                myConfig['title'].text= "Quantity and Capacity per Month of Current Year";
                zingchart.render({
                id: 'chart-div',
                data: myConfig
            });      

            //get distinct years
            for(var x=0; x<pm_warehouse.length; x++){
                    date = new Date(pm_warehouse[x]);
                    year = date.getFullYear();
                    if (year!=containerYear){
                        years.push(year);
                    }
                    containerYear = year;
            }
            $scope.years = years;

             
            $scope.filterData = {
            availableOptions: [
              {id: '1', name: 'Monthly'},
              {id: '2', name: 'Yearly'}
            ]
            };

            var myNewLine = {  
            type: 'line',
            title: {
                  textAlign: 'center',
                  fontSize: 20,
                  fontStyle: 'normal',
                  fontFamily: "Verdana",
                  fontWeight: "100"
            },

            legend:{
                layout: "float",
                backgroundColor: "none",
                borderWidth: 0,
                shadow: 0,
                paddingTop: 0,
                align:"left"

            },
            series: [
            {
                values: $scope.quantity,
                text: 'Quantity'
              },
              {
                values: $scope.capacity,
                text: 'Capacity'
              }
              ]
            };
            
            $scope.ShowDiv = function(x) {

                    if( x == 1){
                        $scope.ngShowYearly = false;
                        $scope.ngShowMonthly = true;                      
                        $scope.getYear = function(yy){
                        getQuantityOfYearMonthly(yy);
                    }
                       
                    } else{
                        $scope.ngShowYearly = true;
                        $scope.ngShowtoYear = false;
                        $scope.ngShowMonthly = false;
                        $scope.getFromYear= function(fromYearSelected){
                            fromYear = fromYearSelected;
                            console.log(fromYear);
                            $scope.ngShowtoYear = true;
                        }

                        $scope.getToYear= function(toYearSelected){
                            toYear = toYearSelected;
                            console.log(toYear);
                            if(fromYear < toYear){
                                myConfig['series'] = [];
                                qtyPerYear = [];
                                rangeOfYears = [];
                                $scope.quantity = [];  
                                $scope.capacity = [];
                                $scope.numberOfAssets = $scope.pmm_warehouse.length;
                                getQuantityPerYear(fromYear, toYear, $scope.pmm_warehouse);

                            }else{
                              alert("Invalid! From Year cannot be more than or equal to To Year. ");
                            }
                            
                        }

                    }
            }; 
            var containerr = 0;
            $scope.numberOfAssets = 0
            $scope.numberOfAssets = $scope.pmm_warehouse.length;
            //console.log($scope.numberOfAssets);

            //get asset quantity per year of the range of year selected
            function getQuantityPerYear(fromY, toY, allAssets){ 
                myConfig['series'] = [];
                qtyPerYear = [];
                rangeOfYears = [];
                $scope.quantity = [];  
                $scope.capacity = [];

                for(var x=0; x<=allAssets.length; x++){
                    date = new Date(allAssets[x]);
                    year = date.getFullYear();
                    if(year >= fromY && year <= toY ) {
                         rangeOfYears.push(year);
                    }
                }   
                console.log(rangeOfYears);

                for(var y = 0; y<=allAssets.length; y++){
                    yearQuantity =0;
                    for(var x=0; x<=pm_warehouse.length; x++){
                        date = new Date(allAssets[x]);
                        year = date.getFullYear();
                        if (year == rangeOfYears[y]){
                            yearQuantity++;
                        }
                    }
                    qtyPerYear.push(yearQuantity);
                }

                 for (var x = 0; x < rangeOfYears.length; x++){
                    $scope.quantity.push([rangeOfYears[x], qtyPerYear[x]]); 
                }


                for (var x = 0; x < rangeOfYears.length; x++){
                    $scope.capacity.push([rangeOfYears[x], parseInt($scope.cp_warehouse)]); 
                }
            
                myConfig['series'].push({values:$scope.quantity,text: 'Quantity'});
                myConfig['series'].push({values:$scope.capacity,text: 'Capacity'});
                myConfig['title'].text= "Quantity and Capacity per Year ";
                zingchart.render({
                id: 'chart-div',
                data: myConfig
            });  
                $scope.ngShowtoYear = false;
            }



            //get asset quantity per month of a certain year selected
            function getQuantityOfYearMonthly(selectedYear){
                myConfig['series'] = [];
                qtyPerMonth = [];
                $scope.quantity = [];  
                $scope.capacity = [];
                

                for(var y=1; y<=12; y++){
                    monthQuantity =0;
                    for(var x=0; x<=pm_warehouse.length; x++){
                        date = new Date(pm_warehouse[x]);
                        month = date.getMonth()+1;
                        year = date.getFullYear();
                        if (month==y && year == selectedYear){
                            monthQuantity++;
                        }
                    }
                    qtyPerMonth.push(monthQuantity);

                }

                 for (var x = 0; x < monthNameList.length; x++){
                    $scope.quantity.push([monthNameList[x], qtyPerMonth[x]]); 
                }
             

                for (var x = 0; x < monthNameList.length; x++){
                    $scope.capacity.push([monthNameList[x], parseInt($scope.cp_warehouse)]); 
                }
            
                myConfig['series'].push({values:$scope.quantity,text: 'Quantity'});
                myConfig['series'].push({values:$scope.capacity,text: 'Capacity'});
                myConfig['title'].text= "Quantity and Capacity per Month of "+selectedYear;
                zingchart.render({
                id: 'chart-div',
                data: myConfig
            });  

            }
                  
        }
    };

})();




        