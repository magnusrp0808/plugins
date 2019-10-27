//=============================================================================
// SingleActorGame
// MRP_SingleActorGame.js
// By Magnus0808 || Magnus Rubin Peterson
//=============================================================================

/*:
 * @plugindesc Removes actor select windows.
 * @author Magnus0808
 *
 * @help Plug and play.
 */

 var Imported = Imported || {};
 Imported.MRP_SingleActorGame = true;
 
 var MRP = MRP || {};
 MRP.SingleActorGame = MRP.SingleActorGame ||{};
 
(function() {
	
	MRP.SingleActorGame.Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow
	Scene_Menu.prototype.createCommandWindow = function() {
		MRP.SingleActorGame.Scene_Menu_createCommandWindow.call(this);
		this._commandWindow.setHandler('skill',     this.onPersonalOk.bind(this));
		this._commandWindow.setHandler('equip',     this.onPersonalOk.bind(this));
		this._commandWindow.setHandler('status',    this.onPersonalOk.bind(this));
	};
	
	Scene_Battle.prototype.onSelectAction = function() {
		var action = BattleManager.inputtingAction();
		this._skillWindow.hide();
		this._itemWindow.hide();
		if (!action.needsSelection()) {
			this.selectNextCommand();
		} else if (action.isForOpponent()) {
			this.selectEnemySelection();
		} else {
			var action = BattleManager.inputtingAction();
			action.setTarget(0);
			this.selectNextCommand();
		}
	};
	
	Scene_ItemBase.prototype.itemTargetActors = function() {
		var action = new Game_Action(this.user());
		action.setItemObject(this.item());
		if (!action.isForFriend()) {
			return [];
		} else if (action.isForAll()) {
			return $gameParty.members();
		} else {
			return [$gameParty.members()[0]];
		}
	};
	

	
	Scene_ItemBase.prototype.determineItem = function() {
		var action = new Game_Action(this.user());
		var item = this.item();
		action.setItemObject(item);
		if (action.isForFriend()) {
			this.onActorOk();
		} else {
			this.useItem();
		}
		this.activateItemWindow();
	};

})();