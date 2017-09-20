import Tog from './src/Tog'
import EventHub from './src/EventHub'

const cl = document.getElementById('console')

function clog (data) {
    cl.innerHTML = JSON.stringify(data, null, 4)
}

const toggles = new Tog(
    {
        afterToggle: (tog) => {
            clog(tog.toggleMap)
        }
    },
    document,
    new EventHub()
)

clog(toggles.toggleMap)
