//Peut servir à ajouté des données au démerrage de meteor avec .startup
Meteor.publish('users', function(){
  return Meteor.users.find({});
});

//Permet à la collection Upload d'accéder au chemin vers les uploads
Meteor.settings.public.meteor_env = process.env.PWD;
