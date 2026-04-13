// src/services/services.ts
import type { CartItem, Order } from '@/types'
import { api } from './api.resources'

// Экспортируем основной API, чтобы использовать в компонентах напрямую
export { api }

// --- Локальные сервисы (Business Logic) ---

// Сервис работы с корзиной (Local Storage + API)
export const cartService = {
	load: (): CartItem[] => {
		const saved = localStorage.getItem('cart')
		return saved ? JSON.parse(saved) : []
	},
	save: (items: CartItem[]) => {
		localStorage.setItem('cart', JSON.stringify(items))
	},
	clear: () => {
		localStorage.removeItem('cart')
	}
}

// Сервис работы с заказами
export const orderService = {
	create: async (items: CartItem[]): Promise<Order> => {
		const total = items.reduce((sum, item) => {
			return sum + item.product.price * item.quantity
		}, 0)

		// Get user ID safely
		const userStr = localStorage.getItem('user')
		const userId = userStr ? JSON.parse(userStr).id : undefined

		const newOrder: Order = {
			id: Date.now().toString(), // ID should be string | number
			items: items,
			total_price: total,        // Fixed: was 'total', now matches interface
			created_at: new Date().toISOString(), // Fixed: was 'date', now matches interface
			status: 'confirmed',       // Matches the updated interface
			userId: userId
		}

		console.log('✅ Заказ создан локально:', newOrder)
		return newOrder
	}
}