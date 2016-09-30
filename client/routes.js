angular.module('dashboardPr').config(function ($urlRouterProvider, $stateProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $stateProvider
    .state('github', {
      url: '/github',
      template: '<github></github>'
    })
    .state('assignations', {
      url: '/assignations',
      template: '<assignations></assignations>'
    })
    .state('integrateurs', {
      url: '/integrateurs',
      template: '<integrateurs></integrateurs>'
    });;

  $urlRouterProvider.otherwise("/github");
});
