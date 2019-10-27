//=============================================================================
// Victory Aftermath Large Group Fix
// MRP_YEP_VictoryAftermath_LargeGroupFix.js
// By Magnus0808 || Magnus Rubin Peterson
//=============================================================================

/*:
 * @plugindesc (Requires YEP_VictoryAftermath.js) Large Group Fix
 * @author Magnus0808
 *
 * @help If you have a large group of battle actors then the victory aftermath
 * window will either have a visual glitch and/or not show all the actors. 
 * (because of not enough space) Furthermore, it will make the actors tiny on
 * the screen if the maxBattleActors is high regardless of the actual amount 
 * of battle actors.
 *
 * This plugin is a fix for these issues. It will size the actors appropriately,
 * and if there are too many actors to be shown then you can scroll to see the
 * rest.
 * 
 *
 * @param Always Display Exp Gain
 * @type boolean
 * @desc When there are a lot of actors it might not show the exp gain for space.
 * @default false
 */

 var Imported = Imported || {};
 Imported.MRP_YEP_VictoryAftermath_LargeGroupFix = true;
 
 var MRP = MRP || {};
 MRP.YEP_VictoryAftermath_LargeGroupFix = MRP.YEP_VictoryAftermath_LargeGroupFix ||{};
 
(function() {
	MRP.YEP_VictoryAftermath_LargeGroupFix.parameters = PluginManager.parameters('MRP_YEP_VictoryAftermath_LargeGroupFix');
	MRP.YEP_VictoryAftermath_LargeGroupFix.alwaysDisplayExpGain = (String(MRP.YEP_VictoryAftermath_LargeGroupFix.parameters['Always Display Exp Gain']) == "true");

	Window_VictoryExp.prototype.initialize = function() {
		var wy = this.fittingHeight(1);
		var width = this.windowWidth();
		var height = this.windowHeight();
		this._showGainedSkills = eval(Yanfly.Param.VAShowSkills);
		Window_Selectable.prototype.initialize.call(this, 0, wy, width, height);
		this.defineTickSound();
		AudioManager.playSe(this._tickSound);
		this._tick = 0;
		this.openness = 0;
		this.refresh();
		this.activate();
	};

	Window_VictoryExp.prototype.maxItems = function() {
		return $gameParty.battleMembers().length;
	};
	
	Window_VictoryExp.prototype.itemHeight = function() {
		var clientHeight = this.height - this.padding * 2;
		var clientHeight = Math.floor(clientHeight / this.maxItems());
		var clientHeight = Math.min(Math.max(clientHeight, this.minItemHeight()), this.maxItemHeight());
		return clientHeight;
	};

	Window_VictoryExp.prototype.minItemHeight = function() {
		return MRP.YEP_VictoryAftermath_LargeGroupFix.alwaysDisplayExpGain ? this.lineHeight() * 3 : this.lineHeight() * 2;
	};
	
	Window_VictoryExp.prototype.maxItemHeight = function() {
		return this.lineHeight() * 3;
	};
	
	MRP.YEP_VictoryAftermath_LargeGroupFix.Window_VictoryExp_drawItem = Window_VictoryExp.prototype.drawItem;
	Window_VictoryExp.prototype.drawItem = function(index) {
		MRP.YEP_VictoryAftermath_LargeGroupFix.Window_VictoryExp_drawItem.call(this, index);
		this.drawItemGauge(index);
	};
	
	Window_VictoryExp.prototype.processCursorMove = function() {
		if (this.isCursorMovable()) {
			if (Input.isRepeated('down')) {
				this.select(this.bottomRow());
				this.cursorDown(Input.isTriggered('down'));
				//this.cursorPagedown();
			}
			if (Input.isRepeated('up')) {
				this.select(this.topRow());
				this.cursorUp(Input.isTriggered('up'));
				//this.cursorPageup();
			}
		}
	};
		
	Window_VictoryExp.prototype.updateCursor = function() {
		this.setCursorRect(0, 0, 0, 0);
	};
})();