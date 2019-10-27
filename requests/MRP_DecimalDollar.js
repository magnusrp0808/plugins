//=============================================================================
// Decimal Dollar
// MRP_DecimalDollar.js
// By Magnus0808 || Magnus Rubin Peterson
//=============================================================================

/*:
 * @plugindesc Changes the way gold is displayed.
 * @author Magnus0808
 *
 * @help This plugin changes the way gold is displayed. With this it is displayed
 * as decimal numbers dollar style. This means that 100$ will be displayed as 
 * $1.00.
 *
 * @param Always Show Decimal
 * @type boolean
 * @desc If true then exactly $1 will be displayed as $1.00 
 * @default true
 */

 var Imported = Imported || {};
 Imported.MRP_DecimalDollar = true;
 
 var MRP = MRP || {};
 MRP.DecimalDollar = MRP.DecimalDollar ||{};
 
(function() {
	MRP.DecimalDollar.parameters = PluginManager.parameters('MRP_DecimalDollar');;
	MRP.DecimalDollar.alwaysShowDecimal = (String(MRP.DecimalDollar.parameters['Always Show Decimal']) == "true");

	MRP.DecimalDollar.convertGold = function(gold) {
		var decimal = gold%100 < 10 ? "0" + gold%100 : gold%100;
		if(!MRP.DecimalDollar.alwaysShowDecimal && Number(decimal) == 0) {
			return Math.floor(gold/100);
		}
		return Math.floor(gold/100) + "." + decimal
	}
	
	Window_Base.prototype.drawCurrencyValue = function(value, unit, x, y, width) {
		value = MRP.DecimalDollar.convertGold(value);
		var valueWidth = Math.min(80, this.textWidth(value));
		this.changeTextColor(this.systemColor());
		this.drawText(unit, x, y, width - valueWidth - 6, 'right');
		this.resetTextColor();
		this.drawText(value, x, y, width, 'right');
	};
	
	BattleManager.displayGold = function() {
		var gold = this._rewards.gold;
		if (gold > 0) {
			$gameMessage.add('\\.' + TextManager.obtainGold.format(MRP.DecimalDollar.convertGold(gold)));
		}
	};
	
	Window_ShopBuy.prototype.drawItem = function(index) {
		var item = this._data[index];
		var rect = this.itemRect(index);
		var priceWidth = 96;
		rect.width -= this.textPadding();
		this.changePaintOpacity(this.isEnabled(item));
		this.drawItemName(item, rect.x, rect.y, rect.width - priceWidth);
		this.drawText(MRP.DecimalDollar.convertGold(this.price(item)), rect.x + rect.width - priceWidth,
					  rect.y, priceWidth, 'right');
		this.changePaintOpacity(true);
};
	
})();