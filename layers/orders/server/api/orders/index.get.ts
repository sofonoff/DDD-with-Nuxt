/**
 * Server API / GET /api/orders — возвращает все заказы.
 * Мок: хранит заказы в памяти сервера.
 */

import { orders } from './store'

export default defineEventHandler(() => orders)
