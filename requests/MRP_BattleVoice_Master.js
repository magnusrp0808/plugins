//=============================================================================
// BattleVoice_Master
// MRP_BattleVoice_Master.js
// By Magnus0808 || Magnus Rubin Peterson
//=============================================================================

/*:
 * @plugindesc (* Requires BattleVoice *) Adds more customization for skill types.
 * @author Magnus0808
 *
 * @help With this you can specify if a skill type should have its own battle voice.
 * Just specify which skill types in the parameters. You can then use the meta-tag:
 * <TYPE_NAMEVoice:SOUNDEFFECT_NAME>
 * Replace TYPE_NAME with the name of the skill type (in lower caps), and replace SOUNDEFFECT_NAME
 * with the name of the sound effect that should be played when using the skill type.
 * E.g. <masterVoice:masterSkillSound>
 *
 * @param Custom Skill Types
 * @type Number[]
 * @desc Skill types which have a custom battle voice. (Skill Type Ids)
 * @default []
 */
 

 var Imported = Imported || {};
 Imported.MRP_BattleVoice_Master = true;
 
 var MRP = MRP || {};
 MRP.BattleVoice_Master = MRP.BattleVoice_Master ||{};
 
(function() {
	
	MRP.BattleVoice_Master.parameters = PluginManager.parameters('MRP_BattleVoice_Master');
	MRP.BattleVoice_Master.customSkillTypes = JSON.parse(MRP.BattleVoice_Master.parameters['Custom Skill Types']).map(function(e){return Number(e)}) || [];
	
	var BV_parameters = PluginManager.parameters('BattleVoice');
	var playSwitchId = Number(BV_parameters['ON switch ID']) || 21;
	
	var canPlayActorVoice = function(){
		return $gameSwitches.value(playSwitchId);
	}
	
	MRP.BattleVoice_Master.SoundManager_playActorVoice = SoundManager.playActorVoice;
	SoundManager.playActorVoice = function(actor, type){
		if (!canPlayActorVoice()) {
		  return;
		}
		var name = '';
		for(var i = 0; i < MRP.BattleVoice_Master.customSkillTypes.length; i++){
			var skillTypeId = MRP.BattleVoice_Master.customSkillTypes[i];
			if($dataSystem.skillTypes[skillTypeId].toLowerCase() == type){
				name = eval("actor.meta." + type + "Voice") || actor.meta.skillVoice;
				break;
			}
		}
		if(name){
			var audio = AudioManager.createAudioByFileame(name);
			AudioManager.playSe(audio);
		} else {
			MRP.BattleVoice_Master.SoundManager_playActorVoice.call(this, actor, type);
		}
	}
	
	MRP.BattleVoice_Master.Game_Actor_performAction = Game_Actor.prototype.performAction;
	Game_Actor.prototype.performAction = function(action) {
		MRP.BattleVoice_Master.Game_Actor_performAction.call(this, action);
		if(action.isCustomSkill(action.item().stypeId)){
			SoundManager.playActorVoice(this.actor(), $dataSystem.skillTypes[action.item().stypeId].toLowerCase());
		}
	}
	
	MRP.BattleVoice_Master.Game_Action_isSkill = Game_Action.prototype.isSkill;
	Game_Action.prototype.isSkill = function() {
		return this.isCustomSkill(this.item().stypeId) ? false : MRP.BattleVoice_Master.Game_Action_isSkill.call(this);
	};
	
	Game_Action.prototype.isCustomSkill = function(skillTypeId) {
		if (MRP.BattleVoice_Master.Game_Action_isSkill.call(this)) {
			for(var i = 0; i < MRP.BattleVoice_Master.customSkillTypes.length; i++){
				var cusSkillTypeId = MRP.BattleVoice_Master.customSkillTypes[i];
				if(cusSkillTypeId == skillTypeId){
					return true;
				}
			}
		}
		return false;
	};
	
})();