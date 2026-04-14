<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
// Импортируем наш API клиент
import { api } from '../../services/api.resources' 

const router = useRouter()
const authStore = useAuthStore()

const products = ref<any[]>([])
const isLoading = ref(true)
const showModal = ref(false)
const isEditing = ref(false)
const currentProduct = ref<any>(null)
const isSaving = ref(false)

// Форма товара
const form = ref({
  title: '',
  price: 0,
  old_price: null as number | null,
  category: 'gpu',
  image: '',
  description: '',
  stock: 10,
  brand: '',
  is_featured: false
})

onMounted(async () => {
  // Проверка прав
  if (!authStore.isAuthenticated || authStore.user?.role !== 'admin') {
    alert('Доступ запрещен: требуются права администратора')
    router.push('/')
    return
  }
  
  await fetchProducts()
})

const fetchProducts = async () => {
  isLoading.value = true
  try {
    // Используем API клиент. 
    // Если у вас есть специальный метод для админа, используйте его. 
    // Если нет, используем общий getAll, но обычно он публичный.
    // Предположим, что мы добавим метод getAdminProducts в api.products или api.admin
    
    // Вариант 1: Если есть метод в api.admin (рекомендуется)
    // products.value = await api.admin.getProducts() 
    
    // Вариант 2: Временный, через прямой запрос внутри api клиента, если метода нет
    // Но лучше добавьте метод в api.ts! Ниже пример использования гипотетического метода:
    const res = await api.products.getAll() // Или api.admin.getAllProducts()
    products.value = res
  } catch (e) {
    console.error('Ошибка загрузки товаров:', e)
    alert('Не удалось загрузить товары')
  } finally {
    isLoading.value = false
  }
}

const openCreateModal = () => {
  isEditing.value = false
  form.value = {
    title: '', 
    price: 0, 
    old_price: null, 
    category: 'gpu', 
    image: '', 
    description: '', 
    stock: 10, 
    brand: '', 
    is_featured: false
  }
  showModal.value = true
}

const openEditModal = (product: any) => {
  isEditing.value = true
  currentProduct.value = product
  // Копируем данные, чтобы не менять исходный объект сразу
  form.value = { 
    ...product,
    old_price: product.old_price || null
  }
  showModal.value = true
}

const saveProduct = async () => {
  if (!form.value.title || !form.value.price) {
    alert('Заполните обязательные поля')
    return
  }

  isSaving.value = true
  try {
    if (isEditing.value && currentProduct.value) {
      // Обновление
      await api.products.update(currentProduct.value.id, form.value)
    } else {
      // Создание
      await api.products.create(form.value)
    }
    
    showModal.value = false
    await fetchProducts() // Обновляем список
  } catch (e: any) {
    console.error(e)
    alert(`Ошибка сохранения: ${e.message || 'Неизвестная ошибка'}`)
  } finally {
    isSaving.value = false
  }
}

const deleteProduct = async (id: number) => {
  if (!confirm('Вы уверены, что хотите удалить этот товар?')) return
  
  try {
    await api.products.delete(id)
    await fetchProducts()
  } catch (e) {
    alert('Ошибка удаления')
  }
}
</script>

