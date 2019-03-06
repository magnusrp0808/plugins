//=============================================================================
// Localization Icons
// MRP_LocalizationIcons.js
// By Magnus0808 || Magnus Rubin Peterson
//=============================================================================

/*:
 * @plugindesc Extension to Iavra Localization Core. Icons use localization.
 * @author Magnus0808
 *
 * @help Put this after Iavra Localization Core.
 * Save the different IconSets in the img/system folder with the following
 * nameing: 'IconSet_[LOCALIZATION NAME]'
 * E.g. IconSet_en (img/system/IconSet_en.png)
 *
 */

(function(){
	var Iavra_languages = IAVRA.I18N.languages();
	
	Window_Base.prototype.drawIcon = function(iconIndex, x, y) {
		var bitmap = ImageManager.loadSystem('IconSet_' + IAVRA.I18N.language);
		var pw = Window_Base._iconWidth;
		var ph = Window_Base._iconHeight;
		var sx = iconIndex % 16 * pw;
		var sy = Math.floor(iconIndex / 16) * ph;
		this.contents.blt(bitmap, sx, sy, pw, ph, x, y);
	};
	
	Sprite_StateIcon.prototype.loadBitmap = function() {
		var bitmap = ImageManager.loadSystem('IconSet_' + IAVRA.I18N.language);
		this.setFrame(0, 0, 0, 0);
	};
	
	Scene_Boot.loadSystemImages = function() {
		ImageManager.reserveSystem('Balloon');
		ImageManager.reserveSystem('Shadow1');
		ImageManager.reserveSystem('Shadow2');
		ImageManager.reserveSystem('Damage');
		ImageManager.reserveSystem('States');
		ImageManager.reserveSystem('Weapons1');
		ImageManager.reserveSystem('Weapons2');
		ImageManager.reserveSystem('Weapons3');
		ImageManager.reserveSystem('ButtonSet');
		
		for(var i = 0; i < Iavra_languages.length; i++){
			ImageManager.reserveSystem('IconSet_' + Iavra_languages[i]);
		}		
	};
	
})();