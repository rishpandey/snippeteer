const path = require('path')
const url = require('url')

// Module to control application
const electron = require('electron')
const { app, BrowserWindow,  globalShortcut, ipcMain} = electron

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, getWindow

// nedb
var Datastore = require('nedb')
	, db = new Datastore({ filename: 'snips.json', autoload: true });
var dataset = [];
var FuzzySearch = require('fuzzy-search');
var searcher = null;

// setup everything
function createWindow () {
	app.dock.hide();

	// Create the browser window.
	mainWindow = new BrowserWindow({width: 400, height: 300})
	mainWindow.minimize();  

	loadData();


	// and load the index.html of the app.
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'index.html'),
		protocol: 'file:',
		slashes: true
	}));

	// Open the DevTools.
	// mainWindow.webContents.openDevTools()

	// Emitted when the window is closed.
	// 
	mainWindow.on('closed', function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null
	})

	// Register shortcut
	
	var addShortcut = 'CommandOrControl+Shift+Plus';
	var searchShortcut = 'CommandOrControl+Alt+Tab';

	const addSnippet = globalShortcut.register(addShortcut, () => {

		addWindow = new BrowserWindow({width: 500, height: 400, frame: false})

		addWindow.loadURL(url.format({
			pathname: path.join(__dirname, 'add-snippet.html'),
			protocol: 'file:',
			slashes: true
		}));

		// addWindow.webContents.openDevTools();


	})


	const getSnippet = globalShortcut.register(searchShortcut, () => {

		getWindow = new BrowserWindow({width: 650, height: 50, frame: false})
		position = getWindow.getPosition();
		getWindow.setPosition(position[0], position[1]-120);
		getWindow.loadURL(url.format({
			pathname: path.join(__dirname, 'get-snippet.html'),
			protocol: 'file:',
			slashes: true
		}));
		
		// getWindow.webContents.openDevTools();


		getWindow.setAlwaysOnTop(true, "floating");
		getWindow.setVisibleOnAllWorkspaces(true);
		getWindow.setFullScreenable(false);
	})
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

app.on('will-quit', () => {
		// Unregister a shortcut.
		globalShortcut.unregister('CommandOrControl+X')

		// Unregister all shortcuts.
		globalShortcut.unregisterAll()

})

// Quit when all windows are closed.
app.on('window-all-closed', function () {

	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q

	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', function () {
	// On OS X it's common to re-create closed mainWindow dock icon is clicked
	if (mainWindow === null) {
		createWindow()
	}
})

// IPC Handlers

ipcMain.on('add-snippet', function(event, text){
	
	addSnipToDb(text);
	loadData();

})  


ipcMain.on('get-snippet', function(event, id){

	electron.Menu.sendActionToFirstResponder('hide:');
	getWindow.close(); 
	const robot = require('robotjs');
	
	db.findOne({ _id: id }, function (err, docs) {

		if(docs){     
				robot.typeString(docs.snippet);
		}
	});
})


ipcMain.on('suggest-snippet', function(event, text){
	var snippet = (searcher.search(text))[0];
	if(snippet){
		console.log(snippet);
		console.log('next');
		getWindow.webContents.send('show-suggestion', snippet.snippet, snippet._id);
	}else{
		getWindow.webContents.send('show-suggestion', "", "");
	}
}) 

ipcMain.on('console-log', function(a){
	console.log(a);
})

// Helper Functions

function loadData(){

		db.find({}, function (err, docs) {
			
			dataset = docs;
			
			searcher = new FuzzySearch(docs, ['snippet'], {
				caseSensitive: false,
				sort:true
			});
		});



}

function searchData(str){
	
	return searcher.search(str);

}

function addSnipToDb(text){
	db.insert({snippet: text}, function (err, newDoc) {});
}


