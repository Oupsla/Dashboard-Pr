angular.module('dashboardPr')
  .directive('assignations', function() {
  return {
    restrict: 'E',
    templateUrl: 'client/assignations/assignations.html',
    controllerAs: 'assignations',
    controller: function($scope, $reactive, cfpLoadingBar, $location, sharedProperties) {
      $reactive(this).attach($scope);

      //Subscribe to differents sources to access data
      this.subscribe('users').ready();
      this.subscribe('githubRepos').ready();
      this.subscribe('githubPr').ready();

      //######################## Vars #############################

      this.reposelected = Session.get("reposelected");

      this.helpers({
        showPage: () => {
          return this.reposelected != null;
        }
      });


      //######################## METHODS #############################

    }
  }
});
