//=============================================================================
// Bust By Class
// MRP_BustByClass.js
// By Magnus0808 || Magnus Rubin Peterson
//=============================================================================

/*:
 * @plugindesc Extension to GAVL_BustMenu. This changes the bust image to be of
 * the actors class instead of their face image.
 * @author Magnus0808
 *
 * @help This requires GAVL_BustMenu(v1.7). This also needs to be placed after
 * GAVL_BustMenu.
 *
 * Just like for GAVL_BustMenu the bust images still need to be placed in
 * the /img/pictures/ folder. However, they now need to be named in the 
 * following maner: YOUR CLASS NAME_1.png
 * E.g. Hero_1.png (/img/pictures/Hero_1.png)
 *
 * I even added a note tag to actors so they can choose to different image for
 * the class: <BustIndex:x>
 * E.g. An actor with the class Hero and note tag <BustIndex:2> uses the image
 * Hero_2.png
 */
 
(function(){ 
	Window_MenuStatus.prototype.drawActorFace = function(actor, x, y, width, height) {
		var index = 0;
		if(actor.actor().meta.BustIndex) index = actor.actor().meta.BustIndex - 1;
		this.drawFace(actor.currentClass().name, index, x, y, width, height);
	};
})();