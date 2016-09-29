var GitHubApi = null;
var github = null;

function initGithubApi(tokenGithub){
  GitHubApi = Meteor.npmRequire('github');

  github = new GitHubApi({
    debug: true,
    headers: {
        "user-agent": "DashboardPr-App" // GitHub is happy with a unique user agent
    }
  });

  console.log("Auth github : " + tokenGithub);

  github.authenticate({
    type: "token",
    token: tokenGithub
  });


}

Meteor.methods({

  getReposFromUser: function (username, token) {

    if(!github)
      initGithubApi(token);

    var currentPage = 0;
    var repos = null;

    //On va boucler car on peut avoir que 100 repos à la fois

    var repos = Async.runSync(function(done) {
      github.repos.getAll({
        "affiliation": "owner,organization_member",
        "page": currentPage,
        "per_page": 100
      }, function(err, res) {

        if (github.hasNextPage(res)) {
          github.getNextPage(res, null, function(err, res) {
            done(err, res);
          });
        } else {
          done(err, res);
        }

      });
    });

    if(repos.error != null){
      if(repos.error.message.search("Not Found") != -1)
        throw new Meteor.Error(400, "User not found");
      else
        throw new Meteor.Error(400, repos.error.message);
    }

    //Save in db cache
    GithubRepos.upsert({user:username}, { $set:{
      user:username,
      repos:repos.result
    }});


    return repos.result;
  },// END : getReposFromUser

  getIntegrateursFromRepo: function (username, token, repo) {

    console.log(username);
    console.log(repo);
    console.log(token);

    //if(!github)
    initGithubApi(token);

    var currentPage = 0;
    var integrateurs = null;

    //On va boucler car on peut avoir que 100 repos à la fois
    var integrateurs = Async.runSync(function(done) {
      github.repos.getTeams({
        "user": username,
        "repo": repo,
        "page": currentPage,
        "per_page": 100
      }, function(err, res) {
        if (github.hasNextPage(res)) {
          github.getNextPage(res, null, function(err, res) {
            done(err, res);
          });
        } else {
          done(err, res);
        }
      });
    });

    if(integrateurs.error != null){
      if(integrateurs.error.message.search("Not Found") != -1)
        throw new Meteor.Error(400, "User not found");
      else
        throw new Meteor.Error(400, integrateurs.error.message);
    }


    return integrateurs.result;

  }//END : getIntegrateursFromRepo

});
