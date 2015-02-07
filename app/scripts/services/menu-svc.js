/* global define */
(function() {
    'use strict';
    define(['lodash'], function(_) {
        // **MenuService**
        // Menu service keeps track of the currently active menu entry.
        //
        // **Constructor**
        var Service = function() {
            this.menus = [{
                    label: 'Dashboard',
                    id: 'dashboard',
                    href: '/',
                    active: true
                }, {
                    label: 'Clusters',
                    id: 'clusters',
                    href: '/clusters',
                    active: false
                }, {
                    label: 'Hosts',
                    id: 'hosts',
                    href: '/hosts',
                    active: false
                }, {
                    label: 'Storage',
                    id: 'storage',
                    href: '/storage',
                    active: false
                }, {
                    label: 'Admin',
                    id: 'admin',
                    href: '/admin',
                    active: false
                }
            ];
        };
        Service.prototype = _.extend(Service.prototype, {
            // Change the active menu item
            setActive: function(menuId) {
                this.menus = _.map(this.menus, function(menu) {
                    menu.active = menu.id === menuId;
                    return menu;
                });
            },
            // Get the current menu metadata
            getMenus: function() {
                return this.menus;
            }
        });
        return [Service];
    });
})();
