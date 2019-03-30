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

var MRP = MRP || {};
MRP.MSCMapName = MRP.MSCMapName || {};

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
	
	
	// Error Window Stuff
	MRP.MSCMapName._makeErrorHtml = Graphics._makeErrorHtml;
	Graphics._makeErrorHtml = function(name, message) {
		MRP.MSCMapName._errorWindow = MRP.MSCMapName.makeErrorWindow(name, message);
		return MRP.MSCMapName._makeErrorHtml.call(this, name, message);
	};
	
	MRP.MSCMapName._makeFullErrorHtml = Graphics._makeFullErrorHtml;
	Graphics._makeFullErrorHtml = function(name, message, stack) {
	  MRP.MSCMapName._errorWindow = MRP.MSCMapName.makeErrorWindow(name, message, stack);
	  return MRP.MSCMapName._makeFullErrorHtml.call(this, name, message, stack);
	};
	
	MRP.MSCMapName.Bitmap_snap = Bitmap.snap;
	Bitmap.snap = function(stage) {
		if(Graphics._errorPrinter.innerHTML) stage.addChild(MRP.MSCMapName._errorWindow);
		return MRP.MSCMapName.Bitmap_snap.call(this, stage);
	};
	
	MRP.MSCMapName.makeErrorWindow = function(name, message, stack) {
		var errorWindow = new Window_Base(0, 0, Graphics.width, Graphics.height);
		errorWindow.makeFontSmaller();
		var x = 50;
		var y = 50;
		if(stack && stack.length > 0) {
			name = stack[0].replace(/(<[^>]*>)/, '');
			message = stack[1].replace(/(<[^>]*>)/, '');
			
			errorWindow.changeTextColor(errorWindow.crisisColor());
			errorWindow.drawText(name, x, y);
			y += 24 * 2;
			errorWindow.drawText(message, x, y);
			y += 24;
			errorWindow.changeTextColor(errorWindow.normalColor());
			for(var i = 2; i < stack.length - 1; i++){
				var stackText = stack[i].replace(/(<[^>]*>)/gi, '');
				errorWindow.drawText(stackText, x, y);
				y += 24;
			}
			errorWindow.changeTextColor(errorWindow.crisisColor());
			y += 24;
			var restartText = stack[stack.length-1].replace(/(<[^>]*>)/gi, '');
			errorWindow.drawText(restartText, x, y);
		} else {
			errorWindow.changeTextColor(errorWindow.crisisColor());
			errorWindow.drawText(name, x, y);
			y += 24 * 2;
			errorWindow.changeTextColor(errorWindow.normalColor());
			errorWindow.drawText(message, x, y);			
		}
		return errorWindow;
	}
	
})();