//=============================================================================
// Sigil States
// MRP_SigilStates.js
// By Magnus0808 || Magnus Rubin Peterson
//=============================================================================

/*:
 * @plugindesc Requires Yanfly's Buff & Status Core. This plugin adds Sigils to the game.
 * @author Magnus0808
 *
 * @help Requires Yanfly's Buff & Status Core, so place this plugin after that one.
 * A sigil is basically a state that any actor can apply to themself in
 * battle. However, an actor can only have one sigil enabled at a time.
 *
 * You also need to create ONE sigil skill which is used as a base skill for all
 * sigils. The following will of the skill will be overritten:
 *
 *      * Name
 *      * Icon
 *      * Description (if the Sigil have a description)
 *
 * The sigil apply skill should then be set in the plugin parameters.
 * You also need to set which States are sigils in the parameters.
 *
 * You can add a description to a Sigil by using the following notetag:
 *
 *       <Description:YOUR DESCRIPTION>
 *
 * @param Sigil Command Text
 * @type string
 * @desc The text for the sigil command.
 * @default Switch Sigil
 *
 * @param Sigils
 * @type state[]
 * @desc If true then you regen health after each battle to have the same procent of health left
 * compared to what you had at the end of the battle.
 *
 * @param Apply Skill
 * @type skill
 * @desc The skill used to apply the sigil. It will be overritten.
 *
 * @param Starting Sigil
 * @type state
 * @desc This sigil will be applied to all battlers in the start of the battle. Leave
 * empty or 0 to disable.
 *
 * @param Change Sigil Cooldown
 * @type number
 * @desc The amount of turns after you have changed sigil until you can change it again
 * @default 0
 *
 * @param Change Sigil Uses Turn
 * @type boolean
 * @desc If true then changing the sigil will use the turn.
 * @default true
 
 */
 
 var Imported = Imported || {};
 Imported.MRP_SigilStates = true;
 
 var MRP = MRP || {};
 MRP.SigilStates = MRP.SigilStates || {};
 
