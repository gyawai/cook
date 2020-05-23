/*
 * �^�O JavaScript
 *
 *
 * Copyright (c) 2003 DRECOM CO.,LTD. All rights reserved.
 * 
 * info@drecom.co.jp
 * http://www.drecom.co.jp/
 */


/**
 * String scanner
 * 
 * @param aString     ������
 * @param packNewline getc() �ŉ��s (CR, CRLF, LF) �����ׂ� LF �ɕϊ����邩
 */
function StringPointer(aString, packNewline)
{
	this.string = aString;
	this.location = 0;
	
	if (this.string == null) {
		this.string = '';
	}
	
	this.packNewline = packNewline;
}
StringPointer.prototype.getString = function() { return this.string; }
StringPointer.prototype.getLocation = function() { return this.location; }
StringPointer.prototype.setLocation = function(anIndex)
{
	if (anIndex > this.string.length) {
		throw ASSERT_EXCEPTION + 'attempt to set bounding over location.';
	}
	this.location = anIndex;
}
StringPointer.prototype.isAtEnd = function() { return this.string.length <= this.location; }

StringPointer.prototype._getc = function() 
{
	return this.isAtEnd() ? null : this.string.charCodeAt(this.location++);
}
StringPointer.prototype.getc = function() 
{
	var c = this._getc();
	
	if (c == null) {
		return null;
	}
	
	if (this.packNewline && c == XBSCType.CR) {
		var nextc = this._getc();
		
		if (nextc != XBSCType.LF && nextc != null) {
			this.pushback();
		}
		c = XBSCType.LF;
	}
	return c;
}
StringPointer.prototype.pushback = function()
{
	this.location--;
	if (this.location < 0) this.location = 0;
}

StringPointer.prototype.readSpaces = function()
{
	var ret = false;
	var c;
	
	while (c = this.getc()) {
		if (!XBSCType.isspace(c)) {
			this.pushback();
			break;
		}
		ret = true;
	}
	return ret;
}
StringPointer.prototype.readUpToString = function(/* String */ stopString)
{
	var i = this.string.indexOf(stopString, this.location);
	if (i == -1) {
		return false;
	}
	this.location = i + stopString.length;
	return true;
}
StringPointer.prototype.readChar = function(aCharacter)
{
	if (this.isAtEnd()) {
		return false;
	}
	var c = this.getc();
	
	if (c == aCharacter) {
		return true;
	} else {
		this.pushback();
		return false;
	}
	return false;
}
XBSUtil.indexOfCharacter = function(aString, c)
{
	var i;
	var len = aString.length;
	
	for (i = 0; i < len; i++) {
		if (c == aString.charCodeAt(i)) {
			return i;
		}
	}
	return -1;
}
StringPointer.prototype.scanUpToCharactersIn = function(/* String */ stopChars)
{	
	var fromIndex = this.getLocation();
	var toIndex   = fromIndex;
	
	if (stopChars == null) {
		stopChars = '';
	}
	while (c = this.getc()) {
		if (XBSUtil.indexOfCharacter(stopChars, c) != -1) {
			this.pushback();
			break;
		}
		toIndex++;
	}
	// end 
	if (toIndex == this.string.length) {
		this.location = fromIndex;
		return null;
	}
	
	if (fromIndex == toIndex) {
		return '';
	}
	
	return this.string.substring(fromIndex, toIndex);
}
// substring stuffs
StringPointer.prototype.substring = function(/* Integer */ fromIndex, toIndex)
{
	return this.string.substring(fromIndex, toIndex);
}
StringPointer.prototype.substringFrom = function(/* Integer */ fromIndex)
{
	return this.substring(fromIndex, this.location);
}

//---------------------------------------------------------------------------------
// Tag
//---------------------------------------------------------------------------------
/**
 * Tag:
 * �^�O�I�u�W�F�N�g�B<A hoge="foo"> �� </A> �͕ʁX�̃C���X�^���X�ɂȂ�B
 * �I�u�W�F�N�g���̂ɂ̓^�O�֘A�̋@�\���܂Ƃ߂Ă���
 * 
 * @param aTagName �^�O��
 * @param aSource �e�L�X�g
 * @param isEndTag ���^�O��
 * @author  Takanori Ishikawa
 * @version 1.0
 */
