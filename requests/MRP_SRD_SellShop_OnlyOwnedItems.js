//=============================================================================
// Only Owned Items For Sell Shop
// MRP_SRD_SellShop_OnlyOwnedItems.js
// By Magnus0808 || Magnus Rubin Peterson
//=============================================================================

/*:
 * @plugindesc Extension to SRD_SellShop. Only shows items you have.
 * @author Magnus0808
 *
 * @help Place after SRD_SellShop. This makes it so the Sell Shop only show the
 * items if you actually have it.
 *
 
 */
 
 var Imported = Imported || {};
 Imported.MRP_SRD_SellShop_OnlyOwnedItems = true;
 
 var MRP = MRP || {};
 MRP.SRD_SellShop_OnlyOwnedItems = MRP.SRD_SellShop_OnlyOwnedItems ||{};
 
(function() {
		
	//-----------------------------------------------------------------------------
    // Window_ShopBuy
    //
    // Changes to Window_ShopBuy
	
	MRP.SRD_SellShop_OnlyOwnedItems.Window_ShopBuy_makeItemList = Window_ShopBuy.prototype.makeItemList;
	Window_ShopBuy.prototype.makeItemList = function() {
		MRP.SRD_SellShop_OnlyOwnedItems.Window_ShopBuy_makeItemList.call(this);
		if($gameTemp.getSellShop()) {
			var filteredData = [];
			var filteredPrice = [];
			for(var i = 0; i < this._data.length; i++) {
				if($gameParty.hasItem(this._data[i])) {
					filteredData.push(this._data[i]);
					filteredPrice.push(this._price[i]);
				}
			}
			this._data = filteredData;
			this._price = filteredPrice;
		}
	};
	
})();