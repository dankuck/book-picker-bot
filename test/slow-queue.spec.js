const SlowQueue = require('../utils/slow-queue');
const assert = require('assert');

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe('SlowQueue', function () {

    it('exists', function () {
        assert(new SlowQueue(1));
    });

    it('can push nothing', function () {
        const queue = new SlowQueue(1);
        const promise = queue.push();
        assert(promise.then, 'Hey that is not a promise');
    });

    it('can push something', function () {
        const queue = new SlowQueue(1);
        const promise = queue.push(() => {});
        assert(promise.then, 'Hey that is not a promise');
    });

    it('runs the promise', function (done) {
        const queue = new SlowQueue(1);
        let ran = false;
        queue.push()
            .then(() => {
                ran = true;
            });
        wait(10)
            .then(() => assert(ran))
            .then(done, done);
    });

    it('runs the callback', function (done) {
        const queue = new SlowQueue(1);
        let ran = false;
        queue.push(() => ran = true);
        wait(10)
            .then(() => assert(ran))
            .then(done, done);
    });

    it('runs the callback then the "then" no waiting', function (done) {
        const queue = new SlowQueue(10);
        let callbackTime = null;
        let thenTime = null;
        queue
            .push(() => {
                callbackTime = new Date();
            })
            .then(() => {
                thenTime = new Date();
            });
        wait(20)
            .then(() => {
                assert(callbackTime);
                assert(thenTime);
                assert(thenTime - callbackTime < 2, 'queue waited before resolving Promise');
            })
            .then(done, done);
    });

    it('runs the callback then another after a wait time', function (done) {
        const queue = new SlowQueue(10);
        let firstTime = null;
        let secondTime = null;
        queue.push(() => {
            firstTime = new Date();
        });
        queue.push(() => {
            secondTime = new Date();
        });
        wait(20)
            .then(() => {
                assert(firstTime);
                assert(secondTime);
                const diff = secondTime - firstTime;
                assert(diff >= 10, `times are not at least 10ms apart: ${secondTime} - ${firstTime} = ${diff}`);
                assert(diff <= 15, `times are more than 12ms apart: ${secondTime} - ${firstTime} = ${diff}`);
            })
            .then(done, done);
    });

    it('runs multiples without a wait if wait_frequency is specified', function (done) {
        const queue  = new SlowQueue(10, 2);
        let firstTime = null;
        let secondTime = null;
        let thirdTime = null;
        queue.push(() => {
            firstTime = new Date();
        });
        queue.push(() => {
            secondTime = new Date();
        });
        queue.push(() => {
            thirdTime = new Date();
        });
        wait(30)
            .then(() => {
                assert(firstTime);
                assert(secondTime);
                assert(thirdTime);
                const diff_1_to_2 = secondTime - firstTime;
                const diff_2_to_3 = thirdTime - secondTime;
                assert(diff_1_to_2 <= 2, `1st and 2nd times are too far apart: ${secondTime} - ${firstTime} = ${diff_1_to_2}`);
                assert(diff_2_to_3 >= 10, `2nd and 3rd times are not at least 10ms apart: ${thirdTime} - ${secondTime} = ${diff_2_to_3}`);
                assert(diff_2_to_3 <= 15, `2nd and 3rd times are more than 15ms apart: ${thirdTime} - ${secondTime} = ${diff_2_to_3}`);
            })
            .then(done, done);
    });

    it('runs in several groups if wait_frequency is specified', function (done) {
        this.slow(2000);
        const queue  = new SlowQueue(10, 2);
        let firstTime = null;
        let secondTime = null;
        let thirdTime = null;
        let fourthTime = null;
        queue.push(() => {
            firstTime = new Date();
        });
        queue.push(() => {
            secondTime = new Date();
        });
        queue.push(() => {
            thirdTime = new Date();
        });
        queue.push(() => {
            fourthTime = new Date();
        });
        wait(40)
            .then(() => {
                assert(firstTime);
                assert(secondTime);
                assert(thirdTime);
                assert(fourthTime);
                const diff_1_to_2 = secondTime - firstTime;
                const diff_2_to_3 = thirdTime - secondTime;
                const diff_3_to_4 = fourthTime - thirdTime;
                assert(diff_1_to_2 <= 2, `1st and 2nd times are too far apart: ${secondTime} - ${firstTime} = ${diff_1_to_2}`);
                assert(diff_2_to_3 >= 10, `2nd and 3rd times are not at least 10ms apart: ${thirdTime} - ${secondTime} = ${diff_2_to_3}`);
                assert(diff_2_to_3 <= 15, `2nd and 3rd times are more than 15ms apart: ${thirdTime} - ${secondTime} = ${diff_2_to_3}`);
                assert(diff_3_to_4 <= 2, `3rd and 4th times are too far apart: ${fourthTime} - ${thirdTime} = ${diff_3_to_4}`);
            })
            .then(done, done);
    });

});
