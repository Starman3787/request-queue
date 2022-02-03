const Queue = require("./index");

const queue = new Queue();

let i = 0;

queue.on("next", (key, data) => {
    setTimeout(() => {
        console.log(data.number);
        queue.retryLater(key, true, 5);
    }, 100);
});

setInterval(() => {
    i++;
    queue.add("yes", { cool: "not really", number: i });
}, 10);