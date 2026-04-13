<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { api } from '../../services/api.resources' 

// --- Интерфейсы для типов (чтобы TS не ругался) ---
interface Order {
  id: number;
  client_name?: string;
  client_email?: string;
  total_price: number;
  status: string;
  created_at: string;
}

interface ProductStat {
  title: string;
  sold_count: number;
}

// --- Реактивные данные ---
const dashboardData = ref({
  revenue: { today: 0, percentChange: 0 },
  orders: { total: 0, lastHour: 0 },
  users: { total: 0 },
  visits: { lastHour: 0, lastMonth: 0, lastYear: 0, total: 0 },
  recentOrders: [] as Order[],
  topProducts: [] as ProductStat[]
});

const isLoading = ref(true);

// Форматирование денег
const formatPrice = (price: number) => new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
const formatNumber = (num: number) => new Intl.NumberFormat('ru-RU').format(num);

// Получение статуса заказа (для бейджиков)
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'paid': case 'completed': return { class: 'badge-success', text: 'Оплачен' };
    case 'pending': return { class: 'badge-warning', text: 'В обработке' };
    case 'failed': case 'cancelled': return { class: 'badge-error', text: 'Отмена' };
    default: return { class: 'badge-ghost', text: status };
  }
};

// Вычисляемое свойство для макс. продаж топа (для прогресс бара 100%)
const maxSoldCount = computed(() => {
  if (!dashboardData.value.topProducts.length) return 1;
  return Math.max(...dashboardData.value.topProducts.map(p => Number(p.sold_count)));
});

// Загрузка данных
const fetchDashboardData = async () => {
  isLoading.value = true;
  try {
    // Предполагаем, что вы добавили этот метод в api.resources.ts
    // Если нет, можно использовать прямой запрос через fetch или axios
    const data = await api.admin.getFullDashboardStats(); 
    dashboardData.value = data;
  } catch (error) {
    console.error("Ошибка загрузки дашборда:", error);
    // Fallback на пустые данные или моки, если API упал
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchDashboardData();
});

const activeMenu = ref('dashboard');
</script>

