const now = () => (+new Date)

// A simple timer for instrumentation.
class PerfTimer {
    constructor(label) {
        this.label = label
        this.t1 = now()
    }

    end() {
        setImmediate(() => {
            const t2 = now()
            const elapsed = t2 - this.t1
            this.elapsed = elapsed
            console.log(`[timer] ${this.label} [${elapsed}ms]`)
        })
    }
}

module.exports = {
    now,
    PerfTimer
}