/**
 * Master Controller
 */

angular.module('dashboardPr')
    .controller('MasterCtrl', ['$scope', '$location', MasterCtrl]);

function MasterCtrl($scope, $location) {
    /**
     * Sidebar Toggle
     */
    var mobileView = 992;

    $scope.currentPage = function(){
      var path = $location.path().substring(1);
      path = path.charAt(0).toUpperCase() + path.slice(1);
      return path;
    }

    $scope.descriptionCurrent = function(){
        switch ($location.path()) {
          case "/github":
            return "Sélectionnez votre projet à gérer";
          case "/assignations":
            return "Assigner les nouvelles Pull Requests à vos intégrateurs";
          case "/integrateurs":
            return "Gérer vos intégrateurs";
          default:
            return "";
        }
    }

    $scope.getClass = function (path) {
      if ($location.path().substr(0, path.length) === path) {
        return 'active-menu';
      } else {
        return '';
      }
    }

    $scope.getWidth = function() {
        return window.innerWidth;
    };

    $scope.toggleSidebar = function() {
        $scope.toggle = !$scope.toggle;
    };

    window.onresize = function() {
        $scope.$apply();
    };
}
