export default class EventHub {
    constructor () {
        this.pool = []
    }

    /**
     * Add event to node and store
     * @param {String} names
     * @param {Function} handler
     * @param {Object} context
     */
    add (names, handler, context = window) {
        names.split(' ').forEach(name => {
            context.addEventListener(name, handler)
            this.pool.push({ name, handler, context })
        })
    }

    /**
     * Remove all events in the pool
     */
    reset () {
        this.pool = this.pool.reduce((pool, event) => {
            event.context.removeEventListener(event.name, event.handler)
            return pool
        }, [])
    }
}
