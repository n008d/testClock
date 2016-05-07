var app = require('app');  // アプリケーション作成用モジュールをロード
var BrowserWindow = require('browser-window');
var powerSaveBlocker = require('electron').powerSaveBlocker;


//  クラッシュレポート
require('crash-reporter').start();

var mainWindow = null;

// 全てのウィンドウが閉じたらアプリケーションを終了します。
app.on('window-all-closed', function() {
	app.quit();
});

// アプリケーションの初期化が完了したら呼び出されます。
app.on('ready', function() {
	// メインウィンドウを作成します。
	var mainWindowParam = {
		width: 1000, height: 600,
		kiosk: true,
	};
	mainWindow = new BrowserWindow(mainWindowParam);

	// メインウィンドウに表示するURLを指定します。
	mainWindow.loadUrl('file://' + __dirname + '/index.html');

	var powerSaveBlockerID = powerSaveBlocker.start('prevent-display-sleep');
	
	// メインウィンドウが閉じられたときの処理
	mainWindow.on('closed', function() {
		powerSaveBlocker.stop(powerSaveBlockerID);
		mainWindow = null;
	});
});
