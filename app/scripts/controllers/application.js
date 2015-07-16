(function () {
	'use strict;'
	define(['lodash'], function(_) {
		var ApplicationController = function($scope) {
			$scope.expandedView = true;
		}
		return ['$scope', ApplicationController];
	});
})();