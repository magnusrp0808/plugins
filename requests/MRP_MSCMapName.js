//=============================================================================
// MSC Map Name
// MRP_MSCMapName.js
// By Magnus0808 || Magnus Rubin Peterson
//=============================================================================
/*:
 * @plugindesc Extension to MakeScreenCapture.
 * @author Magnus0808
 *
 * @help Put this after MakeScreenCapture. This plugin ignores the filename
 * parameter of MakeScreenCapture and instead uses the ID and name of the current Map.
 *
 * @param Test Only
 * @desc If true then you can only take screenshots with the keys during test only.
 * @default false
*/

(function(){
	var MSC_MapName = {};
	MSC_MapName.FileFormat = PluginManager.parameters('MakeScreenCapture')['FileFormat'];
	MSC_MapName.TimeStamp = (String(PluginManager.parameters('MakeScreenCapture')['TimeStamp']) == 'true');
	MSC_MapName.NumberDigit = Number(PluginManager.parameters('MakeScreenCapture')['NumberDigit']);
	MSC_MapName.TestOnly = (String(PluginManager.parameters('MRP_MSCMapName')['Test Only']) == 'true');
	
	SceneManager.takeCapture = function(format) {
        if (!format) {
            format = MSC_MapName.FileFormat;
        }
        this.makeCapture();
		var SceneName = SceneManager._scene.constructor.name;
		if(SceneName == 'Scene_Map'){
			this.saveCapture($dataMapInfos[$gameMap.mapId()].name + "_ID" + $gameMap.mapId(), format);			
		} else {
			this.saveCapture(SceneName, format);			
		}
    };
	
	Utils.isTestCapture = function() {
        return !MSC_MapName.TestOnly || Utils.isOptionValid('test');
    };
	
	
	StorageManager.getLocalImgFileName = function(fileName) {
        if (MSC_MapName.TimeStamp) {
            var date = new Date();
            return fileName + '_' + date.getFullYear() + (date.getMonth() + 1).padZero(2) + date.getDate().padZero(2) +
                '_' + date.getHours().padZero(2) + date.getMinutes().padZero(2) + date.getSeconds().padZero(2);
        } else {
            var number = SceneManager.captureNumber;
            if (number >= Math.pow(10, MSC_MapName.NumberDigit)) number = 0;
            SceneManager.captureNumber = number + 1;
            return fileName + (number > 0 ? "_" + number.padZero(MSC_MapName.NumberDigit) : '');
        }
    };
})();