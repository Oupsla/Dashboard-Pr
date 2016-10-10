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


  removeAssignementOfPR: function (user, repo, number, login, token) {

    initGithubApi(token);

    var request=Meteor.npmRequire("request");

    /*var options = {
      url: "https://api.github.com/repos/denishamann/twistedmagic/issues/3/assignees?assignees=Oupsla&access_token=" + token,
      headers: {
        'User-Agent': 'DashboardPr-App'
      }
      //body: "assignees: ['Oupsla']"
    };*/

    var body = '{"assignees": ["'+login+'"]}';

    var options = {
      //url: 'https://api.github.com/repos/" +user+ "/" + repo + "/issues/" + number + "/?assignees%3D%5B%22Oupsla%22%5D%26access_token%3D' + token,
      url: "https://api.github.com/repos/" + user + "/" + repo + "/issues/" + number + "/assignees?access_token=" + token,
      method: "DEL",
      headers: {
        'User-Agent': 'DashboardPr-App'
      },
      json: JSON.parse(body)
    };

    request.del(options,function(error,response,body){
      if(error){
        throw new Meteor.Error(400, error);
      }else{
        return true;
      }
    });
  }, // END : removeAssignementOfPR

  addAssigneesToPR: function (user, repo, number, login, token) {

    initGithubApi(token);

    var response = Async.runSync(function(done) {
      github.issues.addAssigneesToIssue({
        "user": user,
        "repo": repo,
        "number": number,
        "assignees":  login
      }, function(err, res) {
          done(err, res);
      });
    });

    if(response.error != null){
      if(response.error.message.search("Not Found") != -1)
        throw new Meteor.Error(400, "PR not found");
      else
        throw new Meteor.Error(400, response.error.message);
    }

    return response.result;


  }, // END : removeAssignementOfPR

  getIntegrateursFromRepo: function (username, repo, token) {

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
      if(collab.permissions.push){
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

  autoAssign: function(username, repo, pullRequests){

    var https = Meteor.npmRequire('follow-redirects').https;
    var async = Meteor.npmRequire('async');


    var integrateursDB = GithubIntegrateur.findOne({repo:username+"/"+repo});
    if(integrateursDB == null)
      return;
    integrateursDB = integrateursDB.integrateurs;


    var results = Async.runSync(function(done) {

      async.each(pullRequests, function(pull, callback) {
        var urlFile = pull.patch_url;
        var req = https.get(urlFile, function (resource) {
          resource.setEncoding('utf8');
          resource.on('data', function (data) {

            //Now we will try to say which type is this pull request
            if(data.indexOf('test') != -1){
              pull.typeOfPull = 'Test';
            } else if(data.indexOf('client') != -1 || data.indexOf('html') != -1 || data.indexOf('css') != -1 || data.indexOf('less') != -1){
              pull.typeOfPull = 'Front';
            } else if(data.indexOf('server') != -1){
              pull.typeOfPull = 'Back';
            } else if(data.indexOf('README') != -1 || data.indexOf('doc') != -1 || data.indexOf('txt') != -1){
              pull.typeOfPull = 'Doc';
            } else {
              pull.typeOfPull = 'Other';
            }
          });


        });
        req.end();
        callback();
      }, function(err) {
        if( err ) {
          done("A pr failed to process", null);
        } else {

          //Now we will assign
          for (var key in pullRequests) {
            if (pullRequests.hasOwnProperty(key)) {

              //Return the min of numberAssign integrator
              var res = integrateursDB.reduce(function(prev, current) {
                  if (prev.typeIntegrateur != null && prev.typeIntegrateur == pullRequests[key].typeOfPull)
                    return prev;

                  if (current.typeIntegrateur != null && current.typeIntegrateur == pullRequests[key].typeOfPull)
                    return current;

                  return (prev.numberAssign < current.numberAssign) ? prev : current;
              });

              pullRequests[key].assignAdvice = res.login;
              pullRequests[key].numberAssign += 1;
            }
          }

          done(null, pullRequests);;
        }
      });

    });

    if(results.error != null){
      if(results.error.message.search("Not Found") != -1)
        throw new Meteor.Error(400, "User not found");
      else
        throw new Meteor.Error(400, results.error.message);
    }

    return results.result;




  }//END : autoAssign





});
