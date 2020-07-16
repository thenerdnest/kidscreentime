const ScreenTimeWatcher = require('./lib/ScreenTimeWatcher.class');

const allowedTime = 3/* hrs */ * 60/* min */ * 60/* sec */ * 1000/* millisec */;

const appsToWatch = [
    'MinecraftLauncher.exe',
    'javaw.exe', // minecraft runs in JRE
];

new ScreenTimeWatcher(appsToWatch, allowedTime);

// const { snapshot }      = require('process-list');
// snapshot('pid', 'name')
// .then(list => {
//     require('fs').writeFileSync('processlist.json', JSON.stringify(list, null, 2));
// }).catch(console.log);