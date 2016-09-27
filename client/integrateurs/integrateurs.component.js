angular.module('prettyPr')
  .directive('integrateurs', function() {
  return {
    restrict: 'E',
    templateUrl: 'client/integrateurs/integrateurs.html',
    controllerAs: 'integrateurs',
    controller: function($scope, $reactive, cfpLoadingBar, $location, sharedProperties) {
      $reactive(this).attach($scope);

      //Subscribe to differents sources to access data
      this.subscribe('users').ready();
      this.subscribe('githubRepos').ready();
      this.subscribe('githubPr').ready();

      //######################## Vars #############################



      //######################## METHODS #############################

    }
  }
});
