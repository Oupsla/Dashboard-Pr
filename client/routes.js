angular.module('prettyPr').config(function ($urlRouterProvider, $stateProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $stateProvider
    .state('assignations', {
      url: '/assignations',
      template: '<assignations></assignations>'
    })
    .state('integrateurs', {
      url: '/integrateurs',
      template: '<integrateurs></integrateurs>'
    });;

  $urlRouterProvider.otherwise("/integrateurs");
});
