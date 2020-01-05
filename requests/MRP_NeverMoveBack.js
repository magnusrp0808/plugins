//=============================================================================
// Never Move Back
// MRP_NeverMoveBack.js
// By Magnus0808 || Magnus Rubin Peterson
//=============================================================================

/*:
 * @plugindesc (* Requires YEP_BattleEngineCore *) Battlers will stay in place after actions.
 * @author Magnus0808
 *
 * @help Plug and play.

 */

 var Imported = Imported || {};
 Imported.MRP_NeverMoveBack = true;
 
 var MRP = MRP || {};
 MRP.NeverMoveBack = MRP.NeverMoveBack ||{};
 
(function() {
	
	MRP.NeverMoveBack.BattleManager_createFinishActions = BattleManager.createFinishActions;
	BattleManager.createFinishActions = function() {
		var sprite = this._action.subject().battler();
		sprite._homeX = sprite.x;
		sprite._homeY = sprite.y;
		sprite._offsetX = 0;
		sprite._offsetY = 0;
			
		MRP.NeverMoveBack.BattleManager_createFinishActions.call(this);
	};
	
})();