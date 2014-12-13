// ==UserScript==
// @name        Mamba tweaks
// @namespace   Ru.Mamba.Tweaks
// @include     /^http://(www\.)?mamba\.ru/.*$/
// @version     1
// @grant		GM_openInTab
// ==/UserScript==

var hotkeyAddresses = [];
var focusSet = false;

if (document.location.href.indexOf("search.phtml") != -1) {
    //SwitchUps(true);
    document.onkeydown = NavigateThrough;
}
//else if (document.location.href.indexOf("anketa.phtml?oid=") != -1)
ShowChildren();
ShowChildrenExt();

function SwitchUps(hideUps) {
    var ups = document.getElementsByTagName("A");
    for (var i = 0; i < ups.length; i++) {
        if (ups[i].href && ups[i].className.indexOf("MakeUpBuyIconClass") != -1) {
            var parent = ups[i].parentNode.parentNode.parentNode.parentNode.parentNode;
            if (parent && parent.tagName == "LI") {
                parent.style.display = hideUps ? "none" : "";
            }
        }
    }
}

function ShowChildren() {
    var ups = document.getElementsByTagName("meta");
    var children = "есть";
    for (var i = 0; i < ups.length; i++) {
        if (ups[i].getAttribute('name') == 'keywords') {
            var tokens = /есть ли дети:\s*([^;]+)/.exec(ups[i].getAttribute('content'));
            if (tokens && tokens.length >= 2) {
                children = tokens[1].toLowerCase();
                break;
            }
        }
    }
    var nameTags = document.getElementsByTagName("h1");
    for (var i = 0; i < nameTags.length; i++) {
        if (nameTags[i].className.indexOf("infoName dib") != -1) {
            nameTags[i].innerHTML = nameTags[i].innerHTML + " (" + children + ")";
            break;
        }
    }
}

function NavigateThrough(event) {
	if(!focusSet) {
		//var loginBox = document.getElementById("inputLogin");
		var loginBox = document.activeElement;
		loginBox.blur();
		focusSet = true;
	}
    var eventCode = event.keyCode ? event.keyCode : event.which ? event.which : null;
	if (eventCode >= 96 && eventCode <= 105) {
		var index = eventCode - 96;
		if (hotkeyAddresses[index]) {
			GM_openInTab(hotkeyAddresses[index]);
		}
	}
    if (eventCode == 0x25 || eventCode == 0x27)
	{
		var offsetNumber;
		var reg = /^(.+offset\=)(\d+)(.*)$/;
		var hrefTokens = reg.exec(document.location.href);
		if (hrefTokens.length < 4)
			return;
		offsetNumber = parseInt(hrefTokens[2]);
		switch (eventCode) {
			case 0x25:
				offsetNumber -= 10;
				break;
			case 0x27:
				offsetNumber += 10;
				break;
		}
		document.location = hrefTokens[1] + offsetNumber + hrefTokens[3];
	}
}

function ShowChildrenExt() {
	var linkTags = document.getElementsByTagName("a");
	var index = 0;
    for (var i = 0; i < linkTags.length; i++) {
		if(linkTags[i].getAttribute('class') == 'u-name') {
			index++;
			//linkTags[i].innerHTML = linkTags[i].innerHTML + ' ' + linkTags[i].getAttribute('href');
			send_with_ajax(linkTags[i].getAttribute('href'), index);
		}
	}
}

function send_with_ajax( the_url, index ){
	if(the_url.indexOf("http://") == -1)
		return;
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() { alertContents(httpRequest, the_url, index); };  
    httpRequest.open("GET", the_url, true);
    httpRequest.send(null);
}

function alertContents(httpRequest, the_url, index){
    if (httpRequest.readyState == 4){
        // everything is good, the response is received
        if ((httpRequest.status == 200) || (httpRequest.status == 0)){
            var tokens = /есть ли дети:\s*([^;"]+)/.exec(httpRequest.responseText);
			var children = "есть";
            if (tokens && tokens.length >= 2) {
                children = tokens[1].toLowerCase();
            }
			var photoLinkTokens = /a href="(http:\/\/www\.mamba\.ru\/\w{2}\/mb\d+\/album_photos[^"]+)/.exec(httpRequest.responseText);
			var photolinksFound = photoLinkTokens && photoLinkTokens.length >= 2;
			var noAlcohol = httpRequest.responseText.indexOf("Не пью вообще") != -1;
			var linkTags = document.getElementsByTagName("a");
			for (var i = 0; i < linkTags.length; i++) {
				if(linkTags[i].getAttribute('class') == 'u-name' && linkTags[i].getAttribute('href') == the_url) {
					var indexHtml;
					if(index > 10) {
						indexHtml = "";
					} else {
						if(index == 10)
							index = 0;
						indexHtml = "<font color=\"green\" size=\"6\"><b>" + index + "</b></font> ";
						hotkeyAddresses[index] = photolinksFound ? photoLinkTokens[1] : the_url;
					}
					linkTags[i].parentNode.innerHTML = indexHtml + linkTags[i].parentNode.innerHTML + ' ' + children;
					var divPicNode = linkTags[i].parentNode.parentNode.previousSibling.previousSibling;
					if(children.indexOf("есть") != -1 || noAlcohol) {
						// DIV u-m-photo u-photo
						divPicNode.style = "opacity: 0.1;";
						divPicNode.setAttribute("onMouseOver", "this.style.opacity = 1");
						divPicNode.setAttribute("onMouseOut", "this.style.opacity = .1");
					}
					if(photolinksFound) {
						var picRefPhotoNodes = divPicNode.getElementsByTagName("a");
						//console.log("picRefPhotoNodes " + picRefPhotoNodes[0].href);
						//console.log(" -> " + photoLinkTokens[1]);
						if(picRefPhotoNodes.length >= 1) {
							picRefPhotoNodes[0].href = photoLinkTokens[1];
						}
					}
				}
			}
        }else{
            //alert('There was a problem with the request. ' + httpRequest.status + httpRequest.responseText);
        }
    }
}
