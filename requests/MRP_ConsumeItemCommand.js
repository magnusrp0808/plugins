//=============================================================================
// Test
// MRP_Test.js
// By Magnus0808 || Magnus Rubin Peterson
//=============================================================================

/*:
 * @plugindesc Test
 * @author Magnus0808
 *
 * @help Test
 *
 * @param Test
 * @type boolean
 * @desc Test 
 * @default true
 */

 var Imported = Imported || {};
 Imported.MRP_Test = true;
 
 var MRP = MRP || {};
 MRP.Test = MRP.Test ||{};
 
(function() {
	
	
	MRP.Test.Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		MRP.Test.Game_Interpreter_pluginCommand.call(this, command, args)	
		if (command === 'ConsumeItem'){
			var id;
			var targets;
			var force = false;
			if(args[0]) id = Number(args[0]);
			if(args[1]) {
				var tArg = args[1].toLowerCase();
				switch(tArg) {
					case "all":
						targets = $gameParty.allMembers();
						break;
					case "leader":
						targets = [$gameParty.leader()];
						break;
					default:
						var tId = Number(tArg);
						target = [$gameActors.actor(tId)];
						break;
				}
			}
			if(args[2]) force = (args[2].toLowerCase() == "true");
			if(id && targets) {
				var item = $dataItems[id];
				MRP.Test.applyItem(targets, item, force);
			}
		}
	};
	
	MRP.Test.applyItem = function(targets, item, force){
		var user = targets[0];
		if(!force && !$gameParty.hasItem(item)) return;
		if(!force && $gameParty.hasItem(item)) user.useItem(item);
		var action = new Game_Action(user);
		
		action.setItemObject(item);
		targets.forEach(function(target) {
			for (var i = 0; i < action.numRepeats(); i++) {
				action.apply(target);
			}
		}, this);
		action.applyGlobal();
	}

})();