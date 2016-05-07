var ffi = require('ffi');

//------------------------------------------------------
// for SendInput
var ref = require ('ref');
var struct = require ('ref-struct');

var MouseInput = struct ({
    'type': 'int',
    'dx': 'long',
    'dy': 'long',
    'mouseData': 'int',
    'dwFlags': 'int',
    'time': 'int',
    'dwExtraInfo': 'int'
});
var MouseInputPtr = ref.refType(MouseInput);
var mouseInput = new MouseInput();
mouseInput.type = 3;
mouseInput.dx = 1;
mouseInput.dy = 1;
mouseInput.dwFlags = 0x0001;
mouseInput.mouseData = 0;
mouseInput.time = 0;
mouseInput.dwExtraInfo = 0;
//------------------------------------------------------
var User32 = ffi.Library('User32', {
	'PostMessageA': ['uint32', ['uint32', 'uint32', 'int', 'int']],
	'SendInput': [ 'int', [ 'uint', MouseInputPtr, 'int' ] ],
	'MessageBoxA': ['int', ['int', 'string', 'string', 'int']],
});

var HWND_BROADCAST = 0xFFFF;
var WM_SYSCOMMAND = 0x0112;
var SC_MONITORPOWER = 0xF170;

var DISPLAY_ON = -1;
var DISPLAY_OFF = 2;

function DisplayOff()
{
	console.log("DisplayOff");
	// User32.MessageBoxA(0,"text","title", 0);
	User32.PostMessageA(HWND_BROADCAST,
		WM_SYSCOMMAND, SC_MONITORPOWER, DISPLAY_OFF);
}

function DisplayOn()
{
	console.log("DisplayOn");
	User32.PostMessageA(HWND_BROADCAST,
		WM_SYSCOMMAND, SC_MONITORPOWER, DISPLAY_ON);
		
	var arch = require('os').arch();
	var r = User32.SendInput (1, mouseInput.ref() , arch === 'x64' ? 40 : 28);
	console.log(r);
}

DisplayOff();

setTimeout(function () {
	DisplayOn();
}, 3000);

setTimeout(function () {
	// DisplayOn();
}, 5000);
