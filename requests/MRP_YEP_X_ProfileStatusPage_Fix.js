//=============================================================================
// Yanfly Profile Status Page Fix
// MRP_YEP_X_ProfileStatusPage_Fix.js
// By Magnus0808 || Magnus Rubin Peterson
//=============================================================================

/*:
 * @plugindesc Requires YEP_X_ProfileStatusPage.js (v. 1.03) : Fixes Images
 * @author Magnus0808
 *
 * @help Requires YEP_X_ProfileStatusPage.js(v. 1.03) and YEP_StatusMenuCore (v. 1.04).
 * Should be places immediately after YEP_X_ProfileStatusPage and BEFORE any other
 * plugin that requires YEP_StatusMenuCore
 *
 * The problem this plugin fixes is that text cut of profile image. The "bug" occures
 * because the base drawItem of Window_StatusInfo calls clearItem. It does this to
 * clear out any old text, however this also clears out part of the image. This
 * could be fixed by drawing the image AFTER you have drawn the text.
 *
 * This plugin makes a work around it. However, this is NOT the optimal solution,
 * which to my knowledge can only be done properly by editing YEP_X_ProfileStatusPage
 * directly.
 *
 * This plugin does NOT have automatic linebreaks, so if your lines are too long
 * then you will write over the image.
 */
 
(function() {
	// Rearranged so draw image is after draw items.
	// I have done it like this so it does not have to draw the same image multiple times.
	Window_StatusInfo.prototype.drawAllItems = function() {		
		// From YEP_X_ProfileStatusPage
		if (this._symbol === 'profile' && this._actor) {
		  if (this._actor.profileImage() !== '') {
			var bitmap = ImageManager.loadPicture(this._actor.profileImage());
			if (bitmap.width <= 0) {
			  return setTimeout(this.drawAllItems.bind(this), 5);
			}
			this.drawAllTextItems();
			this.drawProfileImage();
		  }
		  else
		  {
			this.drawAllTextItems();
		  }
		} else {
			this.drawAllTextItems();
		}
		
	};
	
	Window_StatusInfo.prototype.drawAllTextItems = function() {
		// From YEP_StatusMenuCore (drawAllItems)
		var topIndex = this.topIndex();
		for (var i = 0; i < this.maxPageItems(); i++) {
			var index = topIndex + i;
			if (index < this.maxItems()) {
				this.drawItem(index);
			}
		}
	}	
})();