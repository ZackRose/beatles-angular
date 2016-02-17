var Beatles = angular.module("beatles", [
  'ui.router',
  'ngStorage',
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

Beatles.controller('StoreControl', function($scope, $state, $http, $stateParams, $localStorage) {

//**** Store Page product categories ****\\

  var defaultCategory = "Shirt";

  $scope.product_categories = [
      {"name": 'Shirts', "type": "Shirt"},
      {"name": 'Vinyl', "type": "Vinyl"},
      {"name": 'CDs', "type": "CD"},
      {"name": 'Patches', "type": "Patch"}
  ];

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



  //Load product data
  $http.get('products.json')
   .then(function(res){
      $scope.products = res.data;
    });



    //** Cart object and methods **\\

    //Load cart from localStorage
    if ($localStorage.beatlesCart === undefined) {
      $scope.invoice = [];
    }
    else {
      $scope.invoice = $localStorage.beatlesCart;
    }

    //check to see if item in cart
    function itemInCart(product_id, option)
    {
      for (var i=0; i<$scope.invoice.length; i++)
      {
        if ($scope.invoice[i].id == product_id && $scope.invoice[i].option == option) {
          return true;
        }
      }
      return false;
    }

    //increment an item's quantity
    function itemIncrement(item_id, option)
    {
      for (var i=0; i<$scope.invoice.length; i++)
       {
        if ($scope.invoice[i].id == item_id && $scope.invoice[i].option == option){
          $scope.invoice[i].qty++;
          $localStorage.beatlesCart = $scope.invoice;
          break;
        }
      }
    }

    //return total quantity of items in cart
    function cartQuantity()
    {
      var quantity = 0;
      for (var i=0; i<$scope.invoice.length; i++)
      {
        quantity += $scope.invoice[i].qty;
      }
      return quantity;
    }


    //add a product to the cart
    function addToCart(product, selectedoption)
    {
      if (itemInCart(product.id, selectedoption) )
      {
        //If item id (With selected option) is in cart, increment instead of adding a duplicate
        itemIncrement(product.id, selectedoption);
      }
      else
      {
        //Otherwise push a new item with quantity of 1
        $scope.invoice.push({
          id: product.id,
          name: product.info_title,
          type: product.info_type,
          price: product.info_price,
          option: selectedoption,
          qty: 1
        });
        $localStorage.beatlesCart = $scope.invoice;
      }

      console.log($scope.invoice);
    }

    $scope.cartQuantity = cartQuantity;
    $scope.addToCart = addToCart;

});
