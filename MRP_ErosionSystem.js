//=============================================================================
// Erosion System
// MRP_ErosionSystem.js
// By Magnus0808 || Magnus Rubin Peterson
// Version 1.2.2
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
 * [CHANGE LOG]
 * Version 1.2.2:
 *	+ Bug fix (Healing should now no longer remove erosion)
 * Version 1.2.1:
 *  + Compatibility Fixes (Hopefully removed most potentional compatibility issues)
 * Version 1.2:
 *	+ Made the <flatErosion:xxx> notetag work for Equipment. It adds permanent erosion while the equipment is worn.
 *	+ Made the <baseErosion::x.xxx> and <procentErosion:x.xxx> work for Classes. Classes has priority over Actors
 *	  this means that if an Actor and its Class both have the <baseErosion:x.xxx> tag the then the one of the Class
 *	  will take effect and not the one of the Actor.
 * Version 1.1:
 *	+ Made a parameter for if you regen health after battle.
 * Version 1.0:
 * 	+ First Release
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
 *
 * @param Stable Health Procent
 * @type Boolean
 * @desc If true then you regen health after each battle to have the same procent of health left
 * compared to what you had at the end of the battle.
 * @default true
 */
 
(function() {
	
	ErosionSystem = {};
	ErosionSystem.Parameters = PluginManager.parameters('MRP_ErosionSystem');
	ErosionSystem.baseErosion = Number(ErosionSystem.Parameters['Natural Erosion Rate']);
	ErosionSystem.maxErosion = Number(ErosionSystem.Parameters['Max Erosion Rate']);
	ErosionSystem.minErosion = Number(ErosionSystem.Parameters['Min Erosion Rate']);
	ErosionSystem.negativeRegenErosion = (String(ErosionSystem.Parameters['Negative HP Regen Erosion']) == 'true');
	ErosionSystem.dieErosion = (String(ErosionSystem.Parameters['Can Die From Erosion']) == 'true');
	ErosionSystem.stableHealth = (String(ErosionSystem.Parameters['Stable Health Procent']) == 'true');
	
	// Changes to Game_Battler
	var old_init = Game_Battler.prototype.initMembers;
	Game_Battler.prototype.initMembers = function() {
		old_init.call(this);
		this._erosionDamaged = 0;
		this._persistantErosion = 0;
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
		this._paramPlus[0] += this._erosionDamaged - this._persistantErosion;
		this._erosionDamaged = this._persistantErosion;
		if(ErosionSystem.stableHealth) this._hp =  Math.floor(procentHealth * this.paramBase(0));		
	}

	Game_Battler.prototype.applyErosion = function(value, action) {
		var erosionRate = this.getErosionRate();
		var flatErosion = 0;
		
		if(this._leTbsDirectionalDmg) value += Math.floor(value * this._leTbsDirectionalDmg); // Compatible with LeTBS directional dmg
		console.log(this);
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
		console.log("Erosion Damaged: " + this._erosionDamaged)
		console.log("Added Erosion: " + value)
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
	
	var MRP_EROSION_Gb_REGENHP_OLD = Game_Battler.prototype.regenerateHp;
	Game_Battler.prototype.regenerateHp = function() {
		MRP_EROSION_Gb_REGENHP_OLD.call(this);
		var value = Math.floor(this.mhp * this.hrg);
		value = Math.max(value, -this.maxSlipDamage());
		if(ErosionSystem.negativeRegenErosion && value < 0){ // takes dmg
			this.applyErosion(Math.abs(value), null);
		}
	};
	
	Game_Battler.prototype.getPersistantErosion = function(){
		return 0;
	}
	
	Game_Battler.prototype.updatePersistantErosion = function(){
		var difference = this.getPersistantErosion() - this._persistantErosion;
		this._paramPlus[0] -= difference;
		this._persistantErosion += difference;
		this._erosionDamaged = this._persistantErosion;
		if(this._hp > this.mhp) this._hp = this.mhp;
		if(ErosionSystem.dieErosion && (this.paramBase(0) + this._paramPlus[0]) <= 0){
			this.die();
		}
	}
	
	
	// Changes to Actor
	
	MRP_GA_SETUP_OLD = Game_Actor.prototype.setup;
	Game_Actor.prototype.setup = function(actorId) {
		MRP_GA_SETUP_OLD.call(this, actorId);
		this.updatePersistantErosion();
	};
	
	Game_Actor.prototype.getBaseErosionRate = function() {
		var baseErosion = 0;
		var actor = this.actor();
		if(actor){
			// Handle Class baseErosion
			var currentClass = this.currentClass();
			
			if(currentClass.meta.baseErosion){
				baseErosion += Number(currentClass.meta.baseErosion);
			} else if (actor.meta.baseErosion) {
				baseErosion += Number(actor.meta.baseErosion);
			} else {				
				baseErosion += ErosionSystem.baseErosion;
			}
			
			if(actor.meta.procentErosion){
				baseErosion += Number(actor.meta.procentErosion);
			}
			if(currentClass.meta.procentErosion){
				baseErosion += Number(currentClass.meta.procentErosion);
			}
		} else {
			baseErosion += ErosionSystem.baseErosion;
		}
		return baseErosion;
	}
	
	Game_Actor.prototype.getErosionRate = function() {
		var erosionRate = Game_Battler.prototype.getErosionRate.call(this);
		var actor = this.actor();
		if(actor){
			// Handle Equips
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
	
	Game_Actor.prototype.getPersistantErosion = function(){
		var persistantErosion = Game_Battler.prototype.getPersistantErosion.call(this);
		var actor = this.actor();
		if(actor){
			var equips = this._equips;
			for(var i = 0; i < equips.length; i++){
				var equipment;
				if (i == 0){ // is Weapon
					equipment = $dataWeapons[equips[i]._itemId];
				} else { // is armor
					equipment = $dataArmors[equips[i]._itemId];
				}
				if(equipment){
					if(equipment.meta.flatErosion){
						persistantErosion += Number(equipment.meta.flatErosion);
					}
				}
			}
		}
		return persistantErosion;
	}
	
	var MRP_ES_GA_CHANGEEQUIP_OLD = Game_Actor.prototype.changeEquip;
	Game_Actor.prototype.changeEquip = function(slotId, item) {
		MRP_ES_GA_CHANGEEQUIP_OLD.call(this, slotId, item);
		this.updatePersistantErosion();
	};

	var MRP_ES_GA_FORCEEQUIP_OLD = Game_Actor.prototype.forceChangeEquip;
	Game_Actor.prototype.forceChangeEquip = function(slotId, item) {
		MRP_ES_GA_FORCEEQUIP_OLD.call(this, slotId, item);
		this.updatePersistantErosion();
	};

	
	// Handles calling the erosion
	var MRP_EROSION_GA_APPLY_OLD = Game_Action.prototype.apply;
	Game_Action.prototype.apply = function(target) {
		MRP_EROSION_GA_APPLY_OLD.call(this, target);
		if (target.result().isHit() && !(this.item().damage.type > 0)) {
			target.applyErosion(0, this);

		}
	};
	
	var MRP_EROSION_GA_EXECUTEDAMAGE_OLD = Game_Action.prototype.executeDamage;
	Game_Action.prototype.executeDamage = function(target, value) {
		MRP_EROSION_GA_EXECUTEDAMAGE_OLD.call(this, target, value);
		if (value > 0) {
			target.applyErosion(value, this);
		} else {
			target.applyErosion(0, this); // In case of flat erosion
		}
	};
	
	
	// Handles removing erosion after battle
	MRP_BM_ENDBATTLE_OLD = BattleManager.endBattle;
	BattleManager.endBattle = function(result) {
		MRP_BM_ENDBATTLE_OLD.call(this);
		$gameParty.removeErosion();
	};
	
	Game_Party.prototype.removeErosion = function() {
		var actors = this.allMembers();
		for(var i = 0; i < actors.length; i++){
			actors[i].removeErosion();
		}
	};
	
})();