Tag = function(aTagName, aSource, isEndTag) 
{
	this.name = aTagName;
	this.source = aSource;
	this.value = '';
	this.isEnd = !(!isEndTag);
	this.isComment = false;
}
Tag.prototype.getName   = function() { return this.name; }
Tag.prototype.getSource = function() { return this.source; }
Tag.prototype.getValue  = function() { return this.value; }

// �^�O��`
TagDefs = new Object();
TagDefs['��'] 		= ['span', 'style="font-style: italic;"'];
TagDefs['��'] 		= ['span', 'style="font-weight: bold;"'];
TagDefs['��']   	= ['span', 'style="font-size: 125%;"'];
TagDefs['����']		= ['span', 'style="font-size: 150%;"'];
TagDefs['��']     	= ['span', 'style="font-size: 75%;"'];
TagDefs['����']   	= ['span', 'style="text-decoration: underline;"'];
TagDefs['�ŏ���'] 	= ['s', ''];
TagDefs['��']		= ['div', 'style="text-align: left;"'];
TagDefs['��']		= ['div', 'style="text-align: center;"'];
TagDefs['�E']		= ['div', 'style="text-align: right;"'];
TagDefs['�����N']		= ['a', 'href="', '" target="_blank"'];
TagDefs['�F']		= ['span', 'style="color: ', ';"'];

/**
 * �G����
 */
