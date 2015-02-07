(function () {
	'use strict;'
	define(['lodash'], function(_) {
		var MenuController = function($scope, $location, MenuService) {
			$scope.menus = MenuService.getMenus();

			$scope.navigate = function(menu) {
				$location.path(menu.href);
				MenuService.setActive(menu.id);
			};
		}
		return ['$scope', '$location', 'MenuService', MenuController];
	});
})();