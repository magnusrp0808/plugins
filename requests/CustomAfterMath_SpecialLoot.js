//=============================================================================
// CustomAfterMath_SpecialLoot.js
//=============================================================================

/*:
 * @plugindesc This plugin is an extension for YEP_VictoryAftermath. That allows 
 * to add special loot to the victory drop.
 * @author Magnus0808
 * @help The special items are added with this format: var1 "text1"; var2 "text2";
 * use %1 to display the value stored in the variable.
 * E.g. 76 "Retrived %1 arrows"; 2 "Cut of %1 ears"
 * 
 * ------------------------
 * @param Special Items
 * @parent ---Special Items---
 * @desc This is the the special items
 * The special items are added with this format: var1 "text1"; var2 "text2";
 * use %1 to display the value stored in the variable.
 * E.g. 76 "Retrived %1 arrows"; 2 "Cut of %1 ears"
 
 * @param Common Event
 * @desc Common Event to be called after displaying items
 */
 (function() {
	 
	SpecialLoot = {};
	SpecialLoot.Parameters = PluginManager.parameters('CustomAfterMath_SpecialLoot');
	SpecialLoot.specialItems = String(SpecialLoot.Parameters['Special Items']);
	SpecialLoot.specialItemsIndex = [];
	SpecialLoot.specialItemsString = [];
	SpecialLoot.commonEventID = Number(SpecialLoot.Parameters['Common Event']);
	
	var myRe = /(\d+) "(.*?)";?/g;
	var m;
	do {
		m = myRe.exec(SpecialLoot.specialItems);
		if (m) {
			SpecialLoot.specialItemsIndex.push(m[1]);
			SpecialLoot.specialItemsString.push(m[2]);
		}
	} while (m);
	
	Scene_Battle.prototype.processVictoryFinish = function() {
		this._victoryTitleWindow.close();
		BattleManager.processVictoryFinish();
		if(SpecialLoot.commonEventID){
			$gameTemp.reserveCommonEvent(SpecialLoot.commonEventID);
		}
	};


	Window_VictoryDrop.prototype.makeItemList = function() {
		if (BattleManager._rewards.gold > 0) {
		  this._data = ['gold', null];
		} else {
		  this._data = [];
		}
		var special = false;
		for(var i = 0; i < SpecialLoot.specialItemsIndex.length; i++) {
			if($gameVariables.value(SpecialLoot.specialItemsIndex[i]) >= 1) {
				special = true;
				var item = {};
				item.index = SpecialLoot.specialItemsIndex[i];
				item.name = SpecialLoot.specialItemsString[i];
				this._data.push(item);
			}
		}
		if(special) {
			this._data.push(null);
		}
		
		this._dropItems = [];
		this._dropWeapons = [];
		this._dropArmors = [];
		this.extractDrops();
	};
	
	Window_VictoryDrop.prototype.drawItem = function(index) {
		var item = this._data[index];
		if (!item) return;
		this.drawGold(item, index);
		this.drawDrop(item, index);
		this.drawSpecial(item, index);
	};
	
	Window_VictoryDrop.prototype.drawSpecial = function(item, index) {
		if (DataManager.isItem(item) || DataManager.isWeapon(item) ||
		DataManager.isArmor(item) || item == 'gold') return;
		
		var rect = this.itemRect(index);
		rect.width -= this.textPadding();
		this.drawSpecialItemName(item, rect.x, rect.y, rect.width);
	};
	
	Window_VictoryDrop.prototype.drawSpecialItemName = function(item, x, y, width) {
		width = width || 312;
		if (item) {
			var iconBoxWidth = Window_Base._iconWidth + 4;
			this.resetTextColor();
			var name = item.name.replace('%1', $gameVariables.value(item.index));
			this.drawText(name, x + iconBoxWidth, y, width - iconBoxWidth);
		}
	};
	

 })();