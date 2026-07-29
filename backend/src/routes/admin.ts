import { Router } from 'express'
import { requireAdmin, requireAuth } from '../middleware/auth.js'
import { runSync, findSyncRuns } from '../services/sync.js'
import { logAudit } from '../services/audit.js'
import { createPasswordResetToken, sendPasswordResetEmail } from '../services/passwordReset.js'
import {
  blocksLastAdminDemotion,
  countAdmins,
  deleteUserAdmin,
  findUserAdminById,
  findUsersAdmin,
  updateUserBlocked,
  updateUserRole,
} from '../services/users.js'
import { findAnimalAdminById, findAnimalsAdmin, updateAnimalOverrides } from '../services/animals.js'
import {
  adminAnimalListQuerySchema,
  adminUserListQuerySchema,
  updateAnimalOverridesSchema,
  updateUserBlockedSchema,
  updateUserRoleSchema,
} from '../validation/admin.js'

export const adminRouter = Router()

adminRouter.use(requireAuth, requireAdmin)

adminRouter.get('/users', async (req, res) => {
  const parsed = adminUserListQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Ungültige Eingabe' })
  }
  const { page, pageSize, ...filters } = parsed.data
  const { users, total } = await findUsersAdmin({ ...filters, page, pageSize })
  res.json({ users, total, page, pageSize })
})

adminRouter.get('/users/:id', async (req, res) => {
  const user = await findUserAdminById(req.params.id)
  if (!user) {
    return res.status(404).json({ error: 'Nutzer:in nicht gefunden' })
  }
  res.json({ user })
})

adminRouter.patch('/users/:id/block', async (req, res) => {
  const parsed = updateUserBlockedSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Ungültige Eingabe' })
  }
  const target = await findUserAdminById(req.params.id)
  if (!target) {
    return res.status(404).json({ error: 'Nutzer:in nicht gefunden' })
  }

  await updateUserBlocked(target.id, parsed.data.isBlocked)
  await logAudit(req.user!.id, parsed.data.isBlocked ? 'user.block' : 'user.unblock', 'user', target.id)
  res.json({ user: await findUserAdminById(target.id) })
})

adminRouter.patch('/users/:id/role', async (req, res) => {
  const parsed = updateUserRoleSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Ungültige Eingabe' })
  }
  const target = await findUserAdminById(req.params.id)
  if (!target) {
    return res.status(404).json({ error: 'Nutzer:in nicht gefunden' })
  }

  if (blocksLastAdminDemotion(target.role, parsed.data.role, await countAdmins())) {
    return res.status(400).json({ error: 'Der letzte verbleibende Admin kann nicht degradiert werden' })
  }

  await updateUserRole(target.id, parsed.data.role)
  await logAudit(req.user!.id, 'user.role_change', 'user', target.id, {
    from: target.role,
    to: parsed.data.role,
  })
  res.json({ user: await findUserAdminById(target.id) })
})

adminRouter.post('/users/:id/reset-password', async (req, res) => {
  const target = await findUserAdminById(req.params.id)
  if (!target) {
    return res.status(404).json({ error: 'Nutzer:in nicht gefunden' })
  }

  const token = await createPasswordResetToken(target.id)
  sendPasswordResetEmail(target.email, token)
  await logAudit(req.user!.id, 'user.password_reset_triggered', 'user', target.id)
  res.json({ message: 'Reset-Link wurde ausgelöst' })
})

adminRouter.delete('/users/:id', async (req, res) => {
  const target = await findUserAdminById(req.params.id)
  if (!target) {
    return res.status(404).json({ error: 'Nutzer:in nicht gefunden' })
  }

  await logAudit(req.user!.id, 'user.admin_delete', 'user', target.id, { email: target.email })
  await deleteUserAdmin(target.id)
  res.status(204).end()
})

adminRouter.get('/animals', async (req, res) => {
  const parsed = adminAnimalListQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Ungültige Eingabe' })
  }
  const { page, pageSize, ...filters } = parsed.data
  const { animals, total } = await findAnimalsAdmin({ ...filters, page, pageSize })
  res.json({ animals, total, page, pageSize })
})

adminRouter.get('/animals/:id', async (req, res) => {
  const animal = await findAnimalAdminById(req.params.id)
  if (!animal) {
    return res.status(404).json({ error: 'Tier nicht gefunden' })
  }
  res.json({ animal })
})

adminRouter.patch('/animals/:id', async (req, res) => {
  const parsed = updateAnimalOverridesSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Ungültige Eingabe' })
  }
  const target = await findAnimalAdminById(req.params.id)
  if (!target) {
    return res.status(404).json({ error: 'Tier nicht gefunden' })
  }

  await updateAnimalOverrides(target.id, parsed.data.overrides, parsed.data.isHidden)
  await logAudit(req.user!.id, 'animal.override', 'animal', target.id, { overrides: parsed.data.overrides })
  res.json({ animal: await findAnimalAdminById(target.id) })
})

adminRouter.get('/sync-runs', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100)
  res.json({ syncRuns: await findSyncRuns(limit) })
})

adminRouter.post('/sync', async (_req, res) => {
  const summary = await runSync('admin')
  const statusCode = summary.status === 'success' ? 200 : 502
  res.status(statusCode).json(summary)
})
