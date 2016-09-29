angular.module('dashboardPr')
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
      this.currentPageRepo = 0;
      this.reposelected = null;

      this.helpers({
        showRepos: () => {
          return this.repos.list().length == 0;
        },
        reposUser: () => {
          return this.repos.list();
        },
        numberOfPagesRepo: () => {
          return Math.ceil(this.repos.list().length/10);
        }
      });


      //######################## METHODS #############################

      //######## GET REPOS
      this.getRepo = (refresh = false) => {

        var githubUsername = Meteor.user();

        if(!githubUsername)
          return;

        var accessToken = Meteor.user().services.github.accessToken;

        this.currentPageRepo = 0;
        cfpLoadingBar.start();

        //Try to get repos from cache, not from cache if refresh
        var reposCache = GithubRepos.findOne({user:githubUsername});
        if(!refresh && reposCache){
          reposCache = reposCache.repos;
          this.repos.splice(0, this.repos.length);
          for (var i = 0; i < reposCache.length; i++) {
            this.repos.push(reposCache[i]);
          }
          cfpLoadingBar.complete();
          this.alreadyRunning = false;
          bertInfo("Récupération de vos repos réussie à partir du cache !");
          return;
        }

        Meteor.call('getReposFromUser', githubUsername, accessToken,
          function (error, result) {
              cfpLoadingBar.complete();
              this.alreadyRunning = false;
              if(error){
                bertError("Erreur lors de la récupération de vos repos. Detail : " + error);
              } else {
                //Remove old
                this.repos.splice(0, this.repos.length);

                for (var i = 0; i < result.length; i++) {
                  this.repos.push(result[i]);
                }

                bertInfo("Récupération de vos repos réussie !");
              }
        }.bind(this));
      } //END : getRepos

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