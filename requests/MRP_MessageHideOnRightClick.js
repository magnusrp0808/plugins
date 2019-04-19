//=============================================================================
// Message Hide On Right Click
// MRP_MessageHideOnRightClick.js
// By Magnus0808 || Magnus Rubin Peterson
//=============================================================================

var Imported = Imported || {};
Imported.MRP_MessageHideOnRightClick = true;

var MRP = MRP || {};
MRP.MessageHideOnRightClick = MRP.MessageHideOnRightClick ||{};

/*:
 * @plugindesc MessageHide Extension. Hide message on right click.
 * @author Magnus0808
 *
 * @help Plug and play. Put after MessageHide.
*/

(function(){
	
	//-----------------------------------------------------------------------------
    // Window_Message
    //
    // Changes to Window_Message
	
	MRP.MessageHideOnRightClick.Window_Message_update = Window_Message.prototype.update;
	Window_Message.prototype.update = function() {
		MRP.MessageHideOnRightClick.Window_Message_update.call(this);
		this.processRightClick();
	};
	
	Window_Message.prototype.isOpenAndActive = function() {
		return this.isOpen() && this.active;
	};
	
	MRP.MessageHideOnRightClick.Window_Message_updateInput = Window_Message.prototype.updateInput;
	Window_Message.prototype.updateInput = function() {
		if(this.pause && this.isTriggered() && !this.visible) {
			return true;
		}
		return MRP.MessageHideOnRightClick.Window_Message_updateInput.call(this);
	};
	
	Window_Message.prototype.processRightClick = function() {
		if(this.isOpenAndActive() && TouchInput.isCancelled()){
			if(Imported.YEP_X_MessageBacklog && $gameTemp.isMessageBacklogOpened()) return;
			MessageHide_messageWindowVisible = !MessageHide_messageWindowVisible;
		}
	};
	
	
	//-----------------------------------------------------------------------------
    // Window_NameBox
    //
    // Changes to Window_NameBox, if you have YEP_MessageCore
	
	if(Imported.YEP_MessageCore){
		MRP.MessageHideOnRightClick.Window_NameBox_update = Window_NameBox.prototype.update;
		Window_NameBox.prototype.update = function() {
			MRP.MessageHideOnRightClick.Window_NameBox_update.call(this);	
			if(this._parentWindow.isOpen() && this._text != '')
			{
				this.visible = this._parentWindow.visible;			
			} 
		}
	}
})();