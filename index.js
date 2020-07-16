const ScreenTimeWatcher = require('./lib/ScreenTimeWatcher.class');

const allowedTime = 3/* hrs */ * 60/* min */ * 60/* sec */ * 1000/* millisec */;

const appsToWatch = [
    'MinecraftLauncher.exe',
    'Roblox.exe'
];

new ScreenTimeWatcher(appsToWatch, allowedTime);