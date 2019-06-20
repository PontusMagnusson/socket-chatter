const socket = io()

const $messageForm = document.getElementById('messageForm')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.getElementById('send-location')


socket.on('message', (message) => {
    console.log(message)
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

        console.log('Message delivered!')
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
