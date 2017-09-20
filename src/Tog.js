export default class Tog {
    constructor (options, context, eventHub) {
        this.options = options
        this.doc = context
        this.triggers = [...this.doc.querySelectorAll('[data-tog]')]
        this.eventHub = eventHub
        this.toggle = this.handleToggle.bind(this)
        this.toggleMap = this.createToggleMap(this.triggers, (trigger, target) => {
            this.eventHub.add('click', this.toggle, trigger)
            Tog.addAccessAttributes(trigger, target)
        })
    }

    /**
     * Create toggle map of triggers & groups
     * @param {Array} triggers
     * @param {Function} transform
     * @returns {Object} map
     */
    createToggleMap (triggers, transform) {
        return triggers.reduce((map, trigger) => {
            const group = trigger.getAttribute('data-tog-group')
            const id = trigger.getAttribute('data-tog')
            const content = this.doc.getElementById(id) || this.doc.querySelectorAll(`.${id}`)
            const target = content.length ? [...content] : [content]

            // store triggers
            map.triggers[id] = {
                group,
                id,
                target,
                active: false
            }

            // store group reference
            if (group) {
                map.groups[group]
                    ? map.groups[group].push(id)
                    : map.groups[group] = [id]
            }

            // run the trigger and it's content through a function
            transform(trigger, target)
            return map
        }, { triggers: {}, groups: {} })
    }

    /**
     * Handle toggle event
     * @param {Event} event
     */
    handleToggle (event) {
        event.preventDefault()

        const id = Tog.getClosestTrigger(event.target, this.doc).getAttribute('data-tog')
        const { target, active, group, node } = this.toggleMap.triggers[id]
        const groupTriggers = group
            ? this.toggleMap.groups[group].map(id => this.toggleMap.triggers[id])
            : [this.toggleMap.triggers[id]]
        const groupTargets = group
            ? groupTriggers.reduce((targets, trigger) => {
                trigger.id !== id &&
                trigger.target.forEach(target => targets.push(target))

                return targets
            }, []) : []

        if (active) {
            // close active target(s)
            target.forEach(Tog.closeTarget)
        } else {
            // open target(s)
            target.forEach(Tog.openTarget)
            // close group target(s)
            groupTargets.forEach(Tog.closeTarget)
        }

        // set trigger state
        groupTriggers.forEach(trigger => {
            if (trigger.id !== id) {
                this.toggleMap.triggers[trigger.id].active = false
            } else {
                this.toggleMap.triggers[trigger.id].active = !active
            }
        })

        this.options.afterToggle(this)
    }

    /**
     * Open target
     * @param {Element} target
     */
    static openTarget (target) {
        target.setAttribute('aria-hidden', 'false')
        target.setAttribute('aria-expanded', 'true')
    }

    /**
     * Close target
     * @param {Element} target
     */
    static closeTarget (target) {
        target.setAttribute('aria-hidden', 'true')
        target.setAttribute('aria-expanded', 'false')
    }

    /**
     * Get closest trigger node
     * @param {Element} node
     * @param {Element} context
     * @returns {Element} trigger node
     */
    static getClosestTrigger (node, context) {
        const trigger = node.getAttribute('data-tog')

        while (!trigger && node !== context) {
            Tog.getClosestTrigger(node.parentNode)
        }

        return trigger ? node : null
    }

    /**
     * Add aria accessibility attributes to nodes
     * @param {Element} trigger
     * @param {Array} target
     */
    static addAccessAttributes (trigger, target) {
        // handle auto open toggles
        const hidden = trigger.getAttribute('data-tog-active') ? 'false' : 'true'

        // todo - add more aria attributes to both trigger and targets

        target.forEach(node => {
            // set aria-hidden attr
            node.setAttribute('aria-hidden', hidden)
        })
    }
}