<template>
  <div class="flex min-h-screen bg-base-100 text-base-content font-sans">
    
    <!-- Sidebar (Без изменений) -->
    <aside class="w-64 bg-base-200 border-r border-white/5 hidden md:flex flex-col fixed h-full z-20">
      <div class="h-16 flex items-center px-6 border-b border-white/5">
        <span class="text-xl font-bold text-white uppercase tracking-widest">Tech<span class="text-primary">Nova</span></span>
      </div>
      <ul class="menu p-4 gap-2 flex-1">
        <li><a @click="activeMenu = 'dashboard'" :class="{ 'active bg-primary/10 text-primary border-l-4 border-primary': activeMenu === 'dashboard' }" class="hover:bg-white/5 hover:text-white transition-all"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>Дашборд</a></li>
        <li><a @click="activeMenu = 'products'" class="hover:bg-white/5 hover:text-white transition-all"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>Товары</a></li>
        <li><a @click="activeMenu = 'orders'" class="hover:bg-white/5 hover:text-white transition-all"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>Заказы</a></li>
      </ul>
      <div class="p-4 border-t border-white/5 bg-black/20">
         <div class="flex items-center gap-3">
          <div class="avatar online"><div class="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2"><img src="https://via.placeholder.com/100/1b2838/66c0f4?text=AD" /></div></div>
          <div><div class="font-bold text-sm text-white">Artem Admin</div><div class="text-xs text-base-content/50">SuperUser</div></div>
        </div>
      </div>
    </aside>

    <main class="flex-1 md:ml-64 p-6 lg:p-10 overflow-y-auto">
      
      <header class="flex justify-between items-center mb-8">
        <h1 class="text-2xl font-bold text-white uppercase tracking-wide">Обзор системы</h1>
        <button class="btn btn-success btn-sm text-white shadow-lg shadow-success/20">+ Добавить товар</button>
      </header>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>

      <div v-else>
        <!-- ВЕРХНИЕ МЕТРИКИ -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          <!-- Выручка -->
          <div class="stat bg-base-200 border border-white/5 rounded-lg shadow-md relative overflow-hidden">
            <div class="stat-figure text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div class="stat-title text-base-content/60">Выручка (Сегодня)</div>
            <div class="stat-value text-white text-3xl">{{ formatPrice(dashboardData.revenue.today) }}</div>
            <div class="stat-desc" :class="dashboardData.revenue.percentChange >= 0 ? 'text-success' : 'text-error'">
              {{ dashboardData.revenue.percentChange >= 0 ? '↗︎' : '↘︎' }} {{ Math.abs(dashboardData.revenue.percentChange) }}% к вчерашнему дню
            </div>
            <div class="absolute top-0 right-0 h-full w-1 bg-primary"></div>
          </div>

          <!-- Заказы -->
          <div class="stat bg-base-200 border border-white/5 rounded-lg shadow-md relative overflow-hidden">
            <div class="stat-figure text-secondary">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            </div>
            <div class="stat-title text-base-content/60">Всего заказов</div>
            <div class="stat-value text-white text-3xl">{{ formatNumber(dashboardData.orders.total) }}</div>
            <div class="stat-desc text-secondary">{{ dashboardData.orders.lastHour }} новых за последний час</div>
            <div class="absolute top-0 right-0 h-full w-1 bg-secondary"></div>
          </div>

          <!-- Пользователи -->
          <div class="stat bg-base-200 border border-white/5 rounded-lg shadow-md relative overflow-hidden">
            <div class="stat-figure text-accent">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <div class="stat-title text-base-content/60">Пользователи</div>
            <div class="stat-value text-white text-3xl">{{ formatNumber(dashboardData.users.total) }}</div>
            <div class="stat-desc text-base-content/50">Зарегистрировано</div>
            <div class="absolute top-0 right-0 h-full w-1 bg-accent"></div>
          </div>

          <!-- Посещения (За час) -->
          <div class="stat bg-base-200 border border-white/5 rounded-lg shadow-md relative overflow-hidden">
            <div class="stat-figure text-warning">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </div>
            <div class="stat-title text-base-content/60">Активность (Час)</div>
            <div class="stat-value text-white text-3xl">{{ formatNumber(dashboardData.visits.lastHour) }}</div>
            <div class="stat-desc text-base-content/50">Уникальных визитов</div>
            <div class="absolute top-0 right-0 h-full w-1 bg-warning"></div>
          </div>
        </div>

        <!-- СЕКЦИЯ ПОСЕЩАЕМОСТИ (ДЕТАЛЬНО) -->
        <h3 class="text-lg font-bold text-white uppercase tracking-wide mb-4">Детальная статистика посещений</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="stat bg-base-200 border border-white/5 rounded-lg shadow-md">
                <div class="stat-title">За месяц</div>
                <div class="stat-value text-2xl">{{ formatNumber(dashboardData.visits.lastMonth) }}</div>
            </div>
            <div class="stat bg-base-200 border border-white/5 rounded-lg shadow-md">
                <div class="stat-title">За год</div>
                <div class="stat-value text-2xl">{{ formatNumber(dashboardData.visits.lastYear) }}</div>
            </div>
            <div class="stat bg-base-200 border border-white/5 rounded-lg shadow-md">
                <div class="stat-title">Всего</div>
                <div class="stat-value text-2xl">{{ formatNumber(dashboardData.visits.total) }}</div>
            </div>
        </div>

        <!-- ГРАФИК И ТОП ТОВАРОВ -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          <!-- График (Пока оставим мок, так как для реального графика нужна история по дням) -->
          <div class="lg:col-span-2 bg-base-200 border border-white/5 rounded-lg p-6 shadow-lg">
            <h3 class="text-lg font-bold text-white mb-6 uppercase tracking-wide border-b border-white/5 pb-2">Активность продаж (Демо)</h3>
            <div class="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-4">
               <!-- Здесь можно добавить цикл v-for по данным истории, если добавите их в API -->
               <div v-for="val in [40, 65, 35, 85, 55, 95, 70]" :key="val" class="group relative w-full flex flex-col justify-end items-center h-full">
                  <div class="opacity-0 group-hover:opacity-100 absolute -top-8 bg-black text-white text-xs py-1 px-2 rounded transition-opacity z-10">{{ val }}%</div>
                  <div class="w-full max-w-[40px] bg-base-300 rounded-t-sm hover:bg-primary transition-all duration-300 cursor-pointer relative" :style="{ height: val + '%' }"></div>
               </div>
            </div>
          </div>

          <!-- Топ товаров (Динамический) -->
          <div class="bg-base-200 border border-white/5 rounded-lg p-6 shadow-lg">
            <h3 class="text-lg font-bold text-white mb-6 uppercase tracking-wide border-b border-white/5 pb-2">Топ товаров</h3>
            <div class="space-y-6">
              <div v-for="(item, idx) in dashboardData.topProducts" :key="idx">
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-white font-medium truncate w-2/3">{{ item.title }}</span>
                  <span class="text-base-content/60">{{ item.sold_count }} шт.</span>
                </div>
                <progress 
                  class="progress w-full h-2 bg-base-300" 
                  :value="(Number(item.sold_count) / maxSoldCount) * 100" 
                  max="100"
                  :class="idx === 0 ? 'progress-primary' : idx === 1 ? 'progress-success' : 'progress-warning'"
                ></progress>
              </div>
              <div v-if="dashboardData.topProducts.length === 0" class="text-center text-base-content/50 py-4">
                Нет данных о продажах
              </div>
            </div>
          </div>
        </div>

        <!-- ТАБЛИЦА ЗАКАЗОВ (Динамическая) -->
        <div class="bg-base-200 border border-white/5 rounded-lg shadow-lg overflow-hidden">
          <div class="p-6 border-b border-white/5 flex justify-between items-center">
            <h3 class="text-lg font-bold text-white uppercase tracking-wide">Последние заказы</h3>
            <button class="btn btn-xs btn-ghost text-primary">Показать все</button>
          </div>
          <div class="overflow-x-auto">
            <table class="table w-full">
              <thead>
                <tr class="bg-base-300/50 text-base-content/70 uppercase text-xs">
                  <th>ID</th>
                  <th>Клиент</th>
                  <th>Сумма</th>
                  <th>Статус</th>
                  <th class="text-right">Дата</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in dashboardData.recentOrders" :key="order.id" class="hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                  <td class="font-mono text-primary font-bold">#{{ order.id }}</td>
                  <td class="text-white font-medium">
                    {{ order.client_name || order.client_email }}
                  </td>
                  <td class="font-mono">{{ formatPrice(order.total_price) }}</td>
                  <td>
                    <div class="badge text-[10px] font-bold uppercase px-3 gap-1" :class="getStatusBadge(order.status).class">
                      {{ getStatusBadge(order.status).text }}
                    </div>
                  </td>
                  <td class="text-right text-xs text-base-content/50">
                    {{ new Date(order.created_at).toLocaleDateString('ru-RU') }}
                  </td>
                </tr>
                <tr v-if="dashboardData.recentOrders.length === 0">
                    <td colspan="5" class="text-center py-4 text-base-content/50">Заказов пока нет</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>