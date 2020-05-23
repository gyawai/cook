/*
 * �I���e�L�X�g�I�u�W�F�N�g
 *
 * Copyright (c) 2003 DRECOM CO.,LTD. All rights reserved.
 * 
 * info@drecom.co.jp
 * http://www.drecom.co.jp/
 */



// �I��͈͂̊J�n�_�ƏI���_�̏������t�]�������Ƃ������t���O
var reversalFlag = false;
/*
	�I��͈͂ɋt����ݒ肷�邱�Ƃ�IE/NN���ɂł��Ȃ��B�I���_���J�n�_�������ɐݒ肵�悤�Ƃ����ꍇ�A
	�J�n�_�������Ă��܂��A�I���_�Ɠ����ʒu�ɗ��Ă��܂��B
	���̂��߁A�t�]�������Ƃ�I��͈͂Ɛi�ޕ����ASHIFT�L�[��������Ă��邩����擾���A���̏ꍇ�ɂ�
	���݂̃L�����b�g�̈ʒu���I���_�ł͂Ȃ��J�n�_����擾����悤�ɂ��Ă���B
*/


// �����I�ɑI�����������邱�Ƃ������t���O
var nonSelectedFlag = false;
/*
	NN���ƁAonkeydown�C�x���g�̃L�����Z�����s���Ȃ����߁A�L�����b�g���v���O�����œ������ꍇ�ɂ́A
	�����������L�����b�g�̐�����A���ۂɉ����ꂽ�L�[�ɂ���ē����Ă��܂��������炵���������������K�v������B
	���������̕��@���ƁA�J�n�_�ƏI���_�̏������t�]���邱�Ƃ��ł��Ȃ����߁A�I��͈͂��������邱�Ƃ��ł��Ȃ��B
	(�v���O������őI��͈͂��w�肵���ꍇ�A���ۂɉ����ꂽ�L�[�ɂ���ăL�����b�g�������̂͏I���_�̂��߂ł���j
	��L���R���AnonSelectedFlag��true�̏ꍇ�́A���ۂɉ����ꂽ�L�[�ɂ��͈͑I�����I��������Ƃɑ�����C�x���g���ŁA
	�I��͈͂��������鏈�����s���K�v������B
*/


// �E�[�͈̔͂�I�����邱�Ƃ������t���O
var selectingRightEdgeFlag = false;
/*
	nonSelectedFlag�Ɠ��l�ɁA�E�[��I�����邱�Ƃ��ł��Ȃ����߁B
*/


/**
 * �I���e�L�X�g�I�u�W�F�N�g
 * 
 */
function SelectedText(selected)
{
	this.srcElement = selected;
	
	// ���\�b�h�ďo�����Ƃ� null �`�F�b�N���ς킵���̂�
	// false �ŏ�����
	if (selected == null) {
		this.srcElement = false;
	} else {
		if (document.selection) {  // document.selection -- IE 
			this.selected = document.selection.createRange();
		} else {
			this.selected   = null;
			this.srcElement = selected;
		}
	}
}
/**
 * HTML �^�O�Ń^�O�ҏW�i�^�O�폜��ړ��j��L���ɂ��Ȃ��ꍇ��
 * �J�X�^���^�O�����������B
 */
SelectedText.prototype.findTag = function(aText, option, start)
{
	return OEMBlogGlobal.enableTagEditingOnHTML
				? Tag.findTag(aText, option, start)
				: Tag.findCustomTag(aText, option, start);
}

SelectedText.prototype.isSelected = function()
{
	var selected = false;
	
	if (this.selected != null) {	// IE	
		selected = (this.selected.text != '');
	} else if (defined(this.srcElement.selectionStart)) {	// NN 7
		selected = (this.srcElement.selectionStart != this.srcElement.selectionEnd);
	}
	return selected;
}

