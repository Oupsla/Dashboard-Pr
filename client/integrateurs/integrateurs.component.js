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
      Session.set("userselected", localStorage.getItem("userselectedlocal"));
      Session.set("reposelected", localStorage.getItem("reposelectedlocal"));
      
      this.reposelected = Session.get("reposelected");
      this.userselected = Session.get("userselected");
      this.integrateurs = new ReactiveArray();

      this.types = [
        "Test", "Front", "Back", "Doc", "Other"
      ];

      this.helpers({
        showPage: () => {
          return this.reposelected != null;
        }
      });

      //######################## METHODS #############################

      this.getCollabos = (refresh = false) => {

        if(!this.reposelected || !this.userselected){
          bertError("Error of selection of repository");
          return;
        }

        var accessToken = Meteor.user().services.github.accessToken;
        cfpLoadingBar.start();

        Meteor.call('getIntegrateursFromRepo', this.userselected, this.reposelected, accessToken,
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

        if(!this.reposelected || !this.userselected){
          bertError("Error of selection of repository");
          return;
        }

        Meteor.call('updateIntegrateurs', this.userselected, this.reposelected, this.integrateurs,
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
