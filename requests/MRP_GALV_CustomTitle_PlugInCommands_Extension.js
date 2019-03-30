//=============================================================================
// GALV Custom Title PlugIn Commands Extension
// MRP_GALV_CustomTitle_PlugInCommands_Extension.js
// By Magnus0808 || Magnus Rubin Peterson
//=============================================================================

/*:
 * @plugindesc Extension to GALV_CustomTitle. Add plugincommand for layer graphics.
 * @author Magnus0808
 *
 * @help Place this after GALV_CustomTitle.
 *
 * If Persistant Change is enabled then the layer graphics change will be persistant
 * trough restarts of the game.
 *
 * [PLUGIN COMMAND]
 * LayerGraphics fileName xMove yMove opacity z
 *
 * And just like with GALV_CustomTitle you can add multiple layers by adding a |
 * symbol after each layer graphic data set before adding the next layer graphic
 * set.
 *
 * E.g. LayerGraphics Mountains5 0 0 255 1 | DarkSpace1 0 0 100 2
 *
 * @param Persistant Change
 * @type Boolean
 * @desc If true then the layer graphics change will be persistant. 
 * @default true
 */

(function(){
	MRP_CustomTitle_PlugInCommands = {};
	MRP_CustomTitle_PlugInCommands.Parameters = PluginManager.parameters('MRP_GALV_CustomTitle_PlugInCommands_Extension');
	MRP_CustomTitle_PlugInCommands.persistant = (String(MRP_CustomTitle_PlugInCommands.Parameters['Persistant Change']) == 'true');
	
	var MRP_GALVCTPLUGINCOMMAND_GI_PLUGINCOMMAND_OLD = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		MRP_GALVCTPLUGINCOMMAND_GI_PLUGINCOMMAND_OLD.call(this, command, args)
		if (command === 'LayerGraphics'){
			Galv.TITLE.layerData = [];
			Galv.TITLE.layerData.push([]);
			var k = 0;
			for(var i = 0; i < args.length; i++){
				if(args[i] == "|"){
					Galv.TITLE.layerData.push([]);
					k++;
				} else {
					Galv.TITLE.layerData[k].push(args[i]);
				}			
			}
			if(MRP_CustomTitle_PlugInCommands.persistant){
				ConfigManager.layerGraphics = Galv.TITLE.layerData;
				ConfigManager.save();
			}
		}
	};
	
	//=============================================================================
	// ConfigManager (Inspired by Yanfly Engine Plugins - Dynamic Title Images)
	//=============================================================================	 
	ConfigManager.layerGraphics = [];	 
	MRP_GALVCTPLUGINCOMMAND_CM_MAKEDATA = ConfigManager.makeData;
	ConfigManager.makeData = function() {
	  var config = MRP_GALVCTPLUGINCOMMAND_CM_MAKEDATA.call(this);
	  config.layerGraphics = this.layerGraphics;
	  return config;
	};
	 
	MRP_GALVCTPLUGINCOMMAND_CM_APPLYDATA = ConfigManager.applyData;
	ConfigManager.applyData = function(config) {
	  MRP_GALVCTPLUGINCOMMAND_CM_APPLYDATA.call(this, config);
	  this.layerGraphics = config.layerGraphics || [];
	};
	
	// Apply persistant layer graphics
	MRP_GALVCTPLUGINCOMMAND_ST_CREATELAYERS = Scene_Title.prototype.createLayers;
	Scene_Title.prototype.createLayers = function() {
		if(MRP_CustomTitle_PlugInCommands.persistant && ConfigManager.layerGraphics != []){
			Galv.TITLE.layerData = ConfigManager.layerGraphics;
		}
		MRP_GALVCTPLUGINCOMMAND_ST_CREATELAYERS.call(this);
	};
	
})();