Tag.emojiTable = new Object();
Tag.emojiTable['01'] = '�X�}�C��';
Tag.emojiTable['02'] = '�O�Y��';
Tag.emojiTable['03'] = '�n�b�s�[';
Tag.emojiTable['04'] = '��';
Tag.emojiTable['05'] = '���u';
Tag.emojiTable['06'] = '�ӂ�����';
Tag.emojiTable['07'] = '�V���b�N';
Tag.emojiTable['135'] = '����';
Tag.emojiTable['08'] = '�v���X�J';
Tag.emojiTable['18'] = 'NO';
Tag.emojiTable['19'] = 'YES';
Tag.emojiTable['68'] = '�C����';
Tag.emojiTable['69'] = '���C���R�[�g';
Tag.emojiTable['70'] = '��񂲂����NG';
Tag.emojiTable['71'] = '��񂲂����';
Tag.emojiTable['72'] = '�n��';
Tag.emojiTable['09'] = '�n�[�g';
Tag.emojiTable['10'] = '�L���[�s�b�g';
Tag.emojiTable['11'] = '�n�[�g�u���C�N';
Tag.emojiTable['12'] = '�h�L�h�L';
Tag.emojiTable['13'] = '���u���u';
Tag.emojiTable['142'] = '�L�X';
Tag.emojiTable['21'] = '�{';
Tag.emojiTable['22'] = '��������';
Tag.emojiTable['23'] = '�͂Ă�';
Tag.emojiTable['24'] = '�т�����';
Tag.emojiTable['155'] = '���т�����';
Tag.emojiTable['162'] = '�Ȃ��';
Tag.emojiTable['25'] = '��';
Tag.emojiTable['67'] = '��';
Tag.emojiTable['26'] = '�X���[�v';
Tag.emojiTable['27'] = '�L����';
Tag.emojiTable['143'] = '�Ђ�߂�';
Tag.emojiTable['37'] = '���ߑ�';
Tag.emojiTable['33'] = '�j';
Tag.emojiTable['148'] = '�s�[�X';
Tag.emojiTable['122'] = '�O�b�h';
Tag.emojiTable['28'] = 'OK';
Tag.emojiTable['131'] = 'BOO';
Tag.emojiTable['132'] = '�o�C�o�C';
Tag.emojiTable['29'] = '�K�b�e��';
Tag.emojiTable['30'] = '�p�`�p�`';
Tag.emojiTable['38'] = '�_�b�V��';
Tag.emojiTable['36'] = '����';
Tag.emojiTable['85'] = '���e';
Tag.emojiTable['54'] = '��';
Tag.emojiTable['93'] = '�A�b�v';
Tag.emojiTable['95'] = '�_�E��';
Tag.emojiTable['94'] = '�T�C�h';
Tag.emojiTable['179'] = '���t�g';
Tag.emojiTable['166'] = '�Ԃ����';
Tag.emojiTable['45'] = '�˂���';
Tag.emojiTable['46'] = '�y���M��';
Tag.emojiTable['47'] = '�J�G��';
Tag.emojiTable['150'] = '�Ԃ�';
Tag.emojiTable['48'] = '����';
Tag.emojiTable['116'] = '�˂�';
Tag.emojiTable['117'] = '����';
Tag.emojiTable['147'] = '�ς�';
Tag.emojiTable['49'] = '�ɂ�Ƃ�';
Tag.emojiTable['50'] = '�Ђ悱';
Tag.emojiTable['139'] = '�A�q��';
Tag.emojiTable['51'] = '������';
Tag.emojiTable['160'] = '����';
Tag.emojiTable['159'] = '�Ђ�';
Tag.emojiTable['158'] = '�݂΂�';
Tag.emojiTable['76'] = '�Ă�Ƃ���';
Tag.emojiTable['115'] = '�Ƃ��';
Tag.emojiTable['133'] = '��';
Tag.emojiTable['88'] = '����';
Tag.emojiTable['112'] = '�}�O�J�b�v';
Tag.emojiTable['180'] = '�������\�[�_';
Tag.emojiTable['178'] = '���{��';
Tag.emojiTable['81'] = '�r�[��';
Tag.emojiTable['90'] = '�J�N�e��';
Tag.emojiTable['98'] = '���C��';
Tag.emojiTable['82'] = '�ٓ��r';
Tag.emojiTable['61'] = '������';
Tag.emojiTable['78'] = '���';
Tag.emojiTable['79'] = '��������';
Tag.emojiTable['92'] = '�o�i�i';
Tag.emojiTable['80'] = '�X�C�J';
Tag.emojiTable['62'] = '���ɂ���';
Tag.emojiTable['63'] = '���͂�';
Tag.emojiTable['119'] = '�J���[';
Tag.emojiTable['152'] = '�T���h�C�b�`';
Tag.emojiTable['123'] = '�n���o�[�K�[';
Tag.emojiTable['87'] = '�V���[�g�P�[�L';
Tag.emojiTable['65'] = '�P�[�L';
Tag.emojiTable['114'] = '�\�ܖ�';
Tag.emojiTable['86'] = '����';
Tag.emojiTable['99'] = '������';
Tag.emojiTable['177'] = '��';
Tag.emojiTable['42'] = '�H��';
Tag.emojiTable['107'] = '������';
Tag.emojiTable['127'] = '�`���[���b�v';
Tag.emojiTable['100'] = '�ӂ���';
Tag.emojiTable['55'] = '��';
Tag.emojiTable['136'] = '�n�C�r�X�J�X';
Tag.emojiTable['134'] = '���΂�';
Tag.emojiTable['106'] = '���݂�';
Tag.emojiTable['60'] = '�N���[�o�[';
Tag.emojiTable['146'] = '���̂�';
Tag.emojiTable['165'] = '�ԑ�';
Tag.emojiTable['14'] = '��';
Tag.emojiTable['15'] = '�J';
Tag.emojiTable['16'] = '��';
Tag.emojiTable['144'] = '��';
Tag.emojiTable['17'] = '��';
Tag.emojiTable['59'] = '��';
Tag.emojiTable['154'] = '���ꐯ';
Tag.emojiTable['77'] = '��';
Tag.emojiTable['109'] = '����';
Tag.emojiTable['168'] = '�Ă�Ă�V��';
Tag.emojiTable['66'] = '����';
Tag.emojiTable['151'] = '���{��';
Tag.emojiTable['145'] = '���g';
Tag.emojiTable['138'] = '�n�C�q�[��';
Tag.emojiTable['167'] = '�w��';
Tag.emojiTable['157'] = 'T�V���c';
Tag.emojiTable['141'] = '����';
Tag.emojiTable['156'] = '�e�B�A��';
Tag.emojiTable['39'] = '�w�Z';
Tag.emojiTable['40'] = '���';
Tag.emojiTable['140'] = '�a�@';
Tag.emojiTable['43'] = '��';
Tag.emojiTable['41'] = '��';
Tag.emojiTable['73'] = '�o�X';
Tag.emojiTable['83'] = '�d��';
Tag.emojiTable['91'] = '���]��';
Tag.emojiTable['128'] = '��s�@';
Tag.emojiTable['57'] = '�g��';
Tag.emojiTable['35'] = '���[��';
Tag.emojiTable['34'] = '�p�\�R��';
Tag.emojiTable['118'] = 'CD';
Tag.emojiTable['58'] = '����';
Tag.emojiTable['176'] = '�j��';
Tag.emojiTable['172'] = '���';
Tag.emojiTable['103'] = '�r���v';
Tag.emojiTable['74'] = '���v';
Tag.emojiTable['84'] = '�J����';
Tag.emojiTable['97'] = '�e���r';
Tag.emojiTable['104'] = '���d�b';
Tag.emojiTable['175'] = '�|���@';
Tag.emojiTable['102'] = '�|�X�g';
Tag.emojiTable['121'] = '�T�b�J�[�{�[��';
Tag.emojiTable['129'] = '�싅�{�[��';
Tag.emojiTable['89'] = '�R���g���[���[';
Tag.emojiTable['113'] = '�{';
Tag.emojiTable['101'] = '�}�C�N';
Tag.emojiTable['126'] = '�N���b�J�[';
Tag.emojiTable['111'] = '�v���[���g';
Tag.emojiTable['130'] = '�L�����h��';
Tag.emojiTable['96'] = '������';
Tag.emojiTable['125'] = '������';
Tag.emojiTable['75'] = '�ԉ�';
Tag.emojiTable['161'] = '���傤����';
Tag.emojiTable['44'] = '����';
Tag.emojiTable['137'] = '�n���E�B��';
Tag.emojiTable['108'] = '�c���[';
Tag.emojiTable['110'] = '�T���^�u�[�c';
Tag.emojiTable['164'] = '������';
Tag.emojiTable['169'] = '�叼';
Tag.emojiTable['170'] = '�x�m�R';
Tag.emojiTable['171'] = '�H��';
Tag.emojiTable['31'] = '���S��';
Tag.emojiTable['32'] = '�댯';
Tag.emojiTable['56'] = '��';
Tag.emojiTable['64'] = '���P�b�g';
Tag.emojiTable['52'] = '����';
Tag.emojiTable['53'] = '���΂�';
Tag.emojiTable['20'] = '�ǂ���';
Tag.emojiTable['105'] = '�M��';
Tag.emojiTable['124'] = '����';
Tag.emojiTable['120'] = '�T�C�R��';
Tag.emojiTable['149'] = '���M';
Tag.emojiTable['173'] = '�M';
Tag.emojiTable['153'] = '�͂���';
Tag.emojiTable['163'] = '�n��';
Tag.emojiTable['174'] = '�J�v�Z��';


