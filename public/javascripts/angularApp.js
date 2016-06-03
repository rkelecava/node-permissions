var app = angular.module('app',['ui.router']);

app.config([
	'$stateProvider',
	'$urlRouterProvider',
	function ($stateProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise('home');

		$stateProvider
			.state('home', {
				url: '/home',
				templateUrl: '_home.html',
				controller: 'MainCtrl'
			});
	}
]);

app.controller('MainCtrl',['$scope', function ($scope) {

}]);