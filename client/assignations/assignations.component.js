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

      Session.set("userselected", localStorage.getItem("userselectedlocal"));
      Session.set("reposelected", localStorage.getItem("reposelectedlocal"));

      this.reposelected = Session.get("reposelected");
      this.userselected = Session.get("userselected");
      this.pullRqsToAssign = new ReactiveArray();
      this.pullRqsAssigned = new ReactiveArray();

      this.query1 = {
        order: 'title',
        limit: 5,
        page: 1
      };

      this.query2 = {
        order: 'title',
        limit: 5,
        page: 1
      };

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
                  }
                  if (result[i].assignees.length > 0){
                    this.pullRqsAssigned.push(result[i]);
                  }
                }

              }
        }.bind(this));

      };

      this.removeAssignement = (login, issueNumber, pullRq, assigneeremoved) => {

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
                // for (var i = 0; i < this.pullRqsAssigned.length; i++) {
                //     if (this.pullRqsAssigned[i].id == pullRq.id){
                //       console.log("coooooooolll");
                //       console.log(this.pullRqsAssigned.length);
                //
                //       if (this.pullRqsAssigned.assignees == null){
                //         this.pullRqsAssigned.splice(i, 1);
                //         this.pullRqsToAssign.push(pullRq);
                //         return;
                //       }
                //       for (var j=0; j < this.pullRqsAssigned.assignees.length; j++){
                //           if (this.pullRqsAssigned.assignees[j].login == assigneeremoved.login){
                //             this.pullRqsAssigned.assignees.splice(j, 1);
                //           }
                //       }
                //
                //       if (this.pullRqsAssigned.assignees.length <= 0){
                //         this.pullRqsAssigned.splice(i, 1);
                //         this.pullRqsToAssign.push(pullRq);
                //       }
                //     }
                // }
                document.location.reload(true);
              }
        }.bind(this));
      };

      this.addAssignement = (login, issueNumber, pullRq, assigned) => {

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
                console.log(pullRq)
                for (var i = 0; i < this.pullRqsToAssign.length; i++) {
                    if (this.pullRqsToAssign[i].id == pullRq.id){
                      console.log("coooooooolll");
                      console.log(this.pullRqsToAssign.length);
                      this.pullRqsToAssign.splice(i, 1);
                      console.log(this.pullRqsToAssign.length);
                      this.pullRqsAssigned.push(pullRq);
                      pullRq.assignees.push(assigned);
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
              var array = this.pullRqsToAssign.array();

              for (var key in result) {
                if (result.hasOwnProperty(key)) {
                  for (var key2 in array) {
                    if (array.hasOwnProperty(key2)) {
                      if(array[key2].id == result[key].id){
                        //Signal to angular that the deep var have changed with apply
                        $scope.$apply(function(){
                          array[key2].assigned = result[key].assignAdvice;
                        }.bind(this));
                        break;
                      }
                    }
                  }
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
