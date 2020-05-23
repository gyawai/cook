/*
 * �N�b�L�[���� JavaScript
 *
 *
 * Copyright (c) 2003 DRECOM CO.,LTD. All rights reserved.
 * 
 * info@drecom.co.jp
 * http://www.drecom.co.jp/
 */
 
/**
 * Cookie�̒l�ݒ�
 */
function setCookie(name,value,expire){
  document.cookie
    = name + '=' + escape(value)
    + ((expire==null)?'; path=/; expires=Thu, 1-Jan-2030 00:00:00 GMT':('; expires='+expire.toGMTString()));
}

/**
 * Cookie �擾�֐�
 */
function getCookie(name){
  var search = name + '=';
  if (document.cookie.length>0) {
    offset = document.cookie.indexOf(search);
    if (offset != -1){
      offset += search.length;
      end     = document.cookie.indexOf(';',offset);
      if(end == -1)
        end = document.cookie.length;
      return unescape(document.cookie.substring(offset,end));
    }
  }
  return null;
}


/**
 * Cookie ����I�u�W�F�N�g
 * 
 * @param aDocument �N�b�L�[���i�[���� document �I�u�W�F�N�g�i�K�{�j
 * @param aName     �N�b�L�[�̖��O�i�K�{�j
 * @param hours     �L�������B�P�ʂ͎��ԁB
 * @param path      path 
 * @param domain    domain
 * @param secure    secure
 * 
 * @author David Flanagan
 * @author http://examples.oreilly.com/jscript3/text/18-1.txt
 */
function Cookie(aDocument, aName, hours, path, domain, secure)
{
	// 2004-04-20  Takanori Ishikawa  
	// ------------------------------------------------------------------------
	// cookie �ɕۑ�����v���p�e�B�Ƌ�ʂ��邽�߁A
	// Cookie �I�u�W�F�N�g�̃v���p�e�B�ɂ� prefix �Ƃ��� '$' ������
	this.$document = aDocument;
	this.$name     = aName;
	
	this.$expiration = hours ? new Date((new Date()).getTime() + hours*3600000) : null;
	this.$path = path ? path : null;
	this.$domain = domain ? domain : null;
	this.$secure = secure ? secure : false;
}

/**
 * �N�b�L�[��ۑ�
 */

Cookie.prototype.store = function()
{
	// First, loop through the properties of the Cookie object and
	// put together the value of the cookie. Since cookies use the
	// equals sign and semicolons as separators, we'll use colons
	// and ampersands for the individual state variables we store 
	// within a single cookie value. Note that we escape the value
	// of each state variable, in case it contains punctuation or other
	// illegal characters.
	var cookieval = "";
	for(var prop in this) {
		// Ignore properties with names that begin with '$' and also methods.
		if ((prop.charAt(0) == '$') || ((typeof this[prop]) == 'function')) 
			continue;
		if (cookieval != "") cookieval += '&';
		cookieval += prop + ':' + escape(this[prop]);
	}

	// Now that we have the value of the cookie, put together the 
	// complete cookie string, which includes the name and the various
	// attributes specified when the Cookie object was created.
	var cookie = this.$name + '=' + cookieval;
	if (this.$expiration)
		cookie += '; expires=' + this.$expiration.toGMTString();
	if (this.$path) cookie += '; path=' + this.$path;
	if (this.$domain) cookie += '; domain=' + this.$domain;
	if (this.$secure) cookie += '; secure';

	// Now store the cookie by setting the magic Document.cookie property.
	this.$document.cookie = cookie;
}

/**
 * �N�b�L�[��ǂݍ���
 */
Cookie.prototype.load = function()
{
	// First, get a list of all cookies that pertain to this document.
	// We do this by reading the magic Document.cookie property.
	var allcookies = this.$document.cookie;
	if (allcookies == "") return false;

	// Now extract just the named cookie from that list.
	var start = allcookies.indexOf(this.$name + '=');
	if (start == -1) return false;   // Cookie not defined for this page.
	start += this.$name.length + 1;  // Skip name and equals sign.
	var end = allcookies.indexOf(';', start);
	if (end == -1) end = allcookies.length;
	var cookieval = allcookies.substring(start, end);

	// Now that we've extracted the value of the named cookie, we've
	// got to break that value down into individual state variable 
	// names and values. The name/value pairs are separated from each
	// other by ampersands, and the individual names and values are
	// separated from each other by colons. We use the split method
	// to parse everything.
	var a = cookieval.split('&');    // Break it into array of name/value pairs.
	for(var i=0; i < a.length; i++)  // Break each pair into an array.
		a[i] = a[i].split(':');

	// Now that we've parsed the cookie value, set all the names and values
	// of the state variables in this Cookie object. Note that we unescape()
	// the property value, because we called escape() when we stored it.
	for(var i = 0; i < a.length; i++) {
		this[a[i][0]] = unescape(a[i][1]);
	}

	// We're done, so return the success code.
	return true;
}

/**
 * �N�b�L�[����菜��
 */
Cookie.prototype.remove = function()
{
	var cookie;
	cookie = this.$name + '=';
	if (this.$path) cookie += '; path=' + this.$path;
	if (this.$domain) cookie += '; domain=' + this.$domain;
	cookie += '; expires=Fri, 02-Jan-1970 00:00:00 GMT';

	this.$document.cookie = cookie;
}

Cookie.prototype.toString = function()
{
	var cookieval = "";
	for(var prop in this) {
		// Ignore properties with names that begin with '$' and also methods.
		if ((prop.charAt(0) == '$') || ((typeof this[prop]) == 'function')) 
			continue;

		cookieval += prop + ':' + (this[prop]) + "\n";
	}
	return cookieval;
}
/**

//===================================================================
//	The code above is the definition of the Cookie class.
//	The code below is a sample use of that class.
//===================================================================

// Create the cookie we'll use to save state for this web page.
// Since we're using the default path, this cookie will be accessible
// to all web pages in the same directory as this file or "below" it.
// Therefore, it should have a name that is unique among those pages.
// Note that we set the expiration to 10 days in the future.
var visitordata = new Cookie(document, "name_color_count_state", 240);

// First, try to read data stored in the cookie. If the cookie is not
// defined, or if it doesn't contain the data we need, then query the
// user for that data.
if (!visitordata.load() || !visitordata.name || !visitordata.color) {
	visitordata.name = prompt("What is your name:", "");
	visitordata.color = prompt("What is your favorite color:", "");
}

// Keep track of how many times this user has visited the page:
if (visitordata.visits == null) visitordata.visits = 0;
visitordata.visits++;

// Store the cookie values, even if they were already stored, so that the 
// expiration date will be reset to 10 days from this most recent visit.
// Also, store them again to save the updated visits state variable.
visitordata.store();

// Now we can use the state variables we read:
document.write('<FONT SIZE=7 COLOR="' + visitordata.color + '">' +
			   'Welcome, ' + visitordata.name + '!' +
			   '</FONT>' +
			   '<P>You have visited ' + visitordata.visits + ' times.');

*/
