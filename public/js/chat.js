const socket = io()

// ELements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true})

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)*2
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of message container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled ? (from top of container)
    const scrollOffset = $messages.scrollTop + visibleHeight 

    if( containerHeight - newMessageHeight < scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.emit('join', { username, room}, (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    $sidebar.innerHTML = html
})

$messageForm.addEventListener('submit', (event) => {
    event.preventDefault()
    // disable send button
    $messageFormButton.setAttribute('disabled', 'disabled')

    var messageField = event.target.elements.message 
    var message = messageField.value
    messageField.value = ''

    socket.emit('sendMessage', message, (error) => {
        //enable send button and refoucs input field
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.focus()

        if(error) {
            return console.log(error)
        }

        console.log('Message delivered.')
    })
})

$sendLocationButton.addEventListener('click', () => {
    // check for geo-loaction api support for browser
    if (!navigator.geolocation) {
        return alert('You browser does not support geo-location.')
    }

    // disable send location button
    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {

        socket.emit('sendLocation', {
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        }, (message) => {
            // enable send location button
            $sendLocationButton.removeAttribute('disabled')

            console.log('Location shared.')
        })
    })
})