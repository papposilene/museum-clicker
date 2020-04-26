'use strict';
(function() {
  Helpers.validateSaveVersion();

  var game = new Game.Game();
  game.load();

  var museum = game.museum;
  var collection = game.collection;
  var workers = game.workers;
  var upgrades = game.upgrades;
  var achievements = game.achievements;
  var allObjects = game.allObjects;
  var lastSaved;

  var app = angular.module('museumClicker', []);

  app.filter('niceNumber', ['$filter', function($filter) {
      return Helpers.formatNumberPostfix;
  }]);

  app.filter('niceTime', ['$filter', function($filter) {
      return Helpers.formatTime;
  }]);

  app.filter('currency', ['$filter', function($filter) {
    return function(input) {
      return 'MuM ' + $filter('niceNumber')(input);
    };
  }]);

  app.filter('reverse', ['$filter', function($filter) {
    return function(items) {
      return items.slice().reverse();
    };
  }]);

  app.controller('TicketController', function() {
    this.click = function() {
      museum.clickTicket();
      ticket.addEvent();
      UI.showUpdateValue("#update-artwork", museum.state.ticket);
      return false;
    };
  });

  // Hack to prevent text highlighting
  document.getElementById('ticket').addEventListener('mousedown', function(e) {
    e.preventDefault();
  });

  app.controller('MuseumController', ['$interval', function($interval) {
    this.museum = museum;
    this.showTicketInfo = function() {
      if (!this._ticketInfo) {
        this._ticketInfo = Helpers.loadFile('html/museum-and-collection.html');
      }
      UI.showModal('Museums and collections history', this._ticketInfo);
    };
    $interval(function() {  // one tick
      var cashflow = museum.getMoney();
      UI.showUpdateValue("#update-cashflow", cashflow);
      var sum = 0;
      for (var i = 0; i < workers.length; i++) {
        sum += workers[i].state.hired * workers[i].state.rate;
      }
      if (sum > 0) {
        museum.acquireArtwork(sum);
        UI.showUpdateValue("#update-artwork", sum);
        ticket.addEventExternal(workers.map(function(w) {
          return w.state.hired;
        }).reduce(function(a, b){return a + b}, 0));
      }
    }, 1000);
  }]);

  app.controller('CollectionController', ['$compile', function($compile) {
    this.collection = collection;
    this.isVisible = function(item) {
      return item.isVisible(museum);
    };
    this.isAvailable = function(item) {
      return item.isAvailable(museum);
    };
    this.doCollection = function(item) {
      var cost = item.collection(museum);
      if (cost > 0) {
        UI.showUpdateValue("#update-artwork", -cost);
        UI.showUpdateValue("#update-reputation", item.state.reputation);
      }
    };
    this.showInfo = function(r) {
      UI.showModal(r.name, r.getInfo());
      UI.showLevels(r.state.level);
    };
  }]);

  app.controller('HRController', function() {
    this.workers = workers;
    this.isVisible = function(worker) {
      return worker.isVisible(museum);
    };
    this.isAvailable = function(worker) {
      return worker.isAvailable(museum);
    };
    this.hire = function(worker) {
      var cost = worker.hire(museum);
      if (cost > 0) {
        UI.showUpdateValue("#update-cashflow", -cost);
      }
    };
  });

  app.controller('UpgradesController', function() {
    this.upgrades = upgrades;
    this.isVisible = function(upgrade) {
      return upgrade.isVisible(museum, allObjects);
    };
    this.isAvailable = function(upgrade) {
      return upgrade.isAvailable(museum, allObjects);
    };
    this.upgrade = function(upgrade) {
      if (upgrade.buy(museum, allObjects)) {
        UI.showUpdateValue("#update-cashflow", upgrade.cost);
      }
    }
  });

  app.controller('AchievementsController', function($scope) {
    $scope.achievements = achievements;
    $scope.progress = function() {
      return achievements.filter(function(a) { return a.validate(museum, allObjects, lastSaved); }).length;
    };
  });

  app.controller('SaveController',
      ['$scope', '$interval', function($scope, $interval) {
    lastSaved = new Date().getTime();
    $scope.lastSaved = lastSaved;
    $scope.saveNow = function() {
      var saveTime = new Date().getTime();
      game.museum.state.time += saveTime - lastSaved;
      game.save();
      lastSaved = saveTime;
      $scope.lastSaved = lastSaved;
    };
    $scope.restart = function() {
      if (window.confirm(
        'Do you really want to restart the game? All progress will be lost.'
      )) {
        ObjectStorage.clear();
        window.location.reload(true);
      }
    };
    $interval($scope.saveNow, 10000);
  }]);

  app.controller('StatsController', function($scope) {
    $scope.museum = museum;
  });

  analytics.init();
  analytics.sendScreen(analytics.screens.main);
})();
