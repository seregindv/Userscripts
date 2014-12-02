// ==UserScript==
// @name           ETime
// @namespace      Maon.Etime
// @description    Etime images
// @include        /^http://(www\.)?(e.+time\.net|x.+man\.ru)/index.php.*$/
// ==/UserScript==

var allLinks = document.getElementsByTagName('a');

for(var i=0; i < allLinks.length; i++) {
	if (allLinks[i].href.match('\\?image'))
	{
			allLinks[i].href = allLinks[i].href.replace(/.+(http.+)/i,'$1');
	}
}