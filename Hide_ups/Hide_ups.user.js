// ==UserScript==
// @name        Loveplanet tweaks
// @namespace   Ru.Loveplanet.Tweak
// @include     http://loveplanet.ru/*
// @version     1
// ==/UserScript==

if (document.location.href.indexOf("/a-search/") != -1) {
    //CheckButton();
    document.onkeydown = NavigateThrough;
}
else if (document.location.href.indexOf("/page/") != -1)
    ShowChildren();

function NavigateThrough(event) {
    var eventCode = event.keyCode ? event.keyCode : event.which ? event.which : null;
    var baseAddress, pageNumber;
    if (eventCode != 0x25 && eventCode != 0x27)
        return;
    var reg = /^(.+?)(\d+)\/?$/;
    var hrefTokens = reg.exec(document.location.href);
    if (hrefTokens.length < 3)
        return;
    baseAddress = hrefTokens[1];
    pageNumber = parseInt(hrefTokens[2]);
    switch (eventCode) {
        case 0x25:
            pageNumber--;
            break;
        case 0x27:
            pageNumber++;
            break;
    }
    document.location = baseAddress + pageNumber;
}

function ShowChildren() {
    var myProfile = document.getElementById("me");
    var childrenValue;
    if (myProfile != null) {
        myProfile = myProfile.parentNode.parentNode.parentNode.parentNode.nextSibling.nextSibling;
        var dlTag = myProfile.firstChild.nextSibling;
        while (dlTag) {
            if (dlTag.tagName == "DL") {
                var itemType = dlTag.firstChild;
                // дети. хз почему нельзя просто сравнить
                if (itemType.innerHTML.length == 5)
                    childrenValue = itemType.nextSibling.innerHTML;
            }
            dlTag = dlTag.nextSibling;
        }
    }
    var ups = document.getElementsByTagName("A");
    for (var i = 0; i < ups.length; i++) {
        if (ups[i].className == "nickname fl") {
            ups[i].innerHTML = ups[i].innerHTML + " (" + (childrenValue ? childrenValue.toLowerCase() : "есть") + ")";
            break;
        }
    }
}

///////////////////////////////////////////////////

function ShowUps() {
    SwitchUps(false);
}

function SwitchUps(hideUps) {
    var ups = document.getElementsByTagName("A");
    for (var i = 0; i < ups.length; i++) {
        if (ups[i].href && (ups[i].href == "http://loveplanet.ru/a-uppayment/" || ups[i].href == "http://loveplanet.ru/a-elite/")) {
            var parent = ups[i].parentNode.parentNode;
            if (parent && parent.tagName == "DIV" && parent.className && parent.className.indexOf("biglist_row") != -1) {
                parent.style.display = hideUps ? "none" : "";
                //alert(parent.tagName+" "+parent.className+" "+parent.className.indexOf("biglist_row")+" "+parent.style);
            }
        }
    }
}

function CheckButton() {
    if (document.getElementById("pgn_msg_top_button") == null) {
        SwitchUps(true);
        ShowButton("pgn_msg_top");
        ShowButton("pgn_msg_bottom");
    }
    setTimeout(CheckButton, 250);
}

function ShowButton(elementId) {
    var hideUpsButton = document.createElement("button");
    hideUpsButton.innerHTML = 'Show ups';
    hideUpsButton.id = elementId + "_button";
    hideUpsButton.onclick = ShowUps;
    hideUpsButton.style.display = "none";
    var ins = document.getElementById(elementId);
    ins.parentNode.insertBefore(hideUpsButton, ins);
}