<template>
  <div class="min-h-screen bg-base-100 p-8">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-white">Админ-панель: Товары</h1>
        <button @click="openCreateModal" class="btn btn-primary">+ Добавить товар</button>
      </div>

      <!-- Индикатор загрузки -->
      <div v-if="isLoading" class="flex justify-center py-10">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>

      <!-- Таблица товаров -->
      <div v-else class="overflow-x-auto bg-base-200 rounded-lg shadow-xl">
        <table class="table w-full">
          <thead>
            <tr class="text-base-content/70">
              <th>Фото</th>
              <th>Название</th>
              <th>Категория</th>
              <th>Цена</th>
              <th>Приоритет</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in products" :key="p.id" class="hover:bg-white/5">
              <td>
                <div class="w-12 h-12 rounded overflow-hidden bg-base-300 flex items-center justify-center">
                  <img v-if="p.image" :src="p.image" class="w-full h-full object-cover" />
                  <span v-else class="text-xs text-gray-500">Нет фото</span>
                </div>
              </td>
              <td class="font-bold">{{ p.title }}</td>
              <td>{{ p.category }}</td>
              <td>{{ p.price }} ₽</td>
              <td>
                <span v-if="p.is_featured" class="badge badge-warning">TOP</span>
                <span v-else class="badge badge-ghost">Обычный</span>
              </td>
              <td class="space-x-2">
                <button @click="openEditModal(p)" class="btn btn-xs btn-outline btn-info">Ред.</button>
                <button @click="deleteProduct(p.id)" class="btn btn-xs btn-outline btn-error">Удал.</button>
              </td>
            </tr>
            <tr v-if="products.length === 0">
              <td colspan="6" class="text-center py-4 text-base-content/50">Товары не найдены</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Модальное окно создания/редактирования -->
      <dialog :class="['modal modal-bottom sm:modal-middle', showModal ? 'modal-open' : '']">
        <div class="modal-box bg-base-200">
          <h3 class="font-bold text-lg mb-4">{{ isEditing ? 'Редактирование' : 'Новый товар' }}</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="col-span-1 md:col-span-2">
              <label class="label"><span class="label-text">Название товара</span></label>
              <input v-model="form.title" placeholder="Например: RTX 4090 Gaming OC" class="input input-bordered w-full" />
            </div>
            
            <div>
              <label class="label"><span class="label-text">Цена (₽)</span></label>
              <input v-model.number="form.price" type="number" placeholder="0" class="input input-bordered w-full" />
            </div>
            
            <div>
              <label class="label"><span class="label-text">Старая цена (₽)</span></label>
              <input v-model.number="form.old_price" type="number" placeholder="Необязательно" class="input input-bordered w-full" />
            </div>
            
            <div>
              <label class="label"><span class="label-text">Категория</span></label>
              <select v-model="form.category" class="select select-bordered w-full">
                <option value="gpu">Видеокарты</option>
                <option value="cpu">Процессоры</option>
                <option value="laptop">Ноутбуки</option>
                <option value="motherboard">Материнские платы</option>
                <option value="ram">Оперативная память</option>
              </select>
            </div>

            <div>
              <label class="label"><span class="label-text">Бренд</span></label>
              <input v-model="form.brand" placeholder="ASUS, NVIDIA..." class="input input-bordered w-full" />
            </div>
            
            <div class="col-span-1 md:col-span-2">
              <label class="label"><span class="label-text">Ссылка на изображение</span></label>
              <input v-model="form.image" placeholder="https://..." class="input input-bordered w-full" />
            </div>
            
            <div class="col-span-1 md:col-span-2">
              <label class="label"><span class="label-text">Описание</span></label>
              <textarea v-model="form.description" placeholder="Характеристики и особенности..." class="textarea textarea-bordered w-full h-24"></textarea>
            </div>
            
            <div class="col-span-1 md:col-span-2">
               <label class="label cursor-pointer justify-start gap-3">
                <input type="checkbox" v-model="form.is_featured" class="checkbox checkbox-primary" />
                <span class="label-text font-bold">Показывать на главной (Приоритет / TOP)</span>
              </label>
            </div>
          </div>

          <div class="modal-action">
            <button @click="showModal = false" class="btn btn-ghost" :disabled="isSaving">Отмена</button>
            <button @click="saveProduct" class="btn btn-primary" :disabled="isSaving">
              <span v-if="isSaving" class="loading loading-spinner loading-sm"></span>
              {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </div>
        <!-- Закрытие по клику вне окна -->
        <form method="dialog" class="modal-backdrop">
          <button @click="showModal = false">close</button>
        </form>
      </dialog>
    </div>
  </div>
</template>