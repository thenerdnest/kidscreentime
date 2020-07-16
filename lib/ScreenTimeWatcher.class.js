// const { exec }          = require('child-process');
// const { snapshot }      = require('process-list');
// const notifier          = require('node-notifier');
const fs                = require('fs');
const ScreenTimeSession = require('./ScreenTimeSession.class');

let callcnt = 0;
function snapshot() {
    callcnt++;

    console.log(callcnt);

    switch (callcnt) {
        case 0:
        case 1: return [];

        case 2:
        case 3:
        case 4: return [{ name: 'MinecraftLauncher.exe', pid: 1234 }];

        case 5:
        case 6:
        case 7: return [
            { name: 'MinecraftLauncher.exe', pid: 1234 },
            { name: 'Roblox.exe', pid: 4321 }
        ];

        case 8:
        case 9:
        case 10: return [{ name: 'Roblox.exe', pid: 4321 }];

        case 11:
        case 12: return [];

        case 13:
        case 14: return [{ name: 'Roblox.exe', pid: 4321 }];

        case 15:
        case 16:
        case 17: return [];

        case 18:
        case 19:
        case 20: return [{ name: 'SomeApp.exe', pid: 9999 }];

        default: return [];
    }
}

function exec(command) { return console.log(`EXEC CMD: ${command}`); }

const notifier = {
    notify: (x) => console.log(`TITLE: ${x.title}\nMESSAGE: ${x.message}`)
};

class ScreenTimeWatcher {
    constructor(appsToWatch, allowedTime, freq = 1000) {
        this.appsToWatch = appsToWatch;

        this.tomorrow = new Date();
        this.tomorrow.setDate(this.tomorrow.getDate() + 1);
        this.tomorrow.setMinutes(0);
        this.tomorrow.setSeconds(0);
        this.tomorrow.setMilliseconds(0);

        this.allowedTime = allowedTime;
        this.watch_freq  = freq; // watch loop frequency (Default: 1s)
        this.session     = null;
        this.history     = [];

        this.startWatchLoop();
    }

    notify(message) {
        notifier.notify({ title: 'Screen Time Watcher', message });
    }

    killProcess(session) {
        exec(`taskkill /F /PID ${session.pid}`);
    }

    timesUp() {
        this.sessions.forEach(sess => sess.kill());
    }

    getSession(appname, onlyActive = false) {
        const sessions = (this.sessions.has(appname)) // if session exists
            ? this.sessions.get(appname)    // return it
            : null;                          // else return null

        if (!sessions) return null;

        // if we don't need to filter to just active sessions,
        // simply return what we have and stop here.
        if (!onlyActive) return sessions;

        // filter to just active sessions.
        return session.filter(x => x.isActive());
    }

    createSession(appname, pid) {
        // Create the session
        const session = new ScreenTimeSession(appname, pid);

        // Start the timer for the session
        return session.start();
    }

    getLogFileName() {
        const now = new Date();
        return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}.log`;
    }

    startSession() {
        this.session = new ScreenTimeSession();
        this.session.start();
        this.notify(`Screen Time Session Started`);
        fs.appendFileSync(
            this.getLogFileName(),
            `${this.session.startTime.toString()}\nSession Started.\n\n`
        );
    }

    endSession() {
        if (!this.session) return;
        this.session.end();

        const notes = [
            `-------------------------------`,
            `${this.session.endTime.toString()}`,
            `Session Ended. Duration: ${this.session.duration()}`,
            `Apps during this session:\n${Array.from(this.session.apps).map(x => `    - ${x}\n`).join('')}`
        ];

        fs.appendFileSync(
            this.getLogFileName(),
            `${notes.join('\n')}\n\n`
        );
        this.history.push(this.session.getData());
        this.session = null;
        this.notify(`Screen Time Session Ended`);
    }

    reset() {
        console.log('RESETTING');

        // reset the sessions tracked
        this.session = null;

        // reset the tomorrow data.
        this.tomorrow = new Date();
        this.tomorrow.setDate(this.today.getDate() + 1);
        this.tomorrow.setMinutes(0);
        this.tomorrow.setSeconds(0);
        this.tomorrow.setMilliseconds(0);
    }

    check() {
        if (Date.now() > this.tomorrow.getTime()) this.reset();

        // get the list of processes.
        const fullList = snapshot('pid', 'name');

        // list of apps to watch that are currently open.
        const list = fullList.filter(x => this.appsToWatch.includes(x.name));

        // Update / Manage the session status
        if (this.session) {
            // a session is currently active
            if (list.length > 0) {
                // apps are still open
                list.forEach(x => this.session.addAPP(x));
            } else {
                // apps are no longer open
                this.endSession();
            }
        } else {
            // no active session currently
            if (list.length > 0) {
                // need to start session
                this.startSession();
                list.forEach(x => this.session.addAPP(x));
            }
        }

        if (!this.session) return; // stop here if no session is started/needed yet.

        // Add up the total used time...
        let usedTime = 0;
        if (this.session) usedTime += this.session.duration();
        this.history.forEach(s => {
            usedTime += s.duration;
        });

        const timeLeft = this.allowedTime - usedTime;

        if (timeLeft <= 0) {
            this.notify('Screen Limit Reached, closing games!');
            this.timesUp();
        } else if (timeLeft < 900000) {
            this.notify('Screen Time Ends in 15 minutes. Save game now! Games will close in 15 minutes.');
        } else if (timeLeft < 300000) {
            this.notify('Screen Time Ends in 5 minutes. Save game now!');
        } else if (timeLeft < 60000) {
            this.notify('Screen Time Ends in 1 minute. Save game now!');
        }
    }

    startWatchLoop() {
        this.watchloop = setInterval(() => this.check(), 1000);
    }
}

module.exports = ScreenTimeWatcher;