SelectedText.prototype.move = function(length, isEnd)
{
	var result = 0;
	
	if (this.selected != null) {	// IE
		var lenExp = (isEnd) ? (length > 0) : (length < 0);
		if (lenExp && this.getTextBetweenCaret(isEnd, isEnd).length == 0)
			return 0;
		
		result = this.selected[isEnd ? 'moveEnd' : 'moveStart']('character', length);
		this.selected.select();	
	} else if (defined(this.srcElement.selectionStart)) {
		var ex = this.srcElement[isEnd ? 'selectionEnd' : 'selectionStart'];
		
		if (isEnd) {
			this.srcElement.setSelectionRange(this.srcElement.selectionStart, this.srcElement.selectionEnd + length);					
			result = this.srcElement.selectionEnd - ex;
		} else {
			this.srcElement.setSelectionRange(this.srcElement.selectionStart + length, this.srcElement.selectionEnd);	
			result = this.srcElement.selectionStart - ex;
		}
	}
	return result;
}

SelectedText.prototype.moveStart = function(length)
{
	return this.move(length, false);
}
SelectedText.prototype.moveEnd = function(length)
{
	return this.move(length, true);
}


SelectedText.prototype.moveStartOnEnd = function()
{
	if (this.selected != null) {	// IE
		this.selected.collapse(false);
		this.selected.select();
	} else if (defined(this.srcElement.selectionStart)) {
		this.srcElement.selectionStart = this.srcElement.selectionEnd;
	}
}
SelectedText.prototype.moveEndOnStart = function()
{
	if (this.selected != null) {	// IE	
		this.selected.collapse();
		this.selected.select();
	} else if (defined(this.srcElement.selectionStart)) {
		this.srcElement.selectionEnd = this.srcElement.selectionStart;
	}
}

SelectedText.prototype.getTextBetweenCaret = function(after, isSelectionEnd)
{
	var result = '';
	
	if (this.selected != null) {	// IE	
		result = this.getTextBetweenCaret_IE(after, isSelectionEnd);
	} else if (defined(this.srcElement.selectionStart)) {
		var v = this.srcElement[isSelectionEnd ? 'selectionEnd' : 'selectionStart'];
		if (!after) {
			startPos = 0;
			endPos = v;
		} else {
			startPos = v;
			endPos = this.srcElement.value.length;
		}
		result = this.srcElement.value.substring(startPos, endPos);
	}
	return result;
}
SelectedText.prototype.getTextBetweenCaret_IE = function(after, isSelectionEnd)
{
	// TextRange.text�́A�Ō�ɉ��s������Ƃ�����폜���Ă��܂��B
	// ���̂��߁A�擪����L�����b�g�܂ł̕����񂪂ق����ꍇ�́A
	// �܂��L�����b�g����Ō�܂ł̕�������擾���A�G�������g�̕����񂩂炱�̕��������������̂�Ԃ�
	var rightArea = this._getRangeBetweenCaret_IE(true, isSelectionEnd);
	var parentValue = this.selected.parentElement().value;
	var rightText = rightArea.text;

	// �Ō���ɉ��s������ƁA���݂̃L�����b�g�̈ʒu�𕶎��񂩂�ł͎擾�ł��Ȃ��B
	// ���̂��߁A���ݍ��W�𗘗p���Ĉʒu���擾����B
			
	var lastCrLf = parentValue.search('(\\r\\n)+$');
	if (lastCrLf >= 0) {
		lastCrLf = parentValue.length - lastCrLf;
				
		// �����̍��W���擾���A���ݖ������牽�s�ڂ��𔻒f�B
		// �܂��A1�s�̍�����boundingHeight�𗘗p���ĎZ�o���s���ƁA
		// ���ۂ��������Ȓl�ɂȂ��Ă��܂��B���̂��߁A
		// �ŏ��̍s�ƍŌ�̍s��boundingTop�̍����o���A
		// ���s���i�e�L�X�g�G���A�Ɋ܂܂����s�̑����{1)�Ŋ��������̂𗘗p����B
			
		var bottomArea = document.body.createTextRange(); 
		bottomArea.moveToElementText(this.selected.parentElement());
		var topArea = bottomArea.duplicate();
		topArea.collapse(true);
		bottomArea.collapse(false);	
			
		var curRowFromBottom = (bottomArea.boundingTop - this.selected.boundingTop) * parentValue.match(new RegExp('\\r\\n', 'g')).length 
								/ (bottomArea.boundingTop - topArea.boundingTop);
		for (i = 0; i < curRowFromBottom && i < lastCrLf / 2; i++) {
			rightText += '\r\n'; 
		}
	}
	if (after) {
		return rightText;
	} else {
		if (parentValue != null) {
			return parentValue.substring(0, parentValue.length - rightText.length);
		}
	}
	return '';
}

