//=============================================================================
// HighestVariable.js
//=============================================================================

/*:
 * @plugindesc This plugin let you call a function that compares and returns
 * the id of the variable with the highest value.
 * @author Magnus0808
 *
 * @help Call the method DataManager.FindHighestVariable(VariableID_Array);
 *	E.g: DataManager.FindHighestVariable([5, 3 , 2]);
 */
(function() {
	DataManager.FindHighestVariable = function (variables) {
		if(!variables || variables.length == 0) return null;
		
		var highest = $gameVariables.value(variables[0]);
		var index = 0; 
		for(var i = 1; i < variables.length; i++) { 
			if ($gameVariables.value(variables[i]) > highest) { 
				higest = $gameVariables.value(variables[i]); 
				index = variables[i]; 
			} 
		}
		return index;
	}
})();