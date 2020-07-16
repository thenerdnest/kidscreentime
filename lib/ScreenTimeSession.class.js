class ScreenTimeSession {
    constructor(app) {
        this.apps      = new Set();
        this.startTime = null;
        this.endTime   = null;

        if (app) this.addAPP(app);

        return this;
    }

    isActive() {
        // it is active if start is defined, but end is not.
        return (this.startTime !== null && this.endTime === null);
    }

    addAPP(app) {
        console.log(`ADDING APP: ${app.name} (pid: ${app.pid})`);
        this.apps.add(app.name);
    }

    start() {
        this.startTime = new Date();
        return this; // to chain it up ;)
    }

    end() {
        this.endTime = new Date();
        return this; // to chain it up ;)
    }

    duration() {
        // if session hasn't started, the duration should be returned as 0;
        if (!this.startTime) return 0;

        // end time is either the stored actual end time of the session,
        // or if the session is active and there is no end time, we use the
        // Date.now() to get the duration of the currently active session.
        const endTime = this.endTime || new Date();

        return endTime.getTime() - this.startTime.getTime();
    }

    getData() {
        return {
            apps    : Array.from(this.apps),
            start   : this.startTime.toISOString(),
            end     : this.endTime.toISOString(),
            duration: this.duration()
        };
    }
}

module.exports = ScreenTimeSession;