//=============================================================================
// Scroll On Message
// MRP_ScrollOnMessage
// By Magnus0808 || Magnus Rubin Peterson
//=============================================================================

/*:
 * @plugindesc Enables scroll on a message to continue.
 * @author Magnus0808
 *
 * @help Plug and play.
 * Scroll down on a message to make it continue. If you have YEP_X_MessageBacklog
 * then the backlog will show when you scroll up on a message! 
*/


(function(){
	var scrollWaitTime = 12;
	
	var MRP_SCROLL_WM_INITMEMBERS_OLD = Window_Message.prototype.initMembers;
	Window_Message.prototype.initMembers = function() {
		MRP_SCROLL_WM_INITMEMBERS_OLD.call(this);
		this._scrolledTime = 0;
	};
	
	
	var MRP_SCROLL_WM_UPDATE_OLD = Window_Message.prototype.update;
	Window_Message.prototype.update = function() {
		MRP_SCROLL_WM_UPDATE_OLD.call(this);
		this.processWheel();
		this._scrolledTime += 1;
	};
	
	Window_Message.prototype.isOpenAndActive = function() {
		return this.isOpen() && this.active;
	};
	
	Window_Message.prototype.processWheel = function() {
		if (this.isOpenAndActive() && !this.isAnySubWindowActive() && this._scrolledTime > scrollWaitTime) {
			var threshold = 20;
			if (TouchInput.wheelY >= threshold) {
				this.scrollDown();
				this._scrolledTime = 0;
			}
			if (TouchInput.wheelY <= -threshold) {
				this.scrollUp();
				this._scrolledTime = 0;
			}
		}
	};
	
	Window_Message.prototype.scrollDown = function() {
		if(!this.isAnySubWindowActive()){
			this._showFast = true;
			Input.update();
			this.pause = false;
			if (!this._textState) {
				this.terminateMessage();
			}
		}
	};

	Window_Message.prototype.scrollUp = function() {
		if(this._backlogWindow) this.openBacklogWindow();
	};	
})();