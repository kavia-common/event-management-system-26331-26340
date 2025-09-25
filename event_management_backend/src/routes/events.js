'use strict';

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const eventsService = require('../services/events');
const attendeesService = require('../services/attendees');

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management
 */

/**
 * @swagger
 * /events:
 *   get:
 *     summary: List events
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         description: List of events
 */
router.get('/', async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await eventsService.listEvents({ page, limit });
    res.json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Get an event by id
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Event details
 *       404:
 *         description: Not found
 */
router.get('/:id', async (req, res, next) => {
  try {
    const event = await eventsService.getEventById(Number(req.params.id));
    if (!event) return res.status(404).json({ status: 'error', message: 'Event not found' });
    res.json({ status: 'success', data: event });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, start_time, end_time]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               location: { type: string }
 *               start_time: { type: string, format: date-time }
 *               end_time: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Invalid payload
 *       401:
 *         description: Unauthorized
 */
router.post('/', requireAuth, async (req, res, next) => {
  try {
    await eventsService.createEvent(req.body || {}, req.user.id);
    res.status(201).json({ status: 'success' });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Update an event (owner only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = await eventsService.getEventById(id);
    if (!existing) return res.status(404).json({ status: 'error', message: 'Event not found' });
    const isOwner = await eventsService.isOwner(id, req.user.id);
    if (!isOwner) return res.status(403).json({ status: 'error', message: 'Forbidden' });
    await eventsService.updateEvent(id, req.body || {});
    res.json({ status: 'success' });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Delete an event (owner only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = await eventsService.getEventById(id);
    if (!existing) return res.status(404).json({ status: 'error', message: 'Event not found' });
    const isOwner = await eventsService.isOwner(id, req.user.id);
    if (!isOwner) return res.status(403).json({ status: 'error', message: 'Forbidden' });
    await eventsService.deleteEvent(id);
    res.json({ status: 'success' });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /events/{id}/attendees:
 *   get:
 *     summary: List attendees for event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of attendees
 *       404:
 *         description: Event not found
 */
router.get('/:id/attendees', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const event = await eventsService.getEventById(id);
    if (!event) return res.status(404).json({ status: 'error', message: 'Event not found' });
    const attendees = await attendeesService.listAttendees(id);
    res.json({ status: 'success', data: attendees });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /events/{id}/attendees:
 *   post:
 *     summary: Add attendee to event (owner only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id]
 *             properties:
 *               user_id: { type: integer }
 *               status: { type: string, enum: [invited, confirmed, declined] }
 *     responses:
 *       201:
 *         description: Added
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Event not found
 */
router.post('/:id/attendees', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { user_id, status } = req.body || {};
    const existing = await eventsService.getEventById(id);
    if (!existing) return res.status(404).json({ status: 'error', message: 'Event not found' });
    const isOwner = await eventsService.isOwner(id, req.user.id);
    if (!isOwner) return res.status(403).json({ status: 'error', message: 'Forbidden' });
    if (!user_id) return res.status(400).json({ status: 'error', message: 'user_id is required' });
    await attendeesService.addAttendee(id, Number(user_id), status || 'invited');
    res.status(201).json({ status: 'success' });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /events/{id}/attendees/{userId}:
 *   delete:
 *     summary: Remove attendee from event (owner only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Removed
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Event not found
 */
router.delete('/:id/attendees/:userId', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const userId = Number(req.params.userId);
    const existing = await eventsService.getEventById(id);
    if (!existing) return res.status(404).json({ status: 'error', message: 'Event not found' });
    const isOwner = await eventsService.isOwner(id, req.user.id);
    if (!isOwner) return res.status(403).json({ status: 'error', message: 'Forbidden' });
    await attendeesService.removeAttendee(id, userId);
    res.json({ status: 'success' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
