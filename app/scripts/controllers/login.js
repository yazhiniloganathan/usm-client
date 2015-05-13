(function () {
	'use strict;'
	define(['lodash'], function(_) {
		var LoginController = function($scope, $location, UtilService) {
          $scope.login = function(user) {
          	   if(user && user.username && user.password)
          	   {
          	   	 $scope.errorMsg = "";
          	   	 var userObject = {
                  "username": user.username,
                  "password": user.password
                 }
                 UtilService.getVerifyUser(userObject)
                 .then(function(){
                    $location.path('/dashboard');
                 },
                 function(){
                 	$scope.errorMsg = "Authentication Error!.";
                 });
          	   }else {
                  $scope.errorMsg = "The username and password cannot be blank.";
          	   }
		  };
		}
		return ['$scope', '$location', 'UtilService', LoginController];
	});
})();