/*
 * �^�O�ҏW
 *
 * Copyright (c) 2003 DRECOM CO.,LTD. All rights reserved.
 * 
 * info@drecom.co.jp
 * http://www.drecom.co.jp/
 */


/**
 * NullObject idiom
 */
var NullSelectedText = new SelectedText(null);

//---------------------------------------------------------
// Global variables
//---------------------------------------------------------
var gSelectedTextObj   = NullSelectedText;

/**
 * ���p���� HTML �v�f�� id ����
 */
var gColorPaletteID      = 'palette';
var gEmojiPaletteID      = 'emoji'

var gSampleTextColorID   = 'paletteSampleTextColor';
var gPaletteColorWellID  = 'paletteColorWell';
var gPaletteColorFieldID = 'paletteColorField';

var gPaletteIDs = [gColorPaletteID, gEmojiPaletteID];


/**
 * �w�i�F��ύX�ł���v���r���[�̈�
 * 
 * gSelectedPreviewID
 *   null   : �w�i�F��ύX���Ȃ�
 *   string : �w�肳�ꂽ id �̔w�i�F�ύX
 *   array  : �e�v���r���[�̈�̔w�i�F�ύX
 */
var gSelectedPreviewID   = null;
var gSelectedColorWellID = null;

var gPreviewBgColorWellID = 'preview_colorWell';
var gPreviewIDs = ['body_preview', 'extend_preview'];

//---------------------------------------------------------
// Palette
//---------------------------------------------------------
/**
 * �p���b�g���w�肳�ꂽ���C���[�̈ʒu�� Y ���W������B
 * 
 * @param theEvent event
 * @param paletteName 
 * @param layerID
 */
function showPaletteAroundLayer(theEvent, paletteName, layerID)
{
	var lyer = XBSLayer.makeLayer(paletteName);
	var dist = XBSLayer.makeLayer(layerID);
	
	if (theEvent == null) {
		theEvent = window.event;
	}
	setUpColorPalette(paletteName);
	if (lyer.isVisible()) return;
	
	var dx = XBSEvent.getMouseX(theEvent);
	var dy = dist.getY();
	var dw = dist.getWidth();
	var dh = dist.getHeight();
	
	// 2004-05-07  Takanori Ishikawa 
	// ------------------------------------------------------------------------		
	// �E�C���h�E����͂ݏo�����ȏꍇ�͒���
	var w = XBSDocument.getWidth() + XBSDocument.getPageOffsetX();
	var h = XBSDocument.getHeight() + XBSDocument.getPageOffsetY();
	
	dx -= lyer.getWidth()/2;
	var x = dx + lyer.getWidth()/2;
	var y = dy  + lyer.getHeight();
	
	if (x > w) {
		dx -= x - w;
	}
	if (y > h) {
		dy -= y - h;
	}
	XBSLayer.initPositionStyle(lyer.getLayerImp());
	lyer.setPosition(dx, dy);
	lyer.setVisible(true);
	
}

/**
 * �p���b�g���\���ɂ���
 */
function hideAllPalette()
{
	for (var i = 0; i < gPaletteIDs.length; i++) {
		var lyer = XBSLayer.makeLayer(gPaletteIDs[i]);
		
		if (lyer != null && lyer.isValid()) {
			lyer.setVisible(false);
		}
	}
	synchronize_preview_bgcolors();
	gSelectedPreviewID = null;
	gSelectedColorWellID = null;
}

function savePaletteEventHandler()
{
	document.onmouseup = null;
}
function restorePaletteEventHandler()
{
	document.onmouseup = hideAllPalette;
}
//---------------------------------------------------------
// �ҏW
//---------------------------------------------------------

