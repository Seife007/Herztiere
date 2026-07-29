import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import {
  findAnimalById,
  findAnimalsForSwiping,
  likeAnimal,
  unlikeAnimal,
} from '../services/animals.js'

export const animalsRouter = Router()

animalsRouter.use(requireAuth)

animalsRouter.get('/', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200)
  res.json({ animals: await findAnimalsForSwiping(req.user!.id, limit) })
})

animalsRouter.get('/:id', async (req, res) => {
  const animal = await findAnimalById(req.params.id, req.user!.id)
  if (!animal) {
    return res.status(404).json({ error: 'Tier nicht gefunden' })
  }
  res.json({ animal })
})

animalsRouter.post('/:id/likes', async (req, res) => {
  const animal = await findAnimalById(req.params.id, req.user!.id)
  if (!animal) {
    return res.status(404).json({ error: 'Tier nicht gefunden' })
  }
  await likeAnimal(req.user!.id, req.params.id)
  res.status(204).end()
})

animalsRouter.delete('/:id/likes', async (req, res) => {
  await unlikeAnimal(req.user!.id, req.params.id)
  res.status(204).end()
})
