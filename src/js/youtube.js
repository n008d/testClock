
var searchQuerys = [
	// query, ignore title, ignore desc, ignore video id
	[	"秋山殿",	// query string
		[	// ignore title
			"富士総火演",
			 "ガソリンスタンド",
			 "本物の戦車に乗る",
			 "開封",
			 "COD",
			 "実況",
			 "パチンコ", "スロット",
			 "WOT",  "World of Tanks",
			 "自衛隊",
			 "フューリー",
			 "妊娠",
		],
		[	// ignore desc
			"パーソナリティ",
			"引用元",
		],
		[	// ignore video id
		],
	],

	[	"ゆゆ式",	// query string
		[	// ignore title
			"聖地巡礼",
			"弾いてみた",
		],
		[	// ignore desc
			"パーソナリティ",
			"引用元",
		],
		[	// ignore video id
		],
	],
];
var videoIdList = [
	
];

//--------------------------------------------------------------------
// youtube
function getYoutubeQuery()
{
	var idx = Math.floor (Math.random () * searchQuerys.length);
	var query = searchQuerys[idx];
	return query;
}

var player;
function onYouTubePlayerAPIReady() {
	player = new YT.Player('player', {
		height: 480*0.5,
		width: 854*0.5,
//		videoId: 'XofJrPcCtSQ',	// とりあえず秋山殿
		playerVars: {
			'rel': 0,
			'controls': 0,
			'autoplay': 1,
			'showinfo': 0,
			'loop': 0 
		},
		events: {
			'onReady': onPlayerReady,
			'onStateChange':onPlayerStateChange,
		}
	});
}

function onPlayerReady(event) {
	console.log('onPlayerReady', event);
//	event.target.mute();
	startSearchYoutube(getYoutubeQuery());
}

function onPlayerStateChange(event) {
	console.log('onPlayerStateChange', player.getPlayerState(), event, player);
	if (player.getPlayerState() == YT.PlayerState.ENDED) {
//		startSearchYoutube(getYoutubeQuery());

		console.log("ENDED", player.getVideoData());
		if (0 < videoIdList.length) {
			player.cueVideoById(videoIdList[0]);
			videoIdList.shift();
		} else {
			startSearchYoutube(getYoutubeQuery());
		}

	} else if (player.getPlayerState() == YT.PlayerState.CUED) {
		player.playVideo();
		console.log("PLAY: ", player.getVideoData());
	}
}

var API_KEY='AIzaSyCwHpQkimDe9v6EtvwRIhhB8DwDDuFGSjQ';
var YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/';
function startSearchYoutube(queryArray)
{
	var query = queryArray[0];
	var ignore_title = queryArray[1];
	var ignore_desc = queryArray[2];
	var ignore_video_id = queryArray[3];
	
	console.log("startSearchYoutube", query);
	var url = YOUTUBE_API_URL + 'search';
	var data = {
		part:'snippet',
		order:'relevance',
		q:query,
		type:'video',
		regionCode:'JP',
		maxResults:50,
		key:API_KEY,
	};
	var dataText = '';
	for (var key in data) {
		var value = encodeURIComponent(data[key]);
		if (0 < dataText.length) dataText += '&';
		dataText += key + '=' + value;
	}
	
	$.ajax({
		type:"get",                // method
		url:url,
		data:dataText,
		contentType: 'application/json', // リクエストの Content-Type
		dataType: "json",           // レスポンスをJSONとしてパースする
		success: finishedSearchYoutube,	 // 200 OK時
		error: function() {         // HTTPエラー時
			console.log("Server Error. Pleasy try again later.");
		},
		complete: function() {      // 成功・失敗に関わらず通信が終了した際の処理
			console.log('startSearchYoutube complete.');
		}
	});

	function finishedSearchYoutube(json_data)
	{
		// JSON Arrayの先頭が成功フラグ、失敗の場合2番目がエラーメッセージ
		// console.log(json_data);
		var results = json_data.items;

		if (!results) {    // サーバが失敗を返した場合
			console.log("Transaction error. " + json_data[1]);
			return;
		}
		// 成功時処理
		// console.log(results);
		
		// 順番シャッフル
		var shuffle = function() {return Math.random()-.5};
		results.sort(shuffle);
		
		// 有効なのをpush
		var playlist = [];
		for (var i=0; i<results.length; ++i) {
			var item = results[i];
			var video_id = item.id.videoId;
			var title = item.snippet.title;
			var desc= item.snippet.description;
	
			var skip = false;

			// 無視タイトルチェック
			for (var j=0; j<ignore_title.length; ++j) {
				if (0 <= title.indexOf(ignore_title[j])) {
					skip = true;
					break;
				}
			}
			if (skip) continue;
			// 無視詳細チェック
			for (var j=0; j<ignore_desc.length; ++j) {
				if (0 <=desc.indexOf(ignore_desc[j])) {
					skip = true;
					break;
				}
			}
			if (skip) continue;
			// 無視Video IDチェック
			for (var j=0; j<ignore_video_id.length; ++j) {
				if (video_id == ignore_video_id[j]) {
					skip = true;
					break;
				}
			}
			if (skip) continue;

			console.log(">>>>", video_id, title, desc, item);
			playlist.push(video_id);
		}

		// テスト用短いだけの動画
		//; playlist = ['KfiRi-7SwtM', 'n0W5ecXrakY', ];

		for (var i=0; i<playlist.length; ++i) {
			videoIdList.push(playlist[i]);
		}

		console.log('cuePlaylist');
		player.cueVideoById(videoIdList[0]);
		videoIdList.shift();
	}
}