(function () {
	'use strict;'
	define(['lodash'], function(_) {
		var MenuController = function($scope, $location, $rootScope, $routeParams, MenuService) {
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

			$rootScope.$on("$routeChangeStart",function(event, next, current){
				MenuService.setActive(next.menuId);
			});
		}
		return ['$scope', '$location', '$rootScope', '$routeParams', 'MenuService', MenuController];
	});
})();