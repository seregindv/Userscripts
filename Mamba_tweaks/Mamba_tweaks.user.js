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
} else {
    document.onkeydown = ProfileNavigate;
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

function BlurFocus() {
    if (!focusSet) {
        //var loginBox = document.getElementById("inputLogin");
        var loginBox = document.activeElement;
        loginBox.blur();
        focusSet = true;
    }
}

function ProfileNavigate(event) {
    BlurFocus();
    var eventCode = event.keyCode ? event.keyCode : event.which ? event.which : null;
    /*
	// del (not working)
	if(eventCode == 46)
	{
		window.close();
	}*/
    // /
    if (eventCode == 106) {
        var refs = document.getElementsByTagName("a");
        for (var ref in refs) {
            if (refs[ref].className.indexOf("big ot-photo") != -1) {
                refs[ref].click();
                break;
            }
        }
    }
    // *
    if (eventCode == 111) {
        var profileRefs = document.getElementsByTagName("a");
        for (var profileRef in profileRefs) {
            if (profileRefs[profileRef].className == "sel-anketa-nav-anketa") {
                profileRefs[profileRef].click();
                break;
            }
        }
    }
}

function NavigateThrough(event) {
    BlurFocus();
    var eventCode = event.keyCode ? event.keyCode : event.which ? event.which : null;
    if (eventCode >= 96 && eventCode <= 105) {
        var index = eventCode - 96;
        if (hotkeyAddresses[index]) {
            GM_openInTab(hotkeyAddresses[index]);
        }
    }
    if (eventCode == 0x25 || eventCode == 0x27) {
        var offsetNumber;
        var reg = /^(.+offset\=)(\d+)(.*)$/;
        var hrefTokens = reg.exec(document.location.href);
        if (hrefTokens.length < 4)
            return;
        offsetNumber = parseInt(hrefTokens[2]);
        switch (eventCode) {
            case 0x25:
                offsetNumber -= 24;
                break;
            case 0x27:
                offsetNumber += 24;
                break;
        }
        document.location = hrefTokens[1] + offsetNumber + hrefTokens[3];
    }
}

function ShowChildrenExt() {
    var linkTags = document.getElementsByTagName("a");
    var index = 0;
	var idRegEx = /\/(\d{10,})\//;
    for (var i = 0; i < linkTags.length; i++) {
        if (linkTags[i].getAttribute('class') == 'img-responsive') {
			var imgElement = linkTags[i].getElementsByTagName('img')[0];
			var imgSrc = imgElement.getAttribute('src');
			var idTokens = idRegEx.exec(imgSrc);
			if(idTokens && idTokens.length >=2) {
				var ref = 'http://www.mamba.ru/ru/mb' + idTokens[1];
				//console.log('imgSrc', imgSrc);
				//console.log('ref', ref);
				send_with_ajax(imgSrc, ref, index);
				index++;
			}
        }
    }
}

function send_with_ajax(imgUrl, requestUrl, index) {
    if (requestUrl.indexOf("http://") == -1)
        return;
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function () { alertContents(httpRequest, imgUrl, requestUrl, index); };
    httpRequest.open("GET", requestUrl, true);
    httpRequest.send(null);
}

function alertContents(httpRequest, imgUrl, requestUrl, index) {
    if (httpRequest.readyState == 4) {
        // everything is good, the response is received
        if ((httpRequest.status == 200) || (httpRequest.status == 0)) {
			//console.log('imgUrl', imgUrl)
			//console.log('requestUrl', requestUrl)
            var tokens = /есть ли дети:\s*([^;"]+)/.exec(httpRequest.responseText);
            var children = "есть";
            if (tokens && tokens.length >= 2) {
                children = tokens[1].toLowerCase();
            }
			//console.log('children', children);
            var photoLinkTokens = /a href="(http:\/\/www\.mamba\.ru\/\w{2}\/.+?\/album_photos[^"]+)/.exec(httpRequest.responseText);
            var photolinksFound = photoLinkTokens && photoLinkTokens.length >= 2;
            var noAlcohol = httpRequest.responseText.indexOf("Не пью вообще") != -1;
            var heightTokens = />(\d+)\s*см</.exec(httpRequest.responseText);
            var height = "";
            if (heightTokens && heightTokens.length >= 2) {
                height = heightTokens[1];
            }
            var weightTokens = />(\d+)\s*кг</.exec(httpRequest.responseText);
            var weight = "";
            if (weightTokens && weightTokens.length >= 2) {
                weight = weightTokens[1];
            }
            var heightWeight = "";
            if (height != "" || weight != "") {
                heightWeight = " " + height;
                if (weight != "") {
                    heightWeight = heightWeight + "/" + weight;
                }
            }
            //console.log('height', height)
			//console.log('weight', weight);
            var imgTags = document.getElementsByTagName("img");
            for (var i = 0; i < imgTags.length; i++) {
                if (imgTags[i].getAttribute('class') == 'hide' && imgTags[i].getAttribute('src') == imgUrl) {
                    var indexHtml;
                    if (index > 10) {
                        indexHtml = "";
                    } else {
                        if (index == 10)
                            index = 0;
                        indexHtml = "<font color=\"green\" size=\"6\"><b>" + index + "</b></font> ";
                        hotkeyAddresses[index] = photolinksFound ? photoLinkTokens[1] : requestUrl;
                    }
                    //imgTags[i].parentNode.innerHTML = indexHtml + imgTags[i].parentNode.innerHTML + ' ' + children;
                    var divPicNode = imgTags[i].parentNode.parentNode;
                    if (children.indexOf("есть") != -1 || noAlcohol) {
                        // DIV u-m-photo u-photo
                        divPicNode.style = "opacity: 0.1;";
                        divPicNode.setAttribute("onMouseOver", "this.style.opacity = 1");
                        divPicNode.setAttribute("onMouseOut", "this.style.opacity = .1");
                    } else {
                        /*var imgs = divPicNode.getElementsByTagName("img");
                        if (imgs.length > 0) {
                            var saInfoElement = imgTags[i].parentNode.parentNode;
                            var nameElements = document.evaluate(".//a[@class='u-name']", saInfoElement, null, XPathResult.ANY_TYPE, null);
                            var nameElement = nameElements.iterateNext();
                            var name = nameElement.textContent;
                            var link = nameElement.getAttribute("href");
                            var ageElements = document.evaluate("./following-sibling::b", nameElement, null, XPathResult.ANY_TYPE, null);
                            var ageElement = ageElements.iterateNext();
                            var age = "";
                            if (ageElement != null)
                                age = ageElement.textContent;
                            var address = saInfoElement.getElementsByTagName("address")[0].textContent;
                            var addressTokens = /Россия, (.+)/.exec(address);
                            if (addressTokens && addressTokens.length >= 2) {
                                address = addressTokens[1];
                            }
                            addressTokens = /Москва, (м\.\s*.+)/.exec(address);
                            if (addressTokens && addressTokens.length >= 2) {
                                address = addressTokens[1];
                            }
                            var lookingForElements = saInfoElement.getElementsByClassName("s-param");
                            var lookingFor = "";
                            if (lookingForElements.length > 0) {
                                lookingFor = lookingForElements[0].textContent;
                                // not sure why it's not working
                                //lookingFor.replace("Ищу ", "");
                                if (lookingFor.substring(0, 4) == "Ищу ") {
                                    lookingFor = lookingFor.substring(4, lookingFor.length);
                                }
                            }
                            // <li class="U-Normal UT-Normal ">
                            var profileRoot = saInfoElement.parentNode.parentNode;
                            var photoCountElements = profileRoot.getElementsByClassName("vp-count");
                            var photoCount = "";
                            if (photoCountElements.length > 0) {
                                photoCount = photoCountElements[0].textContent;
                            }
                            // 
                            var ribbon = GetRibbon();
                            var ribbonItem = document.createElement("table");
                            ribbonItem.style = 'display: inline-block; width: auto; margin-right: 3px';
                            //console.log("<tr><td>" + "<a href='" + link + "'>" + imgs[0].outerHTML + "</a></td></tr><tr><td><font color=\"green\" size=\"3\"><b>" + index + "</b></font> " + "<a href='" + link + "'>" + name + "</a>" + ", <b>" + age + "</b><br>" + address + "<br>" + lookingFor + "<div style='color: #F60'>" + photoCount + "</div>" + "</td></tr>");
                            ribbonItem.innerHTML = "<tr><td>" + imgs[0].outerHTML + "</td></tr><tr><td><font color=\"green\" size=\"3\"><b>" + index
                                + "</b></font> <span style=\"color: #06C\">" + name + "</span>, <b>" + age + "</b><br>" + address + "<br>" + lookingFor + "<table><tr><td style='color: #F60'>" + photoCount + "</td><td style=\"padding-right: 5px\" align=\"right\">" + heightWeight + "</td></tr></table></td></tr>";
                            ribbon.appendChild(ribbonItem);
                        }*/
                    }
                    if (photolinksFound) {
                        var picRefPhotoNodes = divPicNode.getElementsByTagName("a");
                        //console.log("picRefPhotoNodes " + picRefPhotoNodes[0].href);
                        //console.log(" -> " + photoLinkTokens[1]);
                        if (picRefPhotoNodes.length >= 1) {
                            picRefPhotoNodes[0].href = photoLinkTokens[1];
                        }
                    }
                }
            }
        } else {
            //alert('There was a problem with the request. ' + httpRequest.status + httpRequest.responseText);
        }
    }
}

function GetRibbon() {
    var ribbon = document.getElementById("ProfileRibbon");
    if (ribbon == null) {
        var divs = document.getElementsByTagName("div");
        for (div in divs) {
            var ribbonDiv = divs[div];
            if (ribbonDiv.className == "MainBlockRightSearch") {
                var ribbon = document.createElement("div");
                ribbon.id = "ProfileRibbon";
                ribbonDiv.insertBefore(ribbon, ribbonDiv.firstChild);
                break;
            }
        }
    }
    return ribbon;
}