SelectedText.prototype.deleteNeighborTextFromCaret = function(after, target, original, exceptLength)
{
	if (this.selected != null) {	// IE	
		this.deleteNeighborTextFromCaret_IE(after, target, original, exceptLength);
	} else if (defined(this.srcElement.selectionStart)) {
		this.deleteNeighborTextFromCaret_NN(after, target, original, exceptLength);
	}
}
SelectedText.prototype.deleteNeighborTextFromCaret_NN = function(after, target, original, exceptLength)
{
	with (this.srcElement) {
		var startPos = selectionStart;
		var endPos = selectionEnd;
		var nestCnt=0;
		var targetTags = '';
		var tags = null;
		var leftContext = '', rightContext = '';
		var reselectMode;
		var NO_RESELECT_RANGE = 0;
		var MOVE_RANGE = 1;
		var SHRINK_RANGE = -1;
		var i;

		rightSide = this.getTextBetweenCaret(true, false);
		leftSide = this.getTextBetweenCaret(false, false);
		if (after) {
			except = rightSide.substring(0, exceptLength);
			rightSide = rightSide.substring(exceptLength, rightSide.length);
	
			if ((tags = rightSide.match(new RegExp(target + '|' + original, 'g'))) == null)
				return;
	
			for (i = 0; i < tags.length; i++) {
				if (tags[i].charAt(1) != '/') {
					nestCnt++;
				} else {
					nestCnt--;	
					targetTags += tags[i] + ',';
				}	
				if (nestCnt < 0)
					break;
			}
	
			tags = targetTags.split(',');
			if (tags == null)
				return;
	
			var pos = 0;
			var ex_pos = 0;
			i = 0;
			while (true) {
				pos = rightSide.indexOf(tags[i], ex_pos);
	
				leftContext += rightSide.substring(ex_pos, pos);
				ex_pos = pos + tags.length;
				
				if (i >= tags.length - 2) {
					leftContext = rightSide.substring(0, pos);
					target = tags[i];
					break;
				}
										
				leftContext += tags[i];
					
				i++;
			}
			rightContext = rightSide.substring(pos + target.length, rightSide.length);
			value = leftSide + except + leftContext + rightContext;
			
			if (endPos < leftSide.length + exceptLength + leftContext.length)
				reselectMode = NO_RESELECT_RANGE;
			else if (startPos <= leftSide.length + exceptLength + leftContext.length)
				reselectMode = SHRINK_RANGE;
			else
				reselectMode = MOVE_RANGE;
	
	
		} else {
			except = leftSide.substring(leftSide.length - exceptLength, leftSide.length);
			leftSide = leftSide.substring(0, leftSide.length - exceptLength);
			if ((tags = leftSide.match(new RegExp(target + '|' + original, 'g'))) == null)
				return;
	
			for (i = tags.length-1; i >= 0; i--) {
				if (tags[i].charAt(1) == '/') {
					nestCnt++;
				} else {
					nestCnt--;
					targetTags += tags[i] + ',';
				}
				if (nestCnt < 0)
					break;
			}
	
			tags = targetTags.split(',');
			if (tags == null) return;

			var pos = leftSide.length;
			var ex_pos = pos;
			i = 0;
			while (true) {
				pos = leftSide.lastIndexOf(tags[i], ex_pos);
				ex_pos = pos - tags[i].length;
				
				if (i >= tags.length - 2) {
					rightContext = leftSide.substring(pos + tags[i].length, leftSide.length);
					target = tags[i];
					break;
				}
					
				i++;
			}
			leftContext = leftSide.substring(0, pos);

			value = leftContext + rightContext + except + rightSide;

			reselectMode = MOVE_RANGE;
		}

		switch (reselectMode) {
		case SHRINK_RANGE:
			setSelectionRange(startPos, endPos - target.length);
			break;
		case MOVE_RANGE:
			setSelectionRange(startPos - target.length, endPos - target.length);
			break;
		default:
			setSelectionRange(startPos, endPos);
			break;
		}
	}
}

