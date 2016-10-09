angular.module('dashboardPr')
  .filter('startFrom', function() {
        return function(input, start) {
            start = +start; //parse to int
            return input.slice(start);
        }
  })
  .directive('github', function() {
  return {
    restrict: 'E',
    templateUrl: 'client/github/github.html',
    controllerAs: 'github',
    controller: function($scope, $reactive, cfpLoadingBar, $location, sharedProperties) {
      $reactive(this).attach($scope);

      //Subscribe to differents sources to access data
      this.subscribe('users').ready();
      this.subscribe('githubRepos').ready();
      this.subscribe('githubPr').ready();

      //######################## Vars #############################
      this.repos = new ReactiveArray();

      this.query = {
        order: '-open_issues_count',
        limit: 5,
        page: 1
      };

      this.helpers({
        showRepos: () => {
          return this.repos.list().length == 0;
        },
        reposUser: () => {
          return this.repos.list();
        }
      });


      //######################## METHODS #############################

      this.getRepo = (refresh = false) => {
        var githubUsername = Meteor.user().services.github.username;

        if(!githubUsername)
          return;

        var accessToken = Meteor.user().services.github.accessToken;

        cfpLoadingBar.start();

        //Try to get repos from cache, not from cache if refresh
        /*var reposCache = GithubRepos.findOne({user:githubUsername});
        if(!refresh && reposCache){

          reposCache = reposCache.repos;
          this.repos.splice(0, this.repos.length);
          for (var i = 0; i < reposCache.length; i++) {
            this.repos.push(reposCache[i]);
          }
          cfpLoadingBar.complete();
          this.alreadyRunning = false;
          bertInfo("Retrieving your repos successful from cache");
          return;
        }*/

        Meteor.call('getReposFromUser',githubUsername, accessToken,
          function (error, result) {
              cfpLoadingBar.complete();
              this.alreadyRunning = false;
              if(error){
                bertError("Error retrieving your repos. Details : " + error);
              } else {
                //Remove old
                this.repos.splice(0, this.repos.length);

                for (var i = 0; i < result.length; i++) {
                  this.repos.push(result[i]);
                }

                bertInfo("Retrieving your repos successful");
              }
        }.bind(this));
      } //END : getRepos

      this.selectRepo = (reponame) => {
        if(!reponame){
          bertError("Please select a repo");
        } else {
          var values = reponame.split('/');

          localStorage.setItem("userselectedlocal", values[0]);
          Session.set("userselected", localStorage.getItem("userselectedlocal"));
          localStorage.setItem("reposelectedlocal", values[1]);
          Session.set("reposelected", localStorage.getItem("reposelectedlocal"));


          //Session.set("userselected",values[0]);
          //Session.set("reposelected",values[1]);




          $location.path("/integrateurs");
        }
      }//END : selectRepo

      //Le tracker va s'occuper d'appeler la méthode si la valeur de l'user change
      //Celle-ci change si l'user etait deja connecté auparavant à la fin du chargement
      //de la page
      Tracker.autorun(function() {
        if (Meteor.user() != undefined && Meteor.user().services != undefined && $location.path() == "/github" ) {
          this.getRepo();
        }
      }.bind(this));

    }
  }
});
