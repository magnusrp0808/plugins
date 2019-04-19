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
var Imported = Imported || {};
Imported.MRP_ScrollOnMessage = true;

var MRP = MRP || {};
MRP.ScrollOnMessage = MRP.ScrollOnMessage ||{};

(function(){
	MRP.ScrollOnMessage._scrollWaitTime = 12;
	
	MRP.ScrollOnMessage.Window_Message_initMembers = Window_Message.prototype.initMembers;
	Window_Message.prototype.initMembers = function() {
		MRP.ScrollOnMessage.Window_Message_initMembers.call(this);
		this._scrolledTime = 0;
	};
	
	
	MRP.ScrollOnMessage.Window_Message_update = Window_Message.prototype.update;
	Window_Message.prototype.update = function() {
		MRP.ScrollOnMessage.Window_Message_update.call(this);
		this.processWheel();
		this._scrolledTime += 1;
	};
	
	Window_Message.prototype.isOpenAndActive = function() {
		return this.isOpen() && this.active;
	};
	
	Window_Message.prototype.processWheel = function() {
		if (this.isOpenAndActive() && this.visible && !this.isAnySubWindowActive() && this._scrolledTime > MRP.ScrollOnMessage._scrollWaitTime) {
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
			Input.update();
			this.pause = false;
			if (!this._textState) {
				this.terminateMessage();
			}
		}
	};

	Window_Message.prototype.scrollUp = function() {
		if(Imported.YEP_X_MessageBacklog) this.openBacklogWindow();
	};	
})();