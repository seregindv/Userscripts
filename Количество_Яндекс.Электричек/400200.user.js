// ==UserScript==
// @name       Количество Яндекс.Электричек
// @namespace  http://rasp.yandex.ru/
// @version    0.2
// @description  показывает количество поездов и интервалы
// @include    /^(https?:\/\/)?(www\.)?rasp\.yandex\.ru\/search.+$/
// ==/UserScript==

function FormatInt(i) {
	var result = i.toString();
	if(i < 10)
		result = '0' + result;
	return result;
}

function getTrainCount() {
    var trains = document.getElementsByTagName('tr');
    var i, result = 0, prevTrainDate = null;
	var offset = new Date().getTimezoneOffset();
	var spanReplaces = [], spanCount = 0;
    for(i in trains) {
        if((' '+trains[i].className+' ').indexOf('b-timetable__row') > -1)
		{
			if(trains[i].onclick == null)
				continue;
			var onclickText = trains[i].onclick();
			var trainDate;
			try {
				trainDate = new Date(onclickText['b-timetable__row']['stabilizers'][0].replace(' ', 'T'));
			}
			catch(err) {
				continue;
			}
			if(prevTrainDate != null) {
				var dateDiff = new Date(trainDate - prevTrainDate + offset * 60000);
				var spans = trains[i].getElementsByTagName('span');
				for(var j in spans) {
					if((' '+spans[j].className+' ').indexOf('b-timetable__time') > -1) {
						var hours = dateDiff.getHours();
						var minutes = dateDiff.getMinutes();
						var color = 'lightgray';
						if(hours > 0 || minutes > 49)
							color = 'red';
						else if(hours == 0 && minutes > 25)
						    color = 'lightgreen';
						spanReplaces[spanCount++] = { span: spans[j], html: '<table width=100% border=0 cellpadding=0 cellspacing=0><tr><td>' + spans[j].innerHTML + '</td><td align="right"><font color="' + color + '">' + FormatInt(hours) + ':' + FormatInt(minutes) + '</font></td></tr></table>' };
					break;
					}
				}
			}
			prevTrainDate = trainDate;
            result++;
		}
    }
    for (var replace in spanReplaces) {
        spanReplaces[replace].span.innerHTML = spanReplaces[replace].html;
	}
    return result;
}

var headers = document.getElementsByTagName('h1');
var i, result = 0;
for(i in headers) {
    if((' '+headers[i].className+' ').indexOf('b-page-title__title') > -1) {
        headers[i].innerHTML = headers[i].innerHTML + ' (<font color="blue">' + getTrainCount() + ' шт</font>)';
        break;
    }
}
