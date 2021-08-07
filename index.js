const EventsEmitter = require("events");

class QueueHandler extends EventsEmitter {
    constructor({ TTL = 60 } = {}) {
        super();
        this.TTL = TTL;
        this.queues = {};
    }

    add(key = "null", value) {
        if (!this.queues[key])
            this.queues[key] = require("expire-array")(1000 * this.TTL);
        if (this.queues[key]._db.length == 0)
            this.emit("next", key, value);
        else
            this.queues[key].push(value);
    }

    completed(key = "null") {
        this.queues[key].shift();
        if (!this.queues[key][0])
            return;
        this.emit("next", key, this.queues[key][0]);
    }

    retryLater(key = "null", next = true, pause = 0) {
        const toRetry = this.queues[key].shift();
        this.queues[key].push(toRetry);
        if (next == true)
            this.next(key);
        else if (pause != 0)
            setTimeout((() => this.next(key)), pause * 1000);
    }

    next(key = "null") {
        if (!this.queues[key][0])
            return;
        this.emit("next", key, this.queues[key][0]);
    }
}

module.exports = QueueHandler;