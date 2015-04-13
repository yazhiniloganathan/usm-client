(function () {
	'use strict;'
	define(['lodash'], function(_) {
		var MenuController = function($scope, $location, MenuService) {
			$scope.menus = MenuService.getMenus();

			$scope.navigate = function(menu, parentMenu) {
				$location.path(menu.href);
				if(parentMenu) {
					MenuService.setActive(parentMenu.id);
				}
				else {
					MenuService.setActive(menu.id);
				}
			};
		}
		return ['$scope', '$location', 'MenuService', MenuController];
	});
})();