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


    //We will know count the number of assignement by integrators
    var integrateursDB = GithubIntegrateur.findOne({repo:username+"/"+repo});
    if(integrateursDB == null)
      return;
    integrateursDB = integrateursDB.integrateurs;

    for (var i=0; i<integrateursDB.length; i++) {
        integrateursDB[i].numberAssign = 0;
    }


    pullRequests.result.forEach(function (pr) {
      if(pr.assignee != null){
        for (var i=0; i<integrateursDB.length; i++) {
          if (pr.assignee.login == integrateursDB[i].login)
            integrateursDB[i].numberAssign += 1;  
        }
      }
    });

    GithubIntegrateur.upsert({repo:username+"/"+repo}, { $set:{
      repo:username+"/"+repo,
      integrateurs:integrateursDB
    }});


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

    //Store integrators in DB
    var integrateursDB = GithubIntegrateur.findOne({repo:username+"/"+repo});
    if(integrateursDB == null){
      //First Time
      GithubIntegrateur.upsert({repo:username+"/"+repo}, { $set:{
        repo:username+"/"+repo,
        integrateurs:integrateurs
      }});
    } else {
      //Update
      integrateursDB = integrateursDB.integrateurs;

      for (var key in integrateurs) {
        if (integrateurs.hasOwnProperty(key)) {
          for (var i=0; i<integrateursDB.length; i++) {
            if (integrateursDB[i].login == integrateurs[key].login) {
              integrateurs[key].typeIntegrateur = integrateursDB[i].typeIntegrateur;
              integrateurs[key].note = integrateursDB[i].note;
              integrateurs[key].numberAssign = integrateursDB[i].numberAssign;
              break;
            }
          }
        }
      }

      GithubIntegrateur.upsert({repo:username+"/"+repo}, { $set:{
        repo:username+"/"+repo,
        integrateurs:integrateurs
      }});
    }

    result.integrateurs = integrateurs;

    return result;

  },//END : getIntegrateursFromRepo

  updateIntegrateurs: function (username, repo, integrateurs) {

    var integrateursDB = GithubIntegrateur.findOne({repo:username+"/"+repo});
    if(integrateursDB == null)
      return;
    integrateursDB = integrateursDB.integrateurs;

    for (var key in integrateurs) {
      if (integrateurs.hasOwnProperty(key)) {

        for (var i=0; i<integrateursDB.length; i++) {
          if (integrateursDB[i].login == integrateurs[key].login) {
            integrateursDB[i].id = integrateurs[key].id;
            integrateursDB[i].avatar_url = integrateurs[key].avatar_url;
            integrateursDB[i].typeIntegrateur = integrateurs[key].typeIntegrateur;
            integrateursDB[i].note = integrateurs[key].note;
            integrateursDB[i].permissions = integrateurs[key].permissions;
            integrateursDB[i].numberAssign = integrateurs[key].numberAssign;
            break;
          }
        }
      }
    }

    GithubIntegrateur.upsert({repo:username+"/"+repo}, { $set:{
      repo:username+"/"+repo,
      integrateurs:integrateursDB
    }});

    return true;

  },//END : updateIntegrateurs

  autoAssign: function(username, repo){

  }//END : autoAssign





});
