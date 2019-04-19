//=============================================================================
// Fixes for Yanfly's Message Backlog
// MRP_YEP_X_MessageBacklog_Fixes.js
// By Magnus0808 || Magnus Rubin Peterson
//=============================================================================

/*:
 * @plugindesc Fixes for YEP_X_MessageBacklog.
 * @author Magnus0808
 *
 * @help Place after YEP_X_MessageBacklog. This fixes the following things:
 *         * Now updates the scrollbar everytime you scroll
 *         * The 'Scroll Speed' now also affects scrolling with the arrow keys.
 */
 
 var Imported = Imported || {};
 Imported.MRP_YEP_X_MessageBacklog_Fixes = true;
 
 var MRP = MRP || {};
 MRP.YEP_X_MessageBacklog_Fixes = MRP.YEP_X_MessageBacklog_Fixes ||{};
 
(function() {
		
	//-----------------------------------------------------------------------------
    // Window_MessageBacklog
    //
    // Changes to Window_MessageBacklog
	MRP.YEP_X_MessageBacklog_Fixes.Window_MessageBacklog_scrollUp = Window_MessageBacklog.prototype.scrollUp;
	Window_MessageBacklog.prototype.scrollUp = function() {
		MRP.YEP_X_MessageBacklog_Fixes.Window_MessageBacklog_scrollUp.call(this);
		if (this._scrollSprite) this._scrollSprite.updatePosition();
	};
	
	MRP.YEP_X_MessageBacklog_Fixes.Window_MessageBacklog_scrollDown = Window_MessageBacklog.prototype.scrollDown;
	Window_MessageBacklog.prototype.scrollDown = function() {
		MRP.YEP_X_MessageBacklog_Fixes.Window_MessageBacklog_scrollDown.call(this);
		if (this._scrollSprite) this._scrollSprite.updatePosition();
	};
	
	Window_MessageBacklog.prototype.processCursorMove = function() {
		var longPressed = false;
		if (this.isCursorMovable()) {
			var lastIndex = this.index();		
			if (Input.isLongPressed('down')) {
				if(this._touchHold <= 0) {
					longPressed = true;
					this._touchHold = Yanfly.Param.MsgBacklogScrollSpd;
					this.cursorDown(Input.isTriggered('down'));
				}
			} else if (Input.isRepeated('down')) {
				this.cursorDown(Input.isTriggered('down'));
			}
			
			if (Input.isLongPressed('up')) {
				if(this._touchHold <= 0) {
					longPressed = true;
					this._touchHold = Yanfly.Param.MsgBacklogScrollSpd;
					this.cursorUp(Input.isTriggered('up'));
				}
			} else if (Input.isRepeated('up')) {
				this.cursorUp(Input.isTriggered('up'));
			}
			
			if (Input.isRepeated('right')) {
				this.cursorRight(Input.isTriggered('right'));
			}
			if (Input.isRepeated('left')) {
				this.cursorLeft(Input.isTriggered('left'));
			}
			if (!this.isHandled('pagedown') && Input.isTriggered('pagedown')) {
				this.cursorPagedown();
			}
			if (!this.isHandled('pageup') && Input.isTriggered('pageup')) {
				this.cursorPageup();
			}
			if (this.index() !== lastIndex && !longPressed) {
				SoundManager.playCursor();
			}
		}
	};
	

	
})();