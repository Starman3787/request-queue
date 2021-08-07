const EventsEmitter = require("events");

class QueueHandler extends EventsEmitter {
    constructor({ TTL } = {}) {
        super();
        this.TTL = TTL;
        this.queues = {};
    }

    add(key, value) {
        if (!queues[key])
            queues[key] = require("expire-array")(1000 * this.TTL);
        if (queues[key].length == 0) {
            this.emit("next", key, value);
        } else {
            queues[key].push(value);
        }
    }

    completed(key) {
        queues[key].shift();
        if (!queues[key][0])
            return;
        this.emit("next", key, queues[key][0]);
    }

    retryLater(key, next = true) {
        const toRetry = queues[key].shift();
        queues[key].push(toRetry);
        if (next == true)
            this.next(key);
    }

    next(key) {
        if (!queues[key][0])
            return;
        this.emit("next", key, queues[key][0]);
    }
}

module.exports = QueueHandler;