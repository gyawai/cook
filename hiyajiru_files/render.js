/**
 * 
 * HTML 変換
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
 * 本文、追記、コメントなどのプレビュー
 * 
 * @author Takanori Ishikawa
 * @version 1.0
 */
Renderer = new Object();


/**
 * 表示テキストがないときに表示する説明文
 */
Renderer.DEFAULT_EMPTY_MESSAGE = '<div style="color:#999999">（ここにプレビューが表示されます）</div>';


/**
 * プレビューを実行するかどうか
 */
Renderer.enabled = true;

/**
 * HTMLを有効にするかどうか
 * - HTMLを有効
 * -- サニタイジングなし
 * -- HTML タグはそのまま
 * -- 改行もそのまま
 * - HTMLを無効
 * -- サニタイジングあり
 * -- HTML タグはサニタイジングしたものを出力
 * -- 改行は <br> に変換 
 */
Renderer.enableHTML = false;

/**
 * 自動プレビューを有効にするかどうか
 */
Renderer.enabled = true;

/**
 * 画像をアップロードするディレクトリのパス
 * jsp 側で適宜更新される。
 */
Renderer.uploadImageDirectory = null;

/**
 * コメントで使用されているかどうかをあらわすフラグ。
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
 * すべてレンダリング
 * 
 * @param form レンダリングする内容をもつ textarea の親 Form 要素
 */

function renderPreviewAll(form)
{
	if (null == form) {
		return;
	}
	
	//	2004-04-08  Takanori Ishikawa  
	//	------------------------------------------------------------
	// 複数の jsp ファイルから呼ばれるため、実際にどのテキストエリアがあるかわからない。
	// とりあえずすべて試す	
	var layerIDs    = ['body_preview', 'extend_preview', 'comment_preview'];
	var textareaIDs = ['body', 'extend', 'comment'];
	
	for (var i = 0; i < layerIDs.length; i++) {
		renderPreview(form[textareaIDs[i]], layerIDs[i]);
	}
}



/**
 * key イベントを受け取り、ブラウザごと適切なときに renderPreview() を呼び出す。
 * 
 * @param element value プロパティを持つ Element
 * @param layer_id id
 * @param show_empty_msg 空文字列の場合、説明文を代わりに表示する場合は true
 */
function renderPreviewOnKeyEvent(theEvent, element, layer_id, show_empty_msg)
{	
	if (null == theEvent || null == element) {
		return;
	}
	//	2004-04-08  Takanori Ishikawa  
	//	------------------------------------------------------------
	//	[Bug:OB106] (日本語変換が中断される)
	//	Mac IE5, Opera6 などでは IME で変換中に textArea.value を参照、変更すると
	//	変換が途中で確定してしまうので、keyEvent handler からはこの関数を呼び、ブラウザごと
	//	で処理をわける。
	//	
	//	具体的には、それらのブラウザで Return キーが押された場合のみプレビューを実行するようにした。
	//	（Enter キーは Form 自体の action 起動）
	
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
 * layer_id のレイヤに element.value を html 変換した
 * 内容を表示する
 * 
 * @param element value プロパティを持つ Element
 * @param layer_id id
 * @param show_empty_msg 空文字列の場合、説明文を代わりに表示する場合は true
 * @param is_comment コメントの場合は、true
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
		// サニタイジング
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
 * 文字列を html に変換
 * 
 * @param 文字列
 * @return html
 */
Renderer.convertTextToHTML = function(aText)
{
	var options   = 0;
	var parser    = null;
	var htmlText  = '';
	
	// HTML が有効でなければ改行を<br>に置換
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
