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
      
      // Check if node_modules exists and warn about size
      const nodeModulesPath = path.join(zipPaths[0], 'node_modules');
      const hasNodeModules = fs.existsSync(nodeModulesPath);
      
      if (hasNodeModules) {
        console.log('[Electron] WARNING: node_modules detected - excluding from zip for faster processing');
        console.log('[Electron] OSI will run npm install automatically if needed');
      }
      
      // Dynamic import for ES modules
      const { zip } = await import("zip-a-folder");
      const archiver = await import("archiver");
      const streamBuffers = await import("stream-buffers");
      
      // Create a buffer to store the zip
      const outputStreamBuffer = new streamBuffers.default.WritableStreamBuffer({
        initialSize: (100 * 1024),
        incrementAmount: (10 * 1024)
      });
      
      // Create archive with exclusions
      const archive = archiver.default('zip', {
        zlib: { level: 5 } // Moderate compression for speed
      });
      
      archive.on('error', (err) => {
        console.error('[Electron] Archive error:', err);
        reject(err);
      });
      
      archive.on('end', async () => {
        console.log('[Electron] Archive finalized, size:', archive.pointer(), 'bytes');
        const buffer = outputStreamBuffer.getContents();
        
        // Write to temp file
        await fs.promises.writeFile(zipPaths[1], buffer);
        console.log('[Electron] Zip file written to:', zipPaths[1]);
        
        return resolve(buffer);
      });
      
      // Pipe archive to buffer
      archive.pipe(outputStreamBuffer);
      
      // Add directory with exclusions
      archive.glob('**/*', {
        cwd: zipPaths[0],
        ignore: [
          '**/node_modules/**',
          '**/.git/**',
          '**/dist/**',
          '**/build/**',
          '**/.next/**',
          '**/coverage/**',
          '**/.cache/**',
          '**/tmp/**',
          '**/*.log'
        ]
      });
      
      console.log('[Electron] Creating optimized zip (excluding node_modules and build artifacts)...');
      await archive.finalize();
      
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
