(function () {
    'use strict';
 
    angular
        .module('app')
        .factory('LogsService', Service);
 
    function Service($http, $q) {
        var service = {};
 

        service.getAllLogs = getAllLogs;
        
 
        return service;
        
        
        
        /*
            Function name: User App Service Get Admin
            Author(s): Flamiano, Glenn
            Date Modified: 2018/03/01
            Description: Retrieves all the users
            Parameter(s): none
            Return: none
        */
        function getAllLogs() {
            return $http.get('/api/logs/all').then(handleSuccess, handleError);
        }
        
        
 
        // private functions
 
        function handleSuccess(res) {
            return res.data;
        }
 
        function handleError(res) {
            return $q.reject(res.data);
        }
    }
 
})();