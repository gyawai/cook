/*
 * タグ JavaScript
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
 * @param aString     文字列
 * @param packNewline getc() で改行 (CR, CRLF, LF) をすべて LF に変換するか
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
 * タグオブジェクト。<A hoge="foo"> と </A> は別々のインスタンスになる。
 * オブジェクト自体にはタグ関連の機能をまとめてある
 * 
 * @param aTagName タグ名
 * @param aSource テキスト
 * @param isEndTag 閉じタグか
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

// タグ定義
TagDefs = new Object();
TagDefs['斜'] 		= ['span', 'style="font-style: italic;"'];
TagDefs['太'] 		= ['span', 'style="font-weight: bold;"'];
TagDefs['大']   	= ['span', 'style="font-size: 125%;"'];
TagDefs['特大']		= ['span', 'style="font-size: 150%;"'];
TagDefs['小']     	= ['span', 'style="font-size: 75%;"'];
TagDefs['下線']   	= ['span', 'style="text-decoration: underline;"'];
TagDefs['打消線'] 	= ['s', ''];
TagDefs['左']		= ['div', 'style="text-align: left;"'];
TagDefs['中']		= ['div', 'style="text-align: center;"'];
TagDefs['右']		= ['div', 'style="text-align: right;"'];
TagDefs['リンク']		= ['a', 'href="', '" target="_blank"'];
TagDefs['色']		= ['span', 'style="color: ', ';"'];

/**
 * 絵文字
 */
