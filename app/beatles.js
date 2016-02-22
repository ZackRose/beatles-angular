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
      url: "/cart",
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

    //Load cart from localStorage.
    //the module automatically updates so that the localStorage var is in sync,
    //so once we set one way or the other, no more work needs to be done
    if ($localStorage.beatlesCart === undefined) {
      $scope.invoice = [];
      $localStorage.beatlesCart = $scope.invoice;
    }
    else {
      $scope.invoice = $localStorage.beatlesCart;
    }

    function initSelectOption(item)
    {
      if (item.options && !item.selectedoption)
      {
        var itemOptions = item.options.split("|");
        if (itemOptions.length > 0)
        {
          item.selectedoption = itemOptions[0];
        }
      }

    }

    $scope.initSelectOption = initSelectOption;

    function getItemById(product)
    {
      for (var i=0; i<$scope.invoice.length; i++)
      {
        //key for item is id and selectedoption (for example a Small T-Shirt)
        //if there is no option, the match will be "undefined"
        if ($scope.invoice[i].id == product.id && $scope.invoice[i].option == product.selectedoption) {
          return $scope.invoice[i];
        }
      }
      return null;
    }

    //increment/ decrement
    function itemIncrement(item)
    {
      item.qty++;
    }

    function itemDecrement(item)
    {
      item.qty--;
      if (item.qty <=0)
      {
        removeItem(item);
      }

    }

    $scope.itemIncrement = itemIncrement;
    $scope.itemDecrement = itemDecrement;

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
    function addToCart(product)
    {

      var item = getItemById(product);

      if ( $scope.invoice.indexOf(item) > -1 )
      {
        //If item id (With selected option) is in cart, increment instead of adding a duplicate
        itemIncrement( item );
      }
      else
      {
        //Otherwise push a new item with quantity of 1
        $scope.invoice.push({
          id: product.id,
          name: product.info_title,
          type: product.info_type,
          price: product.info_price,
          option: product.selectedoption,
          qty: 1
        });

      }

    }

    function removeItem(item) {
        var index = $scope.invoice.indexOf(item);
        $scope.invoice.splice(index, 1);
     }

    $scope.removeItem = removeItem;
    $scope.cartQuantity = cartQuantity;
    $scope.addToCart = addToCart;
    $scope.cartSubTotal = cartSubTotal;

    //Cart Calculations

    $scope.shippingLocations = ["USA","World"];

    if ($localStorage.beatlesShippingLocation === undefined) {
      //console.log("switch to default");
      $scope.shipping_location = $scope.shippingLocations[0];
      $localStorage.beatlesShippingLocation = $scope.shipping_location;
    }
    else {
      //console.log("switch to localStorage:",$localStorage.beatlesShippingLocation);
      $scope.shipping_location = $localStorage.beatlesShippingLocation;
    }



    //This is the info for the shipping algorithm.
    //It follows the "x price for 1, y for each additional" formula
    var shippingRates = {
      Shirt: {USA_1: 5, USA_add: 3, World_1: 13, World_add: 5},
      Vinyl: {USA_1: 6, USA_add: 4, World_1: 15, World_add: 5},
      CD: {USA_1: 4, USA_add: 1, World_1: 10, World_add: 3},
      Patch: {USA_1: 1, USA_add: 1, World_1: 3, World_add: 1}
    }

    function cartSubTotal()
    {
      var total = 0;
      for (var i=0; i<$scope.invoice.length; i++)
      {
        total += $scope.invoice[i].qty * $scope.invoice[i].price ;
      }
      return total;
    }
    $scope.cartSubTotal = cartSubTotal;

    //Calculate item with highest shipping rate in cart.
    //This will be used as the base price, all other items will use the "additional"
    //shipping price.  This is roughly the algorithm used in BigCartel and others.
    function getHighestShippingRate()
    {
      var highestRate=0;
      var highest="";

      itemTypes=getItemTypes();

      $.each(shippingRates, function(i, rate)
      {
        //console.log("i: "+i);
        if (itemTypes[i]>0)
        {
          //console.log("i in cartItems");
          if (rate[$scope.shipping_location+"_1"] > highestRate)
          {
            highestRate = rate[$scope.shipping_location+"_1"];
            highest = i;
          }
        }
      });

    return highest;
    }

    function getItemTypes()
    {
      var cartTypes={Shirt:0, Vinyl:0, CD:0, Patch:0};

      $.each($scope.invoice, function(i, item)
      {
        cartTypes[item.type]+=item.qty;
      });

      return cartTypes;
    }

    //Calculate shipping
    function cartShipping() {

      if (cartQuantity() == 0) { return 0; }

      var itemTypes = getItemTypes();

      var first = $scope.shipping_location + "_1";
      var additional = $scope.shipping_location + "_add";

      var total = 0;
      var highestRate = getHighestShippingRate();
      //console.log("getHighestShippingRate: |"+highestRate+"|");

      $.each(itemTypes, function(i, item)
      {
        if (item > 0)
        {

          if (cartQuantity() > 1)
          {
            if (i==highestRate)
            {
              total+=shippingRates[i][$scope.shipping_location+"_1"];
              total+=shippingRates[i][$scope.shipping_location+"_add"] * (item -1);
            }
            else {
              total+=shippingRates[i][$scope.shipping_location+"_add"] * item;
            }
          }
          else {

            total=shippingRates[i][$scope.shipping_location+"_1"] * item;
          }
      }
      });

      return total;

    };

    function updateShippingLocation() {
      /* ToDo: Fix this terrible jQuery hack */
      /* (locate bug causing shippingLocation to reset) */
      $localStorage.beatlesShippingLocation = $scope.shipping_location = $("#shippingLocation option:selected").text();
    }

    $scope.updateShippingLocation = updateShippingLocation;

    $scope.cartShipping = cartShipping;

    function cartCheckout(){console.log("checkout");}
    $scope.cartCheckout = cartCheckout;
});
