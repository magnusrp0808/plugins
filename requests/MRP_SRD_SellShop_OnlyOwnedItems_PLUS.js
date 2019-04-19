//=============================================================================
// Only Owned Items For Sell Shop PLUS
// MRP_SRD_SellShop_OnlyOwnedItems_PLUS_PLUS.js
// By Magnus0808 || Magnus Rubin Peterson
//=============================================================================

/*:
 * @plugindesc Extension to SRD_SellShop. Only shows items you have, and some changes. 
 * @author Magnus0808
 *
 * @help Place after SRD_SellShop. This makes it so the Sell Shop only show the
 * items if you actually have it.
 *
 * This also removes the command for Cancel in the command window of a shop, and you
 * do not have to click on the sell command.
 *
 */
 
 var Imported = Imported || {};
 Imported.MRP_SRD_SellShop_OnlyOwnedItems_PLUS = true;
 
 var MRP = MRP || {};
 MRP.SRD_SellShop_OnlyOwnedItems_PLUS = MRP.SRD_SellShop_OnlyOwnedItems_PLUS ||{};
 
(function() {
	
	//-----------------------------------------------------------------------------
    // Scene_Shop
    //
    // Changes to Scene_Shop
	
	MRP.SRD_SellShop_OnlyOwnedItems_PLUS.Scene_Shop_create = Scene_Shop.prototype.create;
	Scene_Shop.prototype.create = function() {
		MRP.SRD_SellShop_OnlyOwnedItems_PLUS.Scene_Shop_create.call(this);	
		if($gameTemp.getSellShop()) {
			this._commandWindow.deactivate();
			this.commandBuy();
		}
	};
	
	MRP.SRD_SellShop_OnlyOwnedItems_PLUS.Scene_Shop_onBuyCancel = Scene_Shop.prototype.onBuyCancel;
	Scene_Shop.prototype.onBuyCancel = function() {	
		if($gameTemp.getSellShop()) {
			this.popScene.call(this)
		} else {
			MRP.SRD_SellShop_OnlyOwnedItems_PLUS.Scene_Shop_onBuyCancel.call(this);
		}
	};
	
	//-----------------------------------------------------------------------------
    // Window_ShopCommand
    //
    // Changes to Window_ShopCommand

	MRP.SRD_SellShop_OnlyOwnedItems_PLUS.Window_ShopCommand_isCursorVisible = Window_ShopCommand.prototype.isCursorVisible;
	Window_ShopCommand.prototype.isCursorVisible = function() {
		if($gameTemp.getSellShop()) {
			return false;
		} else {
			var row = this.row();
			return row >= this.topRow() && row <= this.bottomRow();
		}
	};
	
	MRP.SRD_SellShop_OnlyOwnedItems_PLUS.Window_ShopCommand_makeCommandList = Window_ShopCommand.prototype.makeCommandList;
	Window_ShopCommand.prototype.makeCommandList = function() {
		if($gameTemp.getSellShop()) {
			this.addCommand(TextManager.sell,    'buy');
		} else {
			MRP.SRD_SellShop_OnlyOwnedItems_PLUS.Window_ShopCommand_makeCommandList.call(this);
		}
	};
		
	//-----------------------------------------------------------------------------
    // Window_ShopBuy
    //
    // Changes to Window_ShopBuy
	
	MRP.SRD_SellShop_OnlyOwnedItems_PLUS.Window_ShopBuy_makeItemList = Window_ShopBuy.prototype.makeItemList;
	Window_ShopBuy.prototype.makeItemList = function() {
		MRP.SRD_SellShop_OnlyOwnedItems_PLUS.Window_ShopBuy_makeItemList.call(this);
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