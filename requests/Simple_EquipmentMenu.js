//=============================================================================
// Simple_EquipmentMenu.js
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
 */

Simple_EquipmentMenu = {};
Simple_EquipmentMenu.Parameters = PluginManager.parameters('Simple_EquipmentMenu');
Simple_EquipmentMenu.etypeId = Number(Simple_EquipmentMenu.Parameters['variable_for_etypeId']);
Simple_EquipmentMenu.alwaysPartyleader = (String(Simple_EquipmentMenu.Parameters['always partyleader']) == 'true');

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
	this.setCategory($gameVariables.value(Simple_EquipmentMenu.etypeId));
	this._itemWindow.selectLast();
	this._itemWindow.activate();
};


Scene_SimpleEquipmentMenu.prototype.actor = function() {
	if(Simple_EquipmentMenu.alwaysPartyleader) {
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
};

// Status window
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
    return 4;
};

Window_SimpleEquipmentStatus.prototype.refresh = function() {
    this.contents.clear();
    if (this._actor) {
		this.drawActorFace(this._actor, 0, 0);
        this.drawActorName(this._actor, Window_Base._faceWidth + this.textPadding() * 2, 0);
        for (var i = 0; i < 3; i++) {
            this.drawItem(Window_Base._faceWidth + this.textPadding(), this.lineHeight() * (1 + i), 2 + i);
			this.drawItem(Window_Base._faceWidth + this.textPadding() + 270 + 30, this.lineHeight() * (1 + i), 2 + i + 3);
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
    return true;
};

Window_eTypeItemList.prototype.includes = function(item) {
	if(!item) return true;
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
        actor.forceChangeEquip(this._etypeId-1, this.item());
        this._statusWindow.setTempActor(actor);
    }
};
