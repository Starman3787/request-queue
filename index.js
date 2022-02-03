const EventsEmitter = require("events");

class QueueHandler extends EventsEmitter {
    constructor() {
        super();
        this.queues = {};
    }

    add(key = "null", value) {
        if (!this.queues[key])
            this.queues[key] = { q: new Array(10).fill(null), c: 0, d: 0 };
        this.queues[key].q[this.queues[key].c] = value;
        this.queues[key].c++;
        if (this.queues[key].c > 9)
            this.queues[key].c = 0;
        if (this.queues[key].q.filter(k => k != null).length == 1)
            this.emit("next", key, value);
    }

    completed(key = "null") {
        this.queues[key].q[this.queues[key].d] = null;
        if (this.queues[key].q.filter(k => k != null).length == 0)
            delete this.queues[key];
        else {
            this.queues[key].d++;
            if (this.queues[key].d > 9)
                this.queues[key].d = 0;
            this.emit("next", key, this.queues[key].q[this.queues[key].d]);
        }
    }

    retryLater(key = "null", next = true, pause = 0) {
        this.queues[key].q[this.queues[key].c] = this.queues[key].q[this.queues[key].d];
        this.queues[key].c++;
        if (this.queues[key].c > 9)
            this.queues[key].c = 0;
        this.queues[key].q[this.queues[key].d] = null;
        if (next == true)
            this.next(key);
        else if (pause != 0)
            setTimeout((() => this.next(key)), pause * 1000);
    }

    next(key = "null") {
        if (this.queues[key].q.filter(k => k != null).length == 0)
            delete this.queues[key];
        else {
            this.queues[key].d++;
            if (this.queues[key].d > 9)
                this.queues[key].d = 0;
            this.emit("next", key, this.queues[key].q[this.queues[key].d]);
        }
    }
}

module.exports = QueueHandler;