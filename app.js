const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs");
const url = require("url");
const path = require("path");

let mainWindow;
let zipPaths = [];

function createWindow() {
  mainWindow = new BrowserWindow({
    minWidth: 800,
    minHeight: 600,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.maximize();
  mainWindow.show();

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, `/dist/frontend/index.html`),
      protocol: "file:",
      slashes: true,
    })
  );

  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function () {
  if (mainWindow === null) createWindow();
});

ipcMain.handle("selectFiles", async () => {
  let files = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile", "multiSelections"],
  });

  return files.filePaths;
});

ipcMain.handle("getZipFromFolder", async () => {
  return new Promise(async(resolve, reject) => {
    console.log('[Electron] Opening folder dialog...');
    let folder = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
    });
  
    if(folder.filePaths.length === 1) {
      let zipPath = folder.filePaths[0];
      let tempPath = path.join(__dirname, "temp.zip");

      zipPaths = [zipPath, tempPath];
      console.log('[Electron] Folder selected:', zipPath);
      console.log('[Electron] Will zip to:', tempPath);

      return resolve(true);
    }

    console.log('[Electron] No folder selected or cancelled');
    return reject(false);
  })
});

ipcMain.handle("zipDirectory", async() => {
  return new Promise(async(resolve, reject) => {
    try {
      console.log('[Electron] Starting zip of:', zipPaths[0]);
      console.log('[Electron] Output path:', zipPaths[1]);
      
      // Dynamic import for ES module
      const { zip } = await import("zip-a-folder");
      await zip(zipPaths[0], zipPaths[1]);
      console.log('[Electron] Zip complete! Reading file...');
      
      const fileData = await fs.promises.readFile(zipPaths[1]);
      console.log('[Electron] File read complete, size:', fileData.length, 'bytes');
      
      return resolve(fileData);
    } catch(error) {
      console.error('[Electron] Zip error:', error);
      return reject(error);
    }
  })
})

ipcMain.handle("getFileData", async (event, ...args) => {
  let data = fs.readFileSync(args[0], "utf8");
  return data;
});
