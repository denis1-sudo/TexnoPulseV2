import pool from '../config/db.js'
// Если у вас есть мидлвара для проверки админа, импортируйте её. 
// Если нет, можно использовать authMiddleware, но лучше сделать adminMiddleware
import { authMiddleware } from './userController.js' 

/**
 * Получить статистику посещений
 * Возвращает:
 * - visitsLastHour: Уникальные пользователи за последний час
 * - visitsLastMonth: Уникальные пользователи за последние 30 дней
 * - visitsLastYear: Уникальные пользователи за последние 365 дней
 * - totalVisits: Общее количество уникальных пользователей в системе
 */
export const getVisitStats = async (req, res) => {
	try {
		// Выполняем все запросы параллельно для скорости
		const [hourRes, monthRes, yearRes, totalRes] = await Promise.all([
			// 1. За последний час
			pool.query(`
				SELECT COUNT(DISTINCT user_id) as count 
				FROM user_activity_log 
				WHERE created_at >= NOW() - INTERVAL '1 hour'
			`),
			
			// 2. За последний месяц (30 дней)
			pool.query(`
				SELECT COUNT(DISTINCT user_id) as count 
				FROM user_activity_log 
				WHERE created_at >= NOW() - INTERVAL '30 days'
			`),

			// 3. За последний год (365 дней)
			pool.query(`
				SELECT COUNT(DISTINCT user_id) as count 
				FROM user_activity_log 
				WHERE created_at >= NOW() - INTERVAL '365 days'
			`),

			// 4. Всего (все уникальные пользователи, когда-либо проявившие активность)
			pool.query(`
				SELECT COUNT(DISTINCT user_id) as count 
				FROM user_activity_log
			`)
		])

		// Формируем ответ
		const stats = {
			visitsLastHour: parseInt(hourRes.rows[0].count) || 0,
			visitsLastMonth: parseInt(monthRes.rows[0].count) || 0,
			visitsLastYear: parseInt(yearRes.rows[0].count) || 0,
			totalVisits: parseInt(totalRes.rows[0].count) || 0
		}

		res.json(stats)

	} catch (err) {
		console.error('Ошибка при получении статистики посещений:', err)
		
		// Если таблица еще не создана, возвращаем нули, чтобы фронт не падал
		if (err.code === '42P01') { // undefined_table
			return res.json({
				visitsLastHour: 0,
				visitsLastMonth: 0,
				visitsLastYear: 0,
				totalVisits: 0
			})
		}

		res.status(500).json({ error: 'Ошибка сервера при получении статистики' })
	}
}

export default {
	getVisitStats
}