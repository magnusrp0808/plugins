//=============================================================================
// Erosion System
// MRP_ErosionSystem.js
// By Magnus0808 || Magnus Rubin Peterson
// Version 1.0
//=============================================================================

/*:
 * @plugindesc Erosion System
 * @author Magnus0808
 *
 * @help This plugin brings an erosion system to your game!
 * There are 3 parameters to this plugin. The natural erosion rate
 * which is the base erosion rate for all attacks. You can then also
 * specify the maximum and minimum.
 * 
 * E.g. with an erosion rate on 10% then if you deal 100dmg to a target with
 * 1000hp, then the target will have 900hp left like normal. However, the targets
 * maximum hp will decrease by 10 to 890hp.
 *
 * You can also make weapons, armor and statuses affect the erosion rate by using
 * the note tag <procentErosion:x.xxx> where x.xx is the number the 
 * erosion rate should be increased with.
 * e.g. if you have a shield with the tag <procentErosion:-0.05> then
 * you will only be affected by an erosion rate of 5% instead of 10%
 * (assuming the Natural Erosion Rate is 10%)
 * 
 * You can also add the tag to skills which will have the same effect for that
 * attack. Furthermore, you can use the note tag <flatErosion:xxxx> to inflect
 * erosion directly to the max hp with a skill!
 * E.g. if you have a skill called Bite with the note tag <flatErosion:100>
 * then everytime you use this skill the target will lose 100 maximum hp for
 * the battle. It should be noted that this does not count towards the maximum
 * erosion rate, and can therefore potentionally deal an even higher amount of 
 * erosion.
 *
 * @param Natural Erosion Rate
 * @type Number
 * @decimals 3
 * @desc This is the base erosion rate in %. 1 = 100%
 * @default 0.100
 *
 * @param Max Erosion Rate
 * @type Number
 * @decimals 3
 * @desc This is the min erosion rate in %.
 * 1 = 100%
 * @default 0.500
 *
 * @param Min Erosion Rate
 * @type Number
 * @decimals 3
 * @desc This is the max erosion in %. This should always be lower than max erosion. 1 = 100%
 * @default 0.000
 *
 * @param Negative HP Regen Erosion
 * @type Boolean
 * @desc If true then negative HP regeneration deals erosion.
 * E.g. Poison (only if the total HP regen is negative)
 * @default true
 *
 * @param Can Die From Erosion
 * @type Boolean
 * @desc If true then it is possible to die from erosion! This happens if
 * when you take erosion dmg it makes your max hp become lower than 1!
 * @default false
 */
 
