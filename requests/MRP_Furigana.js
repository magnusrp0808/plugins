//=============================================================================
// Furigana
// MRP_Furigana.js
// By Magnus0808 || Magnus Rubin Peterson
//=============================================================================

/*:
 * @plugindesc Adds Furigana Utilization.
 * @author Magnus0808
 *
 * @help Use the Text Code \furi[BASETEXT, FURIGANA] to add the furigana above
 * the base text.
 *
 
 */
 
 var Imported = Imported || {};
 Imported.MRP_Furigana = true;
 
 var MRP = MRP || {};
 MRP.Furigana = MRP.Furigana ||{};
 
(function() {
		
	//-----------------------------------------------------------------------------
    // Window_Base
    //
    // Changes to Window_Base
	
	Window_Base.prototype.processNewLine = function(textState) {
		textState.x = textState.left;
		var arr = /^\n((?!\n).)*(\x1bfuri).*?/.exec(textState.text.slice(textState.index));
		if(arr) {
			textState.y += textState.height * 1.5;			
		} else {
			textState.y += textState.height;		
		}
		textState.height = this.calcTextHeight(textState, false);
		
		textState.index++;
	};
	
	MRP.Furigana.Window_Base_processEscapeCharacter = Window_Base.prototype.processEscapeCharacter;
	Window_Base.prototype.processEscapeCharacter = function(code, textState) {
		MRP.Furigana.Window_Base_processEscapeCharacter.call(this, code, textState);
		switch (code) {
		case 'FURI':
			var arr = this.obtainFuriParam(textState);
			var normText = arr[0];
			var furiText = arr[1];
			
			var w = this.textWidth(normText);
			
			this.makeFontSmaller();
			var furiW = this.textWidth(furiText);
			var spaceLength = (w - furiW)/(furiText.length + 1);
			
			var furiStart = textState.x + spaceLength;
			for(var i = 0; i < furiText.length; i++){
				var c = furiText.charAt(i);
				this.contents.drawText(c, furiStart + spaceLength * i, textState.y - textState.height/1.5, w * 2, textState.height);
				furiStart += furiW/furiText.length;
			}
			
			this.makeFontBigger();
			this.contents.drawText(normText, textState.x, textState.y, w * 2, textState.height);
			textState.x += w;
			break;
		}
	};
	
	Window_Base.prototype.obtainFuriParam = function(textState) {
		var arr = /^\[(.+?), *(.+?)\]/.exec(textState.text.slice(textState.index));
		if (arr) {
			textState.index += arr[0].length;
			return arr.slice(1);
		} else {
			return '';
		}
	};
	
	//-----------------------------------------------------------------------------
    // Window_Message
    //
    // Changes to Window_Message
	
	MRP.Furigana.Window_Message_newPage = Window_Message.prototype.newPage
	Window_Message.prototype.newPage = function(textState) {
		MRP.Furigana.Window_Message_newPage.call(this, textState);
		var arr = /^((?!\n).)*(\x1bfuri).*?/.exec(textState.text.slice(textState.index));
		if(arr) {
			textState.y = textState.height * 0.5;			
		} else {
			textState.y = 0;		
		}
	};
	
})();