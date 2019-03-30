//=============================================================================
// MOG YEP Battle Result Hide
// MRP_MOG_YEP_BattleResultHide.js
// By Magnus0808 || Magnus Rubin Peterson
//=============================================================================

/*:
 * @plugindesc Compatibility between MOG_BattleResult and some of Yanfly's plugins.
 * @author Magnus0808
 *
 * @help This plugin should be placed after MOG_BattleResult, YEP_BattleEngineCore,
 * as well as YEP_BattleStatusWindow if used.
 *
 * This plugin makes adds so when the battle result window is created it makes
 * the battle manager enter the victoryPhase from Yanfly's Battle Engine Core.
 * If YEP_BattleStatusWindow is used then this plugin will also hide the status
 * window.
 */
 
var Imported = Imported || {};
Imported.MRP_MOG_YEP_BattleResultHide = true;

(function() {
	var MRP_BATTLERESULTHIDE_SB_CREATEBRESULT_OLD = Scene_Battle.prototype.createBResult;
	Scene_Battle.prototype.createBResult = function() {
		MRP_BATTLERESULTHIDE_SB_CREATEBRESULT_OLD.call(this);
		
		if(Imported.YEP_BattleEngineCore){ 
			if(Imported.YEP_VictoryAftermath) {
				BattleManager.processNormalVictory();
				//BattleManager._victoryPhase = true;
			} else {
				BattleManager._victoryPhase = true;			
			}
		}
		if(Imported.YEP_BattleStatusWindow)
		{
			this._statusWindow.hide();		
		}		
	};	
})();