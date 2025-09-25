'use strict';

const express = require('express');
const router = express.Router();
const usersService = require('../services/users');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string, format: password }
 *     responses:
 *       201:
 *         description: Registered successfully
 */
router.post('/register', async (req, res, next) => {
  try {
    const { user, token } = await usersService.register(req.body || {});
    res.status(201).json({ status: 'success', data: { user, token } });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string, format: password }
 *     responses:
 *       200:
 *         description: Logged in successfully
 */
router.post('/login', async (req, res, next) => {
  try {
    const result = await usersService.login(req.body || {});
    res.json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
