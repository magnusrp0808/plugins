//=============================================================================
// Simple Equipment Menu
// MRP_Simple_EquipmentMenu.js
// By Magnus0808 || Magnus Rubin Peterson
//=============================================================================

/*:
 * @plugindesc This plugin adds the possibility to have a scene that shows the
 * equipment the party have a specific type.
 * include the actors icon, name, and nickname.
 * @author Magnus0808
 *
 * @help In order to use this plug in you should set the etypeId parameter to a
 * variable that represents the equipment id of the type of item you wish to
 * display in the scene.
 *
 * You can also choose if it is always the party leader that uses the menu. To
 * do this simply set the "always partyleader" parameter to true.
 * If not then it will be the $gameParty._menuActorId instead.
 *
 * To call the scene simply run the script:
 * SceneManager.push(Scene_SimpleEquipmentMenu);
 *
 * @param variable_for_etypeId
 * @type variable
 * @desc This is the variable that holds the equipment id
 * of the equipment that should be shown in the Simple Equipment menu.
 * @default 1
 *
 * @param always partyleader
 * @type boolean
 * @desc If true then the simple equipment menu will always be for the partyleader regardless of who the menu actor is.
 * @default true
 *
 * @param Show Face
 * @type boolean
 * @desc If true then the simple equipment menu will show the actors face.
 * @default true
 *
 * @param Auto Close
 * @type boolean
 * @desc If true then the simple equipment menu will close after choosing equipment.
 * @default true
 *
 * @param Can Unequip
 * @type boolean
 * @desc If true then it is possible to unequip equipment by selecting an 'empty' item.
 * @default true
 *
 * @param Show Equipped Message Label
 * @type boolean
 * @desc If true then it is possible to unequip equipment by selecting an 'empty' item.
 * @default true
 *
 * @param Equipped Message Label
 * @type String
 * @desc If true then it is possible to unequip equipment by selecting an 'empty' item.
 * @default Equipped Equipment
 */

var Imported = Imported || {};
Imported.MRP_Simple_EquipmentMenu = true;
 
var MRP = MRP || {};
MRP.Simple_EquipmentMenu = MRP.Simple_EquipmentMenu ||{};


MRP.Simple_EquipmentMenu.Parameters = PluginManager.parameters('MRP_Simple_EquipmentMenu');
MRP.Simple_EquipmentMenu.etypeId = Number(MRP.Simple_EquipmentMenu.Parameters['variable_for_etypeId']);
MRP.Simple_EquipmentMenu.alwaysPartyleader = (String(MRP.Simple_EquipmentMenu.Parameters['always partyleader']) == 'true');
MRP.Simple_EquipmentMenu.showFace = (String(MRP.Simple_EquipmentMenu.Parameters['Show Face']) == 'true');
MRP.Simple_EquipmentMenu.autoClose = (String(MRP.Simple_EquipmentMenu.Parameters['Auto Close']) == 'true');
MRP.Simple_EquipmentMenu.canUnequip = (String(MRP.Simple_EquipmentMenu.Parameters['Can Unequip']) == 'true');
MRP.Simple_EquipmentMenu.showEquippedMessage = (String(MRP.Simple_EquipmentMenu.Parameters['Show Equipped Message Label']) == 'true');
MRP.Simple_EquipmentMenu.equipmentMessage = String(MRP.Simple_EquipmentMenu.Parameters['Equipped Message Label']);

//-----------------------------------------------------------------------------
// Scene_SimpleEquipmentMenu
//
// The Simple Item Scene

function Scene_SimpleEquipmentMenu() {
	this.initialize.apply(this, arguments);
}

Scene_SimpleEquipmentMenu.prototype = Object.create(Scene_ItemBase.prototype);
Scene_SimpleEquipmentMenu.prototype.constructor = Scene_SimpleEquipmentMenu;

Scene_SimpleEquipmentMenu.prototype.initialize = function() {
	Scene_ItemBase.prototype.initialize.call(this);
};

