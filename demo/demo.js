'use strict';
/*global angular */
angular.module('uiSortableDemo', ['ui.directives.sortable']).
controller('uiSortableCtr', ['$scope',
    function ($scope) {
        $scope.users = [{
                uid: 1,
                name: 'name1',
                age: 25,
                email: 'name1@gmail.com',
                desc: '111111111111111111'
            }, {
                uid: 2,
                name: 'name2',
                age: 26,
                email: 'name2@gmail.com',
                desc: '222222222222222'
            }, {
                uid: 3,
                name: 'name3',
                age: 27,
                email: 'name3@gmail.com',
                desc: '3333333333333333333'
            }, {
                uid: 4,
                name: 'name4',
                age: 28,
                email: 'name4@gmail.com',
                desc: '4444444444444444444'
            }
        ];
        $scope.sortItems = {
            options: {
                axis: 'y',
                cursor: 'move',
                placeholder: 'sortable-placeholder'
            },
            items: $scope.users
        };
        $scope.$on('sortcreate', function (event, ui) {
            console.log('sortItems:', $scope.sortItems);
        });
        $scope.$on('sortupdate', function (event, ui) {
            console.log('ui:', ui);
        });
    }
]);