/*
    Name: Home Controller
    Date Created: ??/??/2018
    Author(s):
    
 */
(function () {
    'use strict';
 
    angular
        .module('app', ['ui.router', 'ui.sortable', 'ngSanitize', 'ngCsv', 'ui.bootstrap', 'btford.socket-io', 'zingchart-angularjs'])
        .config(config)
        .run(run);
 
    /*
        Function name: config function
        Author(s): Reccion, Jeremy
        Date Modified: 02/27/2018
        Description: Declare the angular configuration (routes, injectors, etc)
        Parameter(s): $stateProvider, $urlRouteProvider, $httpProvider (dependencies)
        Return: none
    */
    function config($stateProvider, $urlRouterProvider, $httpProvider) {
        // default route
        $urlRouterProvider.otherwise("/");
 
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'home/index.html',
                controller: 'Home.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'home' }
            })
            .state('account', {
                url: '/account',
                templateUrl: 'account/index.html',
                controller: 'Account.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'account' }
            })
            
            //Added by Glenn
            .state('manageUsers', {
                url: '/manageUsers',
                templateUrl: 'manageUsers/index.html',
                controller: 'ManageUsers.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'manageUsers' }
            })

            //Added by Glenn
            .state('manageDevices', {
                url: '/manageDevices',
                templateUrl: 'manageDevices/index.html',
                controller: 'ManageDevices.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'manageDevices' }
            })
            
            //added by jeremy
            .state('asset', {
                url: '/asset',
                //asset_tag parameter is optional and will not show in the url
                params: { 
                    asset_tag: null
                },
                templateUrl: 'asset/index.html',
                controller: 'Asset.IndexController',
                //not yet used
                controllerAs: 'vm',
                data: {activeTab: 'asset'}
            })
            //parameter is always required
            .state('fields' ,{
                url: '/fields?name',
                templateUrl: 'fields/index.html',
                controller: 'Fields.IndexController',
                controllerAs: 'vm',
                data: {activeTab: 'fields'}
            })
            
            .state('manageWarehouses', {
                url: '/manageWarehouses',
                templateUrl: 'warehouse/index.html',
                controller: 'ManageWarehouses.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'manageWarehouses' }
            });


        // added by jeremy
        // this is to intercept all errors. when 401 is received, must redirect to login
        $httpProvider.interceptors.push(function($q, $window, $location){
            return {
                'responseError': function(rejection){
                    var defer = $q.defer();
                    if(rejection.status == 401){
                        location.reload();
                    }

                    defer.reject(rejection);

                    return defer.promise;
                }
            };
        });
    }
 
    /*
        Function name: run function
        Author(s): Reccion, Jeremy
        Date Modified: 02/27/2018
        Description: Executes when angular page is first loaded
        Parameter(s): $http, $rootScope, $window, UserService, $state (dependencies)
        Return: none
    */
    function run($http, $rootScope, $window, UserService, LanguageService, AccessService, $state, socket) {
        //initialize
        $rootScope.user = {};
        $rootScope.selectedLanguage = {};
        $rootScope.defaultLanguage = {};
        $rootScope.greet = false;
        $rootScope.changePasswordModal = false;
        $rootScope.asset = false; 
        $rootScope.account = false; 
        $rootScope.devices = false; 
        $rootScope.warehouses = false; 
        $rootScope.fields = false; 

        // add JWT token as default auth header
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + $window.jwtToken;
 
        //added by jeremy
        // update active tab on state change
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {

            $http.get('/api/users/getUserType').then(function(roles){
                $rootScope.role = roles.data;
                console.log(roles.data);
                AccessService.getSpecificAccess($rootScope.role)
                .then(function(res) {
                    for(var i = 0; i < res.length; i++){
                        if(res[i] == 'assets')$rootScope.asset = true;
                        else if(res[i] == 'fields') $rootScope.fields = true; 
                        else if(res[i] == 'warehouse') $rootScope.warehouses = true;
                        else if(res[i] == 'devices') $rootScope.devices = true; 
                        else if(res[i] == 'accounts') $rootScope.account = true; 
                    }
                })
                .catch(function (error) {
                });
            });



            $http.get('/api/users/isAdmin').then(function(response){
                $rootScope.isAdmin = response.data;
                if(!$rootScope.isAdmin && (toState.name != 'asset' && toState.name != 'home' && toState.name != 'account')){
                    event.preventDefault();
                    $state.transitionTo('home');
                }
                
            });

            //get token from server every route change to determine if session in server is still alive
            $http.get('/app/token').then(function(res){
                if(res.data.indexOf('<html>') != -1){
                        event.preventDefault();
                        location.reload();
                }
            });
            
            $rootScope.activeTab = toState.data.activeTab;
        });

        function getLanguages(){
            LanguageService.getDefaultLanguage()
                .then(function(res) {
                    $rootScope.defaultLanguage = res;

                    if(res.value == 'nihongo'){
                        $rootScope.dropDefLangSel = '日本語';
                    }else if(res.value == 'english'){
                        $rootScope.dropDefLangSel = 'English';
                    }
                })
                .catch(function (error) {
                });
        }
      
        //execute when loaded
        getUserInfos();

        $rootScope.changeLanguage = function(option) {
            changeLang(option);
            socket.emit('languageChange', option);
        }

        function changeLang(option){
            LanguageService.getSpecificLanguage(option)
                .then(function(res) {
                    $rootScope.selectedLanguage = res[Object.keys(res)[0]];
                    $rootScope.hiUser = $rootScope.selectedLanguage.commons.hiUser1+$rootScope.user.firstName
                    +$rootScope.selectedLanguage.commons.hiUser2;

                    if(option == 'nihongo'){
                        $rootScope.dropLangSel = '日本語';
                    } else if (option == 'english') {
                        $rootScope.dropLangSel = 'English';
                    } else {
                        $rootScope.dropLangSel = $rootScope.selectedLanguage.accountSettings.labels.selectLanguage;
                    }
                })
                .catch(function (error) {
                });
            UserService.saveLanguage(option, $rootScope.user);
        }

        socket.on('languageChange', function(option){
            changeLang(option);
        });

        $rootScope.changeDefaultLanguage = function(option) {
            LanguageService.saveDefaultLanguage($rootScope.user, option);

            if(option == 'nihongo'){
                $rootScope.dropDefLangSel = '日本語';
            } else if (option == 'english') {
                $rootScope.dropDefLangSel = 'English';
            }
        }

        /*
            Function name: getUserInfos
            Author(s): Omugtong, Jano
            Date Modified: 02-06-18
            Description: get first name and last name of user for default avatar
                        get id to generate a unique background color for avatar
                        and also assign firstname in rootscope.
            Parameter(s): none
            Return: none
        */
        function getUserInfos() {
            // get current user
            UserService.GetCurrent().then(function (user) {
                var str = user._id;
                $rootScope.user = user;
                $rootScope.fName = user.firstName;
                $rootScope.dropLangSel = '';
                $rootScope.dropDefLangSel = '';

                getLanguages();
                //get language settings from current user
                var setLanguage = user.setLanguage;
                console.log(setLanguage);
                LanguageService.getSpecificLanguage(setLanguage)
                    .then(function(res) {
                        $rootScope.selectedLanguage = res[Object.keys(res)[0]];
                        $rootScope.hiUser = $rootScope.selectedLanguage.commons.hiUser1+user.firstName
                        +$rootScope.selectedLanguage.commons.hiUser2;

                        //add this conditions when adding new language json files
                        if(setLanguage == 'nihongo'){
                            $rootScope.dropLangSel = '日本語';
                        } else if (setLanguage == 'english') {
                            $rootScope.dropLangSel = 'English';
                        } else {
                            $rootScope.dropLangSel = $rootScope.selectedLanguage.accountSettings.labels.selectLanguage;
                        }
                    })
                    .catch(function (error) {
                    });

                if (user.firstName == null){
                    $rootScope.initials = "new";
                }
                else{
                    var initials = user.firstName.charAt(0) + user.lastName.charAt(0);
                    $rootScope.initials = initials.toUpperCase();

                    //get user profile pic
                    $rootScope.profilePic = '/' + user.profilePicUrl;
                    if(user.profilePicUrl == undefined || user.profilePicUrl == ''){
                        $rootScope.profilePic = '';
                    }
                }

                $rootScope.bgColor = {"background" : stringToColour(str)} ;

                function stringToColour(str) {
                    var hash = 0;
                    for (var i = 0; i < str.length; i++) {
                      hash = str.charCodeAt(i) + ((hash << 5) - hash);
                    }
                    var colour = '#';
                    for (var i = 0; i < 3; i++) {
                      var value = (hash >> (i * 8)) & 0xFF;
                      colour += ('00' + value.toString(16)).substr(-2);
                    }
                    return colour;
                  }
            }).finally(function(){
                $rootScope.greet = true;
            });
        }
    }
 
    // manually bootstrap angular after the JWT token is retrieved from the server
    $(function () {
        // get JWT token from server
        $.get('/app/token', function (token) {
            //alert(token);
            if(token.indexOf('<html>') != -1){
                location.reload();
            }
            else{
                window.jwtToken = token;
 
                angular.bootstrap(document, ['app']);
            }
        });
    });
})();