(function() {
   
    MRP.SigilStates.Parameters = PluginManager.parameters('MRP_SigilStates');
    MRP.SigilStates.sigilCommandText = String(MRP.SigilStates.Parameters['Sigil Command Text']);
    MRP.SigilStates.states = JSON.parse(MRP.SigilStates.Parameters['Sigils']);
    MRP.SigilStates.originalCustomApply = [];
    for (var i = 0; i < MRP.SigilStates.states.length; i++) {
        MRP.SigilStates.states[i] = Number(MRP.SigilStates.states[i]);
    }
    MRP.SigilStates.skillId = Number(MRP.SigilStates.Parameters['Apply Skill']);
    MRP.SigilStates.startingSigil = Number(MRP.SigilStates.Parameters['Starting Sigil']);
    MRP.SigilStates.cooldownSigil = Number(MRP.SigilStates.Parameters['Change Sigil Cooldown']);
	MRP.SigilStates.changeTurnSigil = (MRP.SigilStates.Parameters['Change Sigil Uses Turn'] == "true");
   
    MRP.SigilStates.updateOriginalCustomApply = function () {
        var states = MRP.SigilStates.states;
        for(var i = 0; i < states.length; i++){
            var state = states[i];
            $dataStates[state].customEffectEval['addState'] = MRP.SigilStates.originalCustomApply[i] + 'a._cooldownSigil = ' + (MRP.SigilStates.cooldownSigil + 1);
        }
    }
   
   
    //-----------------------------------------------------------------------------
    // DataManager
    //
    // Changes to DataManager
    MRP.SigilStates.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
    DataManager.isDatabaseLoaded = function() {
        if (!MRP.SigilStates.DataManager_isDatabaseLoaded.call(this)) return false;
        if (!MRP.SigilStates.loaded) {
            for (var i = 0; i < MRP.SigilStates.states.length; i++) {
                MRP.SigilStates.originalCustomApply[i] = $dataStates[MRP.SigilStates.states[i]].customEffectEval['addState'];
            }
            MRP.SigilStates.updateOriginalCustomApply();
            MRP.SigilStates.loaded = true;
        }
        return true;
    };
   
    MRP.SigilStates.DataManager_isSkill = DataManager.isSkill;
    DataManager.isSkill = function(item) {  
        if(item && item.id == MRP.SigilStates.skillId) {
            return true;
        } else {
            return MRP.SigilStates.DataManager_isSkill.call(this, item);
        }
    };
   
    //-----------------------------------------------------------------------------
    // Window_BattleSigil
    //
    // The window for selecting which sigil to use.

    function Window_BattleSigil() {
        this.initialize.apply(this, arguments);
    }

    Window_BattleSigil.prototype = Object.create(Window_SkillList.prototype);
    Window_BattleSigil.prototype.constructor = Window_BattleSigil;

    Window_BattleSigil.prototype.initialize = function(x, y, width, height) {
        Window_SkillList.prototype.initialize.call(this, x, y, width, height);
        this.hide();
    };

    Window_BattleSigil.prototype.show = function() {
        this.selectLast();
        this.showHelpWindow();
        Window_SkillList.prototype.show.call(this);
    };

    Window_BattleSigil.prototype.hide = function() {
        this.hideHelpWindow();
        Window_SkillList.prototype.hide.call(this);
    };
   
    Window_BattleSigil.prototype.makeItemList = function() {
        if (this._actor) {
            this._data = this.createSkills(MRP.SigilStates.states);
        } else {
            this._data = [];
        }
    };
   
    Window_BattleSigil.prototype.isEnabled = function(item) {
        return this._actor;
    };
   
    Window_BattleSigil.prototype.createSkills = function(states) {
        var skills = [];
        for(var i = 0; i < states.length; i++){
            var state = $dataStates[states[i]];
            var skill = JsonEx.makeDeepCopy($dataSkills[MRP.SigilStates.skillId]);
            if(state.meta.Description) skill.description = state.meta.Description;
            skill.effects.push({"code":21,"dataId":state.id,"value1":1,"value2":0});
            for(var j = 0; j < states.length; j++){
                if(state.id == states[j]) continue;
                skill.effects.push({"code":22,"dataId":states[j],"value1":1,"value2":0});
            }
            skill.iconIndex = state.iconIndex;
            skill.name = state.name;
            skills[i] = skill;
        }
        return skills;
    }
   
    Window_BattleSigil.prototype.item = function() {
        if(this._data && this.index() >= 0){
            var item  = this._data[this.index()];
            this._actor._sigilSkill = item;
            return item;
        } else {
            return null;
        }      
        return this._data && this.index() >= 0 ? this._data[this.index()] : null;
    };
   
    //-----------------------------------------------------------------------------
    // Scene_Battle
    //
    // Changes to Scene_Battle
   
    MRP.SigilStates.Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
    Scene_Battle.prototype.createAllWindows = function() {
        MRP.SigilStates.Scene_Battle_createAllWindows.call(this);
        this.createsigilWindow();
    };
   
    Scene_Battle.prototype.createsigilWindow = function() {
        var wy = this._helpWindow.y + this._helpWindow.height;
        var wh = this._statusWindow.y - wy;
        this._sigilWindow = new Window_BattleSigil(0, wy, Graphics.boxWidth, wh);
        this._sigilWindow.setHelpWindow(this._helpWindow);
        this._sigilWindow.setHandler('ok',     this.onSigilOk.bind(this));
        this._sigilWindow.setHandler('cancel', this.onSigilCancel.bind(this));
        this.addWindow(this._sigilWindow);
    };
   
    MRP.SigilStates.Scene_Battle_createActorCommandWindow = Scene_Battle.prototype.createActorCommandWindow;
    Scene_Battle.prototype.createActorCommandWindow = function() {
        MRP.SigilStates.Scene_Battle_createActorCommandWindow.call(this);
        this._actorCommandWindow.setHandler('sigil',   this.commandSigil.bind(this));
    };
   
    Scene_Battle.prototype.commandSigil = function() {
        this._sigilWindow.setActor(BattleManager.actor());
        this._sigilWindow.refresh();
        this._sigilWindow.show();
        this._sigilWindow.activate();
    }
   
    MRP.SigilStates.Scene_Battle_isAnyInputWindowActive = Scene_Battle.prototype.isAnyInputWindowActive;
    Scene_Battle.prototype.isAnyInputWindowActive = function() {
        return MRP.SigilStates.Scene_Battle_isAnyInputWindowActive.call(this) || this._sigilWindow.active;
    };
   
    Scene_Battle.prototype.onSigilOk = function() {
        var skill = this._sigilWindow.item();
        var action = BattleManager.inputtingAction();
        action.setSkill(skill.id);
        BattleManager.actor().setLastBattleSkill(skill);
		if(!MRP.SigilStates.changeTurnSigil){
			BattleManager.actor()._actions.push(new Game_Action(BattleManager.actor()));
			BattleManager.actor()._sigilExtraTurn = BattleManager.actor()._actionInputIndex;
		}
        this.onSelectAction();
    };

    Scene_Battle.prototype.onSigilCancel = function() {
        this._sigilWindow.hide();
        this._actorCommandWindow.activate();
    };
   
    MRP.SigilStates.Scene_Battle_onActorOk = Scene_Battle.prototype.onActorOk;
    Scene_Battle.prototype.onActorOk = function() {
        MRP.SigilStates.Scene_Battle_onActorOk.call(this);
        this._sigilWindow.hide();
    };
   
    MRP.SigilStates.Scene_Battle_onActorCancel = Scene_Battle.prototype.onActorCancel;
    Scene_Battle.prototype.onActorCancel = function() {      
        MRP.SigilStates.Scene_Battle_onActorCancel.call(this);
        if(this._actorCommandWindow.currentSymbol() == 'sigil'){
            this._sigilWindow.show();
            this._sigilWindow.activate();
        }
    };
    MRP.SigilStates.Scene_Battle_onSelectAction = Scene_Battle.prototype.onSelectAction;
    Scene_Battle.prototype.onSelectAction = function() {
        this._sigilWindow.hide();
        MRP.SigilStates.Scene_Battle_onSelectAction.call(this);
    };
   
    Scene_Battle.prototype.changeInputWindow = function() {
        if (BattleManager.isInputting()) {
            if (BattleManager.actor()) {
                this.startActorCommandSelection();
            } else {
                this.startPartyCommandSelection();
            }
        } else {
            this.endCommandSelection();
        }
    };
   
   
    //-----------------------------------------------------------------------------
    // Window_ActorCommand
    //
    // Changes to Window_ActorCommand
    Window_ActorCommand.prototype.makeCommandList = function() {
        if (this._actor) {
            this.addAttackCommand();
            this.addSkillCommands();
            this.addCommand(MRP.SigilStates.sigilCommandText, 'sigil', this._actor.canSigilSwitch()); // Maybe do some fancy stuff
            this.addGuardCommand();
            this.addItemCommand();
        }
    };
   
    //-----------------------------------------------------------------------------
    // Game_Action
    //
    // Changes to Game_Action
   
    MRP.SigilStates.Game_Action_item = Game_Action.prototype.item;
    Game_Action.prototype.item = function() {
        if(this._item.isSkill() && this._item._itemId == MRP.SigilStates.skillId){
            return this.subject()._sigilSkill;
        } else {
            return MRP.SigilStates.Game_Action_item.call(this);
        }
    };
	
	//-----------------------------------------------------------------------------
    // Game_Actor
    //
    // Changes to Game_Actor
	
	MRP.SigilStates.Game_Actor_selectPreviousCommand = Game_Actor.prototype.selectPreviousCommand;
	Game_Actor.prototype.selectPreviousCommand = function() {
		var b = MRP.SigilStates.Game_Actor_selectPreviousCommand.call(this);
		if(this._sigilExtraTurn == this._actionInputIndex) {
			this._actions.pop();
			this._sigilExtraTurn = -1;
		}
		return b;
		
	};
   
    //-----------------------------------------------------------------------------
    // Game_Battler
    //
    // Changes to Game_Battler
   
    MRP.SigilStates.Game_Battler_initMembers = Game_Battler.prototype.initMembers;
    Game_Battler.prototype.initMembers = function() {
        MRP.SigilStates.Game_Battler_initMembers.call(this);
        this._cooldownSigil = 0;
        this._sigilSkill = null;
		this._sigilExtraTurn = -1;
    };
    Game_Battler.prototype.canSigilSwitch = function() {
        return this._cooldownSigil < 1 && this._sigilExtraTurn == -1;
    };
   
    MRP.SigilStates.Game_Battler_onTurnEnd = Game_Battler.prototype.onTurnEnd;
    Game_Battler.prototype.onTurnEnd = function() {
        MRP.SigilStates.Game_Battler_onTurnEnd.call(this);
        this._cooldownSigil = this._cooldownSigil > 0 ? this._cooldownSigil - 1 : this._cooldownSigil;
    };
   
    MRP.SigilStates.Game_Battler_onBattleStart = Game_Battler.prototype.onBattleStart;
    Game_Battler.prototype.onBattleStart = function() {
        MRP.SigilStates.Game_Battler_onBattleStart.call(this);
        if(MRP.SigilStates.startingSigil && MRP.SigilStates.startingSigil != 0) {
            this.addState(MRP.SigilStates.startingSigil);
            this._cooldownSigil = 0;
			this._sigilExtraTurn = -1;
        }
    };
	
	//-----------------------------------------------------------------------------
    // BattleManager
    //
    // Changes to BattleManager
	
	MRP.SigilStates.BattleManager_updateTurnEnd = BattleManager.updateTurnEnd;
	BattleManager.updateTurnEnd = function() {
		console.log("updateTurnEnd");
		for(var i = 0; i < $gameParty.members().length; i++) {
			var actor = $gameParty.members()[i];
			actor._sigilExtraTurn = -1;
		}
		MRP.SigilStates.BattleManager_updateTurnEnd.call(this);
	};
       
})();