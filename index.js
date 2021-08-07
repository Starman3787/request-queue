const EventsEmitter = require("events");

class QueueHandler extends EventsEmitter {
    constructor({ TTL = 60 } = {}) {
        super();
        this.TTL = TTL;
        this.queues = new Map();
    }

    add(key = "null", value) {
        if (!this.queues.get(key))
            this.queues.set(key, require("expire-array")(1000 * this.TTL));
        if ((this.queues.get(key)?._db.length ?? 0) == 0)
            this.emit("next", key, value);
        else
            this.queues.get(key).push(value);
    }

    completed(key = "null") {
        const queue = this.queues.get(key).shift();
        this.queues.set(key, queue);
        if (!this.queues.get(key) || !this.queues.get(key)[0])
            return;
        this.emit("next", key, this.queues.get(key)[0]);
    }

    retryLater(key = "null", next = true, pause = 0) {
        const toRetry = this.queues.get(key).shift();
        const queue = this.queues.get(key).push(toRetry);
        this.queues.set(key, queue);
        if (next == true)
            this.next(key);
        else if (pause != 0)
            setTimeout((() => this.next(key)), pause * 1000);
    }

    next(key = "null") {
        if (!this.queues.get(key) || !this.queues.get(key)[0])
            return;
        this.emit("next", key, this.queues.get(key)[0]);
        const queue = this.queues.get(key).shift();
        this.queues.set(key, queue);
    }
}

module.exports = QueueHandler;