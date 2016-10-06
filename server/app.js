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

  console.log("Github auth : " + tokenGithub);

  // oauth key/secret (to get a token)
  github.authenticate({
      type: "oauth",
      token: tokenGithub
  });


}

Meteor.methods({

  getReposFromUser: function (username, token) {

    if(!github)
      initGithubApi(token);

    var repos = null;

    var repos = Async.runSync(function(done) {
      github.repos.getAll({
        "affiliation": "owner,collaborator",
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

  getPRsFromProject: function (username, repo, token) {
    console.log("WWWWWWWWWMMMMMMMMMMMMMMMM");
    if(!github)
      initGithubApi(token);

    var pullRequests = null;


    var pullRequests = Async.runSync(function(done) {
      github.pullRequests.getAll({
        "user": username,
        "repo": repo,
        "state": "open",
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

    if(pullRequests.error != null){
      if(pullRequests.error.message.search("Not Found") != -1)
        throw new Meteor.Error(400, "PR not found");
      else
        throw new Meteor.Error(400, pullRequests.error.message);
    }

    return pullRequests.result;


  }, // END : getPRsFromProject

  getIntegrateursFromRepo: function (username, token, repo) {

    if(!github)
      initGithubApi(token);

    var result = {
      integrateurs: null,
      stats: null
    };

    var integrateurs = new Array();
    var collaborateurs = null;

    collaborateurs = Async.runSync(function(done) {
      github.repos.getCollaborators({
        "user": username,
        "repo": repo,
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
      if(!collab.permissions.admin && collab.permissions.push){
        integrateurs.push(collab);

      }
    });

    //Save in db cache
    GithubIntegrateur.upsert({repo:username+"/"+repo}, { $set:{
      repo:username+"/"+repo,
      repos:integrateurs
    }});


    var events = null;

    events = Async.runSync(function(done) {
      github.activity.getEventsForRepoIssues({
        "user": username,
        "repo": repo,
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

    if(events.error != null){
      if(events.error.message.search("Not Found") != -1)
        throw new Meteor.Error(400, "User not found");
      else
        throw new Meteor.Error(400, events.error.message);
    }

    //crushing events
    events.result.forEach(function (evt) {
      if(evt.event == "merged"){

      

      }
    });


    console.log(events);



    result.integrateurs = integrateurs;
    result.stats = events;

    return result;

  },//END : getIntegrateursFromRepo

  updateIntegrateurs: function (username, repo, integrateurs) {
  
    for (var key in integrateurs) {
      if (integrateurs.hasOwnProperty(key)) {
        console.log(key + " -> " + JSON.stringify(integrateurs[key]));

        GithubIntegrateur.upsert({integrateurName:username+"-"+repo+"-"+integrateurs[key].login}, { $set:{
          integrateurName:username+"-"+repo+"-"+integrateurs[key].login,
          id:integrateurs[key].id,
          avatar_url:integrateurs[key].avatar_url,
          type:integrateurs[key].type,
          note:integrateurs[key].note,
          permissions:integrateurs[key].permissions
        }});

      }
    }

    return true;

  }//END : updateIntegrateurs

});
