var GithubApi = null;
var github = null;

function initGithubApi(token){
  GithubApi = Meteor.npmRequire('github');
  github = new GithubApi({
      version: "3.0.0"
  });

  // or oauth
  github.authenticate({
    type: "oauth",
    token: token
  });
}

Meteor.methods({

  getReposFromUser: function (username, token) {

      if(!github)
        initGithubApi(token);

      //save token for hook uses
      GithubUser.upsert({user:Meteor.user().services.github.username}, {$set:{
        user:Meteor.user().services.github.username,
        token:token
      }});


      var currentPage = 0;
      var repos = null;
      var reposTemp = null;

      //On va boucler car on peut avoir que 100 repos à la fois
      while(true){
        var reposTemp = Async.runSync(function(done) {
          github.repos.getFromUser({
              user: username,
              page: currentPage,
              per_page: 100
          }, function(err, res) {
              done(err, res);
          });
        });

        if(reposTemp.error != null){
          if(reposTemp.error.message.search("Not Found") != -1)
            throw new Meteor.Error(400, "User not found");
          else
            throw new Meteor.Error(400, reposTemp.error.message);
        }

        //On a tous les repos de l'utilisateur
        if(reposTemp.result.length % 100 != 0){
          if(!repos)
            repos = reposTemp;
          break;
        }
        else{
          currentPage++;
          if(!repos)
            repos = reposTemp;
          else {
            repos.result = repos.result.concat(reposTemp.result);
          }
        }
      }

      //Save in db cache
      GithubRepos.upsert({user:username}, {$set:{
        user:username,
        repos:repos.result
      }});


      return repos.result;
  },

  getPullFromRepo: function (username, reponame, token) {

    if(!github)
      initGithubApi(token);

    //save token for hook uses
    GithubUser.upsert({user:Meteor.user().services.github.username}, {$set:{
      user:Meteor.user().services.github.username,
      token:token
    }});

    var pullRequests = Async.runSync(function(done) {
      github.pullRequests.getAll({
          user: username,
          repo: reponame,
          per_page: 100
      }, function(err, res) {
          done(err, res);
      });
    });

    if(pullRequests.error != null){
      throw new Meteor.Error(400, repos.error.message);
    }

    //Save in db cache
    GithubPr.upsert({user:username, repo: reponame}, {$set:{
      user:username,
      repo: reponame,
      pullRequests:pullRequests.result
    }});


    return pullRequests.result;
  }

});