Tag.EmojiNameTable = new Object();
for (key in Tag.emojiTable) {
	Tag.EmojiNameTable[Tag.emojiTable[key]] = key;
}

//�^�O�̎��
Tag.TYPE_CSS = 0;
Tag.TYPE_DEPRECATED_HTML = 1;
Tag.TYPE_JP = 2;
Tag.getDefaultType = function() { return Tag.TYPE_JP; }

// shortcut
gTagType = Tag.getDefaultType();

// �G������URL�p�X
Tag.VIEW_EMOJI_PATH = '/blog/image/emoji/';
Tag.MEMBERS_EMOJI_PATH = '/image/emoji/';





/**
 * ���s���^�O�ɕϊ�����Ƃ��̃e�L�X�g
 */
Tag.BR_TEXT  = '<br>' + OEMBlogGlobal.lineSeparator;
Tag.LT_TEXT  = '&lt;';
Tag.GT_TEXT  = '&gt;';
Tag.AMP_TEXT = '&amp;';

/**
 * �����I�v�V�������w�肷�邽�߂̒萔
 * 
 * <ul>
 * <li>BackwardSearch - �������</li>
 * <li>AnchoredSearch - ������̐擪�A�܂��͏I�[�݂̂ň�v</li>
 */
Tag.BackwardSearch = 1;
Tag.AnchoredSearch = 1 << 1;