function initializeSelectedText(element, fromAnotherElement)
{
	if (null == element) {
		return;
	}
	if (fromAnotherElement != null && fromAnotherElement) {
		element.focus();
	}


	// 2004/03/31 Takanori Ishikawa 
	// ------------------------------------------------------
	// Opera 7, Mac IE: createTextRange�j() �̗L���Ŕ���
	
	// �L�����b�g�𖖔��Ɉړ�������B
	if (element.createTextRange && gSelectedTextObj.isNull()) {
		var text_range;
		
		text_range = element.createTextRange();
		text_range.move("character", element.value.length );
		text_range.select();
	}
	gSelectedTextObj = new SelectedText(element);
	
	gSelectedPreviewID = null;
	gSelectedColorWellID = null;
}


// image_select_place.jsp, entry_write_edit.jsp
function focusSelectedText()
{
	gSelectedTextObj.focus();
}

/**
 * insertText(front)
 * front: �I�𕔕��O���ɑ}������e�L�X�g
 *
 * �e�L�X�g(�G���A)�t�H�[���Ƀe�L�X�g��}������֐�
 * �I�𕶎���̑O�ɑ}�������
 * �I������Ă��Ȃ��ꍇ�A�J�[�\���ʒu�ɑ}�������
 */
function insertText(front)
{
	gSelectedTextObj.insertText(front);
}

//---------------------------------------------------------------------------------
// Edit
//---------------------------------------------------------------------------------

/**
 * �I��͈͂̒[���^�O�̓����ɂ���ꍇ�A�^�O�̊O�ɑI��͈͂��ړ�������
 */
function cutOutTagFragmentOnSelectionArea()
{
	if (false == gSelectedTextObj.isSelected()) 
		return;
	
	var nonSelectionArea = '';
	var tagText          = '';
	var targetArea       = '';
	var tagFragment      = '';
	
	var tag = null;
	
	// �I��͈͂̍��[�̏���
	var tags = gSelectedTextObj.getText().match('^[^<]*>|^[^{]*}');
	if (tags != null) {
		tagFragment = tags[0];

		nonSelectionArea = gSelectedTextObj.getTextBetweenCaret(false, false);
	
		targetArea = nonSelectionArea + tagFragment;
		tag = Tag.findTag(targetArea, Tag.BackwardSearch);
		tagText = tag ? tag.getSource() : '';
		if (tagText != '' && nonSelectionArea.length < targetArea.lastIndexOf(tagText) + tagText.length) {
			gSelectedTextObj.moveStart(tagFragment.length);
		}
	}

	// �I��͈͂̉E�[�̏���
	tags = gSelectedTextObj.getText().match(new RegExp('</?[^>]*$|{[^}]*$', 'g'));
	if (tags != null) {
		tagFragment = tags[tags.length - 1];

		nonSelectionArea = gSelectedTextObj.getTextBetweenCaret(true, true);
	
		targetArea = tagFragment + nonSelectionArea;
		tag = Tag.findTag(targetArea, 0);
		tagText = tag ? tag.getSource() : '';
		if (tagText != '' && nonSelectionArea.length < targetArea.length - targetArea.indexOf(tagText)) {
			gSelectedTextObj.moveEnd(-tagFragment.length);
		}
	}
}

/**
 * SelectedText�̏I������
 */
function finalizeSelectedText()
{
	// ���L�����́ANN�̏ꍇ�ɍs����
	// IE�ł́Aonkeydown�ŃL�����Z������邽�ߕs�K�v
	
	// IE�ŁA���̊֐���onselect����Ăяo���ƃA�N�Z�X�o�C�I���[�V�������������AIE���Ɨ����Ă��܂��B
	// ���̂��߂��̏�����NN��IE�ŕ����Ă���


	if (document.all != null) 
		return;

	if (nonSelectedFlag) {
		nonSelectedFlag = false;
		gSelectedTextObj.moveEnd(-1);
		gSelectedTextObj.moveStartOnEnd();
	}

	if (selectingRightEdgeFlag) {
		selectingRightEdgeFlag = false;
		gSelectedTextObj.moveEnd(1);
	}
}

