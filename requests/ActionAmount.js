//=============================================================================
// ActionAmount.js
//=============================================================================

/*:
 * @plugindesc This plugin adds a window that shows how many actions an actor
 * has left on his/her turn.
 * @author Magnus0808
 *
 * @help Plug and play
 */
(function() {
	
	
	//-----------------------------------------------------------------------------
	// Window_Action
	//
	// The window for displaying the current actors actions left
	
	function Window_Action() {
		this.initialize.apply(this, arguments);
	}
	Window_Action.prototype = Object.create(Window_Base.prototype);
	Window_Action.prototype.constructor = Window_Action;
	
	Window_Action.prototype.initialize = function(x, y) {
		var width = this.windowWidth();
		var height = this.windowHeight();
		Window_Base.prototype.initialize.call(this, x, y, width, height);
		this.refresh();
	};
	
	Window_Action.prototype.windowWidth = function() {
		return 240;
	};

	Window_Action.prototype.windowHeight = function() {
		return this.fittingHeight(1);
	};
	
	Window_Action.prototype.refresh = function() {
		var x = this.textPadding();
		var width = this.contents.width - this.textPadding() * 2;
		this.contents.clear();
		this.drawActionValue(this.value(), x, 0, width);
	};
	
	Window_Action.prototype.value = function() {
		if (this.actor) {
			this.show();
			console.log(this.actor);
			if(this.actor._actCostInputs) { // Added compatibility to DoubleX RMMV Action Cost
				return this.actor.numActions() - (this.actor._actionInputIndex + this.actor._actCostInputs);
			} else {
				return this.actor.numActions() - this.actor._actionInputIndex;
			}
		} else {
			this.hide();
			return 0;
		}
	}
	
	Window_Action.prototype.setActor = function(actor) {
		this.actor = actor;
		this.refresh();
	}
	
	Window_Action.prototype.drawActionValue = function(value, x, y, width) {
		this.drawText("Actions left: " + value, x, y, width, 'left');
	}
	
	Window_Action.prototype.open = function() {
		this.refresh();
		Window_Base.prototype.open.call(this);
	};
	
	
	//-----------------------------------------------------------------------------
	// Scene_Battle
	//
	// Added the Windoe_Action to the scene.
	
	Scene_Battle.prototype.createAllWindows = function() {
		this.createLogWindow();
		this.createStatusWindow();
		this.createPartyCommandWindow();
		this.createActorCommandWindow();
		this.createHelpWindow();
		this.createSkillWindow();
		this.createItemWindow();
		this.createActorWindow();
		this.createEnemyWindow();
		this.createMessageWindow();
		this.createScrollTextWindow();
		this.createActionWindow();
	};
	
	Scene_Battle.prototype.createActionWindow = function() {
		this._actionWindow = new Window_Action(0, 0);
		this._actionWindow.y = this._actorWindow.y - this._actionWindow.height;
		this.addWindow(this._actionWindow);
	}
	
	Scene_Battle.prototype.selectPreviousCommand = function() {
		BattleManager.selectPreviousCommand();
		this._actionWindow.setActor(BattleManager.actor());
		this.changeInputWindow();
	};
	
	Scene_Battle.prototype.selectNextCommand = function() {
		BattleManager.selectNextCommand();
		this._actionWindow.setActor(BattleManager.actor());
		this.changeInputWindow();
	};
		

})();