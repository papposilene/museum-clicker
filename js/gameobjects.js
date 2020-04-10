var GameObjects = (function() {
  'use strict';
  var GLOBAL_VISIBILITY_THRESHOLD = 0.5;

  /** @class GameObject
   * Base class for all objects in the game. This works together with the
   * saving mechanism.
   */
  var GameObject = function(obj) {
    this.state = {};
    $.extend(this, obj);
    if (!this.key) {
      throw 'Error: GameObject has to have a key!';
    }
  };
  GameObject.prototype.loadState =
      function(state) { $.extend(this.state, state); };

  /** @class Museum
   */
  var Museum = function() {
    GameObject.apply(this, [{
                             key : 'museum',
                             state : {
                               name : 'Give your museum an awesome name!',
                               ticket : 1,
                               factor : 5,
                               artwork : 0,
                               money : 0,
                               reputation : 0,
                               clicks : 0,
                               moneyCollected : 0,
                               moneySpent : 0,
                               artworkCollected : 0,
                               artworkSpent : 0,
                               time: 0
                             }
                           }]);
  };

  Museum.prototype = Object.create(GameObject.prototype);

  Museum.prototype.constructor = Museum;

  Museum.prototype.getMoney = function() {
    var addition = this.state.reputation * this.state.factor;
    this.state.money += addition;
    this.state.moneyCollected += addition;
    return addition;
  };

  Museum.prototype.acquireArtwork = function(amount) {
    this.state.artwork += amount;
    this.state.artworkCollected += amount;
  };

  Museum.prototype.clickTicket = function() {
    this.state.clicks += 1;
    this.acquireArtwork(this.state.ticket);
  };

  Museum.prototype.collection = function(cost, reputation) {
    if (this.state.artwork >= cost) {
      this.state.artwork -= cost;
      this.state.artworkSpent += cost;
      this.state.reputation += reputation;
      return true;
    }
    return false;
  };

  Museum.prototype.buy = function(cost) {
    if (this.state.money >= cost) {
      this.state.money -= cost;
      this.state.moneySpent += cost;
      return true;
    }
    return false;
  };

  /** @class Collection
   */
  var Collection = function(obj) {
    GameObject.apply(this, [obj]);
    this.state.level = 0;
    this.state.interesting = false;
  };

  Collection.prototype = Object.create(GameObject.prototype);

  Collection.prototype.constructor = Collection;

  Collection.prototype.isVisible = function(museum) {
    if (!museum) {
      return false;
    }
    return this.state.level > 0 ||
           museum.state.artwork >= this.state.cost * GLOBAL_VISIBILITY_THRESHOLD;
  };

  Collection.prototype.isAvailable = function(museum) {
    if (!museum) {
      return false;
    }
    return museum.state.artwork >= this.state.cost;
  };

  Collection.prototype.collection = function(museum) {
    if (museum && museum.collection(this.state.cost, this.state.reputation)) {
      this.state.level++;
      if (this.state.info_levels.length > 0 &&
          this.state.level === this.state.info_levels[0]) {
        this.state.interesting = true;
        this.state.info_levels.splice(0, 1);
      }
      var old_cost = this.state.cost;
      this.state.cost = Math.floor(this.state.cost * this.cost_increase);
      return old_cost;
    }
    return -1;
  };

  Collection.prototype.getInfo = function() {
    if (!this._info) {
      this._info = Helpers.loadFile(this.info);
    }
    this.state.interesting = false;
    return this._info;
  };

  /** @class Worker
   * Implement an auto-clicker in the game.
   */
  var Worker = function(obj) {
    GameObject.apply(this, [obj]);
    this.state.hired = 0;
  };

  Worker.prototype = Object.create(GameObject.prototype);

  Worker.prototype.constructor = Worker;

  Worker.prototype.isVisible = function(museum) {
    if (!museum) {
      return false;
    }
    return this.state.hired > 0 ||
           museum.state.money >= this.state.cost * GLOBAL_VISIBILITY_THRESHOLD;
  };

  Worker.prototype.isAvailable = function(museum) {
    if (!museum) {
      return false;
    }
    return museum.state.money >= this.state.cost;
  };

  Worker.prototype.hire = function(museum) {
    if (museum && museum.buy(this.state.cost)) {
      this.state.hired++;
      var cost = this.state.cost;
      this.state.cost = Math.floor(cost * this.cost_increase);
      return cost;
    }
    return -1;  // not enough money
  };

  Worker.prototype.getTotal =
      function() { return this.state.hired * this.state.rate; };

  /** @class Upgrade
   */
  var Upgrade = function(obj) {
    GameObject.apply(this, [obj]);
    this.state.visible = false;
    this.state.used = false;
  };

  Upgrade.prototype = Object.create(GameObject.prototype);

  Upgrade.prototype.constructor = Upgrade;

  Upgrade.prototype.meetsRequirements = function(allObjects) {
    if (!allObjects) {
      return false;
    }
    for (var i = 0; i < this.requirements.length; i++) {
      var req = this.requirements[i];
      if (allObjects[req.key].state[req.property] < req.threshold) {
        return false;
      }
    }
    return true;
  };

  Upgrade.prototype.isAvailable = function(museum, allObjects) {
    if (!museum || !allObjects) {
      return false;
    }
    return !this.state.used && museum.state.money >= this.cost &&
           this.meetsRequirements(allObjects);
  };

  Upgrade.prototype.isVisible = function(museum, allObjects) {
    if (!museum || !allObjects) {
      return false;
    }
    if (!this.state.used &&
        (this.state.visible ||
         museum.state.money >= this.cost * GLOBAL_VISIBILITY_THRESHOLD &&
             this.meetsRequirements(allObjects))) {
      this._visible = true;
      return true;
    }
    return false;
  };

  Upgrade.prototype.buy = function(museum, allObjects) {
    if (museum && allObjects && !this.state.used && museum.buy(this.cost)) {
      for (var i = 0; i < this.targets.length; i++) {
        var t = this.targets[i];
        allObjects[t.key].state[t.property] *= this.factor || 1;
        allObjects[t.key].state[t.property] += this.constant || 0;
      }
      this.state.used = true;  // How about actually REMOVING used upgrades?
      this.state.visible = false;
      return this.cost;
    }
    return -1;
  };


  /** @class Achievement
   */
  var Achievement = function(obj) {
    GameObject.apply(this, [obj]);
    this.state.timeAchieved = null;
  };

  Achievement.prototype = Object.create(GameObject.prototype);

  Achievement.prototype.validate = function(museum, allObjects, saveTime) {
    if (this.state.timeAchieved) {
      return true;
    }
    if (allObjects.hasOwnProperty(this.targetKey) &&
        allObjects[this.targetKey].state.hasOwnProperty(this.targetProperty) &&
        allObjects[this.targetKey].state[this.targetProperty] >= this.threshold) {
      this.state.timeAchieved = museum.state.time + new Date().getTime() - saveTime;
      UI.showAchievement(this);
      return true;
    }
    return false;
  };

  Achievement.prototype.isAchieved = function() {
    if (this.state.timeAchieved) {
      return true;
    } else {
      return false;
    }
  };


  // Expose classes in module.
  return {
    Museum: Museum,
    Collection: Collection,
    Worker: Worker,
    Upgrade: Upgrade,
    Achievement: Achievement
  };
}());
