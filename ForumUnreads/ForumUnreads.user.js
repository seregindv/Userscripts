// ==UserScript==
// @name        Forum Unreads
// @namespace   Forum.Unreads
// @include     /^https?://(www\.)?ca.ca.s\.net/discover/.*$/
// @version     1
// @grant       none
// ==/UserScript==
// /^https?://(www\.)?ca.ca.s\.net/(forums|discover)/.*$/

var failCount = 0;
var stopRequested = false;
var imageSet;

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

function RunShowMore()
{
  if(stopRequested)
    return;
  
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
  if (a.name.indexOf('Video') != -1) {
    return -1;
  }
  if (b.name.indexOf('Video') != -1) {
    return 1;
  }
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
  imageSet = new Set();
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
         linkCount.name.indexOf("Amateur") == -1 &&
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
         linkCount.name != "Sam & Fin" &&
         linkCount.name.indexOf("Hot amature") == -1 &&
         linkCount.name.indexOf("Android") == -1 &&
         linkCount.name.indexOf("anus des") == -1 &&
         linkCount.name.indexOf("Celeb") == -1 &&
         linkCount.name.indexOf("Webcam") == -1 &&
         linkCount.name.indexOf("Exhibitionism") == -1 &&
         linkCount.name.indexOf("Nudism") == -1 &&
         linkCount.name.indexOf("★★★") == -1 &&
         linkCount.name.indexOf("Webcam") == -1)
       	linkCountArray.push(linkCount);
    }
    linkCountArray.sort(compareLinksByCountDescending)
    
    var mainDiv = span.getElementsByTagName('div')[0];
    if(mainDiv){
      span.removeChild(mainDiv);
    }
    mainDiv = document.createElement('div');
    span.appendChild(mainDiv);
    
    for(var i = 0; i < linkCountArray.length; i++)
    {
      var linkCount = linkCountArray[i];
      var div = document.createElement('div');
      div.innerHTML = linkCount.count + 
        ' - <a href="' + linkCount.link +
        '" target="_blank">' + linkCount.name + '</a>';
      mainDiv.appendChild(div)
      if (linkCount.name.indexOf('Video') == -1) {
				linkClick(div, linkCount);
      }
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
    var imageSource = image.getAttribute('data-src');
    if(imageSet.has(imageSource))
      continue;
    imageSet.add(imageSource);
    if(image.className.indexOf("ipsImage") == -1)
      continue;
    
    var div = document.createElement("div");
    div.style.cssText = "margin-bottom: 5px;";
    
    var a = document.createElement("a");
    a.href = linkCount.link;
    a.target = '_blank';
    
    var img = document.createElement("img");
    img.src = imageSource;
    
    a.appendChild(img);
    div.appendChild(a);
    tag.appendChild(div);
  }
}

function AddStop()
{
  var span = GetElementByAttribute(document, 'div', 'id', 'ipsLayout_header');

  var stop = document.createElement("BUTTON");
  stop.onclick = function() { stopRequested = true; }
  var t = document.createTextNode("Stop");
  stop.appendChild(t);
  span.appendChild(stop);
  
  var showMore = document.createElement("BUTTON");
  showMore.onclick = function() { stopRequested = false; RunShowMore(); }
  t = document.createTextNode("Continue");
  showMore.appendChild(t);
  span.appendChild(showMore);

  var showLinks = document.createElement("BUTTON");
  showLinks.onclick = function() { stopRequested = true; ShowLinkSummary(); }
  t = document.createTextNode("Show");
  showLinks.appendChild(t);
  span.appendChild(showLinks);
}

AddStop();
RunShowMore();