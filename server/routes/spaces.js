import { Router } from 'express'
import { getAvailability, getSpace, listSpaces } from '../controllers/spaces.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)
router.get('/', listSpaces)
router.get('/:id', getSpace)
router.get('/:id/availability', getAvailability)

export default router
