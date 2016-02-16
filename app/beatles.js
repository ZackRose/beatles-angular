var Beatles = angular.module("beatles", [
  'ui.router'
]).config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/");
  $stateProvider
    .state('main', {
      url: "/",
      templateUrl: "app/main/main.tmpl.html"
    })
    .state('store', {
      url: "/store",
      templateUrl: "app/store/store.tmpl.html",
      controller: 'BeatlesControl'
    })
    .state('cart', {
      url: "/store",
      templateUrl: "app/cart/cart.tmpl.html"
    })

    /*.state('state2.list', {
      url: "/list",
        templateUrl: "partials/state2.list.html",
        controller: function($scope) {
          $scope.things = ["A", "Set", "Of", "Things"];
        }
      })*/


    });

    Beatles.controller('BeatlesControl', function($scope, $http) {
      //var beatlesCtrl = this;

      $scope.merchtypes = [
          {"name": 'Shirts', "type": "Shirt"},
          {"name": 'Vinyl', "type": "Vinyl"},
          {"name": 'CDs', "type": "CD"},
          {"name": 'Patches', "type": "Patch"}
      ];

      $http.get('products.json')
       .then(function(res){
          $scope.products = res.data;
          console.log($scope.products);

          $scope.currentCategory = "Shirt";

          function isCurrentCategory(category) {
              return $scope.currentCategory !== null && category === $scope.currentCategory;
          }

          function setCurrentCategory(category) {
              $scope.currentCategory = category;
          }

          $scope.isCurrentCategory = isCurrentCategory;
          $scope.setCurrentCategory = setCurrentCategory;

        });

    });
