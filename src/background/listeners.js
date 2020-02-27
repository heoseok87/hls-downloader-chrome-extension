import { has } from "ramda";
import { addRequest } from "../modules/requests/action-creators";
import { store } from "../modules/store";
import { changeTab, removeTab } from "../modules/tabs/action-creators";
import { parseFile } from "./Parser";

var callRemote = function(url, cb) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			cb(xhr.responseText);
		}
	}
	xhr.send();
}

var makeName = function(program, ep){
	var result = '';
	var eps = ep.split('-');
	result = program.replace(
			'월화 드라마 ', '').replace(
			'수목 드라마 ', '').trim();
	for (var i = 0; i < eps.length; i++) {
		if(i == 0 && /\d/.test(result)){
			result += "-S01E";
		}else{
			result += "-E";
		}
		result += eps[i].padStart(2, '0');
	}
	return result;
}

var pooqUrl = {};

chrome.webRequest.onCompleted.addListener(
		  async function(req) {
		    if (req.tabId < 0) {
		      return;
		    }
		    console.log(req.url.split("/")[5].split("?")[0]);
		    pooqUrl[req.url.split("/")[5].split("?")[0]] = req.url;
		  },
		  {
		    urls: ["https://apis.pooq.co.kr/vod/contents/*"]
		  },
		  []
		);

chrome.webRequest.onCompleted.addListener(
  async function(req) {
    if (req.tabId < 0) {
      return;
    }
    
    const manifest = await parseFile(req.url);
    if (!has("playlists", manifest)) {
      return;
    }
    
    var program;
    
	if (req.url
				.indexOf('wavve.com') > -1) {
		console.log(pooqUrl);
	    	await callRemote(pooqUrl[req.url.split("/")[5]], function(resp) {
				var json = JSON.parse(resp);
				program = {
					title : json.programtitle,
					ep : json.episodenumber
				};
				console.log(program);
				appendRequest(req, manifest, program);
	    	});
	    return;
	}else if(req.url.indexOf('tving.com') > -1){
		chrome.tabs.sendMessage(req.tabId, {
			url : req.url
		}, null, function(data) {
			program = data;
			console.log(data);
			appendRequest(req, manifest, program);
		});
		return;
	}
	
    appendRequest(req, manifest, program);
  },
  {
    urls: ["http://*/*.m3u8*", "https://*/*.m3u8*"]
  },
  []
);

var appendRequest = function(req, manifest, program){
	chrome.tabs.get(req.tabId, tab => {
	      var current = {"episode_name": tab.title};
	      if(program){
	    	  current = {"episode_name": makeName(program.title, program.ep)};
	      }
	      store.dispatch(addRequest({ ...req, manifest, tab, current }));
	    });
}

chrome.tabs.onActivated.addListener(tab => {
  chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
    tabs[0] && store.dispatch(changeTab(tabs[0]));
  });
});

chrome.windows.onFocusChanged.addListener(windowId => {
  chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
    tabs[0] && store.dispatch(changeTab(tabs[0]));
  });
});
chrome.tabs.onRemoved.addListener(tabId => {
  store.dispatch(removeTab(tabId));
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "loading") {
    store.dispatch(removeTab(tabId));
  }
  chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
    tabs[0] && store.dispatch(changeTab(tabs[0]));
  });
});
