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

      //######################## Vars #############################

      this.reposelected = Session.get("reposelected");
      this.collaborateurs = new ReactiveArray();

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

        console.log(githubUsername);
        console.log(accessToken);
        console.log(this.reposelected);

        Meteor.call('getIntegrateursFromRepo', githubUsername, accessToken, this.reposelected,
          function (error, result) {
              cfpLoadingBar.complete();
              this.alreadyRunning = false;
              if(error){
                bertError("Erreur lors de la récupération des collaborateurs. Detail : " + error);
              } else {
                //Remove old
                this.collaborateurs.splice(0, this.collaborateurs.length);
                for (var i = 0; i < result.length; i++) {
                  this.collaborateurs.push(result[i]);
                }
                bertInfo("Récupération des collaborateurs réussie !");
              }
        }.bind(this));

      }

      Tracker.autorun(function() {
        if (Meteor.user() != undefined && Meteor.user().services != undefined && $location.path() == "/integrateurs" ) {
          this.getCollabos();
        }
      }.bind(this));

    }
  }
});
