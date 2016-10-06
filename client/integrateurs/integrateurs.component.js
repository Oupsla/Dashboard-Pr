angular.module('dashboardPr')
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
      this.subscribe('githubIntegrateur').ready();

      //######################## Vars #############################
      this.reposelected = Session.get("reposelected");
      this.integrateurs = new ReactiveArray();

      this.types = [
        "Test", "Front", "Back", "Other"
      ];

      this.helpers({
        showPage: () => {
          return this.reposelected != null;
        }
      });

      //######################## METHODS #############################

      this.getCollabos = (refresh = false) => {
        var githubUsername = Meteor.user().services.github.username;

        if(!githubUsername || !this.reposelected)
          return;

        var accessToken = Meteor.user().services.github.accessToken;
        cfpLoadingBar.start();

        Meteor.call('getIntegrateursFromRepo', githubUsername, accessToken, this.reposelected,
          function (error, result) {
              cfpLoadingBar.complete();
              this.alreadyRunning = false;
              if(error){
                bertError("Error retrieving your team. Details : " + error);
              } else {
                //Remove old
                this.integrateurs.splice(0, this.integrateurs.length);
                for (var i = 0; i < result.integrateurs.length; i++) {
                  this.integrateurs.push(result.integrateurs[i]);
                }
                bertInfo("Retrieving your team successful");
              }
        }.bind(this));

      };

      this.updateIntegrateurs = () => {

        var githubUsername = Meteor.user().services.github.username;

        if(!githubUsername || !this.reposelected)
          return;

        Meteor.call('updateIntegrateurs', githubUsername, this.reposelected, this.integrateurs,
          function (error, result) {
              cfpLoadingBar.complete();
              this.alreadyRunning = false;
              if(error){
                bertError("Error updating your team. Details : " + error);
              } else {
                bertInfo("Updating your team successful");
              }
        }.bind(this));
      };

      Tracker.autorun(function() {
        if (Meteor.user() != undefined && Meteor.user().services != undefined && $location.path() == "/integrateurs" ) {
          this.getCollabos();
        }
      }.bind(this));

    }
  }
});