Tag.findCustomTag = function(aText, option, start)
{
	var tag = Tag.findTag(aText, option, start);
	
	return (tag == null || tag.isCustomTag() == false) ? null : tag;
}

/**
 * text �̒�����^�O����������B
 * 
 * @param aText �@�����Ώۂ̕�����
 * @param option �����I�v�V�����萔�� OR ��������
 * @param start�@ �����J�n�ʒu�i�I�v�V�����j
 * @return �@�@�@�@�@Tag �I�u�W�F�N�g
 */
Tag.findTag = function(aText, option, start)
{
	var anchor  = null;    // AnchoredSearch �ݒ莞�̊J�n����
	var sp      = null;
	
	if (null == aText || 0 == aText.length) {
		return null;
	}
	sp = new StringPointer(aText);
	
	if (start == null) {
		start = (option & Tag.BackwardSearch) ? aText.length -1 : 0;
	}
	
	//
	// Anchor �I�v�V�����̏���
	// �����J�n�ʒu == �^�O�J�n�ʒu
	//
	if (option & Tag.AnchoredSearch) {
		var LR1 = (option & Tag.BackwardSearch) ? XBSCType.GT : XBSCType.LT;
		var LR2 = (option & Tag.BackwardSearch) ? XBSCType.RBRACE : XBSCType.LBRACE;
		c = aText.charCodeAt(start);
		
		switch (c) {
		case LR1:
			anchor = '<';
			break;
		case LR2:
			anchor = '{';
			break;
		default:
			return null;
			break;
		}
	}
	
	var idx    = -1;
	var fnName = (option & Tag.BackwardSearch) ? "lastIndexOf" : "indexOf";
	
	if (anchor != null) {
		// �O�������Ȃ� start ���g���邪�A
		// ��������̏ꍇ�A���߂Č�������K�v������B
		// �ʓ|�Ȃ̂łǂ���̏ꍇ�ł�����
		idx = aText[fnName](anchor, start);
		
		// �ȉ��̃P�[�X�ɑΉ�
		// <B>hogehoge>hoge
		if (idx != -1 && option & Tag.BackwardSearch) {
			if (idx < aText.lastIndexOf('>', start-1)) {
				return null;
			}
		}
	} else {
		idx = aText[fnName]('<', start);
		if (-1 == idx) {
			idx = aText[fnName]('{', start);
		}
	}
	if (-1 == idx) {
		return null;
	}
	
	// StringPointer �̈ʒu���^�O�̐擪�ʒu�ɂ���
	// scanTag() �ɈϏ�
	sp.setLocation(idx);
	return this.scanTag(sp);
}

Tag.TAG_NAME_STOP_CHARACTER = "/\"<{:";


/**
 * �󔒕������܂܂Ȃ��e�L�X�g���X�L����
 * 
 * @param aStrPtr     StringPointer
 * @param stopChars   ���̕�����Ɋ܂܂�镶���łƂ܂�
 * @param tagStopChar ���̕����łƂ܂�
 */
Tag.scanText = function(aStrPtr, stopChars, tagStopChar)
{
	var fromIndex = aStrPtr.getLocation();
	var toIndex   = fromIndex;
	
	if (stopChars == null) {
		stopChars = '';
	}
	while (c = aStrPtr.getc()) {
		if (c == tagStopChar || 
			XBSUtil.indexOfCharacter("\r\n\t ", c) != -1 ||
			XBSUtil.indexOfCharacter(stopChars, c) != -1 ) 
		{
			aStrPtr.pushback();
			break;
		}
		toIndex++;
	}
	// end 
	if (toIndex == aStrPtr.string.length) {
		aStrPtr.location = fromIndex;
		return null;
	}
	
	if (fromIndex == toIndex) {
		return '';
	}
	
	return aStrPtr.string.substring(fromIndex, toIndex);
}
Tag.scanParameter = function(aStrPtr, tagStopChar)
{
	var idx = aStrPtr.getLocation();

	// 2004-05-06  Takanori Ishikawa 
	// ------------------------------------------------------------------------
	// ':' �̎��͂ɋ󔒂������ꍇ�͂ӂ��� readSpaces() ��
	// �R�����g�A�E�g���O���Ă��������B
	
	// aStrPtr.readSpaces();
	if (false == aStrPtr.readChar(XBSCType.COLON)) {
		aStrPtr.setLocation(idx);
		return "";
	}
	// aStrPtr.readSpaces();
	return Tag.scanText(aStrPtr, "", tagStopChar);
}

