// ==UserScript== 
// @name dofiga.net thumb linker 
// @namespace spat72 
// @description changes default image link to a direct image link 
// @include /^http://(www\.)?dofiga\.net/\?post=\d+$/ 
// ==/UserScript==

var allLinks = document.getElementsByTagName('a')

for(var i=0; i < allLinks.length; i++) { 
	if (allLinks[i].href.match('/?image')) { 
		allLinks[i].href = allLinks[i].href.replace('/?image=','/images/news/'+ 
			location.href.replace(/.*?(\d+)+/, "000000$1").substr(-7)+'/'); 
		allLinks[i].href = allLinks[i].href += '.jpg';
		allLinks[i].onclick = null;
	}
}