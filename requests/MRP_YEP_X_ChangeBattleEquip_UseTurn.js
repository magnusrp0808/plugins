//=============================================================================
// ChangeBattleEquip Use Turn
// MRP_YEP_X_ChangeBattleEquip_UseTurn.js
// By Magnus0808 || Magnus Rubin Peterson
//=============================================================================

/*:
 * @plugindesc (*Requires YEP_X_ChangeBattleEquip*) Makes battle equips use the turn.
 * @author Magnus0808
 *
 * @help Plug and play.
 *
 */

 var Imported = Imported || {};
 Imported.MRP_YEP_X_ChangeBattleEquip_UseTurn = true;
 
 var MRP = MRP || {};
 MRP.YEP_X_ChangeBattleEquip_UseTurn = MRP.YEP_X_ChangeBattleEquip_UseTurn ||{};
 
(function() {
	
	MRP.YEP_X_ChangeBattleEquip_UseTurn.Scene_Equip_refreshActor = Scene_Equip.prototype.refreshActor;
	Scene_Equip.prototype.refreshActor = function() {
		MRP.YEP_X_ChangeBattleEquip_UseTurn.Scene_Equip_refreshActor.call(this);
		if (!$gameTemp._cbeBattle) return;
		$gameTemp.oldEquipment = this.actor().equips();
	};
	
	MRP.YEP_X_ChangeBattleEquip_UseTurn.Scene_Equip_popScene = Scene_Equip.prototype.popScene;
	Scene_Equip.prototype.popScene = function() {
		MRP.YEP_X_ChangeBattleEquip_UseTurn.Scene_Equip_popScene.call(this);
		if (!$gameTemp._cbeBattle) return;
		if (!arraysEqual($gameTemp.oldEquipment, this.actor().equips())) BattleManager.selectNextCommand();
		else BattleManager.actor().setBattleEquipChange(false);
	};
	
	var arraysEqual = function(array1, array2) {
		if(array1.length !== array2.length) return false;
		for(var i = 0; i < array1.length; i++) {
			if(array1[i] !== array2[i]) return false;
		}
		return true;
	}
	
})();