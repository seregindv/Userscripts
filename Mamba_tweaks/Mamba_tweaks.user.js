// ==UserScript==
// @name         Mamba separate site
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  site over site
// @author       Me
// @match        https://love.mail.ru/search/*
// @grant        none
// ==/UserScript==

function addJQuery(callback) {
  var script = document.createElement("script");
  script.setAttribute("src", "//code.jquery.com/jquery-3.4.1.min.js");
  script.addEventListener('load', function() {
    var script = document.createElement("script");
    script.textContent = "window.$=jQuery.noConflict(true);(" + callback.toString() + ")();";
    document.body.appendChild(script);
  }, false);
  document.body.appendChild(script);
}

function onLoad()
{
  function showData(data) {
    const results = $("#results");
    results.empty();
    for (let item of data.items) {
      const ageRange = /(\d+)\D+?(\d+)/.exec(item.lookForAge);
      if (ageRange != null && parseInt(ageRange[2]) < 41)
        continue;
      results.append(
  `<div style="display: inline-block; max-width: 150px; border: 1px solid lightgray; margin: 5px; border-radius: 10px; overflow: hidden">
      <a href="https://love.mail.ru/${item.login}" target="_blank" rel="noopener noreferrer">
          <img src="${item.photo}" />
          <div style="margin: 5px;">
              <div>${item.name}, ${item.selfAge}</div>
              <div>${item.location}</div>
              <div>${item.photoCounters.total} фото, ${item.lookForAge}</div>
          </div>
      </a>
  </div>`);
      $("#pageCount").html(Math.ceil(data.paging.total / 56.0));
    }
  }

  function loadSearchPage(offset){
    var url = `/api/search?offset=${(offset || 0) * 56}&noid=0&nchanged=0&nactive=0&limit=56&statusNames=geoDistance%2ChasVerifiedPhoto`;
    $.get(url)
    	.done(data => {
      showData(data);
    }).fail(e => {
    });
  }
  
  function navigate(page) {
    let current = parseInt($("#nav-page").val());
    switch(page){
      case 'back':
        current--;
        $("#nav-page").val(current);
        break;
      case 'forward':
        current++;
        $("#nav-page").val(current);
        break;
    }
    loadSearchPage(current);
  }

  $(document).ready(d =>{
        $('body').css('overflow', 'hidden')
            .append(
`<div id="mainOverdiv"
  style='width: calc(100% - 40px); height: calc(100% - 40px); left: 0; top: 0; position: fixed; margin: 20px;
    background-color: white; z-index: 10000; border: 1px solid gray; box-shadow: 0 0 1em gray; border-radius: 10px; display: flex; flex-direction: column'>
<div style="text-align: right; margin-right: 3px; margin-top: 2px">
  <svg width="13" height="13" id="closeButton"
    onmouseover="this.querySelector('circle').removeAttribute('display');"
    onmouseout="this.querySelector('circle').setAttribute('display', 'none');"
    onclick="const element = document.getElementById('mainOverdiv'); element.parentNode.removeChild(element); document.getElementsByTagName('body')[0].style.overflow = 'auto';"
    style="cursor: pointer">
    <circle cx="6" cy="6" r="6" fill="#e0e0e0" display="none" />
    <line x1="3" y1="3" x2="9" y2="9" style="stroke: black; stroke-width: 1" />
    <line x1="3" y1="9" x2="9" y2="3" style="stroke: black; stroke-width: 1" />
  </svg>
</div>
<div id="results" style='background-color: #f0f0f0; overflow: auto; flex-grow: 1'></div>
<div style="text-align: right; margin-right: 3px; margin-bottom: 2px"><a href="#" id="nav-back">&lt;&lt;</a><input id="nav-page" type="number" min="1" max="272" value="1" style="width: 3em" /> of<span style="margin: 0 5px" id="pageCount" /><a href="#" id="nav-forward">&gt;&gt;</a></div>
</div>`);
      $("#nav-back").click(() => navigate('back'));
      $("#nav-forward").click(() => navigate('forward'));
      $("#nav-page").keyup(e => {if(e.key == "Enter") navigate();});
      loadSearchPage();
    });
}

addJQuery(onLoad);