//=============================================================================
// Single Actor System
// MRP_SingleActorSystem.js
// By Magnus0808 || Magnus Rubin Peterson
// Version 1.2
//=============================================================================

/*:
 * @plugindesc Removes actor selection windows.
 * @author Magnus0808
 *
 * @help Plug and play.
 * 
 * If you want an item or skill to ignore this plugin you can add the following notetag:
 *     <IgnoreSingleActorSystem>
 *
 * @param Status at Menu
 * @type boolean
 * @desc The status window is embedded in the main menu instead. 
 * @default true
 * 
 * @param onlySingleActor
 * @text Only Single Actor
 * @type boolean
 * @desc Only enable the effects of this plugin if there is a single
 * actor in the party
 * @default false
 */

 var Imported = Imported || {};
 Imported.MRP_SingleActorSystem = true;
 
 var MRP = MRP || {};
 MRP.SingleActorSystem = MRP.SingleActorSystem ||{};
 
(function() {
	
	MRP.SingleActorSystem.Parameters = PluginManager.parameters('MRP_SingleActorSystem');
	MRP.SingleActorSystem.statusWindow = String(MRP.SingleActorSystem.Parameters['Status at Menu']) == "true";
	MRP.SingleActorSystem.onlySingleActor = String(MRP.SingleActorSystem.Parameters['onlySingleActor']) == "true";

	MRP.SingleActorSystem.isEnabled = function(){
		if(MRP.SingleActorSystem.onlySingleActor) return $gameParty.members().length == 1;
		return true;
	}

	MRP.SingleActorSystem.ignoreEnabled = function(action){
		if(!action._item) return false;
		var dataClass = action._item._dataClass;
		var object = null;
		console.log(action)
		switch(dataClass){
			case "item":
				object = $dataItems[action._item._itemId];
				break;
			case "skill":
				object = $dataSkills[action._item._itemId];
				break;
			default:
				return false;
		}
		return (object.meta["IgnoreSingleActorSystem"] == true);
	}

	//-----------------------------------------------------------------------------
	// Scene_Menu
	//
	// Changes to Scene_Menu
	
	MRP.SingleActorSystem.Scene_Menu_create = Scene_Menu.prototype.create
	Scene_Menu.prototype.create = function() {
		MRP.SingleActorSystem.Scene_Menu_create.call(this);
		if(MRP.SingleActorSystem.isEnabled() && MRP.SingleActorSystem.statusWindow) this.createSingleStatusWindow();
	};
	
	Scene_Menu.prototype.createSingleStatusWindow = function() {
		this._singleStatusWindow = new Window_MenuSingleStatus(this._commandWindow.width, 0);
		this._singleStatusWindow.reserveFaceImages();
		this.addWindow(this._singleStatusWindow);
	};
	
	MRP.SingleActorSystem.Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow
	Scene_Menu.prototype.createCommandWindow = function() {
		MRP.SingleActorSystem.Scene_Menu_createCommandWindow.call(this);
		if(MRP.SingleActorSystem.isEnabled()){
			this._commandWindow.setHandler('skill',     this.onPersonalOk.bind(this));
			this._commandWindow.setHandler('equip',     this.onPersonalOk.bind(this));
			this._commandWindow.setHandler('status',    this.onPersonalOk.bind(this));
		}
	};
	
	//-----------------------------------------------------------------------------
	// Scene_Battle
	//
	// Changes to Scene_Battle
	
	MRP.SingleActorSystem.Scene_Battle_onSelectAction = Scene_Battle.prototype.onSelectAction;
	Scene_Battle.prototype.onSelectAction = function() {
		var action = BattleManager.inputtingAction();
		if(MRP.SingleActorSystem.isEnabled() && !MRP.SingleActorSystem.ignoreEnabled(action)){
			console.log(action)
			this._skillWindow.hide();
			this._itemWindow.hide();
			if (!action.needsSelection()) {
				this.selectNextCommand();
			} else if (action.isForOpponent()) {
				this.selectEnemySelection();
			} else {
				var action = BattleManager.inputtingAction();
				action.setTarget(0);
				this.selectNextCommand();
			}
		} else {
			MRP.SingleActorSystem.Scene_Battle_onSelectAction.call(this);
		}
	};
	//-----------------------------------------------------------------------------
	// Scene_ItemBase
	//
	// Changes to Scene_ItemBase
	
	MRP.SingleActorSystem.Scene_ItemBase_itemTargetActors = Scene_ItemBase.prototype.itemTargetActors;
	Scene_ItemBase.prototype.itemTargetActors = function() {
		var action = new Game_Action(this.user());
		if(MRP.SingleActorSystem.isEnabled() && !MRP.SingleActorSystem.ignoreEnabled(action)) {
			action.setItemObject(this.item());
			if (!action.isForFriend()) {
				return [];
			} else if (action.isForAll()) {
				return $gameParty.members();
			} else {
				return [$gameParty.members()[0]];
			}
		} else {
			return MRP.SingleActorSystem.Scene_ItemBase_itemTargetActors.call(this);
		}
	};
	
	MRP.SingleActorSystem.Scene_ItemBase_determineItem = Scene_ItemBase.prototype.determineItem;
	Scene_ItemBase.prototype.determineItem = function() {
		var action = new Game_Action(this.user());
		if(MRP.SingleActorSystem.isEnabled() && !MRP.SingleActorSystem.ignoreEnabled(action)) {
			var item = this.item();
			action.setItemObject(item);
			if (action.isForFriend()) {
				this.onActorOk();
			} else {
				this.useItem();
			}
			this.activateItemWindow();
		} else {
			MRP.SingleActorSystem.Scene_ItemBase_determineItem.call(this);
		}
	};
	
	//-----------------------------------------------------------------------------
	// Window_MenuSingleStatus
	//
	// The window for displaying actor status on the menu screen.

	function Window_MenuSingleStatus() {
		this.initialize.apply(this, arguments);
	}

	Window_MenuSingleStatus.prototype = Object.create(Window_MenuStatus.prototype);
	Window_MenuSingleStatus.prototype.constructor = Window_MenuSingleStatus;

	Window_MenuSingleStatus.prototype.initialize = function(x, y) {
		Window_MenuStatus.prototype.initialize.call(this, x, y);
		this._formationMode = false;
		this._pendingIndex = -1;
		this._actor = $gameParty.members()[0];
		this.refresh();
	};

	Window_MenuSingleStatus.prototype.maxItems = function() {
		return 0;
	};
	
	Window_MenuSingleStatus.prototype.refresh = function() {
		this.contents.clear();
		if (this._actor) {
			var lineHeight = this.lineHeight();
			this.drawBlock1(lineHeight * 0);
			this.drawHorzLine(lineHeight * 1);
			this.drawBlock2(lineHeight * 2);
			this.drawHorzLine(lineHeight * 6);
			this.drawBlock3(lineHeight * 7);
			this.drawHorzLine(lineHeight * 13);
			this.drawBlock4(lineHeight * 14);
		}
	};
	
	Window_MenuSingleStatus.prototype.drawBlock1 = function(y) {
		this.drawActorName(this._actor, 6, y);
		this.drawActorClass(this._actor, 192, y);
		this.drawActorNickname(this._actor, 432, y);
	};

	Window_MenuSingleStatus.prototype.drawBlock2 = function(y) {
		this.drawActorFace(this._actor, 12, y);
		this.drawBasicInfo(164, y);
		this.drawExpInfo(356, y);
	};
	
	Window_MenuSingleStatus.prototype.drawFace = function(faceName, faceIndex, x, y, width, height) {
		var bitmap = ImageManager.loadFace(faceName);
		if (bitmap.width <= 0) {
		  return setTimeout(this.drawFace.bind(this, faceName, faceIndex, x, y, width, height), 25);
		}
		Window_Base.prototype.drawFace.call(this, faceName, faceIndex, x, y, width, height);
	};

	Window_MenuSingleStatus.prototype.drawBlock3 = function(y) {
		this.drawParameters(24, y);
		this.drawEquipments(280, y);
	};

	Window_MenuSingleStatus.prototype.drawBlock4 = function(y) {
		this.drawProfile(6, y);
	};

	Window_MenuSingleStatus.prototype.drawHorzLine = function(y) {
		var lineY = y + this.lineHeight() / 2 - 1;
		this.contents.paintOpacity = 48;
		this.contents.fillRect(0, lineY, this.contentsWidth(), 2, this.lineColor());
		this.contents.paintOpacity = 255;
	};

	Window_MenuSingleStatus.prototype.lineColor = function() {
		return this.normalColor();
	};

	Window_MenuSingleStatus.prototype.drawBasicInfo = function(x, y) {
		var lineHeight = this.lineHeight();
		this.drawActorLevel(this._actor, x, y + lineHeight * 0);
		this.drawActorIcons(this._actor, x, y + lineHeight * 1);
		this.drawActorHp(this._actor, x, y + lineHeight * 2);
		this.drawActorMp(this._actor, x, y + lineHeight * 3);
	};
	
	Window_MenuSingleStatus.prototype.drawActorLevel = function(actor, x, y) {
		this.changeTextColor(this.systemColor());
		this.drawText(TextManager.levelA, x, y, 48);
		this.resetTextColor();
		this.drawText(actor.level, x + 42, y, 36, 'right');
	};

	Window_MenuSingleStatus.prototype.drawParameters = function(x, y) {
		var lineHeight = this.lineHeight();
		for (var i = 0; i < 6; i++) {
			var paramId = i + 2;
			var y2 = y + lineHeight * i;
			this.changeTextColor(this.systemColor());
			this.drawText(TextManager.param(paramId), x, y2, 160);
			this.resetTextColor();
			this.drawText(this._actor.param(paramId), x + 160, y2, 60, 'right');
		}
	};

	Window_MenuSingleStatus.prototype.drawExpInfo = function(x, y) {
		var lineHeight = this.lineHeight();
		var expTotal = TextManager.expTotal.format(TextManager.exp);
		var expNext = TextManager.expNext.format(TextManager.level);
		var value1 = this._actor.currentExp();
		var value2 = this._actor.nextRequiredExp();
		if (this._actor.isMaxLevel()) {
			value1 = '-------';
			value2 = '-------';
		}
		this.changeTextColor(this.systemColor());
		this.drawText(expTotal, x, y + lineHeight * 0, 270);
		this.drawText(expNext, x, y + lineHeight * 2, 270);
		this.resetTextColor();
		this.drawText(value1, x, y + lineHeight * 1, 150, 'right');
		this.drawText(value2, x, y + lineHeight * 3, 150, 'right');
	};

	Window_MenuSingleStatus.prototype.drawEquipments = function(x, y) {
		var equips = this._actor.equips();
		var count = Math.min(equips.length, this.maxEquipmentLines());
		for (var i = 0; i < count; i++) {
			this.drawItemName(equips[i], x, y + this.lineHeight() * i);
		}
	};

	Window_MenuSingleStatus.prototype.drawProfile = function(x, y) {
		this.drawTextEx(this._actor.profile(), x, y);
	};
	
	Window_MenuSingleStatus.prototype.maxEquipmentLines = function() {
		return 6;
	};


})();