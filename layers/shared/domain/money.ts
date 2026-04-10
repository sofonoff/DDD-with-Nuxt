/**
 * Value Object — деньги.
 * Неизменяемый объект, определяется значением, а не идентичностью.
 * Используется для работы с ценами во всех доменах.
 */

export interface Money {
  readonly amount: number
  readonly currency: string
}

export function money(amount: number, currency = 'USD'): Money {
  return Object.freeze({ amount, currency })
}

export function addMoney(a: Money, b: Money): Money {
  return money(a.amount + b.amount, a.currency)
}

export function multiplyMoney(m: Money, qty: number): Money {
  return money(m.amount * qty, m.currency)
}

export function formatMoney(m: Money): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: m.currency,
  }).format(m.amount)
}
