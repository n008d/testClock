var app = require('app');  // アプリケーション作成用モジュールをロード
var BrowserWindow = require('browser-window');
var powerSaveBlocker = require('electron').powerSaveBlocker;
var child_process = require('child_process');
var path = require('path');

var BASE_DIR;
if (process.argv[1].match(/\.js$/)) {
	BASE_DIR = path.resolve(path.dirname(process.argv[1]));
} else {
	BASE_DIR = path.resolve(process.argv[1]);
}
console.log('process.argv[1]: ' + process.argv[1]);
console.log('BASE_DIR: ' + BASE_DIR);

//  クラッシュレポート
require('crash-reporter').start();

var mainWindow = null;

// 全てのウィンドウが閉じたらアプリケーションを終了
app.on('window-all-closed', function() {
	app.quit();
});

// アプリケーションの初期化が完了したらメインウィンドウを開く
app.on('ready', function() {
	var mainWindowParam = {
		width: 1000, height: 600,
		kiosk: true,
	};
	mainWindow = new BrowserWindow(mainWindowParam);
	mainWindow.loadUrl('file://' + __dirname + '/index.html');

	// スリープ抑止
	var powerSaveBlockerID = powerSaveBlocker.start('prevent-display-sleep');
	
	// メインウィンドウが閉じられたときの処理
	mainWindow.on('closed', function() {
		if (powerSaveBlockerID) {
			powerSaveBlocker.stop(powerSaveBlockerID);
			powerSaveBlockerID = 0;
		}
		mainWindow = null;
	});
});

//------------------------------------------------------------------------
var DISPLAY_ON = true;
var DISPLAY_OFF = false;
function DisplayOnOff(on) {
	var cmd = 'cd ' + BASE_DIR + ' && node script\\display_on.js ';
	if (on) cmd += 'ON';
	else    cmd += 'OFF';
	
	child_process.exec(cmd, function (err, stdout, stderr) {
		if (err)	     console.log("[err]\n" + err);
		if (stdout)    console.log("[stdout]\n" + stdout);
		if (stderr)     console.log("[stderr]\n" + stderr);
	});
}

// 画面消灯処理
setTimeout(function () {
//	DisplayOnOff(DISPLAY_OFF);

	// スクリーンセーバー起動テスト
	/* Bubbles.scr なら操作で正常に復帰できる
	var cmd = 'start C:\\Windows\\System32\\Bubbles.scr /s';	// scrnsave, Bubbles
	child_process.exec(cmd, function (err, stdout, stderr) {
		if (err)	     console.log("[err]\n" + err);
		if (stdout)    console.log("[stdout]\n" + stdout);
		if (stderr)     console.log("[stderr]\n" + stderr);
	});
	 */

}, 2000);

setTimeout(function () {
	// YOGATABLET2では復帰できない？
//	DisplayOnOff(DISPLAY_ON);
}, 8000);
