
module.exports = class SlowQueue
{
    constructor(wait_time_ms) {
        this.queue = [];
        setInterval(() => {
            if (this.queue.length === 0) {
                return;
            }
            this.queue.shift()();
        }, wait_time_ms);
    }

    getPromise() {
        return new Promise(resolve => {
            this.queue.push(resolve);
        });
    }
}
