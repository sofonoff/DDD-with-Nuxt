/**
 * Тесты Value Object Money.
 */

import { describe, it, expect } from 'vitest'
import { money, addMoney, multiplyMoney, formatMoney } from '../money'

describe('money', () => {
  it('money() creates frozen object', () => {
    const m = money(100)
    expect(m.amount).toBe(100)
    expect(m.currency).toBe('USD')
    expect(Object.isFrozen(m)).toBe(true)
  })

  it('addMoney adds two money values', () => {
    const result = addMoney(money(100), money(50))
    expect(result.amount).toBe(150)
  })

  it('multiplyMoney multiplies by quantity', () => {
    const result = multiplyMoney(money(29.99), 3)
    expect(result.amount).toBeCloseTo(89.97)
  })

  it('formatMoney formats as currency', () => {
    const result = formatMoney(money(1299.99))
    expect(result).toContain('1,299.99')
  })
})
