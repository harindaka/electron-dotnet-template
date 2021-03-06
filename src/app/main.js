const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', createWindow)
app.on('ready', loadApi);

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

function loadApi(){
  var edge = require('electron-edge');

  var cSharpSource = `
      async (input) => { 
          api.Controllers.ContactsController c = new api.Controllers.ContactsController();
          return ".NET Welcomes " + input.ToString(); 
      }
  `
  
  var apiAssembly = path.join(__dirname, '\\resources\\api\\api.dll');
  console.log(apiAssembly);
  var helloWorld = edge.func({
    source: cSharpSource,
    references: [ apiAssembly ]
  });

  helloWorld('JavaScript', function (error, result) {
    if (error) throw error;
    console.log(result);
  });
}


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
const os = require('os');
var apiProcess = null;

function startApi() {
  var exec = require('child_process').exec;
  //  run server
  var apiStartScript = null;
  if (os.platform() === 'win32') {
    apiAssembly = path.join(__dirname, '\\resources\\api\\api.dll');
    apiProcess = exec('"C:\\projects\\apps\\cmder\\vendor\\dotnet\\dotnet.exe" ' + '"' + apiAssembly + '"');
  }
  else{
    apiAssembly = path.join(__dirname, '/resources/api/api.dll');
    apiProcess = exec('dotnet ' + '"' + apiAssembly + '"');
  }

  apiProcess.stdout.on('data', (data) => {
    writeLog(`stdout: ${data}`);
    
    if (mainWindow == null) {
      createWindow();
    }
  });
}

//Kill process when electron exits
process.on('exit', function () {
  writeLog('exit');
  apiProcess.kill();
});

function writeLog(msg){
  console.log(msg);
}