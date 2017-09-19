angular.module('myApp', ['ngRoute'])
			.factory('UserService', ['$http', function($http) {
		    var service = {
		      isLoggedIn: false,

		      session: function() {
		        return $http.get('/session')
		              .then(function(response) {
		          service.isLoggedIn = true;
		          return response;
		        });
		      },

		      login: function(user) {
		        return $http.post('/login', user)
		          .then(function(response) {
		            service.isLoggedIn = true;
		            return response;
		        });
		      }
		    };
		    return service;
		  }])
		  .controller('MsgCtrl',['$http',function($http){
				var self = this;
				self.msgs = [];
				self.newMsg = {};
				var fetchMsgs = function() {
				  return $http.get('/msg').then(
					  function(response) {
					self.msgs = response.data;
				  }, function(errResponse) {
					console.error('Error while fetching msg');
				  });
				};

				fetchMsgs();

				self.add = function() {
					self.newMsg.msgId = self.msgs.length+1;
				  $http.post('/msg', self.newMsg)
					  .then(fetchMsgs)
					  .then(function(response) {
						self.newMsg = {};
					  });
				};
		  }])
		  .controller('LoginCtrl', ['UserService', '$location',
		    function(UserService, $location) {
		      var self = this;
		      self.userService = UserService;
		      self.user = {username: '', password: ''};

		      self.login = function() {
		        UserService.login(self.user).then(function(success) {
		          $location.path('/login');
		        }, function(error) {
		          self.errorMessage = error.data.msg;
		        })
		      };
		      UserService.session();
		  }])
		  .controller('ManageBlogCtrl',['$http',function($http){
				var self = this;
				self.blogs = [];
				self.newBlog = {};
				var fetchBlogs = function() {
				  return $http.get('/blog').then(
					  function(response) {
					self.blogs = response.data;
				  }, function(errResponse){
					console.error('Error while fetching blog');
				  });
				};

				fetchBlogs();

				self.postBlog = function() {
					self.newBlog.blogId = self.blogs.length+1;
				  $http.post('/blog', self.newBlog)
					  .then(fetchBlogs)
					  .then(function(response) {
						self.newBlog = {};
					  });
				};
		  }])
		  .controller('BlogCtrl',['$http',function($http){
				var self = this;
				self.blogs = [];
				var fetchBlogs = function() {
				  return $http.get('/blog').then(
					  function(response) {
					self.blogs = response.data;
				  }, function(errResponse){
					console.error('Error while fetching blog');
				  });
				};
				fetchBlogs();
		  }])
		  .config(function($routeProvider) {

				$routeProvider.when('/', {
				  templateUrl: 'views/main.html',
				  resolve:{
                    fade:[function(){
					$('.scroll').fadeIn()
				  }]}
				})
				.when('/blog', {
				  templateUrl: 'views/blog.html',
				  controller: 'BlogCtrl as blogCtrl',
				  resolve:{
                    fade:[function(){
					$('.scroll').fadeOut()
				  }]}
				})
				.when('/music', {
				  templateUrl: 'views/music.html',
				  resolve:{
                    fade:[function(){
					$('.scroll').fadeOut()
				  }]}
				})
				.when('/msg', {
				  templateUrl: 'views/msg.html',
				  controller: 'MsgCtrl as msgCtrl',
				  resolve:{
                    fade:[function(){
					$('.scroll').fadeOut()
				  }]}
				})
				.when('/login', {
				  templateUrl: 'views/login.html',
				  controller: 'LoginCtrl as loginCtrl',
				  resolve:{
                    fade:[function(){
					$('.scroll').fadeOut()
				  }]}
				})
				.when('/manageblog', {
				  templateUrl: 'views/manageblog.html',
				  controller: 'ManageBlogCtrl as manageBlogCtrl',
				  resolve:{
                    fade:[function(){
					$('.scroll').fadeOut()
				  }]}
				})
				.when('/managemsg', {
				  templateUrl: 'views/managemsg.html',
				  controller: 'ManageMsgCtrl as manageMsgCtrl',
				  resolve:{
                    fade:[function(){
					$('.scroll').fadeOut()
				  }]}
				})
				$routeProvider.otherwise({
				  redirectTo: '/'
				});
		  })
			.filter('trustHtml', function ($sce) {
			        return function (input) {
			            return $sce.trustAsHtml(input.replace(/\n/g,'<br>'));
			        }
			    });							

