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
      this.subscribe('githubIntegrateur').ready();

      //######################## Vars #############################

      this.reposelected = Session.get("reposelected");
      this.pullRqsToAssign = new ReactiveArray();
      this.pullRqsAssigned = new ReactiveArray();

      this.integrateurs = null;

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

        this.integrateurs = GithubIntegrateur.findOne({repo:githubUsername+"/"+this.reposelected});
        if(this.integrateurs != null)
           this.integrateurs = this.integrateurs.integrateurs;

        var accessToken = Meteor.user().services.github.accessToken;
        cfpLoadingBar.start();

        Meteor.call('getPRsFromProject', githubUsername, this.reposelected,  accessToken,
          function (error, result) {
              cfpLoadingBar.complete();
              this.alreadyRunning = false;
              if(error){
                bertError("Error retrieving your team. Details : " + error);
              } else {
                bertInfo("Retrieving your PRs successful");

                for (var i = 0; i < result.length; i++) {

                  if (result[i].assignees.length == 0){
                    this.pullRqsToAssign.push(result[i]);
                  }
                  if (result[i].assignees.length > 0){
                    this.pullRqsAssigned.push(result[i]);
                  }
                }

              }
        }.bind(this));

      };

      this.removeAssignement = (login, issueNumber) => {

        var githubUsername = Meteor.user().services.github.username;
        if(!githubUsername || !this.reposelected)
          return;
        var accessToken = Meteor.user().services.github.accessToken;
        cfpLoadingBar.start();



        Meteor.call('removeAssignementOfPR', githubUsername, this.reposelected, issueNumber, login, accessToken,
          function (error, result) {
              cfpLoadingBar.complete();
              this.alreadyRunning = false;
              if(error){
                bertError("Error updating your team. Details : " + error);
              } else {
                bertInfo("Successfully removed");
              }
        }.bind(this));
      };

      this.addAssignement = (login, issueNumber) => {

        var githubUsername = Meteor.user().services.github.username;
        if(!githubUsername || !this.reposelected)
          return;
        var accessToken = Meteor.user().services.github.accessToken;
        cfpLoadingBar.start();



        Meteor.call('addAssigneesToPR', githubUsername, this.reposelected, issueNumber, login, accessToken,
          function (error, result) {
              cfpLoadingBar.complete();
              this.alreadyRunning = false;
              if(error){
                bertError("Error updating your team. Details : " + error);
              } else {
                bertInfo("Successfully added");
              }
        }.bind(this));
      };

      this.autoAssign = () => {

        var githubUsername = Meteor.user().services.github.username;

        if(!githubUsername || !this.reposelected)
          return;

        Meteor.call('getPRsFromProject', githubUsername, this.reposelected,
          function (error, result) {
            if(error){
              bertError("Auto Assign failed. Details : " + error);
            } else {
              bertInfo("Auto Assign successful");
            }
          }.bind(this));
      }

      Tracker.autorun(function() {
        if (Meteor.user() != undefined && Meteor.user().services != undefined && $location.path() == "/assignations" ) {
          this.getPullRequests();
        }
      }.bind(this));


    }
  }
});
