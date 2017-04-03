(function() {
	// App Module
	angular.module("musicapp", ['ngResource'])

		// Search bar directive to include a working search bar into modules
		.directive('searchbar', function() {
			return {
				restrict: 'EA',
				replace: false,
				template: '<input type="text" name="searchbar" placeholder="Search Title" class="searchbar" ng-model="search"> <span class="clear" ng-click="search=\'\'" ng-show="search != \'\'"></span> <span class="searchicon"></span>',
				scope: { search: "=name" },
				link: function($scope, ele, attr) {
					
				}
			};
		})

		// Song directive to represent a listview song item
		.directive('song', function() {
			return {
				restrict: 'EA',
				replace: false,
				template: '<div class="row"> <span class="desc"><span class="title">{{song.title}}</span> <span class="genre">[{{song.genres[0].name}}]</span></span> <span class="rating"><rating ng-value="song.rating"></rating></span> </div>',
				scope: { song: "=name" },
				link: function($scope, ele, attr) {
					
				}
			};
		})

		// Genre directive to represent a listview genre item
		.directive('genre', function() {
			return {
				restrict: 'EA',
				replace: false,
				template: '<div class="row" > <span class="title">{{record.name}}</span> </div>',
				scope: { record: "=name" },
				link: function($scope, ele, attr) {
					
				}
			};
		})

		// rating directive to represent a 5-star rating
		.directive('rating', function() {
			return {
				restrict: 'EA',
				replace: false,
				scope: { value: "=ngValue" },
				template: '',
				link: function($scope, ele, attr) {
					var selected = parseFloat($scope.value) / 2;

					for(var i = 0; i < 5; i++) {
						var span = document.createElement('span');
						span.class = 'star';

						if(i < selected)
							span.innerHTML = "&#9733;";
						else
							span.innerHTML = "&#9734;";

						ele.append(span);
					}
				}
			};
		})

		// SongService to provide a compiled resource for songs operation
		.factory('SongService', function($resource) {
			var data = $resource('http://104.197.128.152:8000/v1/tracks/:id', {id: '@id'});
		    return data;
		})

		// GenreService to provide a compiled resource for genres operation
		.factory('GenreService', function($resource) {
			var data = $resource('http://104.197.128.152:8000/v1/genres/:id', {id: '@id'});
		    return data;
		})

		// SongList service to provide a methods for easy access to SongService
		.factory('SongList', function(SongService) {
			var res = {};

			res.songs = [];
			res.next = false;
			res.prev = false;
			res.current = 1;
			res.cached = 0;

			res.getPage = function(page, callback) {
				if(typeof page == "undefined" || page == null)
					page = 1;

				var query = SongService.get({page: page});
				query.$promise.then(function(data) {
					if(typeof callback == "function")
						callback(data);
				});
			};

			res.getSong = function(id, callback) {
				if(typeof id == "undefined" || id == null)
					throw "Invalid ID Provided!"; 
				else {
					// check if track is inside cache
					for(var i = 0; i < res.songs.length; i++) {
						if(res.songs[i].id == id) {
							if(typeof callback == "function")
								callback(res.songs[i]);
							return;
						}
					}

					// get the selected id
					var query = SongService.get({id: id});
					query.$promise.then(function(data) {
						if(typeof callback == "function")
							callback(data.result);
					});
				}
			};

			res.searchSong = function(title, callback) {
				if(typeof title == "undefined" || title == null || title == "")
					throw "Invalid title Provided!"; 
				else {
					// get the selected id
					var query = SongService.get({title: title});
					query.$promise.then(function(data) {
						if(typeof callback == "function")
							callback(data.results);
					});
				}
			};

			res.update = function(id, track, callback) {
				if(typeof id == "undefined" || id == null)
					throw "Invalid ID Provided!";
				else {
					var genres = [];
					for(var i = 0; i < track.genres.length; i++) {
						genres.push(parseInt(track.genres[i].id));
					}

					var query = SongService.save({id: id}, {id: id, title: track.title, rating: track.rating, genres: genres});
					query.$promise.then(function(data) {
						if(typeof callback == "function")
							callback(data.results);
					});
				}
			};

			res.add = function(track, callback) {
				if(typeof track == "object" && typeof track.title != "undefined") {

					var genres = [];
					for(var i = 0; i < track.genres.length; i++) {
						genres.push(parseInt(track.genres[i].id));
					}

					var query = SongService.save({title: track.title, rating: track.rating, genres: genres});
					query.$promise.then(function(data) {
						if(typeof callback == "function")
							callback(data.results);
					});
				} else {
					throw "Invalid Track Information";
				}
			};

			res.get = function(callback) {
				if(res.cached == res.current) {
					if(typeof callback == "function")
						callback();
					return;
				} else {
					res.getPage(res.current, function(data) {
						res.songs = data.results;
						res.next = (data.next != null);
						res.prev = (data.previous != null);

						res.cached = res.current;

						if(typeof callback == "function")
							callback();
					});
				}
			};

			res.nextPage = function(callback) {
				if(res.next != false) {
					res.current++;
					res.get(callback);
				}
			};

			res.prevPage = function(callback) {
				if(res.prev != false) {
					res.current--;
					res.get(callback);
				}
			};

			return res;
		})

		// GenresList service to provide a methods for easy access to GenreService
		.factory('GenresList', function(GenreService) {
			var res = {};

			res.genres = [];
			res.next = false;
			res.prev = false;
			res.current = 1;
			res.cached = 0;

			res.getPage = function(page, callback) {
				if(typeof page == "undefined" || page == null)
					page = 1;

				var query = GenreService.get({page: page});
				query.$promise.then(function(data) {
					if(typeof callback == "function")
						callback(data);
				});
			};

			res.getGenre = function(id, callback) {
				if(typeof id == "undefined" || id == null)
					throw "Invalid ID Provided!"; 
				else {
					// check if track is inside cache
					for(var i = 0; i < res.genres.length; i++) {
						if(res.genres[i].id == id) {
							if(typeof callback == "function")
								callback(res.genres[i]);
							return;
						}
					}

					// get the selected id
					var query = GenreService.get({id: id});
					query.$promise.then(function(data) {
						if(typeof callback == "function")
							callback(data.results);
					});
				}
			};

			res.update = function(id, record) {
				if(typeof id == "undefined" || id == null || typeof record != "object" || typeof record.name == "undefined")
					throw "Invalid ID Provided!";
				else {
					var query = GenreService.save({id: id}, {id: id, name: record.name});
					query.$promise.then(function(data) {
						if(typeof callback == "function")
							callback(data.results);
					});
				}
			};

			res.add = function(record) {
				if(typeof record == "object" && typeof record.name != "undefined") {
					var query = GenreService.save({name: record.name});
					query.$promise.then(function(data) {
						if(typeof callback == "function")
							callback(data.results);
					});
				} else {
					throw "Invalid Genre Information";
				}
			};

			res.get = function(callback) {
				if(res.cached == res.current) {
					if(typeof callback == "function")
						callback();
					return;
				} else {
					res.getPage(res.current, function(data) {
						res.genres = data.results;
						res.next = (data.next != null);
						res.prev = (data.prev != null);

						res.cached = res.current;

						if(typeof callback == "function")
							callback();
					});
				}
			};

			res.nextPage = function(callback) {
				if(res.next != false) {
					res.current++;
					res.get(callback);
				}
			};

			res.prevPage = function(callback) {
				if(res.prev != false) {
					res.current--;
					res.get(callback);
				}
			};

			return res;
		})

		// Main Body Controller
		// Handles tab switching (Module switching)
		.controller("mainController", function($scope, SongList, GenresList) {

			// tabs list
			$scope.tabs = [
				"songs",
				"genres",
				"addsong",
				"updatesong",
				"addgenre",
				"updategenre"
			];

			$scope.currentTab = $scope.tabs[0];
			$scope.selectedSong = null;
			$scope.selectedGenre = null;

			$scope.goto = function(id) {
				if($scope.tabs.length > id && id >= 0)
					$scope.currentTab = $scope.tabs[id];
				else
					throw "Invalid Module ID";
			};

			$scope.update = function(track) {
				$scope.selectedSong = track;
				$scope.goto(3);
			};

			$scope.updateGenre = function(track) {
				$scope.selectedGenre = track;
				$scope.goto(5);
			};

			SongList.get();
			GenresList.get();
		})

		// ViewSongController Handles viewing of songs listview
		.controller('viewSongController', function($scope, SongList, GenresList) {

			$scope.songs = [];
			$scope.searched = [];

			SongList.get(function() {
				$scope.songs = SongList.songs;
			});		

			$scope.movePageBack = function() {
				SongList.prevPage(function() {
					$scope.songs = SongList.songs;
				});
			};		

			$scope.movePageFront = function() {
				SongList.nextPage(function() {
					$scope.songs = SongList.songs;
				});
			};	

			$scope.moveTo = function(id) {
				SongList.current = id;
				SongList.get(function() {
					$scope.songs = SongList.songs;
				});
			};

			// Search Items
			$scope.search = '';

			$scope.$watch('search', function() {
				if($scope.search != "") {
					SongList.searchSong($scope.search, function(list) {
						$scope.searched = list;
					});
				}
			});
		})

		// addSongController allows addition of songs
		.controller('addSongController', function($scope, SongList, GenresList) {
			$scope.track = {
				title: '',
				rating: 0,
				genres: []
			};

			$scope.genres = GenresList.genres;

			$scope.add = function() {
				if($scope.track.title != '') {
					SongList.add($scope.track, function(res) {
						$scope.goto(0);
					});

					$scope.track = {
						title: '',
						rating: 0,
						genres: []
					};

				}
			};

			$scope.$watch('track.genre', function() {
				if(typeof $scope.track.genre == "undefined")
					return;

				for(var i = 0; i < $scope.track.genres.length; i++) {
					if($scope.track.genres[i].id == $scope.track.genre.id)
						return;
				}
				
				$scope.track.genres.push($scope.track.genre);
			});
		})

		// updateSongController allows updation of songs
		.controller('updateSongController', function($scope, SongList, GenresList) {
			if($scope.selectedSong == null || $scope.selectedSong == undefined) {
				throw "Select a song to update";
			}

			$scope.track = $scope.selectedSong;
			$scope.track.rating = parseInt($scope.track.rating);

			$scope.genres = GenresList.genres;

			$scope.update = function() {
				if($scope.track.title != '') {
					SongList.update($scope.track.id, $scope.track, function(res) {
						$scope.selectedSong = null;
						$scope.goto(0);
					});				
				}
			};

			$scope.$watch('track.genre', function() {
				if(typeof $scope.track.genre == "undefined")
					return;

				for(var i = 0; i < $scope.track.genres.length; i++) {
					if($scope.track.genres[i].id == $scope.track.genre.id)
						return;
				}

				$scope.track.genres.push($scope.track.genre);
			});
		})

		// viewGenreController Handles viewing of genres listview
		.controller('viewGenreController', function($scope, SongList, GenresList) {

			$scope.genres = [];

			SongList.get(function() {
				$scope.genres = GenresList.genres;
			});		

			$scope.movePageBack = function() {
				GenresList.prevPage(function() {
					$scope.genres = GenresList.genres;
				});
			};		

			$scope.movePageFront = function() {
				GenresList.nextPage(function() {
					$scope.genres = GenresList.genres;
				});
			};

			// Search Items
			$scope.search = '';
		})

		// addGenreController allows addition of Genres
		.controller('addGenreController', function($scope, SongList, GenresList) {
			$scope.genre = {
				name: ''
			};

			$scope.add = function() {
				if($scope.genre.name != '') {
					GenresList.add($scope.genre, function(res) {
						$scope.goto(0);
					});

					$scope.genre = {
						name: ''
					};

				}
			};
		})

		// updateGenreController allows updation of Genres
		.controller('updateGenreController', function($scope, SongList, GenresList) {
			if($scope.selectedGenre ==  null || $scope.selectedGenre == undefined) {
				throw "Select a genre to update";
			}

			$scope.genre = $scope.selectedGenre;

			$scope.update = function() {
				if($scope.genre.name != '') {
					GenresList.update($scope.genre.id, $scope.genre, function(res) {
						$scope.selectedGenre = null;
						$scope.goto(1);
					});				
				}
			};
		});
	})();