SelectedText.prototype.deleteNeighborTextFromCaret_IE = function(after, target, original, exceptLength)
{
	var nestCnt=0;
	var targetTags = '';
			
	var targetRange = this._getRangeBetweenCaret_IE(after, false);

	if (after)
		targetRange.moveStart('character', exceptLength);
	else
		targetRange.moveEnd('character', -exceptLength);
				

	var originalRange = targetRange.duplicate();
			
	var tags = null;

	if ((tags = targetRange.text.match(new RegExp(target + '|' + original, 'g'))) == null)
		return;
	if (after) { 
		for (i = 0; i < tags.length; i++) {
			if (tags[i].charAt(1) != '/') {
				nestCnt++;
			} else {
				nestCnt--;	
				targetTags += tags[i] + ',';
			}	
			if (nestCnt < 0)
				break;
		}
	} else {
		for (i = tags.length-1; i >= 0; i--) {
			if (tags[i].charAt(1) == '/') {
				nestCnt++;
			} else {
				nestCnt--;
				targetTags += tags[i] + ',';
			}
			if (nestCnt < 0)
				break;
		}
	}

	i = 0;
	tags = targetTags.split(',');
	if ((tags = targetTags.split(',')) == null)
		return;
	while (true)
	{
		if (tags[i] != '') {
			
			if (!targetRange.findText(tags[i], (after) ? 9999999 : -9999999)) 
				return;
						
			if (i >= tags.length - 2) {
				targetRange.text = '';
				break;
			}
						
			if (after) {
				targetRange.setEndPoint('EndToEnd', originalRange);
				targetRange.moveStart('character', tags[i].length);
			} else {
				targetRange.setEndPoint('StartToStart', originalRange);
				targetRange.moveEnd('character', -tags[i].length);
			}					
		}
		i++;
	}
}
SelectedText.prototype._getRangeBetweenCaret_IE = function(after, isSelectionEnd)
{			
	if (this.selected != null) {	// IE	
		targetRange = document.body.createTextRange();
		targetRange.moveToElementText(this.selected.parentElement());
	
		selectedRange = this.selected.duplicate();
		if (!isSelectionEnd)
			selectedRange.collapse();
	
		targetRange.setEndPoint(after ? 'StartToEnd' : 'EndToEnd', selectedRange);
				
		return targetRange;
	}
	return false;
}

SelectedText.prototype.insertTextOnBothSides = function(front, back)
{
	if (this.selected != null) {
		var text_length = this.selected.text.length;
		
		this.selected.text = front + this.selected.text + back;
		this.selected.move('character', - (text_length+back.length) );
		this.selected.moveEnd('character', text_length);
		this.selected.select();
		this.focus();
		
	} else if (defined(this.srcElement.selectionStart)) {
		var sstart = this.srcElement.selectionStart;
		var send   = this.srcElement.selectionEnd;
		var t      = this.srcElement.value;

		t = t.substring(0, sstart) +  front + this.getText() + back +  t.substr(send, t.length);
		this.srcElement.value = t;
		this.srcElement.setSelectionRange(sstart + front.length, send + front.length);
		this.focus();
	} else if (this.srcElement.value != null){
		this.srcElement.value += front + back;
		this.focus();
	}
}
SelectedText.prototype.insertText = function(aText)
{
	if (this.selected) {
		this.selected.text = aText + this.selected.text;
		this.selected.select();
	} else if (defined(this.srcElement.selectionStart)) {
		with (this.srcElement) {
			selectPos = value.substring(0, selectionStart).length +  aText.length;
			value = value.substring(0, selectionStart) +  aText + this.getText() + value.substr(selectionEnd, textLength);
			setSelectionRange(selectPos, selectPos);
			this.focus();
		}
	} else if (this.srcElement.value != null){
		this.srcElement.value += aText;
		this.focus();
	}
}