Scene_SimpleEquipmentMenu.prototype.create = function() {
	Scene_ItemBase.prototype.create.call(this);
	this.createHelpWindow();
	this.createStatusWindow();
	this.createItemWindow();
	this.setCategory($gameVariables.value(MRP.Simple_EquipmentMenu.etypeId));
	this._itemWindow.selectLast();
	this._itemWindow.activate();
};


Scene_SimpleEquipmentMenu.prototype.actor = function() {
	if(MRP.Simple_EquipmentMenu.alwaysPartyleader) {
		return $gameParty.leader();
	} else {
		return Scene_ItemBase.prototype.actor.call(this);
	}
}

Scene_SimpleEquipmentMenu.prototype.setCategory = function(etype) {
	this._itemWindow.setCategory(etype);
}

Scene_SimpleEquipmentMenu.prototype.createStatusWindow = function() {
	var wy = this._helpWindow.y + this._helpWindow.height;
	var wh = Graphics.boxHeight - wy;
	this._statusWindow = new Window_SimpleEquipmentStatus(0, wy, Graphics.boxWidth);
	this._statusWindow.reserveFaceImages();
	this._statusWindow.setActor(this.actor());
	this.addWindow(this._statusWindow);
};

Scene_SimpleEquipmentMenu.prototype.createItemWindow = function() {
	var wy = this._statusWindow.y + this._statusWindow.height;
	var wh = Graphics.boxHeight - wy;
	this._itemWindow = new Window_eTypeItemList(0, wy, Graphics.boxWidth, wh);
	this._itemWindow.setHelpWindow(this._helpWindow);
	this._itemWindow.setStatusWindow(this._statusWindow);
	this._itemWindow.setHandler('cancel', this.popScene.bind(this));
	this._itemWindow.setHandler('ok', this.onItemOk.bind(this));
	this._itemWindow.setActor(this.actor());
	this.addWindow(this._itemWindow);
};

Scene_SimpleEquipmentMenu.prototype.onItemOk = function() {
	SoundManager.playEquip();
	this.actor().changeEquip(this._itemWindow._etypeId - 1, this._itemWindow.item());
	this._itemWindow.refresh();
	this._itemWindow.activate();
	if(MRP.Simple_EquipmentMenu.autoClose) this.popScene();
	if(MRP.Simple_EquipmentMenu.showEquippedMessage && SceneManager.isNextScene(Scene_Map)) SceneManager._nextScene._showEquippedLabel = true;
};

//-----------------------------------------------------------------------------
// Window_SimpleEquipmentStatus
//
// The status window

function Window_SimpleEquipmentStatus() {
	this.initialize.apply(this, arguments);
}

Window_SimpleEquipmentStatus.prototype = Object.create(Window_EquipStatus.prototype);
Window_SimpleEquipmentStatus.prototype.constructor = Window_SimpleEquipmentStatus;

Window_SimpleEquipmentStatus.prototype.initialize = function(x, y, width) {
	var height = this.windowHeight();
	Window_Base.prototype.initialize.call(this, x, y, width, height);
	this._actor = null;
	this._tempActor = null;
	this.createContents();
	this.refresh();
};

Window_SimpleEquipmentStatus.prototype.numVisibleRows = function() {
	return this.useFace() ? 4 : 2;
};

Window_SimpleEquipmentStatus.prototype.useFace = function() {
	return MRP.Simple_EquipmentMenu.showFace;
}

Window_SimpleEquipmentStatus.prototype.refresh = function() {
	this.contents.clear();
	if (this._actor) {
		var baseWidth = this.textPadding();
		if(this.useFace()){
			baseWidth += Window_Base._faceWidth;
			this.drawActorFace(this._actor, 0, 0);
		}
		this.drawActorName(this._actor, baseWidth + this.textPadding(), 0);
		
		for (var i = 0; i < 3; i++) {		
			this.drawItem(baseWidth, this.lineHeight() * (1 + i), 2 + i);
			this.drawItem(baseWidth + 270 + 30, this.lineHeight() * (1 + i), 2 + i + 3);
		}
		
	}
};

