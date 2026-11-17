import cors from 'cors'
import express from 'express'
import authRoutes from './routes/auth.js'
import bookingRoutes from './routes/bookings.js'
import spaceRoutes from './routes/spaces.js'
import { RuleError } from './services/rules.js'

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/auth', authRoutes)
app.use('/api/spaces', spaceRoutes)
app.use('/api/bookings', bookingRoutes)

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }))

// Express 5 forwards thrown/rejected errors here.
app.use((err, req, res, _next) => {
  if (err instanceof RuleError) return res.status(err.status).json({ error: err.message })
  console.error(err)
  res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' })
})

const port = Number(process.env.PORT || 4000)
app.listen(port, () => console.log(`API listening on http://localhost:${port}`))
