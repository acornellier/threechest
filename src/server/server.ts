import express from 'express'
import cors from 'cors'

import { importRoute } from './importRouteApi.ts'

const app = express()

app.use(express.json())

app.use(cors())

app.post('/api/v1', async (req, res) => {
  try {
    const route = await importRoute(req.body.str)
    res.json(route)
  } catch (e) {
    console.error(e)
  }
})

const { PORT = 3456 } = process.env
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
