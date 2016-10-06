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

      this.getPullRequests = () => {
        var githubUsername = Meteor.user().services.github.username;

        if(!githubUsername || !this.reposelected)
          return;

        var accessToken = Meteor.user().services.github.accessToken;
        cfpLoadingBar.start();

        Meteor.call('getPRsFromProject', githubUsername, this.reposelected,  accessToken,
          function (error, result) {
              console.log(result);
              cfpLoadingBar.complete();
              this.alreadyRunning = false;
              if(error){
                bertError("Error retrieving your team. Details : " + error);
              } else {
                bertInfo("Retrieving your PRs successful");
              }
        }.bind(this));

      }


    }
  }
});
