chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	if (msg.url.indexOf('oksusu.com') > -1) {
		var info = $('.vod_inner .vod_title #title')[0].innerText;
		var title = info.substring(0, info.indexOf('('));
		var ep = info.substring(info.indexOf('(') + 1, info.indexOf(')'))
				.replace('회', '');
		sendResponse({
			"title" : title,
			"ep" : ep
		});
	} else if (msg.url.indexOf('jtbcvod.fvod') > -1) {
		var info = $('.v_player_con ._ga-event').attr('data-ga-lbl');
		console.log(info);
		var title = info.substring(0, info.lastIndexOf(' '));
		var ep = info.substring(info.lastIndexOf(' ') + 1, info.length);
		console.log(title);
		console.log(ep);
		sendResponse({
			"title" : title,
			"ep" : ep
		});
	} else if (msg.url.indexOf('tving.com') > -1) {
		var titleSpan = $('div.cjp__ui-hover-hide-block>div>span')[0];
		var info = $('title')[0].text.split('|')[0].trim();
		var title = info.substring(0, info.lastIndexOf(' '));
		var ep = info.substring(info.lastIndexOf(' ') + 1, info.length)
				.replace('화', '');
		var subject = null;
		
		if(titleSpan){
			var spanText = titleSpan.innerText;
			title = spanText.substring(0, spanText.lastIndexOf(' '));
			ep = spanText.substring(spanText.lastIndexOf(' ') + 1, spanText.length)
					.replace('화', '');
			subject = info;
		}
		
		
		console.log(title);
		console.log(ep);
		sendResponse({
			"title" : title,
			"ep" : ep,
			"subject": subject
		});
	}
});