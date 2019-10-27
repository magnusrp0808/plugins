//=============================================================================
// Direct For All Item Use
// MRP_DirectForAllItemUse.js
// By Magnus0808 || Magnus Rubin Peterson
//=============================================================================

/*:
 * @plugindesc Does not show the Actor Window when using items that is for the 
 * whole party.
 * @author Magnus0808
 *
 * @help Plug and play
 *
 */

 var Imported = Imported || {};
 Imported.DirectForAllItemUse = true;
 
 var MRP = MRP || {};
 MRP.DirectForAllItemUse = MRP.DirectForAllItemUse ||{};
 
(function() {
	MRP.DirectForAllItemUse.Scene_ItemBase_determineItem = Scene_ItemBase.prototype.determineItem;
	Scene_ItemBase.prototype.determineItem = function() {	
		var action = new Game_Action(this.user());
		action.setItemObject(this.item());
		if(action.isForAll()){
			this.onActorOk();
			this.activateItemWindow();
		} else {
			MRP.DirectForAllItemUse.Scene_ItemBase_determineItem.call(this);
		}
	};	
})();