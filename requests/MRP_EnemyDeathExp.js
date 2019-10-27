//=============================================================================
// Enemy Death Exp
// MRP_EnemyDeathExp.js
// By Magnus0808 || Magnus Rubin Peterson
//=============================================================================

/*:
 * @plugindesc Individually Experiance on Enemy Deaths
 * @author Magnus0808
 *
 * @help This plugin changes the way exp is calculated.
 * It also displays the exp gain above the actors head. The code for this is 
 * inspired by HimeWorks' Battle Action Exp -> Battle Exp Popup
 *
 * This plugin is intended to be used with a enemy level plugin such as Yanfly's
 * Enemy Levels. However, this is not necesarry. In case you use Yanfly's Enemy
 * Levels, then this plugin will overwrite the exp formular! 
 *
 * You can specify the exp formular using the meta tag: <expFormular:FORMULAR>
 *      E.g. <expFormular: value = 10 * actor.level - this.level>
 * Or if you have longer more complex exp formulars you can use the note tag
 * <expFormular> FORMULAR </expFormular>
 *      E.g. <expFormular> 
                value = 10 * actor.level - this.level
			 </expFormular>
 * value is the exp given.
 *
 * If you do not have an enemy level plugin then you can specify the enemy level
 * using the meta tag: <level:ENEMY_LEVEL>
 *      E.g <level:10>
 *
 * @param Default Exp Formular
 * @type note
 * @default "this.enemy().exp"
 *
 * @param Distribute Exp
 * @type boolean
 * @desc If true then the exp will be distributed between the party instead of everyone getting it.
 * @default true
 *
 * @param Show Item Icon
 * @type boolean
 * @desc If true then the item pop up will show the item icon
 * @default false
 *
 * @param Clean Up
 * @type boolean
 * @desc Clean up after passing notetags. (Deleting the note tag from the note etc.) Helps reduce memory usage.
 * @default true
 *
 * @param Pop Ups
 *
 * @param Exp Gain
 * @parent Pop Ups
 * @type boolean
 * @desc If true then a pop up showing exp gain will be shown.
 * @default true
 *
 * @param Level Up
 * @parent Pop Ups
 * @type boolean
 * @desc If true then a pop up showing level up will be shown.
 * @default true
 *
 * @param Item Gain
 * @parent Pop Ups
 * @type boolean
 * @desc If true then a pop up showing item gain will be shown.
 * @default true
 *
 * @param Gold Gain
 * @parent Pop Ups
 * @type boolean
 * @desc If true then a pop up showing gold gain will be shown.
 * @default true
 *
 * @param Colors
 *
 * @param Exp Gain Color
 * @parent Colors
 * @type string
 * @desc Color Code for Exp Gain
 * @default "rgb(0, 255, 0)"
 *
 * @param Level Up Color
 * @parent Colors
 * @type string
 * @desc Color Code for Level Up
 * @default "rgb(255, 0, 255)"
 *
 * @param Item Gain Color
 * @parent Colors
 * @type string
 * @desc Color Code for Item Gain
 * @default "rgb(65,105,225)"
 *
 * @param Gold Gain Color
 * @parent Colors
 * @type string
 * @desc Color Code for Gold Gain
 * @default "rgb(255,215,0)"
 */

 var Imported = Imported || {};
 Imported.MRP_EnemyDeathExp = true;
 
 var MRP = MRP || {};
 MRP.EnemyDeathExp = MRP.EnemyDeathExp || {};
 
