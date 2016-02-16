var Beatles = angular.module("beatles", [
  'ui.router',
  'beatlesstore'
]).config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/");
  $stateProvider
    .state('main', {
      url: "/",
      templateUrl: "app/main/main.tmpl.html"
    })
    .state('store', {
      url: "/store/:type",
      templateUrl: "app/store/store.tmpl.html",
      controller: 'BeatlesControl'
    })
    .state('cart', {
      url: "/store",
      templateUrl: "app/cart/cart.tmpl.html"
    })
});

Beatles.controller('BeatlesControl', function($scope, $http, $stateParams) {
  //var beatlesCtrl = this;

  var defaultCategory = "Shirt";

  if ($stateParams.type) {
    $scope.currentCategory = $stateParams.type;
  }
  else {
    $scope.currentCategory = defaultCategory;
  }


  function isCurrentCategory(category) {
      return $scope.currentCategory !== null && category === $scope.currentCategory;
  }

  function setCurrentCategory(category) {
      $scope.currentCategory = category;
  }

  $scope.isCurrentCategory = isCurrentCategory;
  $scope.setCurrentCategory = setCurrentCategory;


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
    });

});
