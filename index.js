const EventsEmitter = require("events");

class QueueHandler extends EventsEmitter {
    constructor() {
        super();
        this.queues = new Map();
    }

    add(key = "null", value) {
        if (!this.queues.get(key))
            this.queues.set(key, []);
        let queue = this.queues.get(key);
        queue.push(value);
        this.queues.set(key, queue);
        if (queue.length == 1)
            this.emit("next", key, value);
    }

    completed(key = "null") {
        let queue = this.queues.get(key);
        queue.shift();
        this.queues.set(key, queue);
        if (!this.queues.get(key)[0])
            this.queues.delete(key);
        else
            this.emit("next", key, this.queues.get(key)[0]);
    }

    retryLater(key = "null", next = true, pause = 0) {
        const toRetry = this.queues.get(key).shift();
        let queue = this.queues.get(key);
        queue.push(toRetry);
        this.queues.set(key, queue);
        if (next == true)
            this.next(key);
        else if (pause != 0)
            setTimeout((() => this.next(key)), pause * 1000);
    }

    next(key = "null") {
        if (!this.queues.get(key)[0])
            this.queues.delete(key);
        else {
            this.emit("next", key, this.queues.get(key)[0]);
            let queue = this.queues.get(key);
            queue.shift();
            this.queues.set(key, queue);
        }
    }
}

module.exports = QueueHandler;