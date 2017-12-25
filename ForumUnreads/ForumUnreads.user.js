// ==UserScript==
// @name        Forum Unreads
// @namespace   Forum.Unreads
// @include     /^https?://(www\.)?ca.ca.s\.net/discover/unread/.*$/
// @version     1
// @grant       none
// ==/UserScript==
// /^https?://(www\.)?ca.ca.s\.net/forums/.*$/

var failCount = 0;

function GetElementByAttribute(doc, tagName, attributeName, attributeValue)
{
  var elements = doc.getElementsByTagName(tagName);
  for(var i = 0; i < elements.length; i++)
  {
    var element = elements[i];
    if(element.getAttribute(attributeName) == attributeValue)
      return element;
  }
  return null;
}

function GetElementByAttributePart(doc, tagName, attributeName, attributeValue)
{
  var elements = doc.getElementsByTagName(tagName);
  for(var i = 0; i < elements.length; i++)
  {
    var element = elements[i];
    if(element.getAttribute(attributeName).indexOf(attributeValue) != -1)
      return element;
  }
  return null;
}

function GetElementCountByAttribute(doc, tagName, attributeName, attributeValue)
{
  var elements = doc.getElementsByTagName(tagName);
  var result = 0;
  for(var i = 0; i < elements.length; i++)
  {
    var element = elements[i];
    if(element.getAttribute(attributeName) == attributeValue)
 	     result++;
  }
  return result;
}

function GetCurrentPage()
{
}

function RunShowMore()
{
  var showMore = GetElementByAttribute(document, 'a', 'data-action', 'loadMore');

  if(showMore == null)
    failCount++;
  else
  {
    failCount = 0;
    showMore.click();
  }
  if(failCount <= 10)
    setTimeout(RunShowMore, 500);
  else
    ShowLinkSummary();
}

function GetLinkCounts()
{
  var elements = document.getElementsByTagName('a');
  var result = {};
  for(var i = 0; i < elements.length; i++)
  {
    var element = elements[i];
    if(element.getAttribute('data-linktype') == "link")
    {
      var text = element.innerHTML;
      var resultItem = result[text];
      if(resultItem == null)
        result[text] = { name: text, link: element.href, count: 1, processed: 0 }
      else
      {
        resultItem.count++;
        //forum bug: only last message has correct id
        //resultItem.link = element.href;
      };
    }
  }
  return result;
}

function compareLinksByCountDescending(a, b) {
  if (a.count < b.count) {
    return 1;
  }
  if (a.count > b.count) {
    return -1;
  }
  return 0;
}

function getP()
{
  return GetElementByAttribute(document, 'span', 'data-role', 'streamTitle');
}

function ShowLinkSummary()
{
  var linkCounts = GetLinkCounts();
  var span = getP();
  if(span != null)
  {
    var linkCountArray = [];
    for(var key in linkCounts)
    {
      var linkCount = linkCounts[key];
      if(linkCount.name.indexOf("General") == -1 &&
         linkCount.name.indexOf("CC Mods") == -1 &&
         linkCount.name.indexOf("Chat") == -1 &&
         linkCount.name != "Freddy" &&
         linkCount.name.indexOf("Home Amateur") == -1 &&
         linkCount.name.indexOf("4shared leaked") == -1 &&
         linkCount.name.indexOf("Sexy And Pretty") == -1 &&
         linkCount.name.indexOf("Girls in Solo") == -1 &&
         linkCount.name.indexOf("Girls Collection") == -1 &&
         linkCount.name.indexOf("Girls Here") == -1 &&
         linkCount.name.indexOf("Tech Issues") == -1 &&
         linkCount.name.indexOf("Archive") == -1 &&
         linkCount.name.indexOf("Post Evolution") == -1 &&
         linkCount.name.indexOf("Everything") == -1 &&
         linkCount.name.indexOf("Funnies") == -1 &&
         linkCount.name.indexOf("Wrestling") == -1 &&
         linkCount.name.indexOf("List of Managers") == -1 &&
         linkCount.name != "The big buffering FAQ" &&
         linkCount.name.indexOf("Hot amature") == -1 &&
         linkCount.name.indexOf("Android") == -1 &&
         linkCount.name.indexOf("des filles" == -1))
      	linkCountArray.push(linkCount);
    }
    linkCountArray.sort(compareLinksByCountDescending)
    for(var i = 0; i < linkCountArray.length; i++)
    {
      var linkCount = linkCountArray[i];
      var div = document.createElement('div');
      div.innerHTML = linkCount.count + 
        ' - <a href="' + linkCount.link +
        '">' + linkCount.name + '</a>';
      span.appendChild(div)
      linkClick(div, linkCount);
    }
  }
}

function linkClick(tag, linkCount)
{
  var request = new XMLHttpRequest();
  request.onreadystatechange = function() { onRequestStateChanged(request, tag, linkCount); };
  request.open("GET", linkCount.link, true);
  request.send(null);
}

function onRequestStateChanged(request, tag, linkCount)
{
  if(request.readyState != 4)
    return;
  if(request.status != 200 && request.status != 0)
    return;
  
  var parser = new DOMParser();
  var doc = parser.parseFromString(request.responseText, "text/html");
  var postCount = GetElementCountByAttribute(doc, 'div','data-role', 'commentContent');
  addImages(tag, doc, linkCount);
  linkCount.processed += postCount;
  if(linkCount.processed >= linkCount.count)
    return;

  var prevLink = GetElementByAttribute(doc, 'a', 'rel', 'prev');
  if(prevLink == null)
    return;
  linkCount.link = prevLink.href;
  linkClick(tag, linkCount);
}

function addImages(tag, doc, linkCount)
{
  var images = doc.getElementsByTagName('img');
	for(var i = 0; i < images.length; i++)
  {
    var image = images[i];
    if(image.className.indexOf("ipsImage") == -1)
      continue;
    
    var div = document.createElement("div");
    div.style.cssText = "margin-bottom: 5px;";
    
    var a = document.createElement("a");
    a.href = linkCount.link;
    
    var img = document.createElement("img");
    img.src = image.src;
    
    a.appendChild(img);
    div.appendChild(a);
    tag.appendChild(div);
  }
}

RunShowMore();
//linkClick(GetElementByAttribute(document, 'h1', 'class', 'ipsType_pageTitle'),
//  { name: "", link: 'https://camcaps.net/forums/topic/10666-anna-alex-bree-drew-lexy-pete/?page=34', count: 50, processed: 0 });