SelectedText.prototype.focus = function()
{
	if (this.srcElement != null && this.srcElement.focus != null) {
		this.srcElement.focus();
	}
}
SelectedText.prototype.getText = function()
{
	var t = '';
	
	if (this.selected) {
		t = this.selected.text;
	} else if (defined(this.srcElement.selectionStart)) {
		with (this.srcElement) {
			t = value.substring(selectionStart, selectionEnd);
		}
	} 
	return t;
}



/**
 * 
 * �폜���悤�Ƃ��Ă���^�O�̂�������̃^�O���폜����
 *	
 * @param tag	�^�O
 * @param isDeleteKey 	
 *   DELETE�L�[�������ꂽ�ꍇ��true
 *   BackSpace�L�[�������ꂽ�ꍇ��false
 * @param isSelected   �I������Ă��邩
 * @param exceptLength �I�����ꂽ��Ԃ̏ꍇ�ɁA���O�������I��͈͂̍��[����̈ʒu
 */
SelectedText.prototype.deleteOtherTag = function(tag, isDeleteKey, isSelected, exceptLength)
{
	var tagText = tag.getSource();
	var originalTag = '';
	var targetTag   = '';
	var isEndTag;
	
	if (tagText.match('^</([^>]*)>$') != null) {
		// �폜�Ώۂ��J�n�^�O�̏ꍇ
		originalTag = '</' + RegExp.$1 + '>';
		targetTag = tagText.replace(new RegExp('^</([^>]*)>$'), '<$1:[^>]*>|<$1>');
		isEndTag = false;
		if (isSelected)
			exceptLength = 0;
		else if (!isDeleteKey)
			exceptLength += tagText.length;
		
	} else if (tagText.match('^<([^:>]*)>$|^<([^>:]*):[^>]*>$') != null) {
		// �폜�Ώۂ��I���^�O�̏ꍇ
		originalTag = RegExp.$1 != '' ? tagText : '<' + RegExp.$2 + ':[^>]*>';
		targetTag = tagText.replace(new RegExp('^<([^:>]*)>$'), '</$1>');
		targetTag = targetTag.replace(new RegExp('^<([^>:]*):[^>]*>$'), '</$1>');
		isEndTag = true;
		if (isSelected)
			exceptLength += tagText.length;
		else if (isDeleteKey)
			exceptLength += tagText.length;
			
	} else {
		return;
	}
	
	this.deleteNeighborTextFromCaret(isEndTag, targetTag, originalTag, exceptLength);

}

/**
 * �^�O�̏�ɃL�����b�g�����Ȃ��悤�ɂ���
 *	after:	�E���ɃL�����b�g���ړ����Ă��邩�ǂ���
 *  shiftKey:
 *	 		SHIFT�L�[��������Ă��邩�ǂ���
 * @return �������ɂ� true
 */
