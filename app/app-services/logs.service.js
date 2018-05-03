(function () {
    'use strict';
 
    angular
        .module('app')
        .factory('LogsService', Service);
 
    function Service($http, $q) {
        var service = {};
 

        service.getAllLogs = getAllLogs;
        service.addNotifs = addNotifs;
 
        return service;
        
        
        
        /*
            Function name: Notifications
            Author(s): Ortaleza, Sherine
            Date Modified: 2018/03/01
            Description: Retrieves all the logs
            Parameter(s): none
            Return: none
        */
        function getAllLogs() {
            return $http.get('/api/logs/all').then(handleSuccess, handleError);
        }
        
        function addNotifs(notif) {
            return $http.post('/api/logs/addNotif', notif).then(handleSuccess, handleError);
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