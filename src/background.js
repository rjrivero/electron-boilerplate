// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import path from 'path';
import url from 'url';
import { app, Menu, Tray } from 'electron';
import { devMenuTemplate } from './menu/dev_menu_template';
import { editMenuTemplate } from './menu/edit_menu_template';
import createWindow from './helpers/window';
import { Settings } from './helpers/settings';

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from './env';

var mainWindow;
var settings;

// Make application single instance.
// See https://github.com/electron/electron/blob/v0.36.10/docs/api/app.md#appmakesingleinstancecallback
var shouldQuit = app.makeSingleInstance(function(commandLine, workingDirectory) {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
        if (mainWindow.isMinimized()) {
            mainWindow.restore();
        }
        mainWindow.show();
        mainWindow.focus();
    }
})

if (shouldQuit) {
    app.quit();
}

// Application id to send and receive notifications
// See https://github.com/electron-userland/electron-builder/wiki/NSIS
const appId = "com.fivecorporation.smartbi.contaplus.desktop"
app.setAppUserModelId(appId)

var setApplicationMenu = function () {
    if (env.name !== 'production') {
        var menus = [editMenuTemplate];
        menus.push(devMenuTemplate);
        Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
    }
};

// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
if (env.name !== 'production') {
    var userDataPath = app.getPath('userData');
    app.setPath('userData', userDataPath + ' (' + env.name + ')');
}

app.on('ready', function () {

    setApplicationMenu();

    mainWindow = createWindow('main', {
        width: 860,
        height: 680,
        minWidth: env.window_min_width,
        maxWidth: env.window_max_width,
        minHeight: 460
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'app.html'),
        protocol: 'file:',
        slashes: true
    }));

    if (env.name === 'development') {
        mainWindow.openDevTools();
    }

    settings = new Settings(app, mainWindow, env);
});

app.on('window-all-closed', function () {
    app.quit();
});
