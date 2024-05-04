const express = require('express')
const fs = require('fs')
const { OpenAI } = require('openai')
const axios = require('axios')
const path = require('path')

const app = express()
app.use(express.static(path.join(__dirname, 'public')))

app.use(express.json()) // For parsing application/json

let currentTime
let items

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  currentTime = Date()
  console.log(`${currentTime} Server is running on port ${PORT}`)
})

const openai = new OpenAI({
  apiKey: 'sk-proj-2bnDqQtWjVV2AvuD7YKyT3BlbkFJoXtuqsXv75d4bpzTGEVn', // Should hide this
})

// =========================================================================
// MIDDLEWARE
// =========================================================================

// Home Page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
  currentTime = Date()
  console.log(`${currentTime} Server is running on port ${PORT}`)
})

// On Page Reload
app.get('/get-items', (req, res) => {
  fs.readFile('items.json', (err, data) => {
    if (err) {
      console.error(err)
      return res
        .status(500)
        .json({ success: false, message: 'Failed to load items.' })
    }
    items = JSON.parse(data.toString() || '[]')
    res.json({ success: true, items })
  })
})

// User adds item
app.post('/add-item', async (req, res) => {
  const { item } = req.body
  try {
    const response = await openai.images.generate({
      model: 'dall-e-2',
      prompt: item.toString(),
      n: 1,
      size: '512x512',
    })

    imageUrl = response.data[0].url

    // Download image from URL
    const responseImage = await axios({
      url: imageUrl,
      responseType: 'arraybuffer',
    })

    const imagePath = path.join('images', `${item}.png`)
    console.log(imagePath)

    fs.writeFile(
      __dirname + '/public/' + imagePath,
      responseImage.data,
      'binary',
      function (err) {
        if (err) {
          console.log(err)
          return res.json({ success: false })
        }
        console.log('File saved.')
      },
    )

    const id = items.length
    const newItem = { id, item, imagePath }
    items.push(newItem)

    fs.writeFile('items.json', JSON.stringify(items, null, 2), (err) => {
      if (err) {
        console.error(err)
        return res.json({ success: false })
      }
      res.json({ success: true, id: newItem.id, imagePath: newItem.imagePath })
    })
  } catch (error) {
    console.error('Error generating image:', error)
    return res
      .status(500)
      .json({ success: false, message: 'Failed to generate image' })
  }
})

// User Deletes item
app.post('/delete-item', (req, res) => {
  const { id } = req.body
  fs.readFile('items.json', (err, data) => {
    if (err) {
      console.error(err)
      return res.json({ success: false })
    }
    items = JSON.parse(data.toString() || '[]')
    items = items.filter((item) => item.id !== id)
    fs.writeFile('items.json', JSON.stringify(items, null, 2), (err) => {
      if (err) {
        console.error(err)
        return res.json({ success: false })
      }
      currentTime = Date()
      console.log(`${currentTime} : Item deleted. `)
      res.json({ success: true })
    })
  })
})

// =========================================================================
// UTILITIES
// =========================================================================
