var Beatles = angular.module("Beatles", []);

Beatles.controller('BeatlesControl', function($scope, $http) {

  $scope.merchtypes = [
      {"name": 'Shirts', "type": "Shirt"},
      {"name": 'Vinyl', "type": "Vinyl"},
      {"name": 'CDs', "type": "CD"},
      {"name": 'Patches', "type": "Patch"}
  ];



  $http.get('data.json')
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

/*


          angular.forEach($scope.products, function(value, key) {
             value.is_soldout = (value.is_soldout==="1");
           });

          console.log($scope.products);
*/
        });







});
