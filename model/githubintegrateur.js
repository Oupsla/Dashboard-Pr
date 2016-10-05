GithubIntegrateur = new Mongo.Collection("githubIntegrateur");

if (Meteor.isServer) {

  GithubIntegrateur.allow({
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

  Meteor.publish('githubIntegrateur', function() {
    return GithubIntegrateur.find({});
  });

}