//---------------------------------------------------------------------------------
// Color
//---------------------------------------------------------------------------------
/**
 * �}�E�X���̂��Ă���F�p���b�g�̐F�� RGB ������ (#XXXXXX) ��
 * �擾����B
 * 
 * @param event mousemove �C�x���g
 * @return RGB ������
 */
getBgColor.prev           = null;	/* �O��擾�����l */
// div - id
getBgColor.colorPaletteID = gColorPaletteID;
getBgColor.childPaletteID = 'colors';
getBgColor.width          = 10;			/* �e�F�p���b�g�̈�ӂ̒��� */
getBgColor.cols           = 32;			/* �F�p���b�g�A�J������ */

function getBgColor(event)
{
	var color = null;
	
	// �C�x���g����F���擾
	if (event.srcElement && event.srcElement.style) {
		color = event.srcElement.style.backgroundColor;
	} else if (event.target && event.target.style){
		color = event.target.style.backgroundColor;
	}
	
	// �C�x���g����擾�ł��Ȃ���΃}�E�X�̈ʒu����v�Z����
	if (color == null || (typeof color == 'string' && color.length == 0)) {
		var mouseX = XBSEvent.getMouseX(event);
		var mouseY = XBSEvent.getMouseY(event);
		
		var parent = new XBSLayer(getBgColor.colorPaletteID);	/* �F�p���b�g */
		var lyer   = new XBSLayer(getBgColor.childPaletteID);	/* �e�F�p���b�g���i�[�������C���[ */
		
		// �p���b�g�����ł̑��ΓI�Ȉʒu�ɕϊ�
		mouseX -= (parent.getX() + lyer.getX());
		mouseY -= (parent.getY() + lyer.getY());
		try {
			var nodes;
			var target = null;
			
			// ���ׂĂ̐F�p���b�g�𒲂ׂ�
			nodes = document.getElementById(getBgColor.childPaletteID);
			nodes = nodes.getElementsByTagName("td");
			for (var i = 0; i < nodes.length; i++) {
				var item = nodes.item(i);
				
				// Safari �ł� offsetHeight = 0 �ɂȂ��Ă���
				if (item.offsetLeft <= mouseX && item.offsetLeft + getBgColor.width >= mouseX) {
					// Mac IE �ł� offsetTop = 0 �ɂȂ��Ă���
					var offsetTop = Math.floor((i+1)/getBgColor.cols) * getBgColor.width;
					if (offsetTop <= mouseY && offsetTop + getBgColor.width >= mouseY) {
						target = item;
						break;
					}
				}
			}
			if (target && target.style) {
				color = target.style.backgroundColor;
			}
		} catch (e) {
			//alert("Exception: " + e);
		}
	}
	
	/*
	  NN6���ƁA�F���C���[�������ꂽ�Ƃ���event.target��null�̏ꍇ������B 
	  ���̏ꍇ�́A�O��擾�����l��Ԃ��悤�ɂ��邱�ƂŁA
	  NN6�ɂ��Ή�����B
	*/
	if (typeof color == 'string' && color.length != 0)
		getBgColor.prev = color;
	else
		color = getBgColor.prev;
	
	return UtilKit.normalizeRGBColorRep(color);	
}
/**
 * �w�i�F�I���̊J�n�B
 * 
 * @param previewID �ύX����v���r���[�̈�̔w�i�F
 * ���ׂẴv���r���[�̈��ύX����Ƃ��� null ��n��
 */
function startChoosePreviewBgColor(theEvent, previewID, colorWellID, distLayer)
{
	gSelectedTextObj     = NullSelectedText;
	gSelectedPreviewID   = previewID;
	gSelectedColorWellID = colorWellID;
	if (null == gSelectedPreviewID || typeof gSelectedPreviewID != typeof '') {
		gSelectedPreviewID = gPreviewIDs;
	}
	showPaletteAroundLayer(theEvent, gColorPaletteID, distLayer);
}

/**
 * �F�p���b�g����
 */
