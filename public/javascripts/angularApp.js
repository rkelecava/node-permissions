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

		return auth;
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
			})
			.state('login', {
				url: '/login',
				templateUrl: '_login.html',
				controller: 'AuthCtrl',
				onEnter: [
					'$state',
					'auth',
					function ($state, auth) {
						if (auth.isLoggedIn()) {
							$state.go('home');
						}
					}]
			});
	}
]);

app.controller('MainCtrl',['$scope', function ($scope) {

}]);

app.controller('AuthCtrl', [
	'$scope',
	'$state',
	'auth',
	function ($scope, $state, auth) {
		$scope.user = {};

		$scope.logIn = function () {
			auth.logIn($scope.user)
				.error(function (error) {
					$scope.error = error;
				}).then(function () {
					$state.go('home');
				});
		};
	}
]);

app.controller('NavCtrl', [
	'$scope',
	'auth',
	function ($scope, auth) {
		$scope.isLoggedIn = auth.isLoggedIn;
		$scope.currentUser = auth.currentUser;
		$scope.logOut = auth.logOut;
	}
]);