(function () {
    'use strict';
 
    angular
        .module('app')
        .factory('AccessService', Service);
 
    function Service($http, $q) {
        var service = {};

        service.getSpecificAccess = getSpecificAccess;
        service.getRoles = getRoles;
 
        return service;

        function getSpecificAccess(option){
            return $http({url: '/api/access/getaccess', 
                method: "GET", params: {type: option}}).then(handleSuccess, handleError);

        }

        function getRoles() {
            return $http.get('/api/access/getrole').then(handleSuccess, handleError);
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