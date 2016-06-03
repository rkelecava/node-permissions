var app = angular.module('app',['ui.router']);

app.factory('auth', [
	'$http',
	'$window',
	function ($http, $window) {
		var auth = {};

		auth.saveToken = function (token) {
			$window.localStorage['acl-token'] = token;
		};

		auth.getToken = function () {
			return $window.localStorage['acl-token'];
		};

		auth.isLoggedIn = function () {
			var token = auth.getToken();

			if (token) {
				var payload = JSON.parse($window.atob(token.split('.')[1]));

				return payload.exp > Date.now() / 1000;
			} else {
				return false;
			}
		};

		auth.currentUser = function () {
			if (auth.isLoggedIn()) {
				var token = auth.getToken();
				var payload = JSON.parse($window.atob(token.split('.')[1]));

				return payload.username;
			}
		};

		auth.logIn = function (user) {
			return $http.post('/users/login', user)
				.success(function (data) {
					auth.saveToken(data.token);
				});
		};

		auth.logOut = function () {
			$window.localStorage.removeItem('acl-token');
		};
	}
]);

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