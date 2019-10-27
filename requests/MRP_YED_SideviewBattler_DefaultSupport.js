//=============================================================================
// Default Support - YED_SideviewBattler Extension
// MRP_YED_SideviewBattler_DefaultSupport.js
// By Magnus0808 || Magnus Rubin Peterson
//=============================================================================

/*:
 * @plugindesc YED_SideviewBattler Extension: Adds support for default MV sheets.
 * @author Magnus0808
 *
 * @help Changes the <Sideview Battler Default> to indicate that the sheet is in
 * default MV format.
 *
 */

 var Imported = Imported || {};
 Imported.MRP_MRP_YED_SideviewBattler_DefaultSupport = true;
 
 var MRP = MRP || {};
 MRP.MRP_YED_SideviewBattler_DefaultSupport = MRP.MRP_YED_SideviewBattler_DefaultSupport ||{};
 
(function() {
	
	YED.SideviewBattler.Utils.isSideviewBattler = function() {
		return this._sideviewBattler.default || this._sideviewBattler.filename !== "";
	}
	
	Game_Battler.prototype.isDefault = function() {
        var sideviewBattler = this.getSideviewBattler();
		return sideviewBattler.default;
    };
	
	/*
	Game_Actor.prototype.isDefault = function() {
        var sideviewBattler = this.getSideviewBattler();
		return sideviewBattler.default;
    };
	*/
	
	MRP.Game_Actor_battlerName = Game_Actor.prototype.battlerName;
	Game_Actor.prototype.battlerName = function() {
        if (this.isSideviewBattler()) {
			if(this.isDefault() && this.getBattler().filename == "") return this.actor().battlerName;
            return this.getSideviewFilename();
        }

        return MRP.Game_Actor_battlerName.call(this);
    };
	
	Game_Enemy.prototype.svBattlerName = function() {
		if (this._svBattlerName) return this._svBattlerName;
		if(this.isDefault()) {
			this._svBattlerName = this.enemy().battlerName;
		} else {
			var array = this.enemy().sideviewBattler;
			this._svBattlerName = Yanfly.Util.getRandomElement(array);
		}
		console.log(this.enemy())
		return this._svBattlerName;
	};

	MRP.Game_Enemy_battlerName = Game_Enemy.prototype.battlerName;
	Game_Enemy.prototype.battlerName = function() {
        if (this.isSideviewBattler()) {
			if(this.isDefault() && this.getBattler().filename == "") return this.enemy().battlerName;
            return this.getSideviewFilename();
        }
        return MRP.Game_Enemy_battlerName.call(this);
    };	

	Sprite_Enemy.prototype.isDefault = function() {
        return this._enemy.isDefault();
    };
	
	Sprite_Enemy.prototype.updateFrame = function() {
        if (this._enemy.isSideviewBattler()) {
            if (Imported.YEP_X_AnimatedSVEnemies) {
                this.updateSideviewFrame();
                return;
            }

            this.updateSideviewFrame();
            return;
        }
        _Sprite_Enemy_updateFrame.call(this);
    };
	
	Sprite_Actor.prototype.isDefault = function() {
        return this._actor.isDefault();
    };
	
	MRP.YED_SideviewBattler_Utils_processNotetag = YED.SideviewBattler.Utils._processNotetag;
	YED.SideviewBattler.Utils._processNotetag = function(obj, notetag, helpers) {
		MRP.YED_SideviewBattler_Utils_processNotetag.call(this, obj, notetag, helpers);
		var sideviewBattler = obj._sideviewBattler;	
		
		if(sideviewBattler.default) {
			sideviewBattler.frames = 3;
			
			sideviewBattler.motions['walk'] = {name: "walk", Frames: 3, index: 0, loop: true};
			sideviewBattler.motions['wait'] = {name: "wait", Frames: 3, index: 1, loop: true};
			sideviewBattler.motions['chant'] = {name: "chant", Frames: 3, index: 2, loop: true};
			sideviewBattler.motions['guard'] = {name: "guard", Frames: 3, index: 3, loop: true};
			sideviewBattler.motions['damage'] = {name: "damage", Frames: 3, index: 4, loop: true};
			sideviewBattler.motions['evade'] = {name: "evade", Frames: 3, index: 5, loop: true};
			
			sideviewBattler.motions['thrust'] = {name: "thrust", Frames: 3, index: 6, loop: true};
			sideviewBattler.motions['swing'] = {name: "swing", Frames: 3, index: 7, loop: true};
			sideviewBattler.motions['missile'] = {name: "missile", Frames: 3, index: 8, loop: true};
			sideviewBattler.motions['skill'] = {name: "skill", Frames: 3, index: 9, loop: true};
			sideviewBattler.motions['spell'] = {name: "spell", Frames: 3, index: 10, loop: true};		
			sideviewBattler.motions['item'] = {name: "item", Frames: 3, index: 11, loop: true};
			
			sideviewBattler.motions['escape'] = {name: "escape", Frames: 3, index: 12, loop: true};
			sideviewBattler.motions['victory'] = {name: "victory", Frames: 3, index: 13, loop: true};
			sideviewBattler.motions['dying'] = {name: "dying", Frames: 3, index: 14, loop: true};
			sideviewBattler.motions['abnormal'] = {name: "abnormal", Frames: 3, index: 15, loop: true};
			sideviewBattler.motions['sleep'] = {name: "sleep", Frames: 3, index: 16, loop: true};
			sideviewBattler.motions['dead'] = {name: "dead",Frames: 3, index: 17, loop: true};
		}
	}
	
	Sprite_Actor.prototype.updateSideviewFrame = function() {
        var bitmap = this._mainSprite.bitmap,
            motion = this.getCurrentMotion(),
            frameSizes = this.frameSizes();

        Sprite_Battler.prototype.updateFrame.call(this);

        if (bitmap) {
            var motionIndex = motion.index;
            var pattern = this._pattern;
			if(this.isDefault()) {				
				var cw = bitmap.width / 9;
				var ch = bitmap.height / 6;
				var cx = pattern +  this.motionFrames() * Math.floor(motionIndex / (bitmap.height / ch));
				var cy = motionIndex % Math.floor(bitmap.height / ch);
			} else {
				var cw = frameSizes[0];
				var ch = frameSizes[1];
				var cx = pattern;
				var cy = motionIndex;
			}
            this._mainSprite.setFrame(cx * cw, cy * ch, cw, ch);
        }
    };
	
	Sprite_Enemy.prototype.updateSideviewFrame = function() {
        var bitmap = this._mainSprite.bitmap,
            motion = this.getCurrentMotion(),
            frameSizes = this.frameSizes();

        Sprite_Battler.prototype.updateFrame.call(this);
        if (bitmap.width <= 0) {
            return;
        }

        this._effectTarget = this._mainSprite;
        var motionIndex = motion.index;
        var pattern = this._pattern;
		if(this.isDefault()) {				
			var cw = bitmap.width / 9;
			var ch = bitmap.height / 6;
			var cx = pattern +  this.motionFrames() * Math.floor(motionIndex / (bitmap.height / ch));
			var cy = motionIndex % Math.floor(bitmap.height / ch);
		} else {
			var cw = frameSizes[0];
			var ch = frameSizes[1];
			var cx = pattern;
			var cy = motionIndex;
		} 
		
        var cdh = 0;
        if (this._effectType === 'bossCollapse') {
          cdh = ch - this._effectDuration;
        }

        // this.setFrame(cx * cw, cy * ch, cw, ch);
        this._mainSprite.setFrame(cx * cw, cy * ch, cw, ch - cdh);
        this.adjustMainBitmapSettings(bitmap);
        this.adjustSVShadowSettings();
    };
	

	
})();