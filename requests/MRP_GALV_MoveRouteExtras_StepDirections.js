//=============================================================================
// GALV Move Route Extras - Step Directions Extension
// MRP_GALV_MoveRouteExtras_StepDirections.js
// By Magnus0808 || Magnus Rubin Peterson
//=============================================================================

/*:
 * @plugindesc Extension to GALV Move Route Extras. Adds directions for the step 
 * command
 * @author Magnus0808
 *
 * @help Adds the following options:
 *      * this.step_right(x, id, id, ...);
 *      * this.step_left(x, id, id, ...);
 *      * this.step_up(x, id, id, ...);
 *      * this.step_down(x, id, id, ...);
 *      * this.step_toward_region(id, id, ...); 
 *      * this.step_toward_region_at([id, id, ...], id, id, ...);
 *      * this.step_toward_region_not_at([id, id, ...], id, id, ...);
 * Where x = the amount of steps and id = the region id.
 * The first argument of step_toward_region_at and step_toward_region_not_at is the regions 
 * which the the user should be at for the movement to be done.
 */

 var Imported = Imported || {};
 Imported.MRP_GALV_MoveRouteExtras_StepDirections = true;
 
 var MRP = MRP || {};
 MRP.GALV_MoveRouteExtras_StepDirections = MRP.GALV_MoveRouteExtras_StepDirections ||{};
 
