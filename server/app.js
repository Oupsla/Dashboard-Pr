var GitHubApi = null;
var github = null;

function initGithubApi(tokenGithub){
  GitHubApi = Meteor.npmRequire('github');

  github = new GitHubApi({
    debug: true,
    headers: {
        "user-agent": "DashboardPr-App" // GitHub is happy with a unique user agent
    },
    protocol: "https",
    host: "api.github.com",
    timeout: 5000
  });

  github.authenticate({
    type: "token",
    token: ""
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

    if(!github)
      initGithubApi(token);

    var currentPage = 0;
    var integrateurs = new Array();
    var collaborateurs = null;

    //On va boucler car on peut avoir que 100 repos à la fois
    collaborateurs = Async.runSync(function(done) {
      github.repos.getCollaborators({
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

    if(collaborateurs.error != null){
      if(collaborateurs.error.message.search("Not Found") != -1)
        throw new Meteor.Error(400, "User not found");
      else
        throw new Meteor.Error(400, collaborateurs.error.message);
    }

    //We get all collabs, we need to remove no-admin
    collaborateurs.result.forEach(function (collab) {

      console.log("NEW COLLAB \n");
      console.log(collab);

      if(!collab.permissions.admin && collab.permissions.push){
        integrateurs.push(collab);
      }
    });

    return integrateurs;

  }//END : getIntegrateursFromRepo

});
