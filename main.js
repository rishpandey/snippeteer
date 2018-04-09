const path = require('path')
const url = require('url')
const fs = require('fs')

const Config = require('electron-config')
const config = new Config()

// Module to control application
const electron = require('electron')
const {
  app, 
  BrowserWindow,
  globalShortcut,
  ipcMain,
  clipboard
} = electron

const {autoUpdater} = require("electron-updater");

// Keep a global reference of the window object, if you don't, the window will 
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, getWindow, configWindow, keyWindow, addWindow

var dbPath = app.getPath('appData') + '/snippeteer/snips.json'

if (!fs.existsSync(dbPath)) {
  try {
    fs.writeFileSync(dbPath, '') 
  } catch (error) {
    console.log('Error in writing')
    console.log(error)
  }
}

// fs.readFileSync(dbPath);

// nedb
var Datastore = require('nedb') 
var db = new Datastore({
  filename: dbPath,
  autoload: true
})

var FuzzySearch = require('fuzzy-search')
var searcher = null

// setup everything
function createWindow () {

  if(process.platform === 'darwin'){
    app.dock.hide();
  }

  var AutoLaunch = require('auto-launch');
  var snippeteerAutoLaunch = new AutoLaunch({
    name: 'SNIPPETEER',
    isHidden: true
  })

  // enable autolaunch 
  if(config.get('startup') !== false){
    console.log('Working');
    snippeteerAutoLaunch.enable();
  }else{
    snippeteerAutoLaunch.disable();
  }


  let Tray = electron.Tray;
  let Menu = electron.Menu;

  tray = new Tray(__dirname+'/assets/img/logo_small.png')

  tray.setToolTip('SNIPPETEER')

  var contextMenu = Menu.buildFromTemplate([
    { label: 'Quit SNIPPETEER', click: function(){ app.quit() } }
  ])


  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
  })

  tray.on('right-click', (event, bounds) => {
    tray.popUpContextMenu(contextMenu);
  });


  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 750,
    height: 600,
    frame: false,
    resizable: false,
    skipTaskbar: true,
    show: false,
  })

  // mainWindow.minimize()
  // mainWindow.webContents.openDevTools() 

  loadData()

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'assets' , 'html' , 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.on('show', () => {
    tray.setHighlightMode('always')
  })
  mainWindow.on('hide', () => {
    tray.setHighlightMode('never')
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    loadWindows()
  })



  // Register shortcut
  loadShortcut()
  
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function(){
  createWindow();

  const isDev = require('electron-is-dev');
   
  if (! isDev) {
    autoUpdater.checkForUpdates();      
  }
})


app.on('before-quit', () => {
  globalShortcut.unregisterAll()
})



// IPC Handlers
ipcMain.on('add-snippet', function (event, text) {
  addSnipToDb(text);
  loadData();
})

ipcMain.on('get-snippet', function(event, id) {

  const robot = require('robotjs');

  if (process.platform == 'darwin') {
    electron.Menu.sendActionToFirstResponder('hide:');
  }else{
  	robot.keyTap('tab', ['alt']);
  }

  getWindow.hide();

  db.findOne({
    _id: id
  }, function(err, docs) {
    if(err){
      console.log(err);
    }
    if (docs) {

      var existingData = clipboard.readText();
      clipboard.clear();

      clipboard.writeText((docs.snippet).toString());
      
      if(process.platform === 'darwin'){
        robot.keyTap('v', ['command']);
      }else{
        robot.keyTap('v', ['control']);
      }

      setTimeout(function(){
        clipboard.clear();
        clipboard.writeText(existingData);
      }, 3000);      
    }
  })
})

ipcMain.on('suggest-snippet', function(event, text) {
  if (searcher) {
    var snippet = (searcher.search(text));
    if (snippet) {
      getWindow.webContents.send('show-suggestion', snippet);
    } else {
      getWindow.webContents.send('show-suggestion', null);
    }
  }
})

