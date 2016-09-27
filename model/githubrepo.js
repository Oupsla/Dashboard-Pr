
GithubRepos = new Mongo.Collection("githubRepos");

//ForTest
export const GithubReposCollection = GithubRepos;

if (Meteor.isServer) {

  GithubRepos.allow({
    insert: function () {
      return true;
    },
    remove: function () {
      return true;
    },
    update: function () {
      return true;
    }
  });


  Meteor.publish('githubRepos', function() {
    return GithubRepos.find({});
  });

}