/**
 * �^�O���X�L�����B
 * 
 * @param aStrPtr      �^�O�̐擪�ʒu���w�� StringPointer
 * @return Tag �I�u�W�F�N�g�A
 */
Tag.scanTag = function(aStrPtr)
{
	var sp = aStrPtr;
	var i, c;
	var tagName     = '';
	var isCustomTag = false;
	var tag         = null;
	var isEndTag    = false;
	var param       = null;
	
	if (null == sp || sp.isAtEnd()) {
		return null;
	}
	i = sp.getLocation();
	c = sp.getc();  // �擪����
	
	if (null == c) {
		return null;
	}
	
	//
	// <...> �^�O�̏ꍇ�A���^�O���l������B
	// �^�O���ƃ^�O�̊J�n��������J�X�^���^�O���ǂ����𔻕�
	//
	var tagStopChar = (c == XBSCType.LT) ? XBSCType.GT : XBSCType.RBRACE;
	
	isEndTag    = (c == XBSCType.LT) ? sp.readChar(XBSCType.SLASH) : false;
	tagName     = Tag.scanText(sp, Tag.TAG_NAME_STOP_CHARACTER, tagStopChar);
	isCustomTag = (TagDefs[tagName] != null || c == XBSCType.LBRACE);
	
	if (tagName == null || tagName.length == 0) {
		return null;
	}
	if (!isEndTag && isCustomTag) {
		param = Tag.scanParameter(sp, tagStopChar);
		if (param == null) param = '';
	}
	
	if (isCustomTag) {
		var ch = sp.getc();
		var stop = (c == XBSCType.LT) ? XBSCType.GT : XBSCType.RBRACE;
		
		if (ch != stop) {
			return null;
		}
	} else {
		var QT1 = '\''.charCodeAt(0);
		var QT2 = '"'.charCodeAt(0);
		
		var ch   = -1;
		var quot = -1;
	
		while (ch = sp.getc()) {
			if (ch == QT1 || ch == QT2) {
				if (quot == ch) {
					quot = -1;
				} else if (quot != -1) {
					;
				} else {
					quot = c;
				}
			} else if (c == XBSCType.LT && quot == -1) {
				// nested tag: invalid
				return null;
			}
			if (ch == XBSCType.GT) {
				break;
			}
		}
	}

	tag = sp.substringFrom(i);
	tag = new Tag(tagName, tag, isEndTag);
	tag.value = param;
	
	return tag;
}



Tag.prototype.charCodeAt = function(idx)
{
	var s = this.source;
	return (s == null || s.length <= idx) ? null : s.charCodeAt(idx);
}

/**
 * �g���^�O���ǂ���
 */
Tag.prototype.isCustomTag = function() 
{
	return (this.isCustomTag1() || this.isCustomTag2());
}
Tag.prototype.isCustomTag1 = function()
{
	return (this.charCodeAt(0) == XBSCType.LT && TagDefs[this.name] != null);
}
Tag.prototype.isCustomTag2 = function() 
{
	return (this.charCodeAt(0) == XBSCType.LBRACE);
}

/**
 * HTML �\���̕�����
 */
