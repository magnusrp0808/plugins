//=============================================================================
// YEP Row Formation - Max Battlers Row
// MRP_YEP_RowFormation_MaxBattlersRow.js
// By Magnus0808 || Magnus Rubin Peterson
//=============================================================================

/*:
 * @plugindesc (Requires YEP_RowFormation.js) Max Battlers Row
 * @author Magnus0808
 *
 * @help This adds a limit to how many battles can be in a row
 * The max battle actors in a row should be AT LEAST than:
 *      Max BattleActors / Max Rows + 1
 * This is because otherwise you might not have any legal spots for an battler.
 * You should be VERY aware of the possibility of not having any legal spots
 * if there isn't any legal spots then this will crash your game.
 *
 * @param Max Battlers In a Row
 * @type number
 * @desc The max amount of battlers in a row.
 * @default 4
 */

 var Imported = Imported || {};
 Imported.MRP_YEP_RowFormation_MaxBattlersRow = true;
 
 var MRP = MRP || {};
 MRP.YEP_RowFormation_MaxBattlersRow = MRP.YEP_RowFormation_MaxBattlersRow ||{};
 
(function() {
	MRP.YEP_RowFormation_MaxBattlersRow.parameters = PluginManager.parameters('MRP_YEP_RowFormation_MaxBattlersRow');
	MRP.YEP_RowFormation_MaxBattlersRow.maxBattlersRow = Number(MRP.YEP_RowFormation_MaxBattlersRow.parameters['Max Battlers In a Row']);
	
	MRP.YEP_RowFormation_MaxBattlersRow.Window_RowFormation_drawRowItem = Window_RowFormation.prototype.drawRowItem;
	Window_RowFormation.prototype.drawRowItem = function(index) {
		this.ensureValidRow(index);
		MRP.YEP_RowFormation_MaxBattlersRow.Window_RowFormation_drawRowItem.call(this, index);
	};
	
	Window_RowFormation.prototype.ensureValidRow = function(index) {
		var actor = this.getActor(index);
		var row = actor.row();
		var n = 0;
		for(var i = 0; i < this.maxItems(); i++) {
			var tAct = this.getActor(i);
			if(row == tAct.row()) n++;
		}
		if(n > this.getMaxBattlersRow()) {
			var nRow = this.getFirstFreeRow();
			actor.alterRow(nRow - actor.row());
			actor.refresh();
			this.updateHelp();
			this.updateCursor();
		}
	}

	Window_RowFormation.prototype.cursorRight = function(wrap) {
		var actor = this.getActor(this.index());
		if (!actor) return;
		if (actor.row() < Yanfly.Param.RowMaximum) {
			if (actor.isRowLocked()) return SoundManager.playBuzzer();
			var row = this.getNextFreeRow(actor.row());
			if(row) {
				SoundManager.playCursor();
				actor.alterRow(row - actor.row());
				actor.refresh();
				this.refresh();
				this.updateHelp();
				this.updateCursor();
			} else {
				return SoundManager.playBuzzer()
			}
		}
	};

	Window_RowFormation.prototype.cursorLeft = function(wrap) {
		var actor = this.getActor(this.index());
		if (!actor) return;
		if (actor.row() > 1) {
		  if (actor.isRowLocked()) return SoundManager.playBuzzer();
			var row = this.getPrevFreeRow(actor.row());
			if(row) {
				SoundManager.playCursor();
				actor.alterRow(row - actor.row());
				actor.refresh();
				this.refresh();
				this.updateHelp();
				this.updateCursor();
			} else {
				return SoundManager.playBuzzer()
			}
		}
	};
	
	Window_RowFormation.prototype.isRowFull = function(row) {
		var n = 0;
		for(var i = 0; i < this.maxItems(); i++) {
			var actor = this.getActor(i);
			if(row == actor.row()) n++;
		}
		return n >= this.getMaxBattlersRow();
	}
	
	Window_RowFormation.prototype.getFirstFreeRow = function() {
		for(var i = 1; i <= Yanfly.Param.RowMaximum; i++) {
			if(!this.isRowFull(i)) return i;
		}
		return null;
	}
	
	Window_RowFormation.prototype.getNextFreeRow = function(row) {
		for(var i = row + 1; i <= Yanfly.Param.RowMaximum; i++) {
			if(!this.isRowFull(i)) return i;
		}
		return null;
	}
	
	Window_RowFormation.prototype.getPrevFreeRow = function(row) {
		for(var i = row - 1; i >= 0; i--) {
			if(!this.isRowFull(i)) return i;
		}
		return null;
	}
	
	Window_RowFormation.prototype.getMaxBattlersRow = function() {
		return MRP.YEP_RowFormation_MaxBattlersRow.maxBattlersRow;
	}
	


})();