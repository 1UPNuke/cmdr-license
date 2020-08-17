const {app, BrowserWindow, ipcMain} = require('electron');
var isMaximized = false;

function createWindow () {
  // Create the browser window.
  const win = new BrowserWindow({
    transparent: true,
    darkTheme: true,
    show: false,
    frame: false,
    webPreferences: {
      worldSafeExecuteJavaScript: true,
      allowRunningInsecureContent: false,
      enableRemoteModule: false,
      nodeIntegration: true,
    }
  });

  // and load the index.html of the app.
  win.hide();
  win.setMenu(null);
  win.loadFile('app.html');
  //Show window once it's done loading
  win.webContents.on('did-finish-load', function() {
    win.show();
    //win.toggleDevTools();
  });

  ipcMain.on('minimize-window', (event) => {
    win.minimize();
    event.returnValue = '';
  });
  
  ipcMain.on('maximize-window', (event) => {
    isMaximized ? win.unmaximize() : win.maximize();
    isMaximized = !isMaximized;
    event.returnValue = '';
  });
  
  ipcMain.on('close-window', (event) => {
    win.close();
    event.returnValue = '';
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});