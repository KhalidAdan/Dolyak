const express = require('express')
const fs = require('fs')

const app = express()
const port = 3000

// Set public folder as root
app.use(express.static('public'))

// Provide access to node_modules folder from the client-side
app.use('/scripts', express.static(`${__dirname}/node_modules/`))

// Redirect all traffic to index.html, eventually will
// need multiple views for hosted rooms that do not close on all users leaving
app.use((req, res) => res.sendFile(`${__dirname}/public/index.html`))

app.listen(port, () => {
  console.info('listening on %d', port)
});