SelectedText.prototype.moveCaretOutOfTag = function(isMoveRight, shiftKey)
{
	var text = ''; ;
	
	if (this.isNull()) {
		return false;
	} 
	if (!isMoveRight && shiftKey && !this.isSelected())
		reversalFlag = true;
	else if (!shiftKey || (isMoveRight && !this.isSelected()))
		reversalFlag = false;
	
	if (this.isSelected() && !shiftKey) {
		return false;
	}
		
	
	if (this.isSelected() && ((isMoveRight && reversalFlag) || (!isMoveRight && !reversalFlag))) {
		text = this.getText();
	} else {
		text = this.getTextBetweenCaret(isMoveRight, !reversalFlag);
	}
	
	var searchOption = 0;
	var tag = null;
	var tagText = '';
	var result = false;

	searchOption |= Tag.AnchoredSearch;
	if (!isMoveRight) {
		searchOption |= Tag.BackwardSearch;
	}
	
	tag = this.findTag(text, searchOption);
	tagText = tag != null ? tag.getSource() : '';

	// ���ۂɈړ������������A1���Ȃ��i���邢��1����)�����w�肷��B
	// ���R�́AreversalFlag�̐錾���ɋL�q
	if (isMoveRight) {
		if (!reversalFlag) {
			if (tagText != '') {			
				this.moveEnd(tagText.length - 1);
				if (!shiftKey) 
					this.moveStartOnEnd();
			}
		} else {
			this.moveStart(tagText.length != 0 ? tagText.length : 1);
			if (!this.isSelected()) {

				if (this.getTextBetweenCaret(true, true).length != 0)
					nonSelectedFlag = true;

				reversalFlag = false;

				result = true;
			} else {
				this.moveEnd(-1);
			}
		}			

	} else {
		if (!reversalFlag) {
			
			if (tagText != '') {
				var expectedLength = (tagText.length * -1) +1;
				var movedLength    = 0;
				
				movedLength = this.moveEnd(expectedLength)
				if (!shiftKey) {
					this.moveEndOnStart();
				}
			}
		} else {
			var moveLength;
			
			if (this.moveEnd(1) != 1) {
				selectingRightEdgeFlag = true;
				result = true;
			}
			moveLength = tagText.length != 0 ? (tagText.length *-1) : -1;
			this.moveStart(moveLength);
		}
	}
	return result;
}
//alert(1)
/**
 * 
 * �폜���悤�Ƃ��Ă���^�O�ɑΉ�����A��������̃^�O���폜����
 * ���̂��Ƃō폜���悤�Ƃ��Ă���^�O��I����Ԃɂ���
 * �폜���悤�Ƃ��Ă���^�O�̍폜�́A���ۂɉ����ꂽ�L�[(DEL/BS)���s��
 * 
 * @param isDeleteKey true:DELETE false:BackSpace
 */
SelectedText.prototype.deleteTagOnCaret = function(isDeleteKey)
{
	var selectedText = this.getText();
	var tag          = null;
	
	if (this.isNull())
		return;
	
	if (selectedText == null || selectedText == '') {
		selectedText = this.getTextBetweenCaret(isDeleteKey, false);
		
		var searchOption = isDeleteKey ? 0 : Tag.BackwardSearch;

		searchOption |= Tag.AnchoredSearch;
		tag = this.findTag(selectedText, searchOption);
		if (tag != null) {
			var moveLength = 0;
			
			this.deleteOtherTag(tag, isDeleteKey, false, 0);
			
			moveLength = tag.getSource().length * (isDeleteKey ? 1 : -1);
			this[isDeleteKey ? "moveEnd" : "moveStart"](moveLength);
		}
	} else {
		var exceptLength = 0;
		
		while (1) {
			tag = this.findTag(selectedText, 0);
			if (null == tag)
				break;
			
			var tagText = tag.getSource();
			this.deleteOtherTag(tag, isDeleteKey, true, exceptLength);
			
			selectedText = this.getText();
			exceptLength = selectedText.indexOf(tagText, exceptLength) + tagText.length;
			
			selectedText = selectedText.substring(exceptLength, selectedText.length);
			
		}
	} 
}


SelectedText.prototype.isNull = function()
{
	return (this.srcElement == null || this.srcElement.value == null || this.srcElement.focus == null);
}