function setUpColorPalette(paletteName)
{
	if (paletteName == gEmojiPaletteID)
		return;
	
	if (gSelectedColorWellID && gSelectedPreviewID){
		// �v���r���[�w�i�F
		colorPaletteDidFocusColor(
			UtilKit.getBgColorById(gSelectedColorWellID));
	} else {
		colorPaletteDidFocusColor("#000000");
	}
}



/**
 * �F�p���b�g�̐F�Ƀ}�E�X���ڂ����B
 */
function colorPaletteDidFocusColor(aColor)
{
	var lyer = XBSLayer.makeLayer(gSampleTextColorID);
	var style = null;
	var impFn = null;
	
	if (gSelectedPreviewID != null) {
		// �w�i�F
	}
	
	lyer.getStyleObject().color = aColor;
	UtilKit.setBgColorById(gPaletteColorWellID, aColor);
	textFieldSetValueById(gPaletteColorFieldID, aColor)
}

function colorPaletteDidSelectColor(aColor)
{
	if (false == gSelectedTextObj.isNull()) {
		insert_tag_color(aColor);
	} else if (gSelectedPreviewID != null) {
		updatePreviewBgcolor(gSelectedPreviewID, aColor);
	}
}

function synchronize_preview_bgcolors()
{
	for (var i = 0; i < gPreviewIDs.length; i++) {
		var preId   = gPreviewIDs[i];
		var bgcolor = UtilKit.getBgColorById(preId);
		
		UtilKit.setBgColorById(gPreviewBgColorWellID, bgcolor);
	}
}

/**
 * �v���r���[�̈�̔w�i�F��ύX
 * 
 * @param previewID string or array
 */
function updatePreviewBgcolor(previewID, aColor)
{
	update_preview_bgcolor(previewID, aColor);
	// �w�i�F��ύX������A�����ɃN�b�L�[�ɕۑ�����
	EntryFormManager ? EntryFormManager.savePreferences() : void(0);
}
function update_preview_bgcolor(previewID, aColor)
{
	if (previewID == null || previewID.length == 0) {
		return;
	}
	if (previewID.substring != null) {
		previewID = new Array(previewID);
	}
	
	for (var i = 0; i < previewID.length; i++) {
		UtilKit.setBgColorById(previewID[i], aColor);
	}
	UtilKit.setBgColorById(gPreviewBgColorWellID, aColor);
}

function textFieldSetValueById(layerID, aValue)
{
	var lyer  = new XBSLayer(layerID);
	var imp = null;
	
	if (false == lyer.isValid()) {
		return;
	}
	
	imp = lyer.getLayerImp();
	if (imp != null && imp.value != aValue) {
		imp.value = aValue;
	}
}
function validateColor(aColor)
{
	var i = 0;
	var a = 'a'.charCodeAt(0);
	var f = 'f'.charCodeAt(0);
	var A = 'A'.charCodeAt(0);
	var F = 'F'.charCodeAt(0);
	var c0 = '0'.charCodeAt(0);
	var c9 = '9'.charCodeAt(0);
	
	if (aColor == null || aColor.substring == null || aColor.length < 6) {
		return false;
	}
	if (aColor.charCodeAt(0) == '#'.charCodeAt(0)) {
		i = 1;
		if (aColor.length != 7) {
			return false;
		}
	}
	
	for (; i < aColor.length; i++) {
		var c = aColor.charCodeAt(i);
		
		if ((a <= c && c <= f) ||
		(A <= c && c <= F) ||
		(c0 <= c && c <= c9))
		{ continue; }
		
		return false;
	}
	return true;
}

function colorPaletteFieldValueDidChange(aField)
{
	var color = aField.value
	var preview_id;
	
	if (false == validateColor(color)) {
		return null;
	}
	if (color.charCodeAt(0) != '#'.charCodeAt(0)) {
		color = '#' + color;
	}
	colorPaletteDidFocusColor(color);
	
	return color;
}
function colorPaletteFieldValueDidAction()
{
	var t;
	var color;
	
	t = document.all 
			? document.all(gPaletteColorFieldID)
			: document.getElementById(gPaletteColorFieldID);
	
	color = colorPaletteFieldValueDidChange(t);
	if (color != null) {
		colorPaletteDidSelectColor(color);
	}
	hideAllPalette();
}



