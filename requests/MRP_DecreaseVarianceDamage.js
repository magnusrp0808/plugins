//=============================================================================
// Decrease Variance Damage
// MRP_DecreaseVarianceDamage.js
// By Magnus0808 || Magnus Rubin Peterson
//=============================================================================

/*:
 * @plugindesc Extension to ICFSoft_ParamsCore
 * @author Magnus0808
 *
 * @help This plugin needs ICFSoft_ParamsCore to work.
 * Set the parameters to indicate the index of the NParam that is used to
 * affect the variance.
 * If the value of the NParam is 1 then it will remove 1% of the variance from
 * the minimum damage. So if it is 100 then you will always deal max damage.
 *
 * @param Physical NParam Index
 * @type Number
 * @desc The index of the NParam with the parameter that affect the variance
 * of physcial dmg.
 *
 * @param Magical NParam Index
 * @type Number
 * @desc The index of the NParam with the parameter that affect the variance
 * of magical dmg.
 *
 */

(function(){
	
	DecreaseVarianceDamage = {};
	DecreaseVarianceDamage.Parameters = PluginManager.parameters('MRP_DecreaseVarianceDamage');
	DecreaseVarianceDamage.physicalIndex = Number(DecreaseVarianceDamage.Parameters['Physical NParam Index']);
	DecreaseVarianceDamage.magicIndex = Number(DecreaseVarianceDamage.Parameters['Magical NParam Index']);
	
	Game_Action.prototype.applyVariance = function(damage, variance) {
		var amp = Math.max(Math.abs(damage) * variance / 100, 0);
		var gVariance = 0;

		if(this.isPhysical() && this.isMagical){
			gVariance =  (this.subject().NParam(DecreaseVarianceDamage.physicalIndex)/100 + this.subject().NParam(DecreaseVarianceDamage.magicIndex)/100)/2;
		} else if(this.isPhysical()){
			gVariance =  this.subject().NParam(DecreaseVarianceDamage.physicalIndex)/100;
		} else if (this.isMagical){
			gVariance = this.subject().NParam(DecreaseVarianceDamage.magicIndex)/100;
		}
		if(gVariance > 1) gVariance = 1;
		
		var gAmp = amp * gVariance;			
		amp = Math.floor(amp - gAmp);
		gAmp = Math.floor(gAmp);
		
		var v = Math.randomInt(amp + 1) + Math.randomInt(amp + 1) - amp;
		return damage >= 0 ? damage + v + gAmp : damage - v - gAmp;
	};
	
})();