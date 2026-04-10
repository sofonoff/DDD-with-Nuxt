/**
 * Server API / GET /api/orders — returns all orders.
 * Mock: stores orders in server memory.
 */

import { orders } from './store'

export default defineEventHandler(() => orders)