//---------------------------------------------------------------------------------
//�^�O
//---------------------------------------------------------------------------------


// �G�����}��
function insert_emoji(code)
{
	switch(emoji_type){
		case EMOJI_HTML:
			insertText(Tag.buildEmojiImageTag(code));
			break;
		case EMOJI_REF_JP:
			insertText('{' + getEmojiNameFromCode(code) + '}');
			break;
	}
}

function insert_tag_color(color)
{
	switch (gTagType) {
		case Tag.TYPE_CSS:
			_setSpanTag('color: ' + color + ';');
			break;
		case Tag.TYPE_DEPRECATED_HTML:
			gSelectedTextObj.insertTextOnBothSides('<font color="' + color + '">', '</font>');
			break;
		case Tag.TYPE_JP:
			gSelectedTextObj.insertTextOnBothSides('<�F:' + color + '>', '</�F>');
			break;
	}
}

function _setSpanTag(style)
{
	gSelectedTextObj.insertTextOnBothSides('<span style="' + style + '">','</span>');
}

function _setDivTag(style)
{
	gSelectedTextObj.insertTextOnBothSides('<div style="' + style + '">','</div>');
}



function insert_tag_align_left()
{
	switch (gTagType) {
		case Tag.TYPE_CSS:
			_setDivTag('text-align: left;');
			break;
		case Tag.TYPE_DEPRECATED_HTML:
			gSelectedTextObj.insertTextOnBothSides('<div align="left">', '</div>');
			break;
		case Tag.TYPE_JP:
			gSelectedTextObj.insertTextOnBothSides('<��>', '</��>');
			break;
	}
}
function insert_tag_align_center()
{
	switch(gTagType){
		case Tag.TYPE_CSS:
			_setDivTag('text-align: center;');
			break;
		case Tag.TYPE_DEPRECATED_HTML:
			gSelectedTextObj.insertTextOnBothSides('<center>', '</center>');
			break;
		case Tag.TYPE_JP:
			gSelectedTextObj.insertTextOnBothSides('<��>', '</��>');
			break;
	}
}
function insert_tag_align_right()
{
	switch(gTagType){
		case Tag.TYPE_CSS:
			_setDivTag('text-align: right;');
			break;
		case Tag.TYPE_DEPRECATED_HTML:
			gSelectedTextObj.insertTextOnBothSides('<div align="right">', '</div>');
			break;
		case Tag.TYPE_JP:
			gSelectedTextObj.insertTextOnBothSides('<�E>', '</�E>');
			break;
	}
}
function insert_tag_style_italic()
{
	switch(gTagType){
		case Tag.TYPE_CSS:
			_setSpanTag('font-style: italic;');
			break;
		case Tag.TYPE_DEPRECATED_HTML:
			gSelectedTextObj.insertTextOnBothSides('<i>', '</i>');
			break;
		case Tag.TYPE_JP:
			gSelectedTextObj.insertTextOnBothSides('<��>', '</��>');
			break;
	}
}
function insert_tag_strong()
{
	switch(gTagType){
		case Tag.TYPE_CSS:
			gSelectedTextObj.insertTextOnBothSides('<strong>', '</strong>');
			break;
		case Tag.TYPE_DEPRECATED_HTML:
			gSelectedTextObj.insertTextOnBothSides('<strong>', '</strong>');
			break;
		case Tag.TYPE_JP:
			gSelectedTextObj.insertTextOnBothSides('<��>', '</��>');
			break;
	}
}
function insert_tag_size_large()
{
	switch(gTagType){
		case Tag.TYPE_CSS:
			_setSpanTag('font-size: large;');
			break;
		case Tag.TYPE_DEPRECATED_HTML:
			gSelectedTextObj.insertTextOnBothSides('<big>', '</big>');
			break;
		case Tag.TYPE_JP:
			gSelectedTextObj.insertTextOnBothSides('<��>', '</��>');
			break;
	}
}
function insert_tag_size_xlarge()
{
	switch(gTagType){
		case Tag.TYPE_CSS:
			_setSpanTag('font-size: x-large;');
			break;
		case Tag.TYPE_DEPRECATED_HTML:
			gSelectedTextObj.insertTextOnBothSides('<big><big>', '</big></big>');
			break;
		case Tag.TYPE_JP:
			gSelectedTextObj.insertTextOnBothSides('<����>', '</����>');
			break;
	}
}
function insert_tag_size_small()
{
	switch(gTagType){
		case Tag.TYPE_CSS:
			_setSpanTag('font-size: small;');
			break;
		case Tag.TYPE_DEPRECATED_HTML:
			gSelectedTextObj.insertTextOnBothSides('<small>', '</small>');
			break;
		case Tag.TYPE_JP:
			gSelectedTextObj.insertTextOnBothSides('<��>', '</��>');
			break;
	}
}
function insert_tag_decoration_underline()
{
	switch(gTagType){
		case Tag.TYPE_CSS:
			_setSpanTag('text-decoration: underline;');
			break;
		case Tag.TYPE_DEPRECATED_HTML:
			gSelectedTextObj.insertTextOnBothSides('<u>', '</u>');
			break;
		case Tag.TYPE_JP:
			gSelectedTextObj.insertTextOnBothSides('<����>', '</����>');
			break;
	}
}
function insert_tag_decoration_line_through()
{
	switch(gTagType){
		case Tag.TYPE_CSS:
			_setSpanTag('text-decoration: line-through;');
			break;
		case Tag.TYPE_DEPRECATED_HTML:
			gSelectedTextObj.insertTextOnBothSides('<s>', '</s>');
			break;
		case Tag.TYPE_JP:
			gSelectedTextObj.insertTextOnBothSides('<�ŏ���>', '</�ŏ���>');
			break;
	}
}
function insert_tag_link()
{
	var url = window.prompt('�����N��URL����͂��Ă�������', 'http://');

	if (url != null) {

		switch(gTagType){
			case Tag.TYPE_CSS:
				gSelectedTextObj.insertTextOnBothSides('<a href=&quot;' + url + '&quot; target=&quot;_blank&quot;>','</a>');
				break;
			case Tag.TYPE_JP:
				gSelectedTextObj.insertTextOnBothSides('<�����N:' + url + '>','</�����N>');
				break;
		}
	}
}

//---------------------------------------------------------------------------------
// KeyBinding
//---------------------------------------------------------------------------------
/**
 *  �u�{���v�E�u�ǋL�v��textarea�̃L�[���͑���
 * 
 * @param theEvent key event
 */
function controlKeystroke(theEvent)
{
	var VK_RIGHT = 39;
	var VK_LEFT  = 37;
	var VK_BS    = 8;
	var VK_DEL   = 46;
	
	keyCode = XBSEvent.getKeyCode(theEvent);
	isIe = (theEvent.which == null);

	switch (keyCode) {
	case VK_RIGHT:
		if (gSelectedTextObj.moveCaretOutOfTag(true, theEvent.shiftKey) && isIe) 
			theEvent.returnValue = false;
		
		break;
	case VK_LEFT:
		if (gSelectedTextObj.moveCaretOutOfTag(false, theEvent.shiftKey) && isIe) 
			theEvent.returnValue = false;
		break;
	case VK_BS:
		gSelectedTextObj.deleteTagOnCaret(false);
		break;
	case VK_DEL:
		gSelectedTextObj.deleteTagOnCaret(true);
		break;
		
	default:
		break;
	}
	return false;
}