(function() {
	
	Game_Character.prototype.step_repeat_start_index = null;
	Game_Character.prototype.step_check_index = null;
	Game_Character.prototype.step_repeat_direction = null;
	
	Game_Character.prototype.instant_skip_movement = function() {
		if(this.step_check_index != this._moveRouteIndex) {
			if(this.step_check_index == null) this.step_check_index = this._moveRouteIndex;
			this.advanceMoveRouteIndex();
			var command = this._moveRoute.list[this._moveRouteIndex];
			if (command) {
				this.processMoveCommand(command);
			}
		}
		this.step_check_index = null;
	}
	
	Game_Character.prototype.step_direction = function(x, d, args) {
		if(!this.step_repeats || this.step_repeats <= 0) {				
			var region_test = false;
			for (var j = 0; j < args.length; j++) {
				if (args[j] === $gameMap.regionId(this.x, this.y)) {
					region_test = true;
					break;
				};
			};
			if (!region_test) {			
				this.instant_skip_movement();				
				return false;
			}				
			this.step_repeat_begin(x, d);
		}
		var dr = this.step_repeat_direction;
		var x2 = $gameMap.roundXWithDirection(this.x, dr);
		var y2 = $gameMap.roundYWithDirection(this.y, dr);		

		if (this.canPass(this.x, this.y, dr)) {
			this.moveStraight(dr);
		} else {
			this.step_repeats++;
		}
		this.step_repeat_end();
	};
	
	Game_Character.prototype.step_toward_region_at = function(at) {
		if(at.constructor !== Array) at = [at];
		
		var region_test = false;
		for (var j = 0; j < at.length; j++) {
			if (at[j] === $gameMap.regionId(this.x, this.y)) {
				region_test = true;
				this.instant_skip_movement();
				break;
			};
		};
		if (!region_test) {	
			return false;
		}
		
		var regions = new Array(arguments.length - 1);
		for(var i = 0; i < regions.length; ++i) {
		  regions[i] = arguments[i+1];
		}
		this.step_toward_region(regions);
	}
	
	Game_Character.prototype.step_toward_region_not_at = function(at) {
		if(at.constructor !== Array) at = [at];
		
		var region_test = true;
		for (var j = 0; j < at.length; j++) {
			if (at[j] === $gameMap.regionId(this.x, this.y)) {
				region_test = false;
				break;
			};
		};
		if (!region_test) {
			this.instant_skip_movement();			
			return false;
		}
		
		var regions = new Array(arguments.length - 1);
		for(var i = 0; i < regions.length; ++i) {
		  regions[i] = arguments[i+1];
		}
		this.step_toward_region(regions);
	}
	
	Game_Character.prototype.step_toward_region = function() {
		if(arguments[0].constructor === Array) arguments = arguments[0];
		// Find nearest region
		var region_found = false;
		var searching = true;
		var dx = 0;
		var dy = 0;
		for (var i = 1; searching; i++) {		
			var c = 0;
			for (var j = -i; j <= i; j++) {
				for (var r = 0; r < arguments.length; r++) {
					if($gameMap.isValid(this.x + i, this.y + j)){
						c++;
						if (arguments[r] === $gameMap.regionId(this.x + i, this.y + j)) {
							region_found = true;
							dx = this.x + i;
							dy = this.y + j;
							break;
						}
					}
					if($gameMap.isValid(this.x - i, this.y + j)){
						c++;
						if (arguments[r] === $gameMap.regionId(this.x - i, this.y + j)) {
							region_found = true;
							dx = this.x - i;
							dy = this.y + j;
							break;
						}
					}
					if($gameMap.isValid(this.x + j, this.y + i)){
						c++;
						if (arguments[r] === $gameMap.regionId(this.x + j, this.y + i)) {
							region_found = true;
							dx = this.x + j;
							dy = this.y + i;
							break;
						}
					} 
					if($gameMap.isValid(this.x + j, this.y - i)){
						c++;
						if (arguments[r] === $gameMap.regionId(this.x + j, this.y - i)) {
							region_found = true;
							dx = this.x + j;
							dy = this.y - i;
							break;
						}
					}
				}
				if(region_found) break;
			}
			if(c == 0) searching = false;
			if(region_found) break;
		}
		if (!region_found) {
			this.instant_skip_movement();
			return false;
		}
		
		// Step toward the nearest region
		this.step_toward(dx, dy);	
	}
	
	Game_Character.prototype.step_repeat_begin = function(times, d) {
		this.step_repeats = times;
		this.step_repeat_start_index = this._moveRouteIndex - 1;
		this.step_repeat_direction = d;
	};

	Game_Character.prototype.step_repeat_end = function() {
		this.step_repeats -= 1;
		if (this.step_repeats > 0) {
			this._moveRouteIndex = this.step_repeat_start_index;
		} else {
			this.step_repeat_direction = null;
		}
	};
	
	Game_Character.prototype.step_right = function(x) {
		var d = 6;
		var regions = new Array(arguments.length - 1);
		for(var i = 0; i < regions.length; ++i) {
		  regions[i] = arguments[i + 1];
		}		
		this.step_direction(x, d, regions);
	};	
	
	Game_Character.prototype.step_left = function(x) {
		var d = 4;
		var regions = new Array(arguments.length - 1);
		for(var i = 0; i < regions.length; ++i) {
		  regions[i] = arguments[i + 1];
		}
		this.step_direction(x, d, regions);
	};
	
	Game_Character.prototype.step_up = function(x) {
		var d = 8;
		var regions = new Array(arguments.length - 1);
		for(var i = 0; i < regions.length; ++i) {
		  regions[i] = arguments[i + 1];
		}
		this.step_direction(x, d, regions);
	};
	
	Game_Character.prototype.step_down = function(x) {
		var d = 2;
		var regions = new Array(arguments.length - 1);
		for(var i = 0; i < regions.length; ++i) {
		  regions[i] = arguments[i + 1];
		}
		this.step_direction(x, d, regions);
	};
	
	
	Game_Event.prototype.advanceMoveRouteIndex = function() {
		var moveRoute = this._moveRoute;
		var succeedAnyway = this.event().meta.stopit ? moveRoute.skippable && !this._collided : moveRoute.skippable;
		if (moveRoute && (this.isMovementSucceeded() || succeedAnyway)) {
			var numCommands = moveRoute.list.length - 1;
			this._moveRouteIndex++;
			if (moveRoute.repeat && this._moveRouteIndex >= numCommands) {
				this._moveRouteIndex = 0;
			}
		}
	};
	
	Game_Event.prototype.canPass = function(x, y, d) {
		var pass = Game_CharacterBase.prototype.canPass.call(this, x, y, d);
		if(pass && this.event().meta.stopit){
			var x2 = $gameMap.roundXWithDirection(x, d);
			var y2 = $gameMap.roundYWithDirection(y, d);
			for(var i = 1; i < this.event().meta.stopit; i++) {
				x2 = $gameMap.roundXWithDirection(x2, d);
				y2 = $gameMap.roundYWithDirection(y2, d);
				console.log("x2: x2");
				if (this.isCollidedWithCharacters(x2, y2)) {
					return false;
				}
			}
		}
		return pass;
	};
	
	MRP.GALV_MoveRouteExtras_StepDirections.Game_Event_isCollidedWithCharacters = Game_Event.prototype.isCollidedWithCharacters;
	Game_Event.prototype.isCollidedWithCharacters = function(x, y) {
		this._collided = MRP.GALV_MoveRouteExtras_StepDirections.Game_Event_isCollidedWithCharacters.call(this, x, y);
		return this._collided;
	};
	
	
	MRP.GALV_MoveRouteExtras_StepDirections.Game_Event_isNearTheScreen = Game_Event.prototype.isNearTheScreen;
	Game_Event.prototype.isNearTheScreen = function() {
		if(this.event().meta.alwaysNearScreen) return true;
		return MRP.GALV_MoveRouteExtras_StepDirections.Game_Event_isNearTheScreen.call(this);
	};
		
})();