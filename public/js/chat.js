const socket = io()

// Elements
const $messageForm = document.getElementById('messageForm')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.getElementById('send-location')
const $messages = document.getElementById('messages')
const $sidebar = document.getElementById('sidebar')

// Templates
const messageTemplate = document.getElementById('message-template').innerHTML
const locationMessageTemplate = document.getElementById('location-message-template').innerHTML
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // Get new message
    const $newMessage = $messages.lastElementChild

    // Height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight
    // Total height of container
    const containerHeight = $messages.scrollHeight
    // How far are we scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    // If we are at the bottom of the scrollable area that was before the new message arrived, 
    // move us down to show that new message as well.
    if( containerHeight - newMessageHeight <= scrollOffset ) {
        $messages.scrollTop = $messages.scrollHeight
    }
}


socket.on('message', ({ text, username, createdAt }) => {
    const html = Mustache.render(messageTemplate, { 
        text,
        username,
        createdAt: moment(createdAt).format('HH:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('updateUserList', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    $sidebar.innerHTML = html
})

socket.on('locationMessage', ({url, username, createdAt}) => {
    const html = Mustache.render(locationMessageTemplate, {
        url, 
        username,
        createdAt: moment(createdAt).format('HH:mm') 
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $messageFormButton.setAttribute('disabled', 'disabled')
    let message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }
    })
})

$sendLocationButton.addEventListener('click', () => {
    if( !navigator.geolocation ) {
        alert('Geolocation is not supported by your browser')
        return
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((location) => {
        socket.emit('sendLocation', {
            latitude: location.coords.latitude, 
            longitude: location.coords.longitude
        }, (error) => {
            if (error) {
                return console.log(error)
            }

            $sendLocationButton.removeAttribute('disabled')

            console.log('Location shared!')
        })
    })
})

socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
} )
