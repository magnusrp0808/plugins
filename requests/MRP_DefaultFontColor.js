//=============================================================================
// Default Font Color
// MRP_DefaultFontColor.js
// By Magnus0808 || Magnus Rubin Peterson
//=============================================================================

/*:
 * @plugindesc Makes an option to set the font color
 * @author Magnus0808
 *
 * @help Just set the possible colors in the plugin parameter.
 * The first color set in the parameter will be used at the start of the game.
 *
 * @param Font Colors
 * @type struct<FontColor>[]
 * @desc The first color set will be used at the start of the game.
 * @default ["{\"Name\":\"White\",\"Color\":\"rgb(255, 255, 255)\"}"]
 */
 
 /*~struct~FontColor:
 * @param Name
 * @type String
 *
 * @param Color
 * @type String
 * @desc In the format: rgb(r, g, b), rgba(r, g, b, a), or HexCode (e.g. #FFFFFF)
 * @default rgb(r, g, b)
 */
 
 var Imported = Imported || {};
 Imported.MRP_DefaultFontColor = true;
 
 var MRP = MRP || {};
 MRP.DefaultFontColor = MRP.DefaultFontColor ||{};
 
(function() {
	MRP.DefaultFontColor.Parameters = PluginManager.parameters('MRP_DefaultFontColor');
	MRP.DefaultFontColor.fontColors = [];
	var jsonColors = JSON.parse(MRP.DefaultFontColor.Parameters['Font Colors']);
	for(var i = 0; i < jsonColors.length; i++) {
		MRP.DefaultFontColor.fontColors[i] = JSON.parse(jsonColors[i]);
		MRP.DefaultFontColor.fontColors[i].Index = i;
	}	
	
	MRP.DefaultFontColor.getNextFontColor = function() {
		var index = MRP.DefaultFontColor.currentFontColor.Index + 1;;
		if (index == MRP.DefaultFontColor.fontColors.length) index = 0;
		return MRP.DefaultFontColor.fontColors[index];
	}
	
	MRP.DefaultFontColor.getPrevFontColor = function() {
		var index = MRP.DefaultFontColor.currentFontColor.Index - 1;
		if (index == -1) index = MRP.DefaultFontColor.fontColors.length - 1;
		return MRP.DefaultFontColor.fontColors[index];
	}
	
	//-----------------------------------------------------------------------------
    // ConfigManager
    //
    // Changes to ConfigManager
	
	Object.defineProperty(ConfigManager, 'fontColor', {
		get: function() {
			return MRP.DefaultFontColor.currentFontColor;
		},
		set: function(value) {
			MRP.DefaultFontColor.currentFontColor = value;
		},
		configurable: true
	});
	
	MRP.DefaultFontColor.ConfigManager_makeData = ConfigManager.makeData;
	ConfigManager.makeData = function() {
		var config = MRP.DefaultFontColor.ConfigManager_makeData.call(this);
		config.fontColor = this.fontColor;
		return config;
	};
	
	MRP.DefaultFontColor.ConfigManager_applyData = ConfigManager.applyData;
	ConfigManager.applyData = function(config) {
		MRP.DefaultFontColor.ConfigManager_applyData.call(this, config);
		this.fontColor = this.readFont(config, 'fontColor');
	};
	
	ConfigManager.readFont = function(config, symbol) {
		if (config[symbol] !== undefined) {
			return config[symbol];
		} else {
			return MRP.DefaultFontColor.fontColors[0];
		}
	}
	
	//-----------------------------------------------------------------------------
    // Window_Options
    //
    // Changes to Window_Options
	
	MRP.DefaultFontColor.Window_Options_makeCommandList = Window_Options.prototype.makeCommandList;
	Window_Options.prototype.makeCommandList = function() {
		MRP.DefaultFontColor.Window_Options_makeCommandList.call(this);
		this.addFontColorOptions();
	};
	
	
	Window_Options.prototype.addFontColorOptions = function() {
		this.addCommand("Font Color", 'fontColor');
	};
	
	MRP.DefaultFontColor.Window_Options_processOk = Window_Options.prototype.processOk;
	Window_Options.prototype.processOk = function() {
		var index = this.index();
		var symbol = this.commandSymbol(index);
		var value = this.getConfigValue(symbol);

		if (symbol == 'fontColor') {
			let fontColor = MRP.DefaultFontColor.getNextFontColor();
			this.changeValue(symbol, fontColor);
			this.refresh();
		} else {
			MRP.DefaultFontColor.Window_Options_processOk.call(this);
		}
	};
	
	MRP.DefaultFontColor.Window_Options_cursorRight = Window_Options.prototype.cursorRight;
	Window_Options.prototype.cursorRight = function(wrap) {
		var index = this.index();
		var symbol = this.commandSymbol(index);
		var value = this.getConfigValue(symbol);
		if (symbol == 'fontColor') {
			let fontColor = MRP.DefaultFontColor.getNextFontColor();
			this.changeValue(symbol, fontColor);
			this.refresh();
		} else {
			MRP.DefaultFontColor.Window_Options_cursorRight.call(this, wrap);
		}
	};

	MRP.DefaultFontColor.Window_Options_cursorLeft = Window_Options.prototype.cursorLeft;
	Window_Options.prototype.cursorLeft = function(wrap) {
		var index = this.index();
		var symbol = this.commandSymbol(index);
		var value = this.getConfigValue(symbol);
		if (symbol == 'fontColor') {
			let fontColor = MRP.DefaultFontColor.getPrevFontColor();
			this.changeValue(symbol, fontColor);
			this.refresh();
		} else {
			MRP.DefaultFontColor.Window_Options_cursorLeft.call(this, wrap);
		}
	};
	
	MRP.DefaultFontColor.Window_Options_statusText = Window_Options.prototype.statusText;
	Window_Options.prototype.statusText = function(index) {
		var symbol = this.commandSymbol(index);
		var value = this.getConfigValue(symbol);
		if (symbol == 'fontColor') {
			return value.Name;
		} else {
			return MRP.DefaultFontColor.Window_Options_statusText.call(this, index);
		}
	};

	//-----------------------------------------------------------------------------
    // Window_Base
    //
    // Changes to Window_Base
	
	Window_Base.prototype.normalColor = function() {
		return MRP.DefaultFontColor.currentFontColor.Color;
	};
	
})();