Tag.prototype.toHTMLString = function()
{
	return this.isCustomTag1() ? this.toHTMLString1() : this.toHTMLString2();
}
Tag.prototype.toHTMLString1 = function()
{
	if (this.isComment && (this.name == "��" || this.name == "����")) {
		var ret = "&lt;";
		
		if (this.isEnd) {
			ret += "/";
		}
		
		return ret + this.name + "&gt;";
	}
	
	var defs = TagDefs[this.name];
	if (defs == null || 0 == defs.length) {
		return this.source;
	}
	
	if (this.isEnd) {
		return '</' + defs[0] + '>';
	}
	
	if (defs.length == 2) {
		return '<' + defs[0] + ' ' + defs[1] + '>';
	} else if (defs.length == 3) {
		var v = this.value;
		if (v == '' || v == null) {
			return '';
		}
		// �O�̂��߃T�j�^�C�W���O
		v = v.replace(/</g, Tag.LT_TEXT);
		v = v.replace(/>/g, Tag.GT_TEXT);			
		return '<' + defs[0] + ' ' + defs[1] + v + defs[2] + '>';
	}

	return this.source;
}
Tag.prototype.toHTMLString2 = function()
{
	if (!this.isCustomTag2()) {
		return this.source;
	}
	
	var code = Tag.EmojiNameTable[this.name];
	var text = '';
	
	if (code != null) {	// �G����
		text = Tag.buildEmojiImageTag(code, this.isComment);
	} else {	// �摜
		text = this.buildUploadImageTag();
		if (null == text) {
			text = this.source;
		}
	}
	return text;
}

/**
 * �C���X�^���X�̐����I�ȕ�����
 */
Tag.prototype.toString = function()
{
	return '[Tag:'+this.name+'] ' + this.value + '\n' + this.source;
}



 
// �G�����^�O���
var EMOJI_HTML 		= 0;
var EMOJI_REF_JP	= 1;
var emoji_type = EMOJI_REF_JP;

// �A�b�v�摜�^�O���
var UPIMAGE_HTML 		= 0;
var UPIMAGE_REF			= 1;
var upimage_type = UPIMAGE_REF;



// ---------------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------------
/**
 * �G�����̃R�[�h �ie.g. '01', '64'�j ���疼�O�𓾂�B
 * 
 * @param aCode �R�[�h������
 */
function getEmojiNameFromCode(aCode)
{
	var code = '';
	var name = '';
	
	if (aCode != null) {
		// �󕶎��ɘA�����邱�ƂŖ�����蕶����ɕϊ�����
		code += aCode;
	}
	name = Tag.emojiTable[aCode];
	if (name == null) {
		name = '';
	}
	return name;
}

/**
 * �G�����^�O����
 * 
 * @param code �G���� id
 */
Tag.buildEmojiImageTag = function(code, isComment)
{
	var srcPath;

	if (!isComment) {
		srcPath = Tag.MEMBERS_EMOJI_PATH;
	} else {
		srcPath = Tag.VIEW_EMOJI_PATH;
	}

	return '<img src="' + srcPath + code + '.gif" border="0">';
}

/**
 * �A�b�v���[�h�摜�ւ̃p�X���܂� img �^�O������𐶐�
 * 
 * @param filename      �t�@�C����
 * @param optional_attr �ǉ�����
 * @param dir           �f�B���N�g��
 * 
 * @return img �^�O������
 */
Tag.buildUploadImageTag = function(filename, optional_attr, dir)
{
	var path = dir ? dir : OEMBlogGlobal.uploadImageDirectory;
	
	if (null == path || filename == '') {
		return null;
	}
	if (optional_attr == null) {
		optional_attr = '';
	}
	path = path + escape(filename);
	path = '<img src="' + path + '" border="0" ' + optional_attr +'>';
	return path;
}

Tag.buildUploadImageTagFromText = function(tagText)
{
	var r;
	
	r = tagText.match(OEMBlogGlobal.IMAGE_FILE_PATTERN)
	if (null == r || 0 == r.length) {
		return null;
	}
	
	var fileName = r[r.length-1]
	var option   = '';
	
	if (r.length == 3 && r[1] != null && r[1].length != 0) {
		option = (r[1] == '��:') ? 'align="left"' : 'align="right"';
	}
	return Tag.buildUploadImageTag(fileName, option);
}
Tag.prototype.buildUploadImageTag = function()
{
	return Tag.buildUploadImageTagFromText(this.source);
}

