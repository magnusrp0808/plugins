//=============================================================================
// Multiple Accessories
// MRP_MultipleAccessories.js
// By Magnus0808 || Magnus Rubin Peterson
// Version 1.0
//=============================================================================

/*:
 * @plugindesc Multiple Accessories including cursed items
 * @author Magnus0808
 *
 * @help If you use Yanfly Equip Core then put this after that one.
 * You can also make it so you cannot take an item of on normal means by
 * setting it as cursed. You do this by adding the note tag <cursed:true> to
 * the item.
 *
 * @param Default Equip Slots
 * @type Number[]
 * @desc This is the list of the default equip slots.
 * @default ["1","2","3","4","5"]
 *
 * @param Equip Multiple Of The Same Item
 * @type Boolean
 * @desc If false then you can only equip one of each item.
 * @default false
 *
 * @param Optimize With Cursed Items
 * @type Boolean
 * @desc If true then curesed items will also be used when optimizing.
 * @default false
 *
 * @param Ignore These Equipment Type When Optimizing
 * @type Number[]
 * @desc This is a list of Equipment Types that are not used when optimizing
 * @default ["5"]
 
 */
 
 
(function(){
	
	MultipleAccessories = {};
	MultipleAccessories.Parameters = PluginManager.parameters('MRP_MultipleAccessories');
	MultipleAccessories.equipSlots = JSON.parse(MultipleAccessories.Parameters['Default Equip Slots']);
	for(var i = 0; i < MultipleAccessories.equipSlots.length; i++){
		MultipleAccessories.equipSlots[i] = Number(MultipleAccessories.equipSlots[i]);
	}
	MultipleAccessories.optCursed = (String(MultipleAccessories.Parameters['Optimize With Cursed Items']) == 'true');
	MultipleAccessories.mulitiItems = (String(MultipleAccessories.Parameters['Equip Multiple Of The Same Item']) == 'true');
	MultipleAccessories.ignoreItems = JSON.parse(MultipleAccessories.Parameters['Ignore These Equipment Type When Optimizing']);
	for(var i = 0; i < MultipleAccessories.equipSlots.length; i++){
		MultipleAccessories.ignoreItems[i] = Number(MultipleAccessories.ignoreItems[i]);
	}
	
	// Changes to DataManager
	// Compatibility with yanfly equipcore
	DataManager.setDefaultEquipSlots = function(obj) {
		obj.equipSlots = MultipleAccessories.equipSlots;
	};
	
	// Changes to Game_Actor
	Game_Actor.prototype.equipSlots = function() {
		var slots;
		if(this.currentClass().equipSlots) { // Compatibility with yanfly equipcore
			slots = this.currentClass().equipSlots.slice();
		} else {
			slots = MultipleAccessories.equipSlots;
		}
		if (slots.length >= 2 && this.isDualWield()) {
			slots[1] = 1;
		}
		return slots;
	};
	
	Game_Actor.prototype.clearOptimizeEquipments = function() {
		var maxSlots = this.equipSlots().length;
		for (var i = 0; i < maxSlots; i++) {
			if(MultipleAccessories.ignoreItems.contains(this.equipSlots()[i])) continue;
			if (this.isEquipChangeOk(i)) {
				this.changeEquip(i, null);
			}
		}
	};
	
	Game_Actor.prototype.optimizeEquipments = function() {
		var maxSlots = this.equipSlots().length;
		this.clearOptimizeEquipments();
		for (var i = 0; i < maxSlots; i++) {
			if(MultipleAccessories.ignoreItems.contains(this.equipSlots()[i])) continue;
			if (this.isEquipChangeOk(i)) {
				this.changeEquip(i, this.bestEquipItem(i));
			}
		}
	};
	
	Game_Actor.prototype.bestEquipItem = function(slotId) {
		var etypeId = this.equipSlots()[slotId];
		var items = $gameParty.equipItems().filter(function(item) {
			return item.etypeId === etypeId && this.canEquip(item);
		}, this);
		var bestItem = null;
		var bestPerformance = -1000;
		for (var i = 0; i < items.length; i++) {
			if(!MultipleAccessories.optCursed && items[i].meta.cursed) continue;
			var performance = this.calcEquipItemPerformance(items[i]);
			if (performance > bestPerformance) {
				bestPerformance = performance;
				bestItem = items[i];
			}
		}
		return bestItem;
	};
	
	var MRP_MA_GA_CANEQUIP = Game_Actor.prototype.canEquip;
	Game_Actor.prototype.canEquip = function(item) {
		if(!MultipleAccessories.mulitiItems && this.isEquipped(item)) {
			return false;
		}
		return MRP_MA_GA_CANEQUIP.call(this, item);

	};
	
	var MRP_MA_GA_EQUIPCHANGEOK = Game_Actor.prototype.isEquipChangeOk;
	Game_Actor.prototype.isEquipChangeOk = function(slotId) {		
		var item = this.equips()[slotId];
		if(item && item.meta.cursed) return false;
		
		return MRP_MA_GA_EQUIPCHANGEOK.call(this, slotId);
	};
	
	Game_Actor.prototype.releaseUnequippableItems = function(forcing) {
		for (;;) {
			var slots = this.equipSlots();
			var equips = this.equips();
			var changed = false;
			for (var i = 0; i < equips.length; i++) {
				var item = equips[i];
				if (item && (!MRP_MA_GA_CANEQUIP.call(this, item) || item.etypeId !== slots[i])) {
					if (!forcing) {
						this.tradeItemWithParty(null, item);
					}
					this._equips[i].setObject(null);
					changed = true;
				}
			}
			if (!changed) {
				break;
			}
		}
	};
	
	// "Changes" to Window_EquipSlot
	// This is just the default isEnabled no changes. However, yanfly EquipCore f**** it up so I have to include
	// it ín order for them to be compatible.
	Window_EquipSlot.prototype.isEnabled = function(index) {
		return this._actor ? this._actor.isEquipChangeOk(index) : false;
	};
	
})();