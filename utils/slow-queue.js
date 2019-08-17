/**
 |------------------------------------------------
 | slow-queue.js
 |------------------------------------------------
 | A SlowQueue provides a Promise that will resolve when its turn comes up.
 | The queue will only resolve one Promise per interval. The interval time
 | is given to the constructor. To run more than one Promise per interval,
 | pass a second integer parameter to the constructor.
 */

module.exports = class SlowQueue
{
    /**
     * Create a SlowQueue
     * @param  {int} wait_time_ms milliseconds to wait between Promises
     * @param  {int} wait_frequency wait after resolving this many Promises
     */
    constructor(wait_time_ms, wait_frequency = 1) {
        this.queue = [];
        this.wait_time_ms = wait_time_ms;
        this.wait_frequency = wait_frequency;
        this.tasks_since_last_wait = 0;
        this.waiting = false;
    }

    /**
     * Returns a new Promise that will resolve when the queue reaches it. That
     * could be immediately.
     * If cb is given, it will be called when the queue reaches this promise.
     * If cb returns a Promise, the queue will wait until the Promise completes
     * before starting the next wait interval.
     * @param {Function} cb an optional callback
     * @return {Promise}
     */
    push(cb = null) {
        return new Promise((resolve, reject) => {
            this.queue.push(() => Promise.resolve(cb && cb()).then(resolve, reject));
            this.run();
        });
    }

    /**
     * Checks to see if any tasks are queued. If so, this calls the first one
     * and sets a timeout when its Promise completes. If this method is called
     * again before the timeout completes, it silently returns. When the
     * timeout completes, this method is called again. If the queue is empty,
     * no more timeouts are scheduled.
     *
     * If wait_frequency was set, this runs that many tasks before initiating
     * a wait time.
     *
     * @return {void}
     */
    run() {
        if (this.waiting) {
            return;
        }
        if (this.queue.length > 0) {
            this.waiting = true;
            const task = this.queue.shift();
            task().finally(() => {
                this.tasks_since_last_wait++;
                if (this.tasks_since_last_wait >= this.wait_frequency) {
                    this.tasks_since_last_wait = 0;
                    setTimeout(() => {
                        this.waiting = false;
                        this.run();
                    }, this.wait_time_ms);
                } else {
                    this.waiting = false;
                    this.run();
                }
            });
        }
    }
}
