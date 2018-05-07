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
 
     function Controller($window, $rootScope, FlashService, AssetService, $scope, $interval, $filter, socket, WarehouseService, LogsService, FieldsService) {
        //initialization
        $scope.created_date="";
        $scope.assets = [];
        $scope.warehouses = [];
        $scope.years = [];
        $scope.current_warehouse = {};
        var isModalOpened = false;
		$scope.loading = true;
        $scope.name = 'user';
        $scope.newNotifs = {};
        
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
                                addNotification($scope.warehouses);
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


                            $scope.newNotifs.date = $filter('date')(new Date(), "yyyy-MM-dd HH:mm:ss");
                                $scope.newNotifs.message = $scope.current_warehouse.name+ " is over the limit";

                                console.log($scope.newNotifs);

                                LogsService.addNotifs($scope.newNotifs).then(function(){
                    
                                }).catch(function(err){
                                 //   alert(err.msg_error);
                                });             

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
                        addNotification($scope.warehouses);
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
            addNotification($scope.warehouses);
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
            $scope.myJson = [];
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
            Function name: Add Notifications
            Author(s): Ortaleza, Sherine Marie
            Date Modified: 04/24/2018
            Description: Adds notifications to the logs collection in database
            Parameter(s): none
            Return: none
        */

        function addNotification(warehouselist){
            //filter by warehouse and updated_date (desc)
            //$scope.latest_assets = $scope.$eval("assets | filter: current_warehouse.name | orderBy: '-updated_date'");


            for( var x=0; x<=warehouselist.length; x++){
                if(warehouselist[x].quantity > parseInt(warehouselist[x].capacity)){
                     $scope.newNotifs.date = $filter('date')(new Date(), "yyyy-MM-dd HH:mm:ss");
                     $scope.newNotifs.message = warehouselist[x].name+" "+$rootScope.selectedLanguage.home.labels.isover;
                     console.log( $scope.newNotifs.message);
                     LogsService.addNotifs($scope.newNotifs).then(function(){
    
                }).catch(function(err){
                  // alert(err.msg_error);
                }); 

                } else if (warehouselist[x].quantity == 0){
                    $scope.newNotifs.date = $filter('date')(new Date(), "yyyy-MM-dd HH:mm:ss");
                     $scope.newNotifs.message = warehouselist[x].name+ " " +$rootScope.selectedLanguage.home.labels.isempty;
                     console.log($scope.newNotifs.message);
                     LogsService.addNotifs($scope.newNotifs).then(function(){
    
                }).catch(function(err){
                  // alert(err.msg_error);
                }); 
                } else{

                }
             }

        }

        /*
            Function name: Notifications
            Author(s): Ortaleza, Sherine Marie
            Date Modified: 04/24/2018
            Description: Gets all notification messages from logs collection
            Parameter(s): none
            Return: none
        */

        function getLogs(){
                //get all info in logs collection in db
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
            //get all assets
            AssetService.GetAll().then(function(assets){
                if(assets.length > 0){               
                    //store to array
                    a_type = a_type.replace(/\s/g,'');
                    $scope.assets = assets;
                    $scope.assets_types = asset_types;
                    //initialization
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
                    //info json for pie chart 
                     $scope.myJson = {
                        type: "pie",
                        title: {
                          textAlign: 'center',
                          text: $rootScope.selectedLanguage.home.labels.typeassets,
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
                        //get all asset types and get quantity per type
                    for (var typeCount = 0; typeCount < types.length; typeCount++){
                         typeQuantity = 0;
                        for (assetCount = 0; assetCount < $scope.assetsLength; assetCount++){
                                if (types[typeCount] == $scope.assets[assetCount].type && $scope.current_warehouse.name == $scope.assets[assetCount].location ){
                                    typeQuantity += 1;
                                }       
                        }
                        //push type quantity to array
                        $scope.quantityOfAssetTypes[typeCount] = typeQuantity;
                        //add info to json for pie chart
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
            //initialization
            var monthQuantity = 0;
            var containerRangeYear = 0;
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
            var monthNameList = [
            $rootScope.selectedLanguage.home.labels.jan, 
            $rootScope.selectedLanguage.home.labels.feb, 
            $rootScope.selectedLanguage.home.labels.mar, 
            $rootScope.selectedLanguage.home.labels.apr, 
            $rootScope.selectedLanguage.home.labels.may, 
            $rootScope.selectedLanguage.home.labels.jun, 
            $rootScope.selectedLanguage.home.labels.jul, 
            $rootScope.selectedLanguage.home.labels.aug, 
            $rootScope.selectedLanguage.home.labels.sep, 
            $rootScope.selectedLanguage.home.labels.oct, 
            $rootScope.selectedLanguage.home.labels.nov, 
            $rootScope.selectedLanguage.home.labels.dec];
            var rangeOfYears = [];
            $scope.quantity = [];  
            $scope.capacity = [];
            $scope.ngShowtoYear = false;
            $scope.ngShowfromYear = false;
            $scope.ngShowYearly = false;
            $scope.ngShowMonthly = false;
            $scope.cp_warehouse  = c_warehouse;
            $scope.pmm_warehouse = pm_warehouse;
            //info for line chart
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

            //get all assets per month and add quantity to array per month    
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

                $scope.yAxis = [];
                if(qtyPerMonth.length > parseInt($scope.cp_warehouse)){
                    $scope.yAxis = [];
                }

                //push name of month and the quantity of the assets of the certain month to $scope.quantity array
                 for (var x = 0; x < monthNameList.length; x++){
                    $scope.quantity.push([monthNameList[x], qtyPerMonth[x]]); 
                }

                //push name of month and capacity of asset of current warehouse to $scope.capacity array
                for (var x = 0; x < monthNameList.length; x++){
                    $scope.capacity.push([monthNameList[x], parseInt($scope.cp_warehouse)]); 
                }
                    
                //push $scope.capacity array and $scope.quantity array to myConfig info to create line graph
                myConfig['series'].push({values:$scope.quantity,text: $rootScope.selectedLanguage.home.labels.quantity});
                myConfig['series'].push({values:$scope.capacity,text: $rootScope.selectedLanguage.home.labels.capacity});
                myConfig['title'].text= $rootScope.selectedLanguage.home.labels.currentyear;
                //render for default chart onload
                zingchart.render({
                id: 'chart-div',
                data: myConfig
            });      

            //get all distinct years of assets
            for(var x=0; x<pm_warehouse.length; x++){
                    date = new Date(pm_warehouse[x]);
                    year = date.getFullYear();
                    if (year!=containerYear){
                        years.push(year);
                    }
                    containerYear = year;
            }
            $scope.years = years;

            

            //gets monthly or yearly option from filter and shows corresponding div
            $scope.ShowDiv = function(x) {
                    //if monthly
                    if( x == 1){
                        //shows monthly select element and hides yearly div
                        $scope.ngShowYearly = false;
                        $scope.ngShowMonthly = true;
                        //gets year and passes year to getQuantityOfYearMonthly function                      
                        $scope.getYear = function(yy){
                        getQuantityOfYearMonthly(yy);
                    }
                    //if yearly
                    } else{
                        //hides monthly select element and shows yearly div
                        $scope.ngShowYearly = true;
                        $scope.ngShowtoYear = false;
                        $scope.ngShowMonthly = false;

                        //gets from year from from select element and shows To: select element
                        $scope.getFromYear= function(fromYearSelected){
                            fromYear = fromYearSelected;
                            $scope.ngShowtoYear = true;
                        }

                        //gets to year element from to select element and passes from year to year and number of assets to getQuantity per year method
                        $scope.getToYear= function(toYearSelected){
                            toYear = toYearSelected;
                            //if from year is lesser that to year pass parameters from year and to year to getQuantityPer year
                            if(fromYear < toYear){
                                myConfig['series'] = [];
                                qtyPerYear = [];
                                rangeOfYears = [];
                                $scope.quantity = [];  
                                $scope.capacity = [];
                                $scope.numberOfAssets = $scope.pmm_warehouse.length;
                                getQuantityPerYear(fromYear, toYear, $scope.pmm_warehouse);

                            //if from year and greater than or equal to to year element alert invalid
                            }else{
                              alert($rootScope.selectedLanguage.home.labels.invalidyrmsg);
                                    $scope.ngShowtoYear = false;
                                    $scope.ngShowfromYear = false;
                            }
                            
                        }

                    }
            }; 

            //get asset quantity per year of the range of year selected
            function getQuantityPerYear(fromY, toY, allAssets){ 
                $scope.ngShowtoYear = false;
                $scope.ngShowfromYear = false;
                myConfig['series'] = [];
                qtyPerYear = [];
                rangeOfYears = [];
                $scope.quantity = [];  
                $scope.capacity = [];

                //get the range of year from the passed to year and from year and save it to rangeofyears array
                for(var x=0; x<=allAssets.length; x++){
                    date = new Date(allAssets[x]);
                    year = date.getFullYear();
                    if(year >= fromY && year <= toY && year!=containerRangeYear) {
                         rangeOfYears.push(year);
                    }
                    containerRangeYear = year;
                }    

                //get all assets per year in rangeofyears
                for(var y = 0; y<=rangeOfYears.length; y++){
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

                //push quantity per year based on rangeofyears to $scope.quantity
                 for (var x = 0; x < rangeOfYears.length; x++){
                    $scope.quantity.push([rangeOfYears[x], qtyPerYear[x]]); 
                }

                //push capacity per year based on rangeofyears to $scope.capacity
                for (var x = 0; x < rangeOfYears.length; x++){
                    $scope.capacity.push([rangeOfYears[x], parseInt($scope.cp_warehouse)]); 
                }
                    
                //add capacity and quantity to info of line chart and render chart based on range
                myConfig['series'].push({values:$scope.quantity,text: $rootScope.selectedLanguage.home.labels.quantity});
                myConfig['series'].push({values:$scope.capacity,text: $rootScope.selectedLanguage.home.labels.capacity});
                myConfig['title'].text= $rootScope.selectedLanguage.home.labels.rangeyear;
                
                zingchart.render({
                id: 'chart-div',
                data: myConfig
                });  

                $scope.ngShowtoYear = false;
                $scope.ngShowfromYear = false;
            }

            //get asset quantity per month of a certain year selected
            function getQuantityOfYearMonthly(selectedYear){
                myConfig['series'] = [];
                qtyPerMonth = [];
                $scope.quantity = [];  
                $scope.capacity = [];
                
                //get quantity of assets per month
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

                //push name of month and the quantity of the assets of the certain month to $scope.quantity array
                 for (var x = 0; x < monthNameList.length; x++){
                    $scope.quantity.push([monthNameList[x], qtyPerMonth[x]]); 
                }
             
                //push name of month and capacity of asset of current warehouse to $scope.capacity array
                for (var x = 0; x < monthNameList.length; x++){
                    $scope.capacity.push([monthNameList[x], parseInt($scope.cp_warehouse)]); 
                }
                
                //push $scope.capacity array and $scope.quantity array to myConfig info to create line graph 
                myConfig['series'].push({values:$scope.quantity,text: $rootScope.selectedLanguage.home.labels.quantity});
                myConfig['series'].push({values:$scope.capacity,text: $rootScope.selectedLanguage.home.labels.capacity});
                myConfig['title'].text= $rootScope.selectedLanguage.home.labels.selectedyear + " "+selectedYear;
                zingchart.render({
                id: 'chart-div',
                data: myConfig
            });

            }
                  
        }
    };

})();




        