const Tog = require('../src/Tog').default
const { JSDOM } = require('jsdom')

describe('Tog', () => {
    let tog
    let hub
    let doc
    let transform
    let node

    beforeEach(() => {
        hub = { add: jest.fn() }
        doc = (new JSDOM()).window.document
        tog = new Tog({}, doc, hub)
        transform = jest.fn()
    })

    describe('createToggleMap()', () => {
        test('should handle no toggles', () => {
            tog.createToggleMap([], transform)
            expect(tog.toggleMap).toEqual({ triggers: {}, groups: {} })
        })

        test('should handle single content item', () => {
            const { document } = (new JSDOM(`
                <div id="trigger" data-tog="foo"></div>
                <div id="foo"></div>
            `)).window
            const trigger = document.getElementById('trigger')
            const target = document.getElementById('foo')

            tog = new Tog({}, document, hub)
            tog.createToggleMap([trigger], transform)
            expect(tog.toggleMap).toEqual({
                triggers: {
                    foo: {
                        group: null,
                        id: 'foo',
                        target: [target],
                        active: false
                    }
                },
                groups: {}
            })
        })

        test('should handle multiple content items', () => {
            const { document } = (new JSDOM(`
                <div id="trigger" data-tog="foo"></div>
                <div class="foo"></div>
                <div class="foo"></div>
            `)).window
            const trigger = document.getElementById('trigger')
            const target = [...document.querySelectorAll('.foo')]

            tog = new Tog({}, document, hub)
            tog.createToggleMap([trigger], transform)
            expect(tog.toggleMap).toEqual({
                triggers: {
                    foo: {
                        group: null,
                        id: 'foo',
                        target: target,
                        active: false
                    }
                },
                groups: {}
            })
        })

        test('should handle grouped triggers', () => {
            const { document } = (new JSDOM(`
                <div id="trigger-1" data-tog="target-1" data-tog-group="foo"></div>
                <div id="target-1"></div>
                <div id="trigger-2" data-tog="target-2" data-tog-group="foo"></div>
                <div id="target-2"></div>
            `)).window
            const trigger1 = document.getElementById('trigger-1')
            const trigger2 = document.getElementById('trigger-2')
            const target1 = document.getElementById('target-1')
            const target2 = document.getElementById('target-2')

            tog = new Tog({}, document, hub)
            tog.createToggleMap([trigger1, trigger2], transform)
            expect(tog.toggleMap).toEqual({
                triggers: {
                    'target-1': {
                        group: 'foo',
                        id: 'target-1',
                        target: [target1],
                        active: false
                    },
                    'target-2': {
                        group: 'foo',
                        id: 'target-2',
                        target: [target2],
                        active: false
                    }
                },
                groups: {
                    foo: ['target-1', 'target-2']
                }
            })
        })

        test('should run items through transform', () => {
            const { document } = (new JSDOM(`
                <div id="trigger" data-tog="foo"></div>
                <div id="foo"></div>
            `)).window
            const trigger = document.getElementById('trigger')
            const target = document.getElementById('foo')

            tog = new Tog({}, document, hub)
            tog.createToggleMap([trigger], transform)
            expect(transform.mock.calls.length).toBe(1)
        })
    })

    describe('handleToggle()', () => {})

    describe('openTarget()', () => {
        test('should set aria attributes', () => {
            const { document } = (new JSDOM(`
                <div id="foo"></div>
            `)).window
            const node = document.getElementById('foo')

            Tog.openTarget(node)
            expect(node.getAttribute('aria-hidden')).toBe('false')
            expect(node.getAttribute('aria-expanded')).toBe('true')
        })
    })

    describe('closeTarget()', () => {
        test('should set aria attributes', () => {
            const { document } = (new JSDOM(`
                <div id="foo"></div>
            `)).window
            const node = document.getElementById('foo')

            Tog.closeTarget(node)
            expect(node.getAttribute('aria-hidden')).toBe('true')
            expect(node.getAttribute('aria-expanded')).toBe('false')
        })
    })

    describe('getClosestTrigger()', () => {
        test('should return the trigger if it is the toggle', () => {
            const { document } = (new JSDOM(`
                <div id="foo" data-tog="foo"></div>
            `)).window
            const node = document.getElementById('foo')
            const closest = Tog.getClosestTrigger(node)

            expect(closest).toEqual(node)
        })

        test('should return the trigger if it is a parent', () => {
            // TODO - recursion is breaking jest here
            // const { document } = (new JSDOM(`
            //     <div id="foo" data-tog="foo">
            //         <div id="bar">
            //             <div id="baz"></div>
            //         </div>
            //     </div>
            // `)).window
            // const node = document.getElementById('foo')
            // const target = document.getElementById('baz')
            // const closest = Tog.getClosestTrigger(target, document)
            //
            // expect(closest).toEqual(node)
        })

        test('should return null if a trigger is not found', () => {
            // TODO - recursion is breaking jest here
            // const { document } = (new JSDOM(`
            //     <div id="foo">
            //         <div id="bar">
            //             <div id="baz"></div>
            //         </div>
            //     </div>
            // `)).window
            // const node = document.getElementById('foo')
            // const target = document.getElementById('baz')
            // const closest = Tog.getClosestTrigger(target)
            //
            // expect(closest).toBe(null)
        })
    })

    describe('addAccessAttributes()', () => {
        test('should add correct aria-hidden attribute to the target', () => {
            const { document } = (new JSDOM(`
                <div id="trigger"></div>
                <div id="target"></div>
            `)).window
            const trigger = document.getElementById('trigger')
            const target = document.getElementById('target')

            Tog.addAccessAttributes(trigger, [target])
            expect(target.getAttribute('aria-hidden')).toBe('true')
        })
    })

    describe('default active items', () => {
        test('should handle default active item', () => {
            const { document } =(new JSDOM(`
                <div id="trigger" data-tog="target" data-tog-active="true"></div>
                <div id="target"></div>
            `)).window

            const target = document.getElementById('target')
            const toggle = new Tog({}, document, hub)

            expect(target.getAttribute('aria-hidden')).toBe('false')
        })
        test('should no default active items', () => {
            const { document } =(new JSDOM(`
                <div id="trigger" data-tog="trigger"></div>
                <div id="target"></div>
            `)).window

            const target = document.getElementById('trigger')
            const toggle = new Tog({}, document, hub)

            expect(target.getAttribute('aria-hidden')).toBe('true')
        })
    })
})
