//=============================================================================
// Camera Mouse Move
// MRP_CameraMouseMove.js
// By Magnus0808 || Magnus Rubin Peterson
//=============================================================================
/*:
 * @plugindesc Camera moves when the mouse is at edge of screen.
 * @author Magnus0808
 *
 * @help Plug and play for default settings.
 * The following plugin command can be used to turn off/on the plugin:
 * CameraMouseMove On/Off/Toggle (depending on what you want)
 *
 * @param Border Distance
 * @type Number
 * @desc The distance the mouse should be from the border to move the camera.
 * @default 50
 *
 * @param Move Speed
 * @type Number
 * @decimals 2
 * @desc The speed the camera will move with when the mouse is by the border.
 * @default 0.10
 *
 * @param Always Show Player Move
 * @type Boolean
 * @desc If true then when the player moves the camera will always show it.
 * @default true
*/

(function(){
	var CameraMouseMove = {};
	CameraMouseMove.Parameters = PluginManager.parameters('MRP_CameraMouseMove');
	CameraMouseMove.on = true;
	CameraMouseMove.borderDistance = Number(CameraMouseMove.Parameters['Border Distance']);
	CameraMouseMove.moveSpeed = Number(CameraMouseMove.Parameters['Move Speed']);
	CameraMouseMove.playerCenter = (String(CameraMouseMove.Parameters['Always Show Player Move']) == 'true');
	
	var MRP_CMM_GI_PLUGINCOMMAND_OLD = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		MRP_CMM_GI_PLUGINCOMMAND_OLD.call(this, command, args)
		
		if (command === 'CameraMouseMove'){
			switch(args[0].toLowerCase()){
				case "on":
					CameraMouseMove.on = true;
					break;
				case "off":
					CameraMouseMove.on = false;
					break;
				case "toggle":
					CameraMouseMove.on = !CameraMouseMove.on;
					break;
			}
		}
	};
	
	var MRP_CMM_GM_UPDATE_OLD = Game_Map.prototype.update;
	Game_Map.prototype.update = function(sceneActive) {
		MRP_CMM_GM_UPDATE_OLD.call(this, sceneActive);
		this.updateCamera();
	};
	
	Game_Map.prototype.updateCamera = function(){
		if(CameraMouseMove.on) {
			var mouseX = TouchInput._mouseX;
			var mouseY = TouchInput._mouseY;
			
			if(mouseX < CameraMouseMove.borderDistance) this.scrollLeft(CameraMouseMove.moveSpeed);
			if(mouseY < CameraMouseMove.borderDistance) this.scrollUp(CameraMouseMove.moveSpeed);
			if(mouseX > Graphics.boxWidth - CameraMouseMove.borderDistance) this.scrollRight(CameraMouseMove.moveSpeed);
			if(mouseY > Graphics.boxHeight - CameraMouseMove.borderDistance) this.scrollDown(CameraMouseMove.moveSpeed);
		}	
	}
	
	var MRP_CMM_GP_UPDATESCROLL_OLD = Game_Player.prototype.updateScroll;
	Game_Player.prototype.updateScroll = function(lastScrolledX, lastScrolledY) {
		MRP_CMM_GP_UPDATESCROLL_OLD.call(this, lastScrolledX, lastScrolledY);	
		if(CameraMouseMove.playerCenter && this.isMoving()){
			if(this._realX + 1 < $gameMap._displayX) {
				$gameMap.scrollLeft($gameMap._displayX + this.centerX() - this._realX);
			}
			if(this._realX - 1 > $gameMap._displayX + this.centerX() * 2) {
				$gameMap.scrollRight(this._realX - $gameMap._displayX + this.centerX() * 2);
			}
			if(this._realY + 1 < $gameMap._displayY) {
				$gameMap.scrollUp($gameMap._displayY + this.centerY() - this._realY);
			}
			if(this._realY -1 > $gameMap._displayY + this.centerY() * 2) {
				$gameMap.scrollDown(this._realY - $gameMap._displayY + this.centerY() * 2);
			}	
		}
		
	};
	
	var MRP_CMM_TI_ONMOUSEMOVE = TouchInput._onMouseMove;
	TouchInput._onMouseMove = function(event) {
		MRP_CMM_TI_ONMOUSEMOVE.call(this, event);
		this._mouseX = Graphics.pageToCanvasX(event.pageX);
		this._mouseY = Graphics.pageToCanvasY(event.pageY);
	};
	
})();