//=============================================================================
// MultiLineChoices.js
//=============================================================================

/*:
 * @plugindesc This plugin lets the user add line breaks to choices. Making
 * him/her able to have multi-line choices.
 * has left on his/her turn.
 * @author Magnus0808
 *
 * @help Insert \n to add a new line break in a choice.
 */
(function() {
    
    Window_ChoiceList.prototype.update = function() {
        Window_Selectable.prototype.update.call(this);
    };
    
    Window_ChoiceList.prototype.processEscapeCharacter = function(code, textState) {
        switch (code) {
            case 'N':
                this.processNewLine(textState);
                break;
            case 'C':
                this.changeTextColor(this.textColor(this.obtainEscapeParam(textState)));
                break;
            case 'I':
                this.processDrawIcon(this.obtainEscapeParam(textState), textState);
                break;
            case '{':
                this.makeFontBigger();
                break;
            case '}':
                this.makeFontSmaller();
                break;
        }
    };
	
	Window_ChoiceList.prototype.topIndex = function () {
		var index = 0;
        var y = this.itemHeight() * this.calcLines(0);
		while(this._scrollY >= y) {
			var lines = this.calcLines(index);
			if(lines > 0) {
				y += this.itemHeight() * lines;
				index++;
			} else {
				break;
			}
		}
		return index;
	}
	
	Window_ChoiceList.prototype.lineStart = function (index) {
		return Math.floor(this.calcRectY(index) / this.itemHeight())
	}
	
	Window_ChoiceList.prototype.drawAllItems = function() {
		var topIndex = this.topIndex();
		var index = topIndex;
		var totalLines = this.lineStart(index) - this.topRow();
		while(totalLines < this.maxPageItems()){
			var lines = this.calcLines(index);
			if(lines > 0) {
				if (index < this.maxItems()) { 
					this.drawItem(index);
				}
				totalLines += lines;
				index++;
			} else {
				break;
			}
		}

	};
    
    Window_ChoiceList.prototype.maxRows = function() {
        return this.calcTotalLines();
    };

    Window_ChoiceList.prototype.contentsHeight = function() {
        return this.height - this.standardPadding() * 2;
    };
    
    Window_ChoiceList.prototype.maxChoiceWidth = function() {
        var maxWidth = 96;
        var choices = $gameMessage.choices();
        for (var i = 0; i < choices.length; i++) {
            var lines = choices[i].split(/\\n/);
            for(var j = 0; j < lines.length; j++) {
                var choiceWidth = this.textWidthEx(lines[j]) + this.textPadding() * 2;
                if (maxWidth < choiceWidth) {
                    maxWidth = choiceWidth;
                }
            }
        }
        return maxWidth;
    };
	
	Window_ChoiceList.prototype.isCursorVisible = function() {
		var row = this.row();
		var upperRow = this.upperRow();
		return (row >= this.topRow() && row <= this.bottomRow()) || (upperRow >= this.topRow() && upperRow <= this.bottomRow());
	};
	
	Window_ChoiceList.prototype.ensureCursorVisible = function() {
		var row = this.row();
		var upperRow = this.upperRow();
		if (row < this.topRow()) {
			this.setTopRow(row);
		} else if (upperRow > this.bottomRow()) {
			this.setBottomRow(upperRow);
		}
	};
    
    Window_ChoiceList.prototype.row = function() {
        var row = 0;
        for (var i = 0; i < this.index(); i++){
            row += this.calcLines(i);
        }
        return row;
    };
	
	Window_ChoiceList.prototype.upperRow = function() {
		var row = this.row();
		return row + this.calcLines(this.index()) - 1;
	}
    
    Window_ChoiceList.prototype.numVisibleRows = function() {
        var messageY = this._messageWindow.y;
        var messageHeight = this._messageWindow.height;
        var centerY = Graphics.boxHeight / 2;
        var choices = $gameMessage.choices();
        var numLines = this.calcTotalLines();
        var maxLines = 8;
        if (messageY < centerY && messageY + messageHeight > centerY) {
            maxLines = 4;
        }
        if (numLines > maxLines) {
            numLines = maxLines;
        }
        return numLines;
    };
	
	Window_ChoiceList.prototype.calcTotalLines = function () {
		var numLines = 0;
		for (var i = 0; i < $gameMessage.choices().length; i++) {
			numLines += this.calcLines(i);
		}
		return numLines;
	}
	
	Window_ChoiceList.prototype.calcLines = function (index) {
		var choices = $gameMessage.choices();
		if(choices[index]) {
			return choices[index].split(/\\n/).length;			
		} else {
			return 0;
		}
	}

    Window_ChoiceList.prototype.calcRectY = function(index) {
        if($gameMessage.choices().length == 0) return 0;
        var y = 0;
        for (var i = 0; i < index; i++){
            y += this.itemHeight() * this.calcLines(i);
        }
        return y;
    }
	
    
    Window_ChoiceList.prototype.itemRect = function(index) {
        var rect = new Rectangle();
        var maxCols = this.maxCols();
        rect.width = this.itemWidth();
        if($gameMessage.choices().length != 0){
            rect.height = this.itemHeight() * this.calcLines(index);
        } else {
            rect.height = this.itemHeight();
        }
        rect.x = index % maxCols * (rect.width + this.spacing()) - this._scrollX;
        rect.y = this.calcRectY(index) - this._scrollY; 
        return rect;
    };
    

})();