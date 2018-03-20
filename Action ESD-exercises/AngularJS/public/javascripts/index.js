var app = angular.module('myApp', []);

app.controller('Controller1', function($scope, $rootScope){
    $scope.sample1 = 'This is Controller 1';
    $rootScope.sample1 = 'This is a rootScope variable';
    $scope.input1 = 'This is an input';
    $scope.array = ['item1', 'item2', 'item3', 'item4'];
    $scope.anObject = {
        firstName: 'Juan',
        lastName: 'dela Cruz',
        age: 25
    }
    //$scope.dropdownChoice = '';
    $scope.dropdownChoice = $scope.array[0];


    $scope.displayInput = function(){
        alert($scope.input1);
    }

    $scope.displayChoice = function(){
        alert('you chose ' + $scope.dropdownChoice);
    }
});

app.controller('Controller2', function($scope, $rootScope){
    $scope.sample1 = 'This is Controller 2';
    $scope.canShow = false;
    $scope.object_array = [
        {
            firstName: 'Juan',
            lastName: 'dela Cruz',
            age: 25
        },
        {
            firstName: 'Pedro',
            lastName: 'Reyes',
            age: 25
        },
        {
            firstName: 'Juan',
            lastName: 'Tamad',
            age: 23
        },
        {
            firstName: 'Cardo',
            lastName: 'Dalisay',
            age: 40
        },
        {
            firstName: 'Manny',
            lastName: 'Pacquiao',
            age: 41
        }
    ]

    $scope.displayDiv = function(){
        $scope.canShow = !$scope.canShow;
    }

    $scope.isRequired = true;
    $scope.submitForm = function(){
        //alert('you submitted:\n' + $scope.input1 + '\n' + $scope.input2 + '\n');
        alert('you submitted: ' + $scope.input + '\n' + $scope.input.input1 + '\n' + $scope.input.input2 + '\n');
    }
});

app.controller('Controller3', function(){
    
});