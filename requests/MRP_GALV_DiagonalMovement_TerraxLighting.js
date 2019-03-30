//=============================================================================
// Diagnoal Movement with TerraxLighting
// MRP_GALV_DiagonalMovement_TerraxLighting.js
// By Magnus0808 || Magnus Rubin Peterson
//=============================================================================

/*:
 * @plugindesc Allows for diagional facing flashlight.
 * @author Magnus0808
 *
 * @help In the event that handles the flashlight add the following script to
 * its movement:
 * 
 *		this._direction = $gamePlayer._diagDir ? $gamePlayer._diagDir : $gamePlayer._direction;
 *
 * This will change it to face in the same direction as the player.
 */
 (function(){
	 
	var flashlightoffset = Number(PluginManager.parameters('TerraxLighting')['Flashlight offset'] || 0);
	 
	Bitmap.prototype.radialgradientFillRect2 = function(x1, y1, r1, r2, color1, color2, direction, flashlength, flashwidth) {
		x1=x1+20;

		var isValidColor = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color1);
		if (!isValidColor) {
			color1 = '#000000'
		}
		var isValidColor2 = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color2);
		if (!isValidColor2) {
			color2 = '#000000'
		}

	    var context = this._context;
	    var grad;	
	    
	    // smal dim glove around player
	   	context.save();
	    y1 = y1 - flashlightoffset;
	     
	    r1 = 1;
	  	r2 = 40;
		grad = context.createRadialGradient(x1, y1, r1, x1, y1, r2);
		grad.addColorStop(0, '#999999');
		grad.addColorStop(1, color2);
	
		context.fillStyle = grad;
		context.fillRect(x1-r2, y1-r2, r2*2, r2*2);
	    
	    // flashlight
	    
		for (var cone = 0; cone < flashlength; cone++) {
			var flashlightdensity =  $gameVariables.GetFlashlightDensity();
		   	r1 = cone * flashlightdensity;
	  		r2 = cone * flashwidth;
	  		
			console.log(direction);
	  		switch(direction) {
				case 1:
					x1 = x1 - cone*4.24;
					y1 = y1 + cone*4.24;
					break;
				case 3:
					x1 = x1 + cone*4.24;
					y1 = y1 + cone*4.24;
					break;
				case 7:
					x1 = x1 - cone*4.24;
					y1 = y1 - cone*4.24;
					break;
				case 9:
					x1 = x1 + cone*4.24;
					y1 = y1 - cone*4.24;
					break;
	    		case 6:
	    			x1 = x1 + cone*6;
	       	    	break;
	   			case 4:
	   				x1 = x1 - cone*6;
	       	    	break;
	   			case 2:
	   				y1 = y1 + cone*6;
	       	    	break;
	            case 8:
	            	y1 = y1 - cone*6;
	       	    	break;
			} 
	  		  		

		  	grad = context.createRadialGradient(x1, y1, r1, x1, y1, r2);
		    grad.addColorStop(0, color1);
		    grad.addColorStop(1, color2);
	
		    context.fillStyle = grad;
		    context.fillRect(x1-r2, y1-r2, r2*2, r2*2);
    	}
	    context.fillStyle = grad;
		context.fillRect(x1-r2, y1-r2, r2*2, r2*2);
		
	    context.restore();	    
	    this._setDirty();
	};
	
 })();