(function() {
	
	ErosionSystem = {};
	ErosionSystem.Parameters = PluginManager.parameters('MRP_ErosionSystem');
	ErosionSystem.baseErosion = Number(ErosionSystem.Parameters['Natural Erosion Rate']);
	ErosionSystem.maxErosion = Number(ErosionSystem.Parameters['Max Erosion Rate']);
	ErosionSystem.minErosion = Number(ErosionSystem.Parameters['Min Erosion Rate']);
	ErosionSystem.negativeRegenErosion = (String(ErosionSystem.Parameters['Negative HP Regen Erosion']) == 'true');
	ErosionSystem.dieErosion = (String(ErosionSystem.Parameters['Can Die From Erosion']) == 'true');
	
	// Changes to Game_Battler
	var old_init = Game_Battler.prototype.initMembers;
	Game_Battler.prototype.initMembers = function() {
		old_init.call(this);
		this._erosionDamaged = 0;
	};
	
	
	Game_Battler.prototype.getBaseErosionRate = function() {
		var battler;
		var baseErosion = 0;
		if(this.isEnemy()){
			battler = this.enemy();
		}else {
			battler = this.actor();
		}
		if(battler){
			if(battler.meta.baseErosion){
				baseErosion += Number(battler.meta.baseErosion);
			}else{
				baseErosion += ErosionSystem.baseErosion;
			}
			if(battler.meta.procentErosion){
				baseErosion += Number(battler.meta.procentErosion)
			}
		} else {
			baseErosion += ErosionSystem.baseErosion;
		}
		return baseErosion;
	}
	
	Game_Battler.prototype.getErosionRate = function() {
		var erosionRate = this.getBaseErosionRate();
		// Handle States
		let states = this.states();
		for(var i = 0; i < states.length; i++){
			let state = states[i];
			if(state.meta.procentErosion){
				erosionRate += Number(state.meta.procentErosion);
			}
		}
		return erosionRate;
	}
	
	Game_Battler.prototype.removeErosion = function() {
		var procentHealth = this._hp/this.mhp;
		this._paramPlus[0] += this._erosionDamaged;
		this._erosionDamaged = 0;
		this._hp =  Math.floor(procentHealth * this.paramBase(0));		
	}

	Game_Battler.prototype.applyErosion = function(value, action) {
		var erosionRate = this.getErosionRate();
		var flatErosion = 0;
		
		if(this._leTbsDirectionalDmg) value += Math.floor(value * this._leTbsDirectionalDmg); // Compatible with LeTBS directional dmg
		
		// Handle Skills
		if(action){
			var dataClass = action._item._dataClass;
			if(dataClass == 'skill'){
				var skill = $dataSkills[action._item._itemId];
				if(skill.meta.procentErosion){
					erosionRate += Number(skill.meta.procentErosion);
				}
				if(skill.meta.flatErosion){
					flatErosion += Number(skill.meta.flatErosion);
				}
			}
		}
		
		this.applyProcentErosion(value, erosionRate);
		this.applyFlatErosion(flatErosion);
	}
	
	Game_Battler.prototype.applyProcentErosion = function(value, erosionRate){
		if(erosionRate < ErosionSystem.minErosion) erosionRate = ErosionSystem.minErosion;
		if(erosionRate > ErosionSystem.maxErosion) erosionRate = ErosionSystem.maxErosion;
		var erosionDmg = value * erosionRate;
		this.applyFlatErosion(erosionDmg);
	}
	
	Game_Battler.prototype.applyFlatErosion = function(value){
		if(this._erosionDamaged + value <= 0){ // The flat erosion removes all erosion
			this._paramPlus[0] += this._erosionDamaged;
			this._erosionDamaged = 0;
		} else {
			this._erosionDamaged += value;
			this._paramPlus[0] -= value;
		}
		if(this._hp > this.mhp) this._hp = this.mhp;
		if(ErosionSystem.dieErosion && (this.paramBase(0) + this._paramPlus[0]) <= 0){
			this.die();
		}
	}
	
	Game_Battler.prototype.regenerateHp = function() {
		var value = Math.floor(this.mhp * this.hrg);
		value = Math.max(value, -this.maxSlipDamage());
		if (value !== 0) {
			this.gainHp(value);
		}
		if(ErosionSystem.negativeRegenErosion && value < 0){ // takes dmg
			this.applyErosion(Math.abs(value), null);
		}
	};
	
	
	// Changes to Actor
	Game_Actor.prototype.getErosionRate = function() {
		var erosionRate = Game_Battler.prototype.getErosionRate.call(this);
		var actor = this.actor();
		if(actor){
			var equips = actor.equips;
			for(var i = 0; i < equips.length; i++){
				var equipment;
				if (i == 0){ // is Weapon
					equipment = $dataWeapons[equips[i]];
				} else { // is armor
					equipment = $dataArmors[equips[i]];
				}
				
				if(equipment){
					if(equipment.meta.procentErosion){
						erosionRate += Number(equipment.meta.procentErosion);
					}
				}
			}
		}
		return erosionRate;
	}
	
	// Handles calling the erosion
	Game_Action.prototype.apply = function(target) {
		var result = target.result();
		this.subject().clearResult();
		result.clear();
		result.used = this.testApply(target);
		result.missed = (result.used && Math.random() >= this.itemHit(target));
		result.evaded = (!result.missed && Math.random() < this.itemEva(target));
		result.physical = this.isPhysical();
		result.drain = this.isDrain();
		if (result.isHit()) {
			if (this.item().damage.type > 0) {
				result.critical = (Math.random() < this.itemCri(target));
				var value = this.makeDamageValue(target, result.critical);
				this.executeDamage(target, value);
				target.applyErosion(value, this);
			} else {
				target.applyErosion(0, this);
			}
			this.item().effects.forEach(function(effect) {
				this.applyItemEffect(target, effect);
			}, this);
			this.applyItemUserEffect(target);
		}
	};
	
	// Handles removing erosion after battle
	BattleManager.endBattle = function(result) {
		this._phase = 'battleEnd';
		if (this._eventCallback) {
			this._eventCallback(result);
		}
		if (result === 0) {
			$gameSystem.onBattleWin();
		} else if (this._escaped) {
			$gameSystem.onBattleEscape();
		}
		$gameParty.removeErosion();
	};
	
	Game_Party.prototype.removeErosion = function() {
		var actors = this.allMembers();
		for(var i = 0; i < actors.length; i++){
			actors[i].removeErosion();
		}
	};
	
})();