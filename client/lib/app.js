angular.module('dashboardPr', [
  'angular-meteor',
  'ui.router',
  'ngMaterial',
  'mdDataTable',
  'ngFileUpload',
  'ui.bootstrap',
  'ngAnimate',
  'accounts.ui',
  'angular-loading-bar'
])
.service('sharedProperties', function () {
    var changement = null;

    return {
        getChangement: function () {
            return changement;
        },
        setChangement: function(value) {
            changement = value;
        }
    };
});

Accounts.ui.config({
  requestPermissions: {
    github: ['user', 'repo', 'admin:org', 'admin:repo_hook', 'notifications']
  }
});


bertError = function bertError(message){
  Bert.alert({
    title: "Erreur",
    message: message,
    type: 'danger',
    style: 'growl-top-right',
    icon: 'fa-times'
  });
};


bertInfo = function bertInfo(message){
  Bert.alert({
    title: 'Info',
    message: message,
    type: 'info',
    style: 'growl-top-right',
    icon: 'fa-check-circle'
  });
};
