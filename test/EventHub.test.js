const EventHub = require('../src/EventHub').default

describe('EventHub', () => {
    let hub
    let node
    let handler

    beforeEach(() => {
        hub = new EventHub()
        handler = jest.fn()
        node = {
            addEventListener: jest.fn(),
            removeEventListener: jest.fn()
        }
    })

    describe('add()', () => {
        test('should add single event to pool', () => {
            hub.add('click', handler, node)

            expect(hub.pool).toEqual([{
                name: 'click',
                handler: handler,
                context: node
            }])
        })

        test('should add multiple events to pool', () => {
            hub.add('click touch', handler, node)
            expect(hub.pool).toEqual([
                {
                    name: 'click',
                    handler: handler,
                    context: node
                },
                {
                    name: 'touch',
                    handler: handler,
                    context: node
                }
            ])
        })

        test('should call addEventListener', () => {
            hub.add('click', handler, node)
            expect(node.addEventListener.mock.calls.length).toBe(1)
        })
    })

    describe('reset()', () => {
        test('should remove all events from pool', () => {
            hub.pool = [{
                name: 'click',
                handler: handler,
                context: node
            }]
            hub.reset()
            expect(hub.pool.length).toBe(0)
        })

        test('should call removeEventListener', () => {
            hub.pool = [{
                name: 'click',
                handler: handler,
                context: node
            }]
            hub.reset()
            expect(node.removeEventListener.mock.calls.length).toBe(1)
        })
    })
})
