const { app, BrowserWindow } = require('electron')
  
  // Keep a global reference of the window object, if you don't, the window will
  // be closed automatically when the JavaScript object is garbage collected.
  let win
  
  function createWindow () {
    // Create the browser window.
    win = new BrowserWindow({ width: 800, height: 800 })
  
    // and load the index.html of the app.
    win.loadFile('index.html')
  
    // Open the DevTools.
    win.webContents.openDevTools()
  
    // Emitted when the window is closed.
    win.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      win = null
    })
  }

ipc = require('electron').ipcMain
  
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
app.on('ready', () => {
    createWindow()
    ipc.on('reset-request', function(event) {
        const {net} = require('electron')
        const request = net.request('http://localhost:8000/reset')
        request.on('response', (response) => {
            console.log(`STATUS: ${response.statusCode}`)
            console.log(`HEADERS: ${JSON.stringify(response.headers)}`)
            response.on('data', (chunk) => {
                console.log(`BODY: ${chunk}`)
            })
            response.on('end', () => {
                console.log('No more data in response.')
            })
        })
        request.end()
    });

    ipc.on('vote-request', function(event, arg) {
        const {net} = require('electron')
        const request = net.request({
            method: 'POST',
            protocol: 'http:',
            hostname: 'localhost',
            port: 8000,
            path: '/vote/' + arg['candidateId']
        })
        request.setHeader('Content-Type', 'application/json')
        request.write(JSON.stringify(arg))
        request.on('response', (response) => {
            console.log(`STATUS: ${response.statusCode}`)
            console.log(`HEADERS: ${JSON.stringify(response.headers)}`)
            response.on('data', (chunk) => {
                console.log(`BODY: ${chunk}`)
            })
            response.on('end', () => {
                console.log('No more data in response.')
            })
        })
        request.end()
    });

    ipc.on('image-request', function(event, arg) {
        const {net} = require('electron')
        const request = net.request({
            method: 'POST',
            protocol: 'http:',
            hostname: 'localhost',
            port: 8000,
            path: '/uploadImage' 
        })
        request.setHeader('Content-Type', 'application/json')
        request.write(JSON.stringify({'img': arg}))
        var returnval = false;
        request.on('response', (response) => {
            console.log(`STATUS: ${response.statusCode}`)
            console.log(`HEADERS: ${JSON.stringify(response.headers)}`)
            response.on('data', (chunk) => {
                console.log(`BODY: ${chunk}`)
            })
            response.on('end', () => {
                console.log('No more data in response.')
            })
            if(response.statusCode == 200) {
                returnval = true;
            }
        })
        request.end()
        //event.sender.send(returnval)
    });
})
  
  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
  
  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow()
    }
  })
  
  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and require them here.