Tag.emojiTable = new Object();
Tag.emojiTable['01'] = 'スマイル';
Tag.emojiTable['02'] = 'グズン';
Tag.emojiTable['03'] = 'ハッピー';
Tag.emojiTable['04'] = '笑';
Tag.emojiTable['05'] = 'ラブ';
Tag.emojiTable['06'] = 'ふきげん';
Tag.emojiTable['07'] = 'ショック';
Tag.emojiTable['135'] = 'げっ';
Tag.emojiTable['08'] = 'プンスカ';
Tag.emojiTable['18'] = 'NO';
Tag.emojiTable['19'] = 'YES';
Tag.emojiTable['68'] = '海水浴';
Tag.emojiTable['69'] = 'レインコート';
Tag.emojiTable['70'] = 'りんごちゃんNG';
Tag.emojiTable['71'] = 'りんごちゃん';
Tag.emojiTable['72'] = 'ハム';
Tag.emojiTable['09'] = 'ハート';
Tag.emojiTable['10'] = 'キューピット';
Tag.emojiTable['11'] = 'ハートブレイク';
Tag.emojiTable['12'] = 'ドキドキ';
Tag.emojiTable['13'] = 'ラブラブ';
Tag.emojiTable['142'] = 'キス';
Tag.emojiTable['21'] = '怒';
Tag.emojiTable['22'] = 'ルンルン';
Tag.emojiTable['23'] = 'はてな';
Tag.emojiTable['24'] = 'びっくり';
Tag.emojiTable['155'] = '超びっくり';
Tag.emojiTable['162'] = 'なんで';
Tag.emojiTable['25'] = '汗';
Tag.emojiTable['67'] = '涙';
Tag.emojiTable['26'] = 'スリープ';
Tag.emojiTable['27'] = 'キラリ';
Tag.emojiTable['143'] = 'ひらめき';
Tag.emojiTable['37'] = 'ため息';
Tag.emojiTable['33'] = '祝';
Tag.emojiTable['148'] = 'ピース';
Tag.emojiTable['122'] = 'グッド';
Tag.emojiTable['28'] = 'OK';
Tag.emojiTable['131'] = 'BOO';
Tag.emojiTable['132'] = 'バイバイ';
Tag.emojiTable['29'] = 'ガッテン';
Tag.emojiTable['30'] = 'パチパチ';
Tag.emojiTable['38'] = 'ダッシュ';
Tag.emojiTable['36'] = 'メモ';
Tag.emojiTable['85'] = '爆弾';
Tag.emojiTable['54'] = '火';
Tag.emojiTable['93'] = 'アップ';
Tag.emojiTable['95'] = 'ダウン';
Tag.emojiTable['94'] = 'サイド';
Tag.emojiTable['179'] = 'レフト';
Tag.emojiTable['166'] = '赤ちゃん';
Tag.emojiTable['45'] = 'ねずみ';
Tag.emojiTable['46'] = 'ペンギン';
Tag.emojiTable['47'] = 'カエル';
Tag.emojiTable['150'] = 'ぶた';
Tag.emojiTable['48'] = 'いぬ';
Tag.emojiTable['116'] = 'ねこ';
Tag.emojiTable['117'] = 'さる';
Tag.emojiTable['147'] = 'ぱんだ';
Tag.emojiTable['49'] = 'にわとり';
Tag.emojiTable['50'] = 'ひよこ';
Tag.emojiTable['139'] = 'アヒル';
Tag.emojiTable['51'] = 'うさぎ';
Tag.emojiTable['160'] = 'うま';
Tag.emojiTable['159'] = 'ひつじ';
Tag.emojiTable['158'] = 'みつばち';
Tag.emojiTable['76'] = 'てんとう虫';
Tag.emojiTable['115'] = 'とんぼ';
Tag.emojiTable['133'] = '魚';
Tag.emojiTable['88'] = '湯呑';
Tag.emojiTable['112'] = 'マグカップ';
Tag.emojiTable['180'] = 'メロンソーダ';
Tag.emojiTable['178'] = '日本酒';
Tag.emojiTable['81'] = 'ビール';
Tag.emojiTable['90'] = 'カクテル';
Tag.emojiTable['98'] = 'ワイン';
Tag.emojiTable['82'] = 'ほ乳瓶';
Tag.emojiTable['61'] = 'いちご';
Tag.emojiTable['78'] = 'りんご';
Tag.emojiTable['79'] = 'さくらんぼ';
Tag.emojiTable['92'] = 'バナナ';
Tag.emojiTable['80'] = 'スイカ';
Tag.emojiTable['62'] = 'おにぎり';
Tag.emojiTable['63'] = 'ごはん';
Tag.emojiTable['119'] = 'カレー';
Tag.emojiTable['152'] = 'サンドイッチ';
Tag.emojiTable['123'] = 'ハンバーガー';
Tag.emojiTable['87'] = 'ショートケーキ';
Tag.emojiTable['65'] = 'ケーキ';
Tag.emojiTable['114'] = '十五夜';
Tag.emojiTable['86'] = 'だんご';
Tag.emojiTable['99'] = '鏡もち';
Tag.emojiTable['177'] = '餅';
Tag.emojiTable['42'] = '食事';
Tag.emojiTable['107'] = 'さくら';
Tag.emojiTable['127'] = 'チューリップ';
Tag.emojiTable['100'] = 'ふたば';
Tag.emojiTable['55'] = '花';
Tag.emojiTable['136'] = 'ハイビスカス';
Tag.emojiTable['134'] = 'るりばな';
Tag.emojiTable['106'] = 'もみじ';
Tag.emojiTable['60'] = 'クローバー';
Tag.emojiTable['146'] = 'きのこ';
Tag.emojiTable['165'] = '花束';
Tag.emojiTable['14'] = '晴';
Tag.emojiTable['15'] = '雨';
Tag.emojiTable['16'] = '曇';
Tag.emojiTable['144'] = '雷';
Tag.emojiTable['17'] = '雪';
Tag.emojiTable['59'] = '月';
Tag.emojiTable['154'] = '流れ星';
Tag.emojiTable['77'] = '虹';
Tag.emojiTable['109'] = '結晶';
Tag.emojiTable['168'] = 'てるてる坊主';
Tag.emojiTable['66'] = '買物';
Tag.emojiTable['151'] = 'リボン';
Tag.emojiTable['145'] = '口紅';
Tag.emojiTable['138'] = 'ハイヒール';
Tag.emojiTable['167'] = '指輪';
Tag.emojiTable['157'] = 'Tシャツ';
Tag.emojiTable['141'] = '王冠';
Tag.emojiTable['156'] = 'ティアラ';
Tag.emojiTable['39'] = '学校';
Tag.emojiTable['40'] = '会社';
Tag.emojiTable['140'] = '病院';
Tag.emojiTable['43'] = '家';
Tag.emojiTable['41'] = '車';
Tag.emojiTable['73'] = 'バス';
Tag.emojiTable['83'] = '電車';
Tag.emojiTable['91'] = '自転車';
Tag.emojiTable['128'] = '飛行機';
Tag.emojiTable['57'] = '携帯';
Tag.emojiTable['35'] = 'メール';
Tag.emojiTable['34'] = 'パソコン';
Tag.emojiTable['118'] = 'CD';
Tag.emojiTable['58'] = 'お金';
Tag.emojiTable['176'] = '祝袋';
Tag.emojiTable['172'] = '大入';
Tag.emojiTable['103'] = '腕時計';
Tag.emojiTable['74'] = '時計';
Tag.emojiTable['84'] = 'カメラ';
Tag.emojiTable['97'] = 'テレビ';
Tag.emojiTable['104'] = '黒電話';
Tag.emojiTable['175'] = '掃除機';
Tag.emojiTable['102'] = 'ポスト';
Tag.emojiTable['121'] = 'サッカーボール';
Tag.emojiTable['129'] = '野球ボール';
Tag.emojiTable['89'] = 'コントローラー';
Tag.emojiTable['113'] = '本';
Tag.emojiTable['101'] = 'マイク';
Tag.emojiTable['126'] = 'クラッカー';
Tag.emojiTable['111'] = 'プレゼント';
Tag.emojiTable['130'] = 'キャンドル';
Tag.emojiTable['96'] = 'うきわ';
Tag.emojiTable['125'] = 'うちわ';
Tag.emojiTable['75'] = '花火';
Tag.emojiTable['161'] = 'ちょうちん';
Tag.emojiTable['44'] = '温泉';
Tag.emojiTable['137'] = 'ハロウィン';
Tag.emojiTable['108'] = 'ツリー';
Tag.emojiTable['110'] = 'サンタブーツ';
Tag.emojiTable['164'] = 'こたつ';
Tag.emojiTable['169'] = '門松';
Tag.emojiTable['170'] = '富士山';
Tag.emojiTable['171'] = '羽根';
Tag.emojiTable['31'] = '初心者';
Tag.emojiTable['32'] = '危険';
Tag.emojiTable['56'] = '旗';
Tag.emojiTable['64'] = 'ロケット';
Tag.emojiTable['52'] = 'うんこ';
Tag.emojiTable['53'] = 'おばけ';
Tag.emojiTable['20'] = 'どくろ';
Tag.emojiTable['105'] = '信号';
Tag.emojiTable['124'] = 'かぎ';
Tag.emojiTable['120'] = 'サイコロ';
Tag.emojiTable['149'] = '鉛筆';
Tag.emojiTable['173'] = '筆';
Tag.emojiTable['153'] = 'はさみ';
Tag.emojiTable['163'] = '地球';
Tag.emojiTable['174'] = 'カプセル';


