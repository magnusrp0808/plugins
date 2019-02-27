//=============================================================================
// SimpleStatus_Nickname.js
//=============================================================================

/*:
 * @plugindesc This plugin changes the simple status of an actor to only
 * include the actors icon, name, and nickname.
 * @author Magnus0808
 *
 * @help Plug and play
 */
(function() {
	
	Window_Base.prototype.drawActorSimpleStatus = function(actor, x, y, width) {
		var lineHeight = this.lineHeight();
		var x2 = x + 180;
		var width2 = Math.min(200, width - 180 - this.textPadding());
		this.drawActorName(actor, x, y);
		this.drawText(actor._nickname, x, y + lineHeight * 1, width);
		this.drawActorIcons(actor, x, y + lineHeight * 2);
	};
		
})();