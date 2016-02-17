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
      controller: 'StoreControl'
    })
    .state('cart', {
      url: "/store",
      templateUrl: "app/cart/cart.tmpl.html",
      controller: 'StoreControl'
    })
});

Beatles.controller('StoreControl', function($scope, $state, $http, $stateParams) {

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

  $scope.isCurrentCategory = isCurrentCategory;

  $scope.merchtypes = [
      {"name": 'Shirts', "type": "Shirt"},
      {"name": 'Vinyl', "type": "Vinyl"},
      {"name": 'CDs', "type": "CD"},
      {"name": 'Patches', "type": "Patch"}
  ];

  $scope.invoice = [];

  $http.get('products.json')
   .then(function(res){
      $scope.products = res.data;
      //console.log($scope.products);
    });

    function itemInCart(item_id, option)
    {
      angular.forEach($scope.invoice, function(item, key) {
        if (item.id == item_id && item.option == option) return true;
      });
      return false;
    }

    function itemIncrement(item_id, option)
    {
      for (var i=0; i<$scope.invoice.length; i++)
       {
        if ($scope.invoice[i].id == item_id && $scope.invoice[i].option == option){
          $scope.invoice[i].qty++;
          break;
        }
      }
    }

    function addToCart(product, selectedoption)
    {
      if (itemInCart(product.id, selectedoption) )
      {
        itemIncrement(product.id, selectedoption)
      }
      else
      {
        $scope.invoice.push({
          id: product.id,
          name: product.info_title,
          type: product.info_type,
          price: product.info_price,
          option: selectedoption,
          qty: 1
        });
      }

      console.log($scope.invoice);
    }



    $scope.addToCart = addToCart;


});
