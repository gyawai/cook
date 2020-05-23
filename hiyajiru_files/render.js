/**
 * 
 * HTML �ϊ�
 *
 * Copyright (c) 2003 DRECOM CO.,LTD. All rights reserved.
 * 
 * info@drecom.co.jp
 * http://www.drecom.co.jp/
 */

//---------------------------------------------------------------------------------
// Renderer
//---------------------------------------------------------------------------------
/**
 * �{���A�ǋL�A�R�����g�Ȃǂ̃v���r���[
 * 
 * @author Takanori Ishikawa
 * @version 1.0
 */
Renderer = new Object();


/**
 * �\���e�L�X�g���Ȃ��Ƃ��ɕ\�����������
 */
Renderer.DEFAULT_EMPTY_MESSAGE = '<div style="color:#999999">�i�����Ƀv���r���[���\������܂��j</div>';


/**
 * �v���r���[�����s���邩�ǂ���
 */
Renderer.enabled = true;

/**
 * HTML��L���ɂ��邩�ǂ���
 * - HTML��L��
 * -- �T�j�^�C�W���O�Ȃ�
 * -- HTML �^�O�͂��̂܂�
 * -- ���s�����̂܂�
 * - HTML�𖳌�
 * -- �T�j�^�C�W���O����
 * -- HTML �^�O�̓T�j�^�C�W���O�������̂��o��
 * -- ���s�� <br> �ɕϊ� 
 */
Renderer.enableHTML = false;

/**
 * �����v���r���[��L���ɂ��邩�ǂ���
 */
Renderer.enabled = true;

/**
 * �摜���A�b�v���[�h����f�B���N�g���̃p�X
 * jsp ���œK�X�X�V�����B
 */
Renderer.uploadImageDirectory = null;

/**
 * �R�����g�Ŏg�p����Ă��邩�ǂ���������킷�t���O�B
 */
Renderer.isComment = false; 



//---------------------------------------------------------------------------------
// Preview
//---------------------------------------------------------------------------------
Renderer.setEnabled = function(flag)
{
	flag = UtilKit.parseBoolean(flag);
	Renderer.enabled = flag;
	
	if (flag) {
		renderPreviewAll(gWriteEntryForm);
	}
}
Renderer.setEnableHTML = function(flag)
{
	flag = UtilKit.parseBoolean(flag);
	Renderer.enableHTML = flag;
	renderPreviewAll(gWriteEntryForm);
}

/**
 * ���ׂă����_�����O
 * 
 * @param form �����_�����O������e������ textarea �̐e Form �v�f
 */

function renderPreviewAll(form)
{
	if (null == form) {
		return;
	}
	
	//	2004-04-08  Takanori Ishikawa  
	//	------------------------------------------------------------
	// ������ jsp �t�@�C������Ă΂�邽�߁A���ۂɂǂ̃e�L�X�g�G���A�����邩�킩��Ȃ��B
	// �Ƃ肠�������ׂĎ���	
	var layerIDs    = ['body_preview', 'extend_preview', 'comment_preview'];
	var textareaIDs = ['body', 'extend', 'comment'];
	
	for (var i = 0; i < layerIDs.length; i++) {
		renderPreview(form[textareaIDs[i]], layerIDs[i]);
	}
}



/**
 * key �C�x���g���󂯎��A�u���E�U���ƓK�؂ȂƂ��� renderPreview() ���Ăяo���B
 * 
 * @param element value �v���p�e�B������ Element
 * @param layer_id id
 * @param show_empty_msg �󕶎���̏ꍇ�A�����������ɕ\������ꍇ�� true
 */
function renderPreviewOnKeyEvent(theEvent, element, layer_id, show_empty_msg)
{	
	if (null == theEvent || null == element) {
		return;
	}
	//	2004-04-08  Takanori Ishikawa  
	//	------------------------------------------------------------
	//	[Bug:OB106] (���{��ϊ������f�����)
	//	Mac IE5, Opera6 �Ȃǂł� IME �ŕϊ����� textArea.value ���Q�ƁA�ύX�����
	//	�ϊ����r���Ŋm�肵�Ă��܂��̂ŁAkeyEvent handler ����͂��̊֐����ĂсA�u���E�U����
	//	�ŏ������킯��B
	//	
	//	��̓I�ɂ́A�����̃u���E�U�� Return �L�[�������ꂽ�ꍇ�̂݃v���r���[�����s����悤�ɂ����B
	//	�iEnter �L�[�� Form ���̂� action �N���j
	
	if (XBSUtil.macIE && XBSUtil.macIE.major < 6 ||
	    XBSUtil.opera && XBSUtil.opera.major < 7 )
	{
		var code = XBSEvent.getKeyCode(theEvent);
	
		if (code != XBSEvent.NEW_LINE_KEY) {
			return;
		}
	} 
	renderPreview(element, layer_id, show_empty_msg);
	
}