Window_SimpleEquipmentStatus.prototype.drawActorFace = function(actor, x, y, width, height) {
	const bitmap = ImageManager.loadFace(actor.faceName());
	if (bitmap.width <= 0) {
	  return setTimeout(this.drawActorFace.bind(this, actor, x, y, width, height), 25);
	}
	this.drawFace(actor.faceName(), actor.faceIndex(), x, y, width, height);
};


//-----------------------------------------------------------------------------
// Window_eTypeItemList
//
// Item list that compares it items by their equipment id.
function Window_eTypeItemList() {
	this.initialize.apply(this, arguments);
}

Window_eTypeItemList.prototype = Object.create(Window_ItemList.prototype);
Window_eTypeItemList.prototype.constructor = Window_eTypeItemList;

Window_eTypeItemList.prototype.initialize = function(x, y, width, height) {
	Window_Selectable.prototype.initialize.call(this, x, y, width, height);
	this._etypeId = 0;
	this._actor = null;
};

Window_eTypeItemList.prototype.setActor = function(actor) {
	if (this._actor !== actor) {
		this._actor = actor;
		this.refresh();
		this.resetScroll();
	}
};

Window_eTypeItemList.prototype.setCategory = function(etype) {
	if (this._etypeId !== etype) {
		this._etypeId = etype;
		this.refresh();
		this.resetScroll();
	}
};

Window_eTypeItemList.prototype.isEnabled = function(item) {
	var enabled = MRP.Simple_EquipmentMenu.canUnequip ? true : !!item;
	return enabled;
};

Window_eTypeItemList.prototype.includes = function(item) {
	if(item === null) return MRP.Simple_EquipmentMenu.canUnequip;
	if (this._etypeId < 0 || item.etypeId != this._etypeId) {
		return false;
	}
	return this._actor.canEquip(item); // Only shows if you can equip
};

Window_eTypeItemList.prototype.setStatusWindow = function(statusWindow) {
	this._statusWindow = statusWindow;
	this.callUpdateHelp();
};

Window_eTypeItemList.prototype.updateHelp = function() {
	Window_ItemList.prototype.updateHelp.call(this);
	if (this._actor && this._statusWindow) {
		var actor = JsonEx.makeDeepCopy(this._actor);
		console.log(this._etypeId-1);
		actor.forceChangeEquip(this._etypeId-1, this.item());
		this._statusWindow.setTempActor(actor);
	}
};

//-----------------------------------------------------------------------------
// Window_EquippedLabel
//
// The window for showing a the equipment have been changed

function Window_EquippedLabel() {
	this.initialize.apply(this, arguments);
}

Window_EquippedLabel.prototype = Object.create(Window_Base.prototype);
Window_EquippedLabel.prototype.constructor = Window_EquippedLabel;

Window_EquippedLabel.prototype.initialize = function() {
	var width = this.windowWidth();
	var height = this.windowHeight();
	Window_Base.prototype.initialize.call(this, Graphics.boxWidth - width, 0, width, height);
	this.opacity = 0;
	this.contentsOpacity = 0;
	this._showCount = 0;
	this.refresh();
};

Window_EquippedLabel.prototype.windowWidth = function() {
	return 360;
};

Window_EquippedLabel.prototype.windowHeight = function() {
	return this.fittingHeight(1);
};

Window_EquippedLabel.prototype.update = function() {
	Window_Base.prototype.update.call(this);
	if (this._showCount > 0) {
		this.updateFadeIn();
		this._showCount--;
	} else {
		this.updateFadeOut();
	}
};

Window_EquippedLabel.prototype.updateFadeIn = function() {
	this.contentsOpacity += 16;
};