(function() {
	
	MRP.EnemyDeathExp.parameters = PluginManager.parameters('MRP_EnemyDeathExp');;
	MRP.EnemyDeathExp.defaultExpFormular = JSON.parse(String(MRP.EnemyDeathExp.parameters['Default Exp Formular']));
	MRP.EnemyDeathExp.distributeExp = (String(MRP.EnemyDeathExp.parameters['Distribute Exp']) == "true");
	MRP.EnemyDeathExp.showItemIcon = (String(MRP.EnemyDeathExp.parameters['Show Item Icon']) == "true");
	MRP.EnemyDeathExp.cleanUp = (String(MRP.EnemyDeathExp.parameters['Clean Up']) == "true");
	
	MRP.EnemyDeathExp.expGainPopUp = (String(MRP.EnemyDeathExp.parameters['Exp Gain']) == "true");
	MRP.EnemyDeathExp.lvlGainPopUp = (String(MRP.EnemyDeathExp.parameters['Level Up']) == "true");
	MRP.EnemyDeathExp.itemGainPopUp = (String(MRP.EnemyDeathExp.parameters['Item Gain']) == "true");
	MRP.EnemyDeathExp.goldGainPopUp = (String(MRP.EnemyDeathExp.parameters['Gold Gain']) == "true");
	
	MRP.EnemyDeathExp.expGainColor = eval(String(MRP.EnemyDeathExp.parameters['Exp Gain Color']));
	MRP.EnemyDeathExp.lvlGainColor = eval(String(MRP.EnemyDeathExp.parameters['Level Up Color']));
	MRP.EnemyDeathExp.itemGainColor = eval(String(MRP.EnemyDeathExp.parameters['Item Gain Color']));
	MRP.EnemyDeathExp.goldGainColor = eval(String(MRP.EnemyDeathExp.parameters['Gold Gain Color']));
	
	
	//-----------------------------------------------------------------------------
	// DataManager
	//
	// Changes to the DataManager
	
	MRP.EnemyDeathExp.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded
	DataManager.isDatabaseLoaded = function() {
		if (!MRP.EnemyDeathExp.DataManager_isDatabaseLoaded.call(this)) return false;
		if (!MRP.EnemyDeathExp._loaded) {
			DataManager.processMRP_EnemyDeathExp_Notetags($dataEnemies);
			MRP.EnemyDeathExp._loaded = true;
		}
		return true;
	};
	
	DataManager.processMRP_EnemyDeathExp_Notetags = function(group) {
		var regex = /<expFormular>(?<data>(.|\n)*?)<\/expFormular>/g;
		for (var n = 1; n < group.length; n++) {
			var obj = group[n];
			var result = regex.exec(obj.note);
			if (result) {
				obj.meta.expFormular = result.groups.data;
				if(MRP.EnemyDeathExp.cleanUp) {
					delete obj.meta["/expFormular"];
					obj.note = obj.note.replace(regex, "");
				}
			}
		}
	}
	
	
	//-----------------------------------------------------------------------------
	// BattleManager
	//
	// Changes to the BattleManager
	
	BattleManager.makeRewards = function() {
		// No longer used
	};
	
	BattleManager.gainExp = function(enemy) {
		if(!enemy) return 0;
		this._rewards.exp = this._rewards.exp || 0;
		$gameParty.allMembers().forEach(function(actor) {
			var exp = MRP.EnemyDeathExp.distributeExp ? Math.ceil(enemy.exp(actor) / $gameParty.aliveMembers().length) : enemy.exp(actor);
			BattleManager._rewards.exp += exp;
			actor.gainExp(exp);
		});
	};
	
	BattleManager.gainDropItems = function(enemy) {
		if(!enemy) return [];
		this._rewards.items = this._rewards.items || [];
		var items = enemy.makeDropItems();
		var actor = $gameActors.actor(BattleManager._action._subjectActorId);
		actor.result()._itemGains = items;
		items.forEach(function(item) {
			BattleManager._rewards.items.push(item);
			$gameParty.gainItem(item, 1);
		});
	};
	
	
	BattleManager.gainGold = function(enemy) {
		if(!enemy) return 0;
		this._rewards.gold = this._rewards.gold || 0;
		var gold = enemy.gold();
		this._rewards.gold += gold;
		var actor = $gameActors.actor(BattleManager._action._subjectActorId);
		actor.result()._goldGain = gold;
		$gameParty.gainGold(gold);
	};
	
	BattleManager.gainRewards = function(enemy) {
		if(!enemy) return;
		this.gainExp(enemy);
		this.gainGold(enemy);
		this.gainDropItems(enemy);
	};
	
	MRP.EnemyDeathExp.BattleManager_invokeAction = BattleManager.invokeAction;
	BattleManager.invokeAction = function(subject, target) {
		MRP.EnemyDeathExp.BattleManager_invokeAction.call(this, subject, target);
		$gameParty.battleMembers().forEach(function(actor){
			actor.result()._playGains = true;
		});
	};
	
	// Compatibility stuff
	if(Imported.YEP_VictoryAftermath) {
		MRP.EnemyDeathExp.BattleManager_startBattle = BattleManager.startBattle;
		BattleManager.startBattle = function() {
			MRP.EnemyDeathExp.BattleManager_startBattle.call(this);
			if(Imported.YEP_X_AftermathLevelUp) this.prepareVictoryPreLevel();
			$gameParty.allMembers().forEach(function(actor) {
				actor._preVictoryExp = actor.currentExp();
				actor._preVictoryLv = actor._level;
			}, this);
		};
		
		BattleManager.prepareVictoryInfo = function() {
			$gameParty.allMembers().forEach(function(actor) {
				ImageManager.loadFace(actor.faceName());
				actor._victoryPhase = true;
				actor._victorySkills = [];
			}, this);
			$gameParty.allMembers().forEach(function(actor) {
				actor._expGained = actor.currentExp() - actor._preVictoryExp;
				actor._postVictoryLv = actor._level;
			}, this);
			if(Imported.YEP_X_AftermathLevelUp) this.prepareVictoryPostLevel();
		};
	}
	
	//-----------------------------------------------------------------------------
	// Game_ActionResult
	//
	// Changes to Game_ActionResult
	
	MRP.EnemyDeathExp.Game_ActionResult_clear = Game_ActionResult.prototype.clear;
	Game_ActionResult.prototype.clear = function() {
		MRP.EnemyDeathExp.Game_ActionResult_clear.call(this);
		this._expGain = 0;
		this._goldGain = 0;
		this._itemGains = [];
		this._leveledUp = false;
		this._playGains = false;
		this._playedGains = false;
	};
	
	//-----------------------------------------------------------------------------
	// Game_Enemy
	//
	// Changes to Game_Enemy	
	
	Object.defineProperty(Game_Enemy.prototype, 'level', {
		get: function() {
			return this._level;
		},
		configurable: true
	});
	
	MRP.EnemyDeathExp.Game_Enemy_die = Game_Enemy.prototype.die;
	Game_Enemy.prototype.die = function() {
		MRP.EnemyDeathExp.Game_Enemy_die.call(this);
		BattleManager.gainRewards(this);
	};

	MRP.EnemyDeathExp.Game_Enemy_setup = Game_Enemy.prototype.setup;
	Game_Enemy.prototype.setup = function(enemyId, x, y) {
		MRP.EnemyDeathExp.Game_Enemy_setup.call(this, enemyId, x, y);
		this._level = this._level || eval(this.enemy().meta.level || 1);
	};
	
	Game_Enemy.prototype.exp = function(actor) {
		if(!actor) return 0;		
		var value = 0;
		var formular = this.enemy().meta.expFormular || MRP.EnemyDeathExp.defaultExpFormular;
		value = eval(formular)
		return value;
	};
	
	//-----------------------------------------------------------------------------
	// Game_Actor
	//
	// Changes to Game_Actor
	
	MRP.EnemyDeathExp.Game_Actor_changeExp = Game_Actor.prototype.changeExp;
	Game_Actor.prototype.changeExp = function(exp, show) {
		var gainedExp = exp - this.currentExp();
		this.result()._expGain = gainedExp;
		MRP.EnemyDeathExp.Game_Actor_changeExp.call(this, exp, show);
	};	
	
	MRP.EnemyDeathExp.Game_Actor_levelUp = Game_Actor.prototype.levelUp;
	Game_Actor.prototype.levelUp = function() {
		this.result()._leveledUp = true;
		MRP.EnemyDeathExp.Game_Actor_levelUp.call(this);
	};
	
	//-----------------------------------------------------------------------------
	// Game_Action
	//
	// Changes to Game_Action
	
	MRP.EnemyDeathExp.Game_Action_apply = Game_Action.prototype.apply;
	Game_Action.prototype.apply = function(target) {
		$gameParty.battleMembers().forEach(function(actor){
			actor.result().clear();
		});
		MRP.EnemyDeathExp.Game_Action_apply.call(this, target);
	};
	
	//-----------------------------------------------------------------------------
	// Sprite_Actor
	//
	// Changes to Sprite_Actor
	
	MRP.EnemyDeathExp.Sprite_Actor_initMembers = Sprite_Actor.prototype.initMembers;
	Sprite_Actor.prototype.initMembers = function() {
		MRP.EnemyDeathExp.Sprite_Actor_initMembers.call(this);
		this.gainSprites = [];
	};

	Sprite_Actor.prototype.createExpSprite = function(exp) {
		var expSprite = new Sprite_ExpGain(exp);
		this.addChild(expSprite);
		expSprite.setup(this._battler);
		return expSprite;
	};
	
	Sprite_Actor.prototype.createItemSprite = function(item) {
		var itemSprite = new Sprite_ItemGain(item);
		this.addChild(itemSprite);
		itemSprite.setup(this._battler);
		return itemSprite;
	};
	
	Sprite_Actor.prototype.createLvlUpSprite = function() {
		var lvlSprite = new Sprite_LevelGain();
		this.addChild(lvlSprite);
		lvlSprite.setup(this._battler);
		return lvlSprite;
	};
	
	Sprite_Actor.prototype.createGoldSprite = function(gold) {
		var goldSprite = new Sprite_GoldGain(gold);
		this.addChild(goldSprite);
		goldSprite.setup(this._battler);
		return goldSprite;
	};
	
	MRP.EnemyDeathExp.Sprite_Actor_update = Sprite_Actor.prototype.update;
	Sprite_Actor.prototype.update = function() {
		MRP.EnemyDeathExp.Sprite_Actor_update.call(this);
		if (this._actor && this._actor.isSpriteVisible()) {		
			if(this._actor.result()._playGains) {
				this._actor.result()._playGains = false;
				if(MRP.EnemyDeathExp.expGainPopUp) this.addExpSprite();
				if(MRP.EnemyDeathExp.itemGainPopUp) this.addItemSprite();			
				if(MRP.EnemyDeathExp.lvlGainPopUp) this.addLevelUpSprite();
				if(MRP.EnemyDeathExp.goldGainPopUp) this.addGoldSprite();
			}		
			this.updateGainSprites();
		}
	}
	
	Sprite_Actor.prototype.updateGainSprites = function() {
		if(this.gainSprites.length > 0) {
			if(this.gainSprites[0].isPlaying()) {
				this.gainSprites[0].update();
			} else {
				this.removeChild(this.gainSprites[0]);
				this.gainSprites.splice(0, 1);
				if(this.gainSprites.length > 0) this.gainSprites[0].play(this.damageOffsetX() - 20, this.damageOffsetY() - 120);
			}
		}
	}
	
	Sprite_Actor.prototype.addExpSprite = function() {
		if(this._actor.result()._expGain) {
			this.gainSprites.push(this.createExpSprite(this._actor.result()._expGain));
			if(this.gainSprites.length == 1) this.gainSprites[0].play(this.damageOffsetX() - 20, this.damageOffsetY() - 120);
		}
	}
	
	Sprite_Actor.prototype.addItemSprite = function() {
		if(this._actor.result()._itemGains.length > 0) {
			var items = this._actor.result()._itemGains;
			for(var i = 0; i < items.length; i++) {
				this.gainSprites.push(this.createItemSprite(items[i]));
				if(this.gainSprites.length == 1) this.gainSprites[0].play(this.damageOffsetX() - 20, this.damageOffsetY() - 120);
			}
		}
	}
	
	Sprite_Actor.prototype.addLevelUpSprite = function() {
		if(this._actor.result()._leveledUp){
			this.gainSprites.push(this.createLvlUpSprite());
			if(this.gainSprites.length == 1) this.gainSprites[0].play(this.damageOffsetX() - 20, this.damageOffsetY() - 120);
		}
	}
	
	Sprite_Actor.prototype.addGoldSprite = function() {
		if(this._actor.result()._goldGain > 0){
			this.gainSprites.push(this.createGoldSprite(this._actor.result()._goldGain));
			if(this.gainSprites.length == 1) this.gainSprites[0].play(this.damageOffsetX() - 20, this.damageOffsetY() - 120);
		}
	}
	
	
	//-----------------------------------------------------------------------------
	// Sprite_Gains
	//
	// The parent sprite for gains.
	
	function Sprite_Gain() {
		this.initialize.apply(this, arguments);
	}
	Sprite_Gain.prototype = Object.create(Sprite_Base.prototype);
	Sprite_Gain.prototype.constructor = Sprite_Gain;
	
	Sprite_Gain.prototype.initialize = function() {
		Sprite_Base.prototype.initialize.call(this);
		this._duration = 0;		
	};
	
	Sprite_Gain.prototype.setup = function(battler) {
		this._battler = battler;
		this.bitmap = new Bitmap(100, 200);
		this.bitmap.textColor = this.textColor();
		this.bitmap.fontSize = 20;
	};
	
	Sprite_Gain.prototype.textColor = function(){
		return "rgb(0, 0, 0)";
	}
	
	Sprite_Gain.prototype.play = function(x, y) {
		this.x = x;
		this.y = y;
		this._duration = 90;		
	}
	
	Sprite_Gain.prototype.update = function() {	
		if (this._duration > 30) {
		  this.y -= 0.5;
		}
		if (this._duration > 0) {
			this._duration -= 1
		}
	};
	
	
	Sprite_Gain.prototype.isPlaying = function() {
		return this._duration > 0;
	};
	
	//-----------------------------------------------------------------------------
	// Sprite_ExpGain
	//
	// The sprite that shows the exp gained.
	
	function Sprite_ExpGain() {
		this.initialize.apply(this, arguments);
	}
	
	Sprite_ExpGain.prototype = Object.create(Sprite_Gain.prototype);
	Sprite_ExpGain.prototype.constructor = Sprite_ExpGain;
	
	Sprite_ExpGain.prototype.initialize = function(exp) {
		Sprite_Gain.prototype.initialize.call(this);
		this.exp = exp || 0;
	};
	
	Sprite_ExpGain.prototype.textColor = function(){
		return MRP.EnemyDeathExp.expGainColor;
	}
	
	Sprite_ExpGain.prototype.play = function(x, y) {
		if(this._battler && this.exp > 0) {
			Sprite_Gain.prototype.play.call(this, x, y);
			this.bitmap.drawText(this.exp + TextManager.expA, 0, 0, 100, 200, 'center');
		}
	}
	
	//-----------------------------------------------------------------------------
	// Sprite_ItemGain
	//
	// The sprite that shows the item gained.
	
	function Sprite_ItemGain() {
		this.initialize.apply(this, arguments);
	}
	
	Sprite_ItemGain.prototype = Object.create(Sprite_Gain.prototype);
	Sprite_ItemGain.prototype.constructor = Sprite_ItemGain;
	
	Sprite_ItemGain.prototype.initialize = function(item) {
		Sprite_Gain.prototype.initialize.call(this);
		this.item = item || null;
	};
	
	Sprite_ItemGain.prototype.textColor = function(){
		return MRP.EnemyDeathExp.itemGainColor;
	}
	
	Sprite_ItemGain.prototype.play = function(x, y) {
		if(this._battler && this.item) {
			Sprite_Gain.prototype.play.call(this, x, y);
			this.drawItemName(this.item, 0, -y - 32, this.width);
		}
	}
	
	Sprite_ItemGain.prototype.drawItemName = function(item, x, y, width) {
		if (item) {
			if(MRP.EnemyDeathExp.showItemIcon){
				var iconBoxWidth = Window_Base._iconWidth + 4;
				this.drawIcon(item.iconIndex, x + 2, y + 2);
				this.drawText(item.name, x + iconBoxWidth, y, width - iconBoxWidth, 'center');
			} else {
				this.drawText(item.name, x, y, width, 'center');
			}
		}
	};
	
	Sprite_ItemGain.prototype.drawText = function(text, x, y, maxWidth, align) {
		this.bitmap.drawText(text, x, y, maxWidth, 32, align);
	};
	
	Sprite_ItemGain.prototype.drawIcon = function(iconIndex, x, y) {
		var bitmap = ImageManager.loadSystem('IconSet');
		var pw = Window_Base._iconWidth;
		var ph = Window_Base._iconHeight;
		var sx = iconIndex % 16 * pw;
		var sy = Math.floor(iconIndex / 16) * ph;
		this.bitmap.blt(bitmap, sx, sy, pw, ph, x, y);
	};
	
	//-----------------------------------------------------------------------------
	// Sprite_LevelGain
	//
	// The sprite that shows the level gained. (Level Up!)
	
	function Sprite_LevelGain() {
		this.initialize.apply(this, arguments);
	}
	
	Sprite_LevelGain.prototype = Object.create(Sprite_Gain.prototype);
	Sprite_LevelGain.prototype.constructor = Sprite_LevelGain;
	
	Sprite_LevelGain.prototype.initialize = function() {
		Sprite_Gain.prototype.initialize.call(this);
	};
	
	Sprite_LevelGain.prototype.textColor = function(){
		return MRP.EnemyDeathExp.lvlGainColor;
	}
	
	Sprite_LevelGain.prototype.play = function(x, y) {
		if(this._battler) {
			Sprite_Gain.prototype.play.call(this, x, y);
			this.bitmap.drawText(TextManager.levelA + " Up!", 0, 0, 100, 200, 'center');
		}
	}
	
	//-----------------------------------------------------------------------------
	// Sprite_GoldGain
	//
	// The sprite that shows the gold gained.
	
	function Sprite_GoldGain() {
		this.initialize.apply(this, arguments);
	}
	
	Sprite_GoldGain.prototype = Object.create(Sprite_Gain.prototype);
	Sprite_GoldGain.prototype.constructor = Sprite_GoldGain;
	
	Sprite_GoldGain.prototype.initialize = function(gold) {
		Sprite_Gain.prototype.initialize.call(this);
		this.gold = gold || 0;
	};
	
	Sprite_GoldGain.prototype.textColor = function(){
		return MRP.EnemyDeathExp.goldGainColor;
	}
	
	Sprite_GoldGain.prototype.play = function(x, y) {
		if(this._battler && this.gold > 0) {
			Sprite_Gain.prototype.play.call(this, x, y);
			this.bitmap.drawText(this.gold + TextManager.currencyUnit, 0, 0, 100, 200, 'center');
		}
	}
	
})();