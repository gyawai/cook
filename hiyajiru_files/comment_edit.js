/*
 * コメント編集
 *
 * Copyright (c) 2003 DRECOM CO.,LTD. All rights reserved.
 * 
 * info@drecom.co.jp
 * http://www.drecom.co.jp/
 */



var COMMENT_FORM_NAME               = 'WriteCommentForm';
var COMMENT_TEXTAREA_NAME           = 'comment';
var COMMENT_COOKIE_CHECKBOX_NAME    = 'EatCookie';
var COMMENT_PREVIEW_ID              = 'comment_preview';
var COMMENT_TOOLBAR_POSMARK_ID      = 'comment_toolbar_position_marker';

var COMMENT_AUTHOR_NAME             = 'author';
var COMMENT_EMAIL_NAME              = 'email';
var COMMENT_URL_NAME                = 'url';
var gCommentSaveCookieNames = [COMMENT_AUTHOR_NAME, COMMENT_EMAIL_NAME, COMMENT_URL_NAME];

var gCommentForm               = null;
var gCommentTextArea           = null;
var gCommentSaveCookieCheckbox = null;

// *** Cookie ***//
var COMMENT_COOKIE_NAME         = 'blog.comment.preferences';
var COMMENT_COOKIE_EXPIRE_DAYS  = 30; 

var gCommentCookie = new Cookie(document, COMMENT_COOKIE_NAME, COMMENT_COOKIE_EXPIRE_DAYS * 24);

loadCommentCookie.loaded = false;
function loadCommentCookie()
{
	var loaded = false;
	
	if (null == gCommentForm || null == gCommentSaveCookieCheckbox) {
		return;
	}
	
	loaded = gCommentCookie.load();
	
	// load の結果を反映
	loadCommentCookie.loaded = loaded;
	if (gCommentSaveCookieCheckbox != null) {
		gCommentSaveCookieCheckbox.checked = loaded;
		if (false == loadCommentCookie.loaded) {
			return;
		}
	}
	
	for (var i = 0; i < gCommentSaveCookieNames.length; i++) {
		var nm = gCommentSaveCookieNames[i];
		var t  = null;
		var v  = null;
		
		if (null == nm) continue;
		t = gCommentForm[nm];
		v = gCommentCookie[nm];
		if (null == v || null == t) continue;
		
		t.value = v;
	}
}
function storeCommentCookie()
{
	for (var i = 0; i < gCommentSaveCookieNames.length; i++) {
		var nm = gCommentSaveCookieNames[i];
		var t  = null;
		
		if (null == nm) continue;
		t = gCommentForm[nm];
		if (null == t || null == t.value) continue;
		
		gCommentCookie[nm] = t.value;
	}
	gCommentCookie.store();
	loadCommentCookie.loaded = true;
}
function removeCommentCookie()
{
	if (loadCommentCookie.loaded) {
		gCommentCookie.remove();
	}
}

/**
 * checkbox - onclick
 */
function handleEatCookieCheckBoxOnClick(aCheckBox)
{
	var checked = (true == aCheckBox.checked);
	if (checked) {
		storeCommentCookie();
	} else {
		removeCommentCookie();
	}	
}
/** form.onsubmit */
function comment_form_onsubmit()
{
	var lyer = XBSLayer.makeLayer(gColorPaletteID);
	
	// 2004-05-19  Takanori Ishikawa 
	// -----------------------------------------------------------
	// カラーパレットの　RGB 手入力の完了
	// HTML の構成上、Form にすることができなかったので
	// 苦肉の策
	if (lyer != null && lyer.isVisible()) {
		colorPaletteFieldValueDidAction();
		return false;
	}
	if (comment_form_onsubmit.tooLate) {
		return false;
	}
	comment_form_onsubmit.tooLate = true;
	
	var checked;
	checked = (gCommentSaveCookieCheckbox != null && true == gCommentSaveCookieCheckbox.checked);	
	if (checked) {
		storeCommentCookie();
	} else {
		removeCommentCookie();
	}
	return true;
}
function comment_setUp_textArea(textArea)
{
	// 2004-05-19  Takanori Ishikawa 
	// -----------------------------------------------------------
	// テンプレート編集でユーザに JavaScript を見せたくないので、ここで設定
	
	textArea.onfocus     = function(e){ };
	textArea.onmouseup   = function(e){ initializeSelectedText(this); cutOutTagFragmentOnSelectionArea(); renderPreview(this, COMMENT_PREVIEW_ID);}; 
	textArea.onchange    = function(e){ renderPreview(this, COMMENT_PREVIEW_ID); };
	textArea.onkeydown   = function(e){ initializeSelectedText(this); controlKeystroke(event); };
	textArea.onkeyup     = function(e){ initializeSelectedText(this); finalizeSelectedText(); renderPreviewOnKeyEvent(event, this, COMMENT_PREVIEW_ID); };
}

/** body.onload */
function comment_body_onload()
{
	/*
	 * HTML を有効にする
	 * @see render.js
	 */
	Renderer.enableHTML = false;
	
	Renderer.isComment = true;
	
	gCommentForm = document[COMMENT_FORM_NAME];
	if (gCommentForm != null) {
		gCommentTextArea = gCommentForm[COMMENT_TEXTAREA_NAME];
	
		// null の可能性もあり
		gCommentSaveCookieCheckbox = gCommentForm[COMMENT_COOKIE_CHECKBOX_NAME];

		comment_setUp_textArea(gCommentTextArea);
		renderPreviewAll(gCommentForm);
	
		// UtilKit.addhock だと false を返してキャンセルできない
		gCommentForm.onsubmit = comment_form_onsubmit;
		loadCommentCookie();
	}
}

/* shortcut for render.js*/
function comment_render()
{
	if (gCommentTextArea != null) {
		renderPreview(gCommentTextArea, COMMENT_PREVIEW_ID);
	}
}


/* onmousedownにすると、onClickが無効になるので、up */
UtilKit.addhook(document, 'onmouseup', hideAllPalette);
UtilKit.addhook(window, 'onload', comment_body_onload);
