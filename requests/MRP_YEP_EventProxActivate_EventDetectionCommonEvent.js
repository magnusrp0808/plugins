//=============================================================================
// YEP Event Proximity Activate - Event Detection Common Event Extension
// MRP_YEP_EventProxActivate_EventDetectionCommonEvent.js
// By Magnus0808 || Magnus Rubin Peterson
//=============================================================================

/*:
 * @plugindesc (* Requires YEP_EventProxActivate *) Allows for events to detect other events and run common events
 * @author Magnus0808
 *
 * @help This plugin adds the following Comment Tags to events:
 *    <Activation Typeset: x>
 *       x is the typeset that this event is tagged as.
 *    <Activation Type x: common y>
 *       x is the typeset to detect. 
 *       y is the common event id that is called when x enters proximity
 */

 var Imported = Imported || {};
 Imported.MRP_Test = true;
 
 var MRP = MRP || {};
 MRP.YEP_EventProxActivate_EventDetectionCommonEvent = MRP.YEP_EventProxActivate_EventDetectionCommonEvent ||{};
 
(function() {
	MRP.YEP_EventProxActivate_EventDetectionCommonEvent.Game_Event_initEventProximitySettings = Game_Event.prototype.initEventProximitySettings;
	Game_Event.prototype.initEventProximitySettings = function() {
		MRP.YEP_EventProxActivate_EventDetectionCommonEvent.Game_Event_initEventProximitySettings.call(this);
		this._activationTypeSet = null;
		this._activationTypeCommons = [];
	};
	
	MRP.YEP_EventProxActivate_EventDetectionCommonEvent.Game_Event_setupEventProximityCommentTags = Game_Event.prototype.setupEventProximityCommentTags;
	Game_Event.prototype.setupEventProximityCommentTags = function() {
		if (!this.page()) return;
		MRP.YEP_EventProxActivate_EventDetectionCommonEvent.Game_Event_setupEventProximityCommentTags.call(this);
		
		var note1 = /<ACTIVATION TYPESET: (\d+)>/i;
		var note2 = /<ACTIVATION TYPE (\d+): common (\d+)>/gi;
		
		var list = this.list();
		for (var i = 0; i < list.length; ++i) {
			var ev = list[i];
			if ([108, 408].contains(ev.code)) {
				if (ev.parameters[0].match(note1)) {
					this._activationTypeSet = parseInt(RegExp.$1);
				} else if (ev.parameters[0].match(note2)) {
					this._activationTypeCommons.push([parseInt(RegExp.$1), parseInt(RegExp.$2)]);
				}
			}		
		}
	};
	
	MRP.YEP_EventProxActivate_EventDetectionCommonEvent.Game_Event_setupEventProximitySettings = Game_Event.prototype.setupEventProximitySettings;
	Game_Event.prototype.setupEventProximitySettings = function() {
		MRP.YEP_EventProxActivate_EventDetectionCommonEvent.Game_Event_setupEventProximitySettings.call(this);
		this.checkEventCollision();
	};
	
	
	MRP.YEP_EventProxActivate_EventDetectionCommonEvent.Game_Event_updateMove = Game_Event.prototype.updateMove;
	Game_Event.prototype.updateMove = function() {
		MRP.YEP_EventProxActivate_EventDetectionCommonEvent.Game_Event_updateMove.call(this);
		if(!this.isMoving()) {
			this.checkEventCollision();
		}
	};
	
	Game_Event.prototype.checkEventCollision = function() {
		if (!$gameMap.isEventRunning()) {
			$gameMap.events().forEach(function(event) {
				this.eventCollision(event);
				event.eventCollision(this);
			}, this);
		}
	}
	
	Game_Event.prototype.eventCollision = function(event) {
		if (!$gameMap.isEventRunning()) {
			if(event == this) return;
			if((this._activationTypeCommons.length > 0) && (event._activationTypeSet != null) && event.meetEventProximityConditions(false, this)) {
				this.runActivationCommonEvents(event._activationTypeSet);				
			}
		}
	}
	
	Game_Event.prototype.runActivationCommonEvents = function(activationTypeSet) {
		for(var i = 0; i < this._activationTypeCommons.length; i++) {
			var setId = this._activationTypeCommons[i][0];
			var commonId = this._activationTypeCommons[i][1];
			
			if(setId == activationTypeSet) {
				// Call common event with this as parent
				this._interpreter = this._interpreter || new Game_Interpreter();
				if (!this._interpreter.isRunning()) {
					this._interpreter.setup(this.list(), this._eventId);
				}
				this._interpreter._params[0] = commonId;
				this._interpreter.command117();
				this._interpreter.update();
				//$gameTemp.reserveCommonEvent(commonId);
			}			
		}	
	}
	
	MRP.Game_Event_meetEventProximityConditions = Game_Event.prototype.meetEventProximityConditions;
	Game_Event.prototype.meetEventProximityConditions = function(parallel, ev) {
		var playerProx = MRP.Game_Event_meetEventProximityConditions.call(this, parallel);
		if(playerProx){
			return playerProx;
		} else if(ev) {
			if (ev._activationType === 'radius') {
				var x1 = this.x;
				var y1 = this.y;
				var x2 = ev.x;
				var y2 = ev.y;
				var radius = $gameMap.distance(x1, y1, x2, y2);
				return ev._activationDist >= radius
			} else if (ev._activationType === 'square') {
				return ev._activationDist >= Math.abs(ev.deltaXFrom(this.x)) && 
				ev._activationDist >= Math.abs(ev.deltaYFrom(this.y));
			} else if (ev._activationType === 'row') {
				return ev._activationDist >= Math.abs(ev.deltaYFrom(this.y));
			} else if (ev._activationType === 'column') {
				return ev._activationDist >= Math.abs(ev.deltaXFrom(this.x));
			} else {
				return false;
			}
		}
		return false;
	};
	
})();