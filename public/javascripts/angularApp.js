var app = angular.module('app',['ui.router']);

app.factory('auth', [
	'$http',
	'$window',
	'$state',
	'$stateParams',
	function ($http, $window, $state, $stateParams) {
		var auth = {
			roles: []
		};

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

		auth.hasRole = function (role) {
			for (var i=0; i<auth.roles.length; i++) {
				if (role == 'user') {
					if (auth.roles[i] == role || auth.roles[i] == 'admin') {
						return true;
					}
				} else {
					if (auth.roles[i] == role) {
						return true;
					}
				}

			}

			return false;
		};

		auth.currentUser = function () {
			if (auth.isLoggedIn()) {
				var token = auth.getToken();
				var payload = JSON.parse($window.atob(token.split('.')[1]));

				angular.copy(payload.roles, auth.roles);

				return payload.username;
			}
		};

		auth.getRoles = function () {
			if (auth.isLoggedIn()) {
				var token = auth.getToken();
				var payload = JSON.parse($window.atob(token.split('.')[1]));

				return $http.get('/users/' + payload._id + '/roles')
					.success(function (data) {
						angular.copy(data, auth.roles);
					});
			} else {
				angular.copy([], auth.roles);
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
			auth.roles = [];
			$state.transitionTo($state.current, $stateParams, { reload: true, inherit: false, notify: true });
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
			})
			.state('admin', {
				url: '/admin',
				templateUrl: '_admin.html',
				controller: 'AdminCtrl',
				onEnter: [
					'$state',
					'auth',
					function ($state, auth) {
						if (!auth.isLoggedIn() && !auth.hasRole('admin')) {
							$state.go('login');
						}
					}]
			});
	}
]);

app.controller('MainCtrl',['$scope', 'auth', function ($scope, auth) {
	$scope.roles = auth.roles;
	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.hasRole = auth.hasRole;
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


app.controller('AdminCtrl', [
	'$scope',
	'auth',
	function ($scope, auth) {
		$scope.isLoggedIn = auth.isLoggedIn;
		$scope.hasRole = auth.hasRole;
	}
]);