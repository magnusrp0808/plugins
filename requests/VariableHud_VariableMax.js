//=============================================================================
// VariableHud_VariableMax.js
//=============================================================================

/*:
 * @plugindesc MOG_VariableHud extension. This plugin adds the possibilty to use a variable as the max
 * value of a variable hud.
 * @author Magnus0808
 *
 * @help You can now use \v[x] to use variable x as a value.
 * E.g set_variable_max : 1 : \v[12]
 */
(function() {
	
	for (var i = 0; i < Moghunter.variableHud_Max; i++) {
		Moghunter.variableHud_ValueLimit[i] = String(Moghunter.parameters['Hud ' + String(i + 1) + ' Maximum Value'] || 999);
	};	
	
	
	Scene_Map.prototype.createVariableHuds = function() {
		this._variableHud = [];
		for (var i = 0; i < Moghunter.variableHud_Max; i++) {
			if (!$gameSystem._variableHudData[i]) {
				 $gameSystem._variableHudData[i] = {}
				 var vis = String(Moghunter.variableHud_VisibleInt[i]) === "true" ? true : false;
				 $gameSystem._variableHudData[i].id = i;
				 $gameSystem._variableHudData[i].visible = vis;
				 $gameSystem._variableHudData[i].maxValue = this.getMaxValue(i);			 
				 $gameSystem._variableHudData[i].showMax = String(Moghunter.variableHud_ShowMax[i]) == "true" ? true : false;			 
				 $gameSystem._variableHudData[i].gauge = String(Moghunter.variableHud_ShowGauge[i]) == "true" ? true : false;
				 $gameSystem._variableHudData[i].gaugeX = Number(Moghunter.variableHud_gaugeX[i]);
				 $gameSystem._variableHudData[i].gaugeY = Number(Moghunter.variableHud_gaugeY[i]);
				 $gameSystem._variableHudData[i].autoFade = String(Moghunter.variableHud_AutoFade[i]) == "true" ? true : false;
			};
			this._variableHud[i] = new VariableHud(i);
			this._variableHud[i].mz = 120;
			this._hudField.addChild(this._variableHud[i]);			
		};
	};
	
	Scene_Map.prototype.updateMaxValues = function() {
		for (var i = 0; i < Moghunter.variableHud_Max; i++) {
			$gameSystem._variableHudData[i].maxValue = this.getMaxValue(i);
		}
	}
	
	Scene_Map.prototype.getMaxValue = function(i) {
		var maxString = Moghunter.variableHud_ValueLimit[i];	
		var regex = /\\v\[(\d*)\]/
		var match = regex.exec(maxString);
		
		if(match) {
			return $gameVariables.value(Number(match[1]));
		} else {
			return Number(maxString);
		}	
	}
	
	var _mog_variableHud_pluginCommand = Game_Interpreter.prototype.pluginCommand
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		_mog_variableHud_pluginCommand.call(this,command, args)
		if (command === "hide_variable_hud") {
			var varID = Number(args[1]) - 1;
			if ($gameSystem._variableHudData[varID]) {
				$gameSystem._variableHudData[varID].visible = false;
			};
		} else if (command === "show_variable_hud") {
			var varID = Number(args[1]) - 1;
			if ($gameSystem._variableHudData[varID]) {
				 $gameSystem._variableHudData[varID].visible = true;
			};		
		};
		if (command === "set_variable_max")  {
			var id = Number(args[1]);
			var maxvalue = args[3] != null ? String(args[3]) : "0";		
			for (var i = 0; i < Moghunter.variableHud_Max; i++) {
				var vid = Moghunter.variableHud_VariableID[i];
				if ($gameSystem._variableHudData[i] && vid === id) {
					Moghunter.variableHud_ValueLimit[i] = maxvalue;
					$gameSystem._variableHudData[i].maxValue = Scene_Map.prototype.getMaxValue(i);
				};
			};
		};
		return true;
	};
	
	Game_Variables.prototype.onChange = function() {
		$gameMap.requestRefresh();
		Scene_Map.prototype.updateMaxValues();
	};

})();