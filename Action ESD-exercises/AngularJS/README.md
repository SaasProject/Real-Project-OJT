#action-exercises

basic setup:
    1. download & install npm
    2. cmd into a folder then type "express --view=ejs [proj-name]"
        *this will further create a folder
    3. type "npm install --save"
    4. in public folder, create an html file called index (index.html)
    5. code basic markup then type hi in the <body> tag

to run:
    1. cmd at the folder's root directory
    2. type "npm start"
to stop:
    1. press Ctrl + C in cmd then type Y

angular (no ui-router):

    1. download or use cdn and declare in index.html
        <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.4.7/angular.js"></script>

    2. create js file called index (index.js) under public/javascripts folder. also declare in index.html
        <script src="javascripts/index.js"></script>

    3. in <html> tag, apply ng-app directive and type any name
        <html ng-app="myApp">

    4. create 2 <div>s under <body>. use ng-controller directive on each one then name them uniquely
        <div ng-controller="Controller1"></div>
        <div ng-controller="Controller2"></div>

    5. in index.js, declare variable and assign angular.module('ng-app name', ['dependencies'])
        *angular.module() has 2 parameters. 1st is the name of ng-app (as declared in step 3). 2nd is an array of dependencies (3rd-party API). so far, there are no dependencies yet, but it is REQUIRED to have [].
        
        e.g. var app = angular.module('myApp', []);

    6. declare the two controllers using app.controller('controller-name', function(function_parameters))
        *controller() has 2 parameters. 1st is the name of the controller (as decleared in step 4). 2nd is a function with dependencies. these dependencies can come from the core angular or other 3rd party API.

        common function parameters:
            $scope = variable of a controller that can be used in html.
            $rootScope = variable that can be shared by all controllers

        e.g. app.controller('Controller1', function($scope, $rootScope){});

    7. in the function of Controller 1, declare a $scope variable and assign 'This is Controller 1' as its value.
        e.g. $scope.sample1 = 'This is Controller 1';

    8. in index.html, type "{{sample1}}" under Controller 1 div. Then run the app
    9. in the function of Controller 2, declare the same $scope variable name from Controller 1 and assign 'This is Controller 2' as its value.
            e.g. $scope.sample1 = 'This is Controller 2';

    10. in index.html, type "{{sample1}}" under Controller 2 div. Then run the app.
        *notice that the variable names are the same but have different output. 
        this means that the $scope only covers its controller
    
    11. in Controller 1, declare a $rootScope variable with the same name from Controllers 1 & 2 (i.e. sample1) and assign 'This is a rootScope variable' as its value.
        e.g. $rootScope.sample1 = 'This is a rootScope variable';

    12. in index.html type {{sample1}} in both Controller 1 & Controller 2 divs. then run app
        *notice that since $scope and $rootScope share a similar variable name, only the $scope variable values are displayed and not the $rootScope
        this means that avoid having similar names between $scope and $rootScope IF using inside a controller div

    13. move the {{sample1}} from step 12 to outside the Controller divs then run app
        *now the 'This is a rootScope variable' text is displayed.
        *declaration and assignment of $rootScope variables can occur in any controller

        *when browsers load, the actual "{{saple1}}" may be displayed before displaying the actual string. {{}} is said to be slower. a better alternative is using 'ng-bind' directive. but do note that ng-bind needs to be in an html element tag, thus when they are not needed, {{}} is used

        e.g.
            {{sample1}}
            <text ng-bind="sample1></text>

    14. in index.html, create an input field under Controller 1. use 'ng-model' directive and assign a name
        e.g. <input type="text" ng-model="input1">

        then type {{input1}} under it. run app

        *as you type, {{input1}} changes values.
    
    15. in index.html, create a button under Controller 1. use 'ng-click' and assign a function name
        *this will perform the function whenever this button is clicked
        e.g. <button ng-click="displayInput()">Display</button>

        under Controller 1 in index.js, declare a $scope function display() and alert the $scope.input1 variable

        e.g. 
            $scope.displayInput = function(){
                alert($scope.input1);
            }
        
        *parameters may also be included in $scope functions

        
    16. run app the press the button
        *when the alert dialog appears, the value is 'undefined'. this is because there is no declaration of $scope.input1 inside the controller
    
        run app. type then press the button
        *in the alert function, it recognizes $scope.input1 even though it is not declared

    17. declare and assign a value to input1
        e.g. $scope.input1 = 'This is an input field';

    18. run app
        *notice that the input field already has a value. again, the $scope variable is recognizable in html & js provided that they are under the same controller

        delete the string from the input field and press the button
        *this time, the alert dialog displays '' (blank) and not 'undefined'. this means that to avoid having undefined values, it may be best to initialize them in the controller.

    19. under Controller 2 in index.html, create a div. then use 'ng-if' directive and assign a name. type anything under     this div.
        *ng-if renders the element if true. therefore it accepts boolean values only. so either a variable or function can be used as long as its return value is T/F
        e.g.
            <div ng-if="canShow">
                This is visible because canShow variable is true
            </div>

    20. under Controller 2 in index.html, create a button and use ng-click with a function called displayDiv()
        e.g. <button ng-click="displayDiv()">Display Div</button>

        under Controller 2 in index.js, declare displayDiv function. assign $scope.canShow to true inside this function
        e.g. 
            $scope.displayDiv = function(){
                $scope.canShow = true;
            }

        *"displayDiv()" in ng-click directive can also be replaced with "canShow = true"

    21. to make it a toggle button, initialize canShow to false, then at displayDiv(), set the reverse

        e.g.
            $scope.canShow = false;
            $scope.displayDiv = function(){
                $scope.canShow = !$scope.canShow;
            }

        *"displayDiv()" in ng-click directive can also be replaced with "canShow = !canShow"

    22. under Controller 2 in index.html, create a form with 2 inputs and a submit button. use 'ng-submit' directive          inside the <form> tag and assign a function. use 'ng-required' inside each <input> tag and assign a variable

        e.g. 
            <form ng-submit="submitForm()">
                <input type="text" ng-model="input1" ng-required="isRequired">
                <input type="text" ng-model="input2" ng-required="isRequired">
                <button type="submit">Submit</button>
            </form>

        under Controller 2 in index.js, declare and assign the isRequired variable to true
        also declare and assign the submitForm()

        e.g. 
            $scope.isRequired = true;
            $scope.submitForm = function(){
                alert('you submitted:\n' + $scope.input1 + '\n' + $scope.input2 + '\n');
            }

    23. $scope variables can also work as objects. in some cases, it may be more appropriate to use than single            variables. an example to this is the form from step 22.

        change the ng-model of input 1 to input.input1 and the ng-model of input2 to input.input2
        e.g.
            <input type="text" ng-model="input.input1" ng-required="isRequired">
            <input type="text" ng-model="input.input2" ng-required="isRequired">

        under Controller 2 in index.js, change the alert to input object
        e.g. alert('you submitted: ' + $scope.input + '\n' + $scope.input.input1 + '\n' + $scope.input.input2 + '\n');

        *notice that the value when $scope.input is displayed is [object Object]
        *the point is data can be grouped without explicitly stating them in the js. use '.' notation to declare variables/properties of an object

    24. under Controller 1 in index.html, create 1 table. use 'ng-repeat' directive inside the <tr> tag
        *ng-repeat can also be used in other tags such as <div> and <li>. 
        *take note of the expression used in ng-repeat:
            'array' is a $scope array variable, 'item' is like the current element in the array

        e.g. 
        <table>
            <tbody>
                <tr ng-repeat="item in array">
                    <td ng-bind="item"></td>
                </tr>
            </tbody>
        </table>

        under Controller 1 in index.js, declare and assign the $scope.array
        *it is possible to have an array of objects. then in html, use the '.' again to call each property
        e.g. $scope.array = ['item1', 'item2', 'item3', 'item4'];

        run app
    
    25. in step 24, ng-repeat is used to iterate an array, but ng-repeat can also be used to iterate               properties of an object. use (key, val) instead of item

        under Controller 1 in index.html, create another table but replace 'item' with '(key, val)' and 'array' with a $scope object variable. then create 2 <td>s, with 'key' and 'val' on each
        e.g. 
        <table>
            <tbody>
                <tr ng-repeat="(key, val) in anObject">
                    <td ng-bind="key"></td>
                    <td ng-bind="val"></td>
                </tr>
            </tbody>
        </table>

        under Controller 1 in index.js, declare and assign the object variable
        e.g. 
        $scope.anObject = {
            firstName: 'Juan',
            lastName: 'dela Cruz',
            age: 25
        }

        run app

    26. under Controller 2 in index.js, create a $scope array variable. then create objects as its elements
        *for simplicity, all objects have the same properties
        e.g.
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
    
        under Controller 2 in index.html, create an input field with ng-model as 'search'.
        e.g. <input type="text" ng-model="search">

        then create another table. use ng-repeat in <tr>. then create 3 <td>s for each object's properties. 
        take note of the modified expression used in ng-repeat:
            'filter' is used like a search. this will return a subset of objects from the object_array that satisfies the parameter
        *there are other filters such as 'orderBy' & 'date'
        *alternatively, you can also use ng-repeat with (key, val) in the <td> tag
        e.g.
        <table>
            <tbody>
                <tr ng-repeat="item in object_array | filter: search">
                    <td ng-bind="item.firstName"></td>
                    <td ng-bind="item.lastName"></td>
                    <td ng-bind="item.age"></td>
                </tr>
            </tbody>
        </table>

        run app then type explore the search input field. type valid & valid strings

    27. under Controller 1 in index.html, create a dropdown menu. use 'ng-model' directive to store your           choice. there are two ways in populating the dropdown:
            'ng-options' inside the <select> tag
            'ng-repeat' inside the <option> tag
        you can also use 'ng-change' directive inside the <select> tag. the expression in ng-change will be performed whenever the ng-model changes
        *we will use the array from step 24
        e.g.
            <select ng-model="dropdownChoice" ng-change="displayChoice()">
                <option ng-repeat="item in array"><text ng-bind="item"></text></option>
            </select>

        then under Controller 1 in index.js, declare and assign displayChoice()
        e.g.
        $scope.dropdownChoice = '';
        $scope.displayChoice = function(){
            alert('you chose ' + $scope.dropdownChoice);
        }

        run app
        *notice that ng-bind does not work here. this is one of the cases where the {{}} is used. so change
        <text ng-bind="item"></text> to {{item}} 
        e.g. <option ng-repeat="item in array">{{item}}</option>

        
        *notice that there is a blank option at first. then it disappears once you have selected a valid item.
        this is because the initial value of $scope.dropdownChoice can either be 'undefined' or none from the choices. to avoid this, initialize dropdownChoice with any of the choices from $scope.array
        *at first load, the first item in the array is preferred
        e.g. $scope.dropdownChoice = $scope.array[0];

        run app
            

    SYSTEM STUDY:
    on the project files, browse through the app folder (this is the angular part). take note the files in the app-services folder as well as the app.js. some of the topics not covered above but are definitely useful (e.g. $http service & routing) are coded there.

終わった!

REMEMBER: this is just a basic tutorial. not all topics are covered.



        

        






    
