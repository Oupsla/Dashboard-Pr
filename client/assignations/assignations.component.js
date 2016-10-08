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
      this.userselected = Session.get("userselected");
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

        if(!this.reposelected || !this.userselected){
          bertError("Error of selection of repository");
          return;
        }

        this.integrateurs = GithubIntegrateur.findOne({repo:this.userselected+"/"+this.reposelected});        
        if(this.integrateurs != null)
           this.integrateurs = this.integrateurs.integrateurs;

        var accessToken = Meteor.user().services.github.accessToken;
        cfpLoadingBar.start();

        Meteor.call('getPRsFromProject', this.userselected, this.reposelected,  accessToken,
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
                    console.log("qdmqsdmsqkd");
                    console.log(result[i]);
                  }
                  if (result[i].assignees.length > 0){
                    this.pullRqsAssigned.push(result[i]);
                  }

                  console.log(this.pullRqsToAssign);
                }

              }
        }.bind(this));

      };

      this.removeAssignement = (login, issueNumber) => {

        if(!this.reposelected || !this.userselected){
          bertError("Error of selection of repository");
          return;
        }

        var accessToken = Meteor.user().services.github.accessToken;
        cfpLoadingBar.start();

        Meteor.call('removeAssignementOfPR', this.userselected, this.reposelected, issueNumber, login, accessToken,
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

      this.addAssignement = (login, issueNumber, pullRq) => {

        if(!this.reposelected || !this.userselected){
          bertError("Error of selection of repository");
          return;
        }

        var accessToken = Meteor.user().services.github.accessToken;
        cfpLoadingBar.start();

        Meteor.call('addAssigneesToPR', this.userselected, this.reposelected, issueNumber, login, accessToken,
          function (error, result) {
              cfpLoadingBar.complete();
              this.alreadyRunning = false;
              if(error){
                bertError("Error updating your team. Details : " + error);
              } else {
                bertInfo("Successfully added");
                console.log("wsqdsqd");
                console.log(pullRq.id)
                for (var i = 0; i < this.pullRqsToAssign.length; i++) {
                    if (this.pullRqsToAssign[i].id == pullRq.id){
                      console.log("coooooooolll");
                      console.log(this.pullRqsToAssign.length);
                      this.pullRqsToAssign.splice(i, 1);
                      console.log(this.pullRqsToAssign.length);

                      var temp = new ReactiveArray();

                      for (var j = 0; j < this.pullRqsToAssign.length; j++) {
                        temp.push(this.pullRqsToAssign[j]);
                      }

                      //Remove old
                      this.pullRqsToAssign.clear();
                      console.log(temp.length);
                      console.log(this.pullRqsToAssign.length);

                      for (var j = 0; j < temp.length; j++) {
                        this.pullRqsToAssign.push(temp[j]);
                      }

                      console.log(this.pullRqsToAssign.length)

                    }
                }
              }
        }.bind(this));
      };

      this.autoAssign = () => {

        if(!this.reposelected || !this.userselected){
          bertError("Error of selection of repository");
          return;
        }

        Meteor.call('autoAssign', this.userselected, this.reposelected, this.pullRqsToAssign,
          function (error, result) {
            if(error){
              bertError("Auto Assign failed. Details : " + error);
            } else {
              for (var key in result) {
                if (result.hasOwnProperty(key)) {
                  console.log(result[key].assignAdvice);
                }
              }
              bertInfo("Auto Assign successful");
            }
          }.bind(this));
      };

      Tracker.autorun(function() {
        if (Meteor.user() != undefined && Meteor.user().services != undefined && $location.path() == "/assignations" ) {
          this.getPullRequests();
        }
      }.bind(this));


    }
  }
});