/**
 * layer_id �̃��C���� element.value �� html �ϊ�����
 * ���e��\������
 * 
 * @param element value �v���p�e�B������ Element
 * @param layer_id id
 * @param show_empty_msg �󕶎���̏ꍇ�A�����������ɕ\������ꍇ�� true
 * @param is_comment �R�����g�̏ꍇ�́Atrue
 */
function renderPreview(element, layer_id, show_empty_msg, is_comment)
{
	if (false == Renderer.enabled || null == element || null == layer_id) {
		return;
	}
	
	var lyer = new XBSLayer(layer_id);
	var htmlText;
	
	if (null == lyer || null == lyer.getLayerImp()) {
		return;
	}
	
	htmlText = element.value;
	htmlText = Renderer.convertTextToHTML(htmlText);
	if (htmlText == '' && (!defined(show_empty_msg) || show_empty_msg == true)) {
		htmlText = Renderer.DEFAULT_EMPTY_MESSAGE;
	}
	
	lyer.setInnerHTML(htmlText);
}



//---------------------------------------------------------------------------------
// Parser
//---------------------------------------------------------------------------------
function Parser(sourceText, options) 
{
	this.src = sourceText;
	this.options = options;
	
	/* StringPointer: CRLF, CR --> LF */
	this.sp = new StringPointer(this.src, true);
	
	this.buffer = '';
	this.markedIndex = 0;
}
/**
 * Option masks (use bit OR)
 * 
 */
Parser.NEWLINE_TO_BR = 1;
Parser.SANITIZE      = 1 << 1;



Parser.prototype.newline2BRIfNeeded = function(v)
{
	if (this.options & Parser.NEWLINE_TO_BR) {
		v = v.replace(/\r\n|\r|\n/g, Tag.BR_TEXT);
	}
	return v;
}
Parser.prototype.sanitizeIfNeeded = function(v, amp)
{
	if (this.options & Parser.SANITIZE) {
		// �T�j�^�C�W���O
		v = v.replace(/</g, Tag.LT_TEXT);
		v = v.replace(/>/g, Tag.GT_TEXT);
		if (amp) {
			v = v.replace(/&/g, Tag.AMP_TEXT);
		}
	}
	return v;
}
Parser.prototype.flush = function(toIndex)
{
	if (toIndex == null)
		toIndex = this.sp.getLocation();
	
	var t = this.sp.substring(this.markedIndex, toIndex);
	
	t = this.sanitizeIfNeeded(t);
	t = this.newline2BRIfNeeded(t);
	this.buffer += t;
}
Parser.prototype.parse = function()
{
	// data variable
	var sp = this.sp;
	var c;
	var idx;
	var tag = '';
	
	this.markedIndex = idx = sp.getLocation();
	while ( (c = sp.getc()) != null ) {
		// Tag
		if (c == XBSCType.LBRACE || c == XBSCType.LT) {
			
			tag = Tag.findTag(this.src, Tag.AnchoredSearch, idx);
			if (tag != null) {
				this.flush(idx);
				tag.isComment = Renderer.isComment;
				
				var html = tag.toHTMLString();
				if (!tag.isCustomTag() && !tag.isCustomTag2()) {
					html = this.sanitizeIfNeeded(html, false);
				}
				this.buffer += html;
				sp.readUpToString(c == XBSCType.LBRACE ? '}' : '>');
				this.markedIndex = sp.getLocation();
			}
		}
		idx = sp.getLocation();
	}
	this.flush();
	
	return this.buffer;
}



/**
 * ������� html �ɕϊ�
 * 
 * @param ������
 * @return html
 */
Renderer.convertTextToHTML = function(aText)
{
	var options   = 0;
	var parser    = null;
	var htmlText  = '';
	
	// HTML ���L���łȂ���Ή��s��<br>�ɒu��
	if (!Renderer.enableHTML) {
		options |= Parser.NEWLINE_TO_BR;
		options |= Parser.SANITIZE;
	}
	parser   = new Parser(aText, options);
	htmlText = parser.parse();
	
	/* JUST A DEBUG */
	window.LAST_HTML = htmlText;
	
	return htmlText;
}
/* JUST A DEBUG */
function ptag() { alert(window.LAST_HTML) }
