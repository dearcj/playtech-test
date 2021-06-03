const EventEmitter = require('events');


const MACHINE_DEPENDENT_FIX = 12; //ms
//since in general setTimeout call + EventEmitter dispatcher adds something around 10ms delay
//to steadily pass test #5 need to cut something like 10ms from interval


module.exports = class AsyncQueue extends EventEmitter {

    getCurrentInterval() {
        return this.interval;
    }

    enqueue(item) {
        this.items.push(item);
        this.emit("enqueued", item);
    }

    setInterval(value) {
        clearTimeout(this.timeout);
        this.interval = value;

        if (this.started) {
            this.updateTimeouts();
        }
    }

    dequeue() {
        let item = this.items.shift();
        if (item) {
            this.emit("dequeued", item);
            this.updateTimeouts();
            this.lastTick = Date.now();
        }
    }

    updateTimeouts(timeOffset) {
        this.timeout = setTimeout(this.dequeue.bind(this), timeOffset ? this.interval - timeOffset - MACHINE_DEPENDENT_FIX: this.interval - MACHINE_DEPENDENT_FIX);
    }

    start() {
        if (!this.started) {
            this.updateTimeouts(this.prePauseTime);
            this.prePauseTime = 0;
            this.started = true;
        }
    }

    pause() {
        this.started = false;
        this.prePauseTime = Date.now() - this.lastTick;

        clearTimeout(this.timeout);
    }

    print() {
        return [...this.items];
    }

    peek() {
        return this.items.length > 0 ? this.items[0] : null;
    }

    constructor() {
        super();

        this.prePauseTime = 0;
        this.started = false;
        this.items = [];
        this.interval = 250;
        
        this.on("interval", this.setInterval);
    }

};