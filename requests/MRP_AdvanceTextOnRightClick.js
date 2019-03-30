//=============================================================================
// Advance Text On Right Click
// MRP_AdvanceTextOnRightClick.js
// By Magnus0808 || Magnus Rubin Peterson
//=============================================================================

/*:
 * @plugindesc Advance text on right click
 * @author Magnus0808
 *
 * @help Plug and play.
 * Put this after MRP_ScrollOnMessage if you have that one.
*/


(function(){
	var MRP_ADVANCERIGHTCLICK_WM_UPDATE_OLD = Window_Message.prototype.update;
	Window_Message.prototype.update = function() {
		MRP_ADVANCERIGHTCLICK_WM_UPDATE_OLD.call(this);
		this.processRightClick();
	};
	
	Window_Message.prototype.isOpenAndActive = function() {
		return this.isOpen() && this.active && this.visible;
	};
	
	Window_Message.prototype.processRightClick = function() {
		if(this.isOpenAndActive() && TouchInput.isCancelled()){
			if(!this.isAnySubWindowActive()){
				this._showFast = true;
				Input.update();
				this.pause = false;
				if (!this._textState) {
					this.terminateMessage();
				}
			}
		}
	};
	

})();