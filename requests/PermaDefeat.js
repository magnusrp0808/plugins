//=============================================================================
// PermaDefeat.js
//=============================================================================

/*:
 * @plugindesc This plugin adds permanent defeat to the game.
 * @author Magnus0808
 *
 * @help If a player reaches the defeat screen then all saves associated with the
 *	current save be deleted. This allows for having multiple saves but still having
 *	permanent defeat.
 */
 (function() {
	
	var $saveID        = null;
	
	Scene_Gameover.prototype.create = function() {
		Scene_Base.prototype.create.call(this);
		this.playGameoverMusic();
		this.createBackground();
		this.deleteSaveFiles();
	};
	
	Scene_Gameover.prototype.deleteSaveFiles = function() {
		for (var i = 0; i < DataManager.maxSavefiles(); i++) {
			if (DataManager.isThisGameFile(i)) {
				var json = StorageManager.load(i);
				var contents = JsonEx.parse(json);
				if(contents.saveID == $saveID) {
					StorageManager.remove(i);
				}
			}
		}
	}
	
	DataManager.makeSaveContents = function() {
		// A save data does not contain $gameTemp, $gameMessage, and $gameTroop.
		var contents = {};
		contents.system       = $gameSystem;
		contents.screen       = $gameScreen;
		contents.timer        = $gameTimer;
		contents.switches     = $gameSwitches;
		contents.variables    = $gameVariables;
		contents.selfSwitches = $gameSelfSwitches;
		contents.actors       = $gameActors;
		contents.party        = $gameParty;
		contents.map          = $gameMap;
		contents.player       = $gamePlayer;
		contents.saveID		  = $saveID;
		return contents;
	};
	
	DataManager.extractSaveContents = function(contents) {
		$gameSystem        = contents.system;
		$gameScreen        = contents.screen;
		$gameTimer         = contents.timer;
		$gameSwitches      = contents.switches;
		$gameVariables     = contents.variables;
		$gameSelfSwitches  = contents.selfSwitches;
		$gameActors        = contents.actors;
		$gameParty         = contents.party;
		$gameMap           = contents.map;
		$gamePlayer        = contents.player;
		$saveID			   = contents.saveID;
	};
	
	DataManager.setupNewGame = function() {
		this.createGameObjects();
		this.selectSavefileForNewGame();
		$gameParty.setupStartingMembers();
		$gamePlayer.reserveTransfer($dataSystem.startMapId,
			$dataSystem.startX, $dataSystem.startY);
		Graphics.frameCount = 0;
		$saveID = this.makeSaveID();
	};
	
	DataManager.makeSaveID = function() {
	  var text = "";
	  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	  for (var i = 0; i < 16; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	  }
	  return text;
	}

	
 })();