Tag.EmojiNameTable = new Object();
for (key in Tag.emojiTable) {
	Tag.EmojiNameTable[Tag.emojiTable[key]] = key;
}

//タグの種類
Tag.TYPE_CSS = 0;
Tag.TYPE_DEPRECATED_HTML = 1;
Tag.TYPE_JP = 2;
Tag.getDefaultType = function() { return Tag.TYPE_JP; }

// shortcut
gTagType = Tag.getDefaultType();

// 絵文字のURLパス
Tag.VIEW_EMOJI_PATH = '/blog/image/emoji/';
Tag.MEMBERS_EMOJI_PATH = '/image/emoji/';





/**
 * 改行をタグに変換するときのテキスト
 */
Tag.BR_TEXT  = '<br>' + OEMBlogGlobal.lineSeparator;
Tag.LT_TEXT  = '&lt;';
Tag.GT_TEXT  = '&gt;';
Tag.AMP_TEXT = '&amp;';

/**
 * 検索オプションを指定するための定数
 * 
 * <ul>
 * <li>BackwardSearch - 後方検索</li>
 * <li>AnchoredSearch - 文字列の先頭、または終端のみで一致</li>
 */
Tag.BackwardSearch = 1;
Tag.AnchoredSearch = 1 << 1;


Tag.findCustomTag = function(aText, option, start)
{
	var tag = Tag.findTag(aText, option, start);
	
	return (tag == null || tag.isCustomTag() == false) ? null : tag;
}

/**
 * text の中からタグを検索する。
 * 
 * @param aText 　検索対象の文字列
 * @param option 検索オプション定数を OR したもの
 * @param start　 検索開始位置（オプション）
 * @return 　　　　　Tag オブジェクト
 */
