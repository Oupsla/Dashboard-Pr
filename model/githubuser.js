GithubUser = new Mongo.Collection("githubUser");

//ForTest
export const GithubUserCollection = GithubUser;


if (Meteor.isServer) {

  GithubUser.allow({
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

  Meteor.publish('githubUser', function() {
    return GithubUser.find({});
  });

}
