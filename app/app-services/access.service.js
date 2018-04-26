(function () {
    'use strict';
 
    angular
        .module('app')
        .factory('AccessService', Service);
 
    function Service($http, $q) {
        var service = {};

        service.getSpecificAccess = getSpecificAccess;
 
        return service;

        function getSpecificAccess(option){
            return $http({url: '/api/access/getaccess', 
                method: "GET", params: {type: option}}).then(handleSuccess, handleError);

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