Tag.findTag = function(aText, option, start)
{
	var anchor  = null;    // AnchoredSearch 設定時の開始文字
	var sp      = null;
	
	if (null == aText || 0 == aText.length) {
		return null;
	}
	sp = new StringPointer(aText);
	
	if (start == null) {
		start = (option & Tag.BackwardSearch) ? aText.length -1 : 0;
	}
	
	//
	// Anchor オプションの処理
	// 検索開始位置 == タグ開始位置
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
		// 前方検索なら start が使えるが、
		// 後方検索の場合、改めて検索する必要がある。
		// 面倒なのでどちらの場合でも検索
		idx = aText[fnName](anchor, start);
		
		// 以下のケースに対応
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
	
	// StringPointer の位置をタグの先頭位置にして
	// scanTag() に委譲
	sp.setLocation(idx);
	return this.scanTag(sp);
}

Tag.TAG_NAME_STOP_CHARACTER = "/\"<{:";


/**
 * 空白文字を含まないテキストをスキャン
 * 
 * @param aStrPtr     StringPointer
 * @param stopChars   この文字列に含まれる文字でとまる
 * @param tagStopChar この文字でとまる
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
	// ':' の周囲に空白を許す場合はふたつの readSpaces() の
	// コメントアウトを外してください。
	
	// aStrPtr.readSpaces();
	if (false == aStrPtr.readChar(XBSCType.COLON)) {
		aStrPtr.setLocation(idx);
		return "";
	}
	// aStrPtr.readSpaces();
	return Tag.scanText(aStrPtr, "", tagStopChar);
}

/**
 * タグをスキャン。
 * 
 * @param aStrPtr      タグの先頭位置を指す StringPointer
 * @return Tag オブジェクト、
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
	c = sp.getc();  // 先頭文字
	
	if (null == c) {
		return null;
	}
	
	//
	// <...> タグの場合、閉じタグも考慮する。
	// タグ名とタグの開始文字からカスタムタグかどうかを判別
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
 * 拡張タグかどうか
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
 * HTML 表現の文字列
 */
Tag.prototype.toHTMLString = function()
{
	return this.isCustomTag1() ? this.toHTMLString1() : this.toHTMLString2();
}
Tag.prototype.toHTMLString1 = function()
{
	if (this.isComment && (this.name == "大" || this.name == "特大")) {
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
		// 念のためサニタイジング
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
	
	if (code != null) {	// 絵文字
		text = Tag.buildEmojiImageTag(code, this.isComment);
	} else {	// 画像
		text = this.buildUploadImageTag();
		if (null == text) {
			text = this.source;
		}
	}
	return text;
}

/**
 * インスタンスの説明的な文字列
 */
Tag.prototype.toString = function()
{
	return '[Tag:'+this.name+'] ' + this.value + '\n' + this.source;
}



 
// 絵文字タグ種類
var EMOJI_HTML 		= 0;
var EMOJI_REF_JP	= 1;
var emoji_type = EMOJI_REF_JP;

// アップ画像タグ種類
var UPIMAGE_HTML 		= 0;
var UPIMAGE_REF			= 1;
var upimage_type = UPIMAGE_REF;



// ---------------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------------
/**
 * 絵文字のコード （e.g. '01', '64'） から名前を得る。
 * 
 * @param aCode コード文字列
 */
function getEmojiNameFromCode(aCode)
{
	var code = '';
	var name = '';
	
	if (aCode != null) {
		// 空文字に連結することで無理やり文字列に変換する
		code += aCode;
	}
	name = Tag.emojiTable[aCode];
	if (name == null) {
		name = '';
	}
	return name;
}

/**
 * 絵文字タグ生成
 * 
 * @param code 絵文字 id
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
 * アップロード画像へのパスを含む img タグ文字列を生成
 * 
 * @param filename      ファイル名
 * @param optional_attr 追加属性
 * @param dir           ディレクトリ
 * 
 * @return img タグ文字列
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
		option = (r[1] == '左:') ? 'align="left"' : 'align="right"';
	}
	return Tag.buildUploadImageTag(fileName, option);
}
Tag.prototype.buildUploadImageTag = function()
{
	return Tag.buildUploadImageTagFromText(this.source);
}

