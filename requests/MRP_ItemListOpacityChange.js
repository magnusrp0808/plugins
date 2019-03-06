//=============================================================================
// Item List Opacity Change
// MRP_ItemListOpacityChange.js
// By Magnus0808 || Magnus Rubin Peterson
//=============================================================================

/*:
 * @plugindesc Change the translucent opacity of the item list.
 * @author Magnus0808
 *
 * @help Change the plugin parameter to the translucent opacity you want for
 * the item list.
 *
 * @param Item List Opacity
 * @type Number
 * @desc The translucent opacity of the Item List
 * @default 160
 */
 
 (function(){
	var MRP_ItemListOpacityChange = {};
	MRP_ItemListOpacityChange.opacity = Number(PluginManager.parameters('MRP_ItemListOpacityChange')['Item List Opacity']);
	
	
	Window_ItemList.prototype.translucentOpacity = function() {
		return MRP_ItemListOpacityChange.opacity;
	}
 })();