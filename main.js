const electron = require('electron')

// Module to control application life.
const app = electron.app

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const globalShortcut = electron.globalShortcut
const robot = require("robotjs");

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow



var ipc = require('electron').ipcMain;  

function createWindow () {

  // Create the browser window.
  mainWindow = new BrowserWindow({width: 400, height: 300})
  mainWindow.minimize();

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
  const ret = globalShortcut.register(addShortcut, () => {

    addWindow = new BrowserWindow({width: 200, height: 150})

    addWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'add-shortcut.html'),
      protocol: 'file:',
      slashes: true
    }));

  })


  if (!ret) {
    console.log('registration failed')
  }

  // Check whether a shortcut is registered.
  console.log(globalShortcut.isRegistered(addShortcut));

}

app.on('will-quit', () => {
    // Unregister a shortcut.
    globalShortcut.unregister('CommandOrControl+X')

    // Unregister all shortcuts.
    globalShortcut.unregisterAll()

})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})


ipc.on('add-snippet', (event, args) => 
  // find all the shortcuts to show 
  registerGlobalShortcut(1,args)
)  

function registerGlobalShortcut(id,text){
  const ret = globalShortcut.register('CommandOrControl+Shift+'+id, () => {    
    Array.from(text.split('')).forEach(function(c){
      robot.keyTap(c);
    });
  })


  if (!ret) {
    console.log('registration failed')
  }

  // Check whether a shortcut is registered.
  console.log(globalShortcut.isRegistered('CommandOrControl+Shift+'+id));
}


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
