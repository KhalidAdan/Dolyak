window.addEventListener('load', () => {
  // Chat platform
  const chatTemplate = Handlebars.compile($('#chat-template').html())
  const chatContentTemplate = Handlebars.compile($('#chat-content-template').html())
  const chatEl = $('#chat')
  const formEl = $('.form')
  const messages = []

  var url = window.location.href
  user = url.split("/")
  let username = user[3]

  // Local Video
  const localImageEl = $('#local-image')
  const localVideoEl = $('#local-video')

  // Remote Videos
  const remoteVideoTemplate = Handlebars.compile($('#remote-video-template').html())
  const remoteVideosEl = $('#remote-videos')
  let remoteVideosCount = 0

  // Hide cameras until they are initialized
  localVideoEl.hide()

  // create our webrtc connection
  const webrtc = new SimpleWebRTC({
    // the id/element dom element that will hold "our" video
    localVideoEl: 'local-video',
    // the id/element dom element that will hold remote videos
    remoteVideosEl: 'remote-videos',
    // immediately ask for camera access
    autoRequestMedia: true,
    debug: false,
    detectSpeakingEvents: true,
    autoAdjustMic: false,
  })

  // we have to wait until it's ready
  webrtc.on('readyToCall', () => {
      var roomName = 'Yak'
      console.log(`Joining Room: ${roomName}`)
      webrtc.joinRoom(roomName)
      showChatRoom(roomName)
      postMessage(`${username} joined chatroom`)
  })

  // Display Chat Interface
  const showChatRoom = (room) => {
    $('#post-btn').on('click', () => {
      const message = $('#post-message').val()
      postMessage(message)
    })
    $('#post-message').on('keyup', (event) => {
      if (event.keyCode === 13) {
        const message = $('#post-message').val()
        postMessage(message)
      }
    })
  }
  // Post Local Message
  const postMessage = (message) => {
    const chatMessage = {
      username,
      message,
      postedOn: new Date().toLocaleString('en-GB'),
    }
    // Send to all peers
    webrtc.sendToAll('chat', chatMessage)
    // Update messages locally
    messages.push(chatMessage)
    $('#post-message').val('')
    updateChatMessages()
  }

  // Update Chat Messages
  const updateChatMessages = () => {
    const html = chatContentTemplate({ messages })
    const chatContentEl = $('#chat-content')
    chatContentEl.html(html)
    // automatically scroll downwards
    const scrollHeight = chatContentEl.prop('scrollHeight')
    chatContentEl.animate({ scrollTop: scrollHeight }, 'slow')
  }


    // We got access to local camera
    webrtc.on('localStream', () => {
      localImageEl.hide()
      localVideoEl.show()
    })

    // Receive message from remote user
    webrtc.connection.on('message', (data) => {
      if (data.type === 'chat') {
        const message = data.payload
        messages.push(message)
        updateChatMessages()
      }
    })

    // Remote video was added
    webrtc.on('videoAdded', (video, peer) => {
      // eslint-disable-next-line no-console
      const id = webrtc.getDomId(peer)
      console.log(id)
      const html = remoteVideoTemplate({ id })
      if (remoteVideosCount === 0) {
        remoteVideosEl.html(html)
      } else {
        remoteVideosEl.append(html)
      }
      $(`#${id}`).html(video)
      $(`#${id} video`).addClass('ui image medium') // Make video element responsive
      remoteVideosCount += 1
    })

    // Remote video was added
    webrtc.on('videoRemoved', (video, peer) => {
      const id = webrtc.getDomId(peer)
      $(`#${id}`).empty()
      remoteVideosCount -= 1
    })

    $("#pauseVideo").on('click', () => {
      webrtc.pauseVideo()
    })

    $("#playVideo").on('click', () => {
      webrtc.resumeVideo()
    })

    $("#mute").on('click', () => {
      webrtc.mute()
    })

    $("#unmute").on('click', () => {
      webrtc.unmute()
    })


})
