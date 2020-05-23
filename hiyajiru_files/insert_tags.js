/*
 * タグ編集
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
 * 利用する HTML 要素の id 属性
 */
var gColorPaletteID      = 'palette';
var gEmojiPaletteID      = 'emoji'

var gSampleTextColorID   = 'paletteSampleTextColor';
var gPaletteColorWellID  = 'paletteColorWell';
var gPaletteColorFieldID = 'paletteColorField';

var gPaletteIDs = [gColorPaletteID, gEmojiPaletteID];


/**
 * 背景色を変更できるプレビュー領域
 * 
 * gSelectedPreviewID
 *   null   : 背景色を変更しない
 *   string : 指定された id の背景色変更
 *   array  : 各プレビュー領域の背景色変更
 */
var gSelectedPreviewID   = null;
var gSelectedColorWellID = null;

var gPreviewBgColorWellID = 'preview_colorWell';
var gPreviewIDs = ['body_preview', 'extend_preview'];

//---------------------------------------------------------
// Palette
//---------------------------------------------------------
/**
 * パレットを指定されたレイヤーの位置で Y 座標を決定。
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
	// ウインドウからはみ出そうな場合は調整
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
 * パレットを非表示にする
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
// 編集
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
	// Opera 7, Mac IE: createTextRange）() の有無で判定
	
	// キャレットを末尾に移動させる。
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
 * front: 選択部分前部に挿入するテキスト
 *
 * テキスト(エリア)フォームにテキストを挿入する関数
 * 選択文字列の前に挿入される
 * 選択されていない場合、カーソル位置に挿入される
 */
function insertText(front)
{
	gSelectedTextObj.insertText(front);
}

//---------------------------------------------------------------------------------
// Edit
//---------------------------------------------------------------------------------

/**
 * 選択範囲の端がタグの内部にある場合、タグの外に選択範囲を移動させる
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
	
	// 選択範囲の左端の処理
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

	// 選択範囲の右端の処理
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
 * SelectedTextの終了処理
 */
function finalizeSelectedText()
{
	// 下記処理は、NNの場合に行われる
	// IEでは、onkeydownでキャンセルされるため不必要
	
	// IEで、この関数をonselectから呼び出すとアクセスバイオレーションが発生し、IEごと落ちてしまう。
	// そのためこの処理をNNとIEで分けている


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
 * マウスがのっている色パレットの色を RGB 文字列 (#XXXXXX) で
 * 取得する。
 * 
 * @param event mousemove イベント
 * @return RGB 文字列
 */
getBgColor.prev           = null;	/* 前回取得した値 */
// div - id
getBgColor.colorPaletteID = gColorPaletteID;
getBgColor.childPaletteID = 'colors';
getBgColor.width          = 10;			/* 各色パレットの一辺の長さ */
getBgColor.cols           = 32;			/* 色パレット、カラム数 */

function getBgColor(event)
{
	var color = null;
	
	// イベントから色を取得
	if (event.srcElement && event.srcElement.style) {
		color = event.srcElement.style.backgroundColor;
	} else if (event.target && event.target.style){
		color = event.target.style.backgroundColor;
	}
	
	// イベントから取得できなければマウスの位置から計算する
	if (color == null || (typeof color == 'string' && color.length == 0)) {
		var mouseX = XBSEvent.getMouseX(event);
		var mouseY = XBSEvent.getMouseY(event);
		
		var parent = new XBSLayer(getBgColor.colorPaletteID);	/* 色パレット */
		var lyer   = new XBSLayer(getBgColor.childPaletteID);	/* 各色パレットを格納したレイヤー */
		
		// パレット内部での相対的な位置に変換
		mouseX -= (parent.getX() + lyer.getX());
		mouseY -= (parent.getY() + lyer.getY());
		try {
			var nodes;
			var target = null;
			
			// すべての色パレットを調べる
			nodes = document.getElementById(getBgColor.childPaletteID);
			nodes = nodes.getElementsByTagName("td");
			for (var i = 0; i < nodes.length; i++) {
				var item = nodes.item(i);
				
				// Safari では offsetHeight = 0 になっている
				if (item.offsetLeft <= mouseX && item.offsetLeft + getBgColor.width >= mouseX) {
					// Mac IE では offsetTop = 0 になっている
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
	  NN6だと、色レイヤーが押されたときにevent.targetがnullの場合がある。 
	  この場合は、前回取得した値を返すようにすることで、
	  NN6にも対応する。
	*/
	if (typeof color == 'string' && color.length != 0)
		getBgColor.prev = color;
	else
		color = getBgColor.prev;
	
	return UtilKit.normalizeRGBColorRep(color);	
}
/**
 * 背景色選択の開始。
 * 
 * @param previewID 変更するプレビュー領域の背景色
 * すべてのプレビュー領域を変更するときは null を渡す
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
 * 色パレット準備
 */
function setUpColorPalette(paletteName)
{
	if (paletteName == gEmojiPaletteID)
		return;
	
	if (gSelectedColorWellID && gSelectedPreviewID){
		// プレビュー背景色
		colorPaletteDidFocusColor(
			UtilKit.getBgColorById(gSelectedColorWellID));
	} else {
		colorPaletteDidFocusColor("#000000");
	}
}



/**
 * 色パレットの色にマウスが載った。
 */
function colorPaletteDidFocusColor(aColor)
{
	var lyer = XBSLayer.makeLayer(gSampleTextColorID);
	var style = null;
	var impFn = null;
	
	if (gSelectedPreviewID != null) {
		// 背景色
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
 * プレビュー領域の背景色を変更
 * 
 * @param previewID string or array
 */
function updatePreviewBgcolor(previewID, aColor)
{
	update_preview_bgcolor(previewID, aColor);
	// 背景色を変更したら、すぐにクッキーに保存する
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
//タグ
//---------------------------------------------------------------------------------


// 絵文字挿入
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
			gSelectedTextObj.insertTextOnBothSides('<色:' + color + '>', '</色>');
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
			gSelectedTextObj.insertTextOnBothSides('<左>', '</左>');
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
			gSelectedTextObj.insertTextOnBothSides('<中>', '</中>');
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
			gSelectedTextObj.insertTextOnBothSides('<右>', '</右>');
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
			gSelectedTextObj.insertTextOnBothSides('<斜>', '</斜>');
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
			gSelectedTextObj.insertTextOnBothSides('<太>', '</太>');
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
			gSelectedTextObj.insertTextOnBothSides('<大>', '</大>');
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
			gSelectedTextObj.insertTextOnBothSides('<特大>', '</特大>');
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
			gSelectedTextObj.insertTextOnBothSides('<小>', '</小>');
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
			gSelectedTextObj.insertTextOnBothSides('<下線>', '</下線>');
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
			gSelectedTextObj.insertTextOnBothSides('<打消線>', '</打消線>');
			break;
	}
}
function insert_tag_link()
{
	var url = window.prompt('リンク先URLを入力してください', 'http://');

	if (url != null) {

		switch(gTagType){
			case Tag.TYPE_CSS:
				gSelectedTextObj.insertTextOnBothSides('<a href=&quot;' + url + '&quot; target=&quot;_blank&quot;>','</a>');
				break;
			case Tag.TYPE_JP:
				gSelectedTextObj.insertTextOnBothSides('<リンク:' + url + '>','</リンク>');
				break;
		}
	}
}

//---------------------------------------------------------------------------------
// KeyBinding
//---------------------------------------------------------------------------------
/**
 *  「本文」・「追記」のtextareaのキー入力操作
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