ipcMain.on('show-config', function(a) {

    configWindow = new BrowserWindow({
      width: 400,
      height: 400,
      frame: false,
      show: false,
      parent: mainWindow, 
      modal: true,
      resizable: false,
      skipTaskbar: true,
    })

    configWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'assets' , 'html' ,'get-config.html'),
      protocol: 'file:',
      slashes: true
    }))

    // configWindow.webContents.openDevTools();
   
    configWindow.once('ready-to-show', () => {
      
      configWindow.show()

      keyWindow = new BrowserWindow({
        width: 400,
        height: 60,
        frame: false,
        show: false,
        resizable: false,
        skipTaskbar: true,
      })

      keyWindow.loadURL(url.format({
        pathname: path.join(__dirname , 'assets' , 'html' , 'get-key.html'),
        protocol: 'file:',
        slashes: true
      }))
      keyWindow.setFullScreenable(false)
    })

})

ipcMain.on('register-shortcut', function (event, text) {

  console.log(text);
  global.shortcut = text;

  // keyWindow.reload();

  keyWindow.show();

  // keyWindow.webContents.openDevTools();

})

ipcMain.on('save-shortcut', function (event, accelerator) {

  console.log(accelerator + '\n' + global.shortcut)
  setShortcut(global.shortcut, accelerator)
  configWindow.webContents.send('refresh-shortcuts');

})

autoUpdater.on('update-downloaded', (info) => {
    mainWindow.webContents.send('updateReady')
});

// when receiving a quitAndInstall signal, quit and install the new version ;)
ipcMain.on("quitAndInstall", (event, arg) => {
    autoUpdater.quitAndInstall();
})

// Helper Functions

function loadData () {
  db.find({}, function(err, docs) {
    if (docs.length > 0) {
        dataset = docs;
        searcher = new FuzzySearch(docs, ['snippet'], {
          caseSensitive: false,
          sort: true
        });
    }
  })
}

function searchData (str) {
  return searcher.search(str)
}

function addSnipToDb(text) {
  db.insert({
    snippet: text
  }, function (err, newDoc) {})
}

function getShortcut (type) {
  return config.get(type);
}

function setShortcut (type, accelerator) {
  config.set(type, accelerator);
  loadShortcut();
}

function loadShortcut () {
  var addShortcut = getShortcut('add')
  var searchShortcut = getShortcut('search')
  var showShortcut = getShortcut('show')

  if (addShortcut) {

    const addSnippet = globalShortcut.register(addShortcut, () => {

      addWindow.show();

    })
  }

  if (searchShortcut) {
    const getSnippet = globalShortcut.register(searchShortcut, () => {
      getWindow.show();
    })
  }

  if (showShortcut) {
    const showApp = globalShortcut.register(showShortcut, () => {})
  }
}

function loadWindows(){
	addWindow = new BrowserWindow({
	  width: 500,
	  height: 400,
	  frame: false,
	  show: false,
    resizable: false,
    skipTaskbar: true,
	})


	addWindow.loadURL(url.format({
	  pathname: path.join(__dirname, 'assets' , 'html' , 'add-snippet.html'),
	  protocol: 'file:',
	  slashes: true
	}))

  addWindow.setAlwaysOnTop(true, "floating");
  addWindow.setVisibleOnAllWorkspaces(true);
  addWindow.setFullScreenable(false);

	// addWindow.webContents.openDevTools();

	getWindow = new BrowserWindow({
	  width: 650,
	  height: 50,
	  frame: false,
	  show: false,
    resizable: false,
    skipTaskbar: true,
	})

	var position = getWindow.getPosition()
	getWindow.setPosition(position[0], position[1] - 120);
	getWindow.loadURL(url.format({
	  pathname: path.join(__dirname, 'assets' , 'html' , 'get-snippet.html'),
	  protocol: 'file:',
	  slashes: true
	}))

	// getWindow.webContents.openDevTools();

	getWindow.setAlwaysOnTop(true, "floating");
	getWindow.setVisibleOnAllWorkspaces(true);
	getWindow.setFullScreenable(false);
}