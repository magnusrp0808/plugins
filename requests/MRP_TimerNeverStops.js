//=============================================================================
// MRP_TimerNeverStops.js
//=============================================================================

/*:
 * @plugindesc This makes the build in timer run no matter the Scene showing
 * @author Magnus0808
 *
 * @help Plug and play.
 */
(function() {
	
	Scene_Base.prototype.update = function() {
		this.updateFade();
		this.updateChildren();
		$gameTimer.update(this.isActive());
	}
	
	Game_Timer.prototype.update = function(sceneActive) {
		if (sceneActive && this._working && this._frames > 0) {
			this._frames--;
			if (this._frames === 0) {
				this.onExpire();
			}
		}
	};
	
	Scene_Battle.prototype.update = function() {
		var active = this.isActive();
		$gameScreen.update();
		this.updateStatusWindow();
		this.updateWindowPositions();
		if (active && !this.isBusy()) {
			this.updateBattleProcess();
		}
		Scene_Base.prototype.update.call(this);
	};
	
	Scene_Map.prototype.updateMain = function() {
		var active = this.isActive();
		$gameMap.update(active);
		$gamePlayer.update(active);
		$gameScreen.update();
	};
	
		
})();