import { Router } from 'express'
import {
  createBooking,
  getBooking,
  joinInvite,
  myBookings,
  previewInvite,
  updateBooking,
} from '../controllers/bookings.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)
router.get('/me', myBookings)
router.get('/invite/:token', previewInvite)
router.post('/join/:token', joinInvite)
router.post('/', createBooking)
router.get('/:id', getBooking)
router.patch('/:id', updateBooking)

export default router
