//=============================================================================
// MRP_GALV_MessageBackground_MessageHide_Compatibility.js
//=============================================================================

/*:
 * @plugindesc This plugin is to make GALV_MessgeBackground and MessageHide compatibility with eachother. 
 * @author Magnus0808
 * @help Have GALV_MessageBackground (version 2.0) and MessageHide (v1.1.0) before this plugin.
 */

(function (){
	var MRP_GALV_HIDE_WM_OLD = Window_Message.prototype.update;
	Window_Message.prototype.update = function() {
		MRP_GALV_HIDE_WM_OLD.call(this);
		if(Galv.MBG){ // Kind of test for if GALV_MessgeBackground is on
			if(MessageHide_messageWindowVisible){
				Galv.MBG.disable = $gameSwitches.value(Galv.MBG.s);
			} else {
				Galv.MBG.disable = true;
			}
		}
	}
 })();