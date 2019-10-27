//=============================================================================
// YEP EnemyLevels Individual Exp Extension
// MRP_YEP_EnemyLevels_IndividualExpExtenstion.js
// By Magnus0808 || Magnus Rubin Peterson
//=============================================================================

/*:
 * @plugindesc YEP_EnemyLevels_IndividualExpExtenstion
 * @author Magnus0808
 *
 * @help This plugin changes the way exp is calculated for actors. Now it will
 * be calculated individually for each actor by passing the actor to the enemy's
 * exp calculation.
 *
 * Requires YEP_EnemyLevels in order to set a custom exp formular.
 *      Use either 'actor' or 'a' to reference the actor gaining exp in the 
 *      exp formular.
 *      e.g. <Custom Parameter exp Formula>
				value = 10 * a.level;
			 </Custom Parameter exp Formula>
 *
 * This plugin should be placed immediately after YEP_EnemyLevels. If you also
 * use YEP_PartySystem then this should also be placed immediately after that
 * one if possible.
 *
 * @param Default Actor Id
 * @desc If the exp function is called on an enemy in a way that didn't specify
 * the actorId then this is used.
 * @default 1
 *
 */

 var Imported = Imported || {};
 Imported.MRP_YEP_EnemyLevels_IndividualExpExtenstion = true;
 
 var MRP = MRP || {};
 MRP.YEP_EnemyLevels_IndividualExpExtenstion = MRP.YEP_EnemyLevels_IndividualExpExtenstion || {};
 
(function() {
	
	MRP.YEP_EnemyLevels_IndividualExpExtenstion.Parameters = PluginManager.parameters('MRP_YEP_EnemyLevels_IndividualExpExtenstion');;
	MRP.YEP_EnemyLevels_IndividualExpExtenstion.defaultActorId = eval(String(MRP.YEP_EnemyLevels_IndividualExpExtenstion.Parameters['Default Actor Id']));
	
	MRP.YEP_EnemyLevels_IndividualExpExtenstion.BattleManager_makeRewards = BattleManager.makeRewards;
	BattleManager.makeRewards = function() {
		MRP.YEP_EnemyLevels_IndividualExpExtenstion.BattleManager_makeRewards.call(this);
		this._rewards.exp = $gameParty.allMembers().map(function(a) {
			return $gameTroop.expForActor(a._actorId);
		});
	};
	
	Game_Troop.prototype.expForActor = function(actorId) {
		return this.deadMembers().reduce(function(r, enemy) {
			return r + enemy.exp(actorId);
		}, 0);
	}
	
	MRP.YEP_EnemyLevels_IndividualExpExtenstion.Game_Enemy_exp = Game_Enemy.prototype.exp;
	if(Imported.YEP_EnemyLevels) {
		Game_Enemy.prototype.exp = function(actorId) {
			var paramId = 8;
			this.enemy().baseParamFormula[paramId] = this.enemy().baseParamFormula[paramId].split(" ").map(function(item) {
				return item.replace(/^((\(*)(actor|a|\$gameActors.actor\(\d+)(\)|\b))/g, "$2$gameActors.actor(" + (actorId ? actorId : MRP.YEP_EnemyLevels_IndividualExpExtenstion.defaultActorId) + ")");
			}).join(" ");
			var exp = MRP.YEP_EnemyLevels_IndividualExpExtenstion.Game_Enemy_exp.call(this);
			this._cacheBaseParam[paramId] = null;
			return exp;
		}
	} else {
		Game_Enemy.prototype.exp = function(actorId) {
			MRP.YEP_EnemyLevels_IndividualExpExtenstion.Game_Enemy_exp.call(this);
		}
	}
	
	Game_Troop.prototype.expTotal = function() {
		return this.deadMembers().reduce(function(r, enemy) {
			return r + enemy.exp(null);
		}, 0);
	};
	
	BattleManager.displayExp = function() {
		var exp = this._rewards.exp.reduce(function(r, xp) {
			return r + xp;
		});
		if (exp > 0) {
			var text = TextManager.obtainExp.format(exp, TextManager.exp);
			$gameMessage.add('\\.' + text);
		}
	};
	
	MRP.YEP_EnemyLevels_IndividualExpExtenstion.BattleManager_gainExp = BattleManager.gainExp;
	BattleManager.gainExp = function() {
		if(Imported.YEP_PartySystem && Yanfly.Param.ParamExpDis) {
			var alive = $gameParty.aliveMembers().length;
			this._rewards.exp = this._rewards.exp.map(function(e){
				e = Math.ceil(e / alive);
				return e;
			});
		}
		var exp = this._rewards.exp;
		for(var i = 0; i < $gameParty.allMembers().length; i++) {
			var actor = $gameParty.allMembers()[i];
			var aExp = exp[i];
			actor.gainExp(aExp);
		}
	};
	
})();