Window_EquippedLabel.prototype.updateFadeOut = function() {
	this.contentsOpacity -= 16;
};

Window_EquippedLabel.prototype.open = function() {
	this.refresh();
	this._showCount = 150;
};

Window_EquippedLabel.prototype.close = function() {
	this._showCount = 0;
};

Window_EquippedLabel.prototype.refresh = function() {
	this.contents.clear();
	var width = this.contentsWidth();
	this.drawBackground(0, 0, width, this.lineHeight());
	this.drawText(MRP.Simple_EquipmentMenu.equipmentMessage, 0, 0, width, 'center');
};

Window_EquippedLabel.prototype.drawBackground = function(x, y, width, height) {
	var color1 = this.dimColor1();
	var color2 = this.dimColor2();
	this.contents.gradientFillRect(x, y, width / 2, height, color2, color1);
	this.contents.gradientFillRect(x + width / 2, y, width / 2, height, color1, color2);
};

Window_EquippedLabel.prototype.dimColor1 = function() {
	if(Imported.Olivia_MapDisplayNameCore) {
		return $gameMap.displayNameDimColor1();
	} else {
		return 'rgba(0, 0, 0, 0.6)';
	}
};

Window_EquippedLabel.prototype.dimColor2 = function() {
	if(Imported.Olivia_MapDisplayNameCore) {
		return $gameMap.displayNameDimColor2();
	} else {
		return 'rgba(0, 0, 0, 0)';
	}
};

//-----------------------------------------------------------------------------
// Scene_Map
//
// Changes to Scene_Map

MRP.Simple_EquipmentMenu.Scene_Map_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
Scene_Map.prototype.createDisplayObjects = function() {
	MRP.Simple_EquipmentMenu.Scene_Map_createDisplayObjects.call(this);
	this.createMapEquipmentLabel();
};

Scene_Map.prototype.createMapEquipmentLabel = function() {
	this._mapEquippedLabelWindow = new Window_EquippedLabel();
	this.addChild(this._mapEquippedLabelWindow);
};

MRP.Simple_EquipmentMenu.Scene_Map_initialize = Scene_Map.prototype.initialize;
Scene_Map.prototype.initialize = function() {
	MRP.Simple_EquipmentMenu.Scene_Map_initialize.call(this);
	this._showEquippedLabel = false;
};

MRP.Simple_EquipmentMenu.Scene_Map_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function() {
	if(this._showEquippedLabel) {
		this._showEquippedLabel = false;
		this._mapEquippedLabelWindow.open();
	}
	MRP.Simple_EquipmentMenu.Scene_Map_update.call(this);
};

MRP.Simple_EquipmentMenu.Scene_Map_stop = Scene_Map.prototype.stop;
Scene_Map.prototype.stop = function() {
	this._mapEquippedLabelWindow.close();
	MRP.Simple_EquipmentMenu.Scene_Map_stop.call(this);
};

MRP.Simple_EquipmentMenu.Scene_Map_terminate = Scene_Map.prototype.terminate;
Scene_Map.prototype.terminate = function() {
	if (!SceneManager.isNextScene(Scene_Battle)) {
		this._mapEquippedLabelWindow.hide();
	}
	this.removeChild(this._mapEquippedLabelWindow);
	MRP.Simple_EquipmentMenu.Scene_Map_terminate.call(this);
};

MRP.Simple_EquipmentMenu.Scene_Map_callMenu = Scene_Map.prototype.callMenu;
Scene_Map.prototype.callMenu = function() {
	MRP.Simple_EquipmentMenu.Scene_Map_callMenu.call(this);
	this._mapEquippedLabelWindow.hide();
};

MRP.Simple_EquipmentMenu.Scene_Map_launchBattle = Scene_Map.prototype.launchBattle;
Scene_Map.prototype.launchBattle = function() {
	MRP.Simple_EquipmentMenu.Scene_Map_launchBattle.call(this);
	this._mapEquippedLabelWindow.hide();
};
