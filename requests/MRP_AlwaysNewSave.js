//=============================================================================
// Always New Save
// MRP_AlwaysNewSave.js
// By Magnus0808 || Magnus Rubin Peterson
//=============================================================================

/*:
 * @plugindesc The Save Command in the Menu always saves in a new slot if it can.
 * @author Magnus0808
 *
 * @help Plug and Play
 *
 
 */
 
 var Imported = Imported || {};
 Imported.MRP_AlwaysNewSave = true;
 
 var MRP = MRP || {};
 MRP.AlwaysNewSave = MRP.AlwaysNewSave ||{};
 
(function() {
		
	//-----------------------------------------------------------------------------
    // Window_MapSave
    //
    // The window for showing a file have been saved
	
	function Window_MapSave() {
		this.initialize.apply(this, arguments);
	}

	Window_MapSave.prototype = Object.create(Window_Base.prototype);
	Window_MapSave.prototype.constructor = Window_MapSave;

	Window_MapSave.prototype.initialize = function() {
		var width = this.windowWidth();
		var height = this.windowHeight();
		Window_Base.prototype.initialize.call(this, Graphics.boxWidth - width, 0, width, height);
		this.opacity = 0;
		this.contentsOpacity = 0;
		this._showCount = 0;
		this.refresh();
	};

	Window_MapSave.prototype.windowWidth = function() {
		return 360;
	};

	Window_MapSave.prototype.windowHeight = function() {
		return this.fittingHeight(1);
	};

	Window_MapSave.prototype.update = function() {
		Window_Base.prototype.update.call(this);
		if (this._showCount > 0) {
			this.updateFadeIn();
			this._showCount--;
		} else {
			this.updateFadeOut();
		}
	};

	Window_MapSave.prototype.updateFadeIn = function() {
		this.contentsOpacity += 16;
	};

	Window_MapSave.prototype.updateFadeOut = function() {
		this.contentsOpacity -= 16;
	};

	Window_MapSave.prototype.open = function() {
		this.refresh();
		this._showCount = 150;
	};

	Window_MapSave.prototype.close = function() {
		this._showCount = 0;
	};

	Window_MapSave.prototype.refresh = function() {
		this.contents.clear();
		var width = this.contentsWidth();
		this.drawBackground(0, 0, width, this.lineHeight());
		this.drawText("Saved", 0, 0, width, 'center');
	};

	Window_MapSave.prototype.drawBackground = function(x, y, width, height) {
		var color1 = this.dimColor1();
		var color2 = this.dimColor2();
		this.contents.gradientFillRect(x, y, width / 2, height, color2, color1);
		this.contents.gradientFillRect(x + width / 2, y, width / 2, height, color1, color2);
	};
	
	Window_MapSave.prototype.dimColor1 = function() {
		if(Imported.Olivia_MapDisplayNameCore) {
			return $gameMap.displayNameDimColor1();
		} else {
			return 'rgba(0, 0, 0, 0.6)';
		}
	};

	Window_MapSave.prototype.dimColor2 = function() {
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
	
	MRP.AlwaysNewSave.Scene_Map_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
	Scene_Map.prototype.createDisplayObjects = function() {
		MRP.AlwaysNewSave.Scene_Map_createDisplayObjects.call(this);
		this.createMapSave();
	};
	
	Scene_Map.prototype.createMapSave = function() {
		this._mapSaveWindow = new Window_MapSave();
		this.addChild(this._mapSaveWindow);
	};
	
	MRP.AlwaysNewSave.Scene_Map_initialize = Scene_Map.prototype.initialize;
	Scene_Map.prototype.initialize = function() {
		MRP.AlwaysNewSave.Scene_Map_initialize.call(this);
		this._showSaved = false;
	};
	
	MRP.AlwaysNewSave.Scene_Map_update = Scene_Map.prototype.update;
	Scene_Map.prototype.update = function() {
		if(this._showSaved) {
			this._showSaved = false;
			this._mapSaveWindow.open();
		}
		MRP.AlwaysNewSave.Scene_Map_update.call(this);
	};
	
	MRP.AlwaysNewSave.Scene_Map_stop = Scene_Map.prototype.stop;
	Scene_Map.prototype.stop = function() {
		this._mapSaveWindow.close();
		MRP.AlwaysNewSave.Scene_Map_stop.call(this);
	};
	
	MRP.AlwaysNewSave.Scene_Map_terminate = Scene_Map.prototype.terminate;
	Scene_Map.prototype.terminate = function() {
		if (!SceneManager.isNextScene(Scene_Battle)) {
			this._mapSaveWindow.hide();
		}
		this.removeChild(this._mapSaveWindow);
		MRP.AlwaysNewSave.Scene_Map_terminate.call(this);
	};
	
	MRP.AlwaysNewSave.Scene_Map_callMenu = Scene_Map.prototype.callMenu;
	Scene_Map.prototype.callMenu = function() {
		MRP.AlwaysNewSave.Scene_Map_callMenu.call(this);
		this._mapSaveWindow.hide();
	};
	
	MRP.AlwaysNewSave.Scene_Map_launchBattle = Scene_Map.prototype.launchBattle;
	Scene_Map.prototype.launchBattle = function() {
		MRP.AlwaysNewSave.Scene_Map_launchBattle.call(this);
		this._mapSaveWindow.hide();
	};
		
	//-----------------------------------------------------------------------------
    // Scene_Menu
    //
    // Changes to Scene_Menu
	
	MRP.AlwaysNewSave.getNextFileId = function() {
		var latestSavefileId = DataManager.latestSavefileId();
		if(!StorageManager.exists(latestSavefileId)) return latestSavefileId;
		if(latestSavefileId == DataManager.maxSavefiles()){
			return 1;
		} else {
			return latestSavefileId + 1;
		}		
	}
	
	Scene_Menu.prototype.commandSave = function() {
		$gameSystem.onBeforeSave();
		var saveId = MRP.AlwaysNewSave.getNextFileId();
		if (DataManager.saveGame(saveId)) {
			SoundManager.playSave();
			StorageManager.cleanBackup(saveId);
			this.popScene();
			if(SceneManager.isNextScene(Scene_Map)) SceneManager._nextScene._showSaved = true;
		} else {
			SoundManager.playBuzzer();
		}
	};
		
})();