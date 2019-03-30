//=============================================================================
// Message Hide On Right Click
// MRP_MessageHideOnRightClick.js
// By Magnus0808 || Magnus Rubin Peterson
//=============================================================================

var Imported = Imported || {};

/*:
 * @plugindesc MessageHide Extension. Hide message on right click.
 * @author Magnus0808
 *
 * @help Plug and play. Put after MessageHide.
*/

(function(){
	var MRP_HIDERIGHTCLICK_WM_UPDATE_OLD = Window_Message.prototype.update;
	Window_Message.prototype.update = function() {
		MRP_HIDERIGHTCLICK_WM_UPDATE_OLD.call(this);
		this.processRightClick();
	};
	
	Window_Message.prototype.isOpenAndActive = function() {
		return this.isOpen() && this.active;
	};
	
	var MRP_HIDERIGHTCLICK_WM_UPDATEINPUT_OLD = Window_Message.prototype.updateInput;
	Window_Message.prototype.updateInput = function() {
		if(this.pause && this.isTriggered() && !this.visible) {
			return true;
		}
		return MRP_HIDERIGHTCLICK_WM_UPDATEINPUT_OLD.call(this);
	};
	
	Window_Message.prototype.processRightClick = function() {
		if(this.isOpenAndActive() && TouchInput.isCancelled()){
			MessageHide_messageWindowVisible = !MessageHide_messageWindowVisible;
		}
	};
	
	if(Imported.YEP_MessageCore){
		var MRP_HIDERIGHTCLICK_WNB_UPDATE = Window_NameBox.prototype.update;
		Window_NameBox.prototype.update = function() {
			MRP_HIDERIGHTCLICK_WNB_UPDATE.call(this);	
			if(this._parentWindow.isOpen())
			{
				this.visible = this._parentWindow.visible;			
			} 
		}
	}
})();