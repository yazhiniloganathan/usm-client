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
                    href: '/dashboard',
                    hasSubMenus: false,
                    active: true
                }, {
                    label: 'Clusters',
                    id: 'clusters',
                    href: '/clusters',
                    hasSubMenus: false,
                    active: false
                }, {
                    label: 'Hosts',
                    id: 'hosts',
                    href: '/hosts',
                    hasSubMenus: false,
                    active: false
                }, {
                    label: 'Storage',
                    id: 'storage',
                    href: '/storage',
                    hasSubMenus: true,
                    subMenus: [
                        {
                            title: 'Volumes',
                            id: 'volumes',
                            href: '/volumes'
                        },
                        {
                            title: 'Pools',
                            id: 'pools',
                            href: '/pools'
                        }
                    ],
                    active: false
                }, {
                    label: 'Admin',
                    id: 'admin',
                    href: '/admin',
                    hasSubMenus: false,
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
