const EventsEmitter = require("events");

class QueueHandler extends EventsEmitter {
    constructor(waitPeriod, maxQueueSize) {
        super();
        this.queues = new Map();
        this.timeouts = new Map();
        this.waitPeriod = waitPeriod;
        this.maxQueueSize = maxQueueSize;
    }

    add(key = "null", value) {
        if (!this.queues.get(key))
            this.queues.set(key, []);
        let queue = this.queues.get(key);
        queue.push(value);
        this.queues.set(key, queue);
        if (queue.length == 1)
            this.timeouts.set(key, setTimeout(() => this._emitBundle(key), this.waitPeriod * 1000));
        else if (queue.length == this.maxQueueSize) {
            const timeout = this.timeouts.get(key);
            clearTimeout(timeout);
            this._emitBundle(key);
        }
    }

    _emitBundle(key = "null") {
        this.timeouts.delete(key);
        let queue = this.queues.get(key);
        const bundle = queue.splice(0, this.maxQueueSize);
        this.queues.set(key, queue);
        this.emit("next", key, bundle);
    }
}

module.exports = QueueHandler;