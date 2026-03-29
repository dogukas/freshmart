import { supabase } from './supabaseClient';

// Simulate realistic network delay to show off UI loading states
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchProducts() {
  await delay(800); // 800ms fake delay to simulate network latency
  
  const { data, error } = await supabase
    .from('products')
    .select('*');
    
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data;
}

export async function createOrder(cartItems, total, showToast, clearCart, userId) {
  if (!userId) {
    showToast('Sipariş vermek için giriş yapmalısınız.', 'error');
    return false;
  }
  if (!cartItems || cartItems.length === 0) {
    showToast('Sepetiniz boş!', 'error');
    return false;
  }

  // 1. Create Order
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert([{ total_amount: total, status: 'completed', user_id: userId }])
    .select()
    .single();

  if (orderError) {
    console.error('Error creating order:', orderError);
    const msg = orderError.message || 'Sipariş oluşturulamadı.';
    showToast(`Ödeme hatası: ${msg}`, 'error');
    return false;
  }

  // 2. Insert Order Items
  const orderItemsData = cartItems.map(item => ({
    order_id: orderData.id,
    product_id: String(item.id),
    quantity: parseInt(item.qty),
    price: parseFloat(item.price)
  }));
  
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsData);

  if (itemsError) {
    // Non-blocking: order is created, items may fail due to RLS on old accounts
    console.warn('Order items insertion warning:', itemsError.message);
  }

  showToast(`Sipariş #${orderData.id} başarıyla alındı! 🎉`, 'success');
  if (typeof clearCart === 'function') clearCart();
  return true;
}

export async function fetchUserOrders(userId) {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }
  
  return data;
}

// =============================================
// MOBILE APP BRIDGE FUNCTIONS
// Mobil uygulamanın entegrasyon adaptörü tarafından kullanılır.
// Ayrıntılar için: INTEGRATION_HUB.md
// =============================================

/**
 * [MOBİL] Tüm siparişleri getir (admin görünümü — service_role key gerekir)
 * Mobil endpoint: GET /rest/v1/orders?select=*,order_items(*)&order=created_at.desc
 */
export async function fetchAllOrdersAdmin() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all orders:', error);
    return [];
  }
  return data;
}

/**
 * [MOBİL] Ürün stoğunu güncelle ("E-Ticarete Aktar" sonrası)
 * Mobil endpoint: PATCH /rest/v1/products?id=eq.<id>
 */
export async function updateProductStock(productId, newQty) {
  const { error } = await supabase
    .from('products')
    .update({ stock_quantity: newQty })
    .eq('id', productId);

  if (error) {
    console.error('Error updating stock:', error);
    return false;
  }
  return true;
}

/**
 * [MOBİL] Mobil uygulamadan yeni ürün ekle
 * Mobil endpoint: POST /rest/v1/products
 */
export async function addProduct(productData) {
  const { data, error } = await supabase
    .from('products')
    .insert([{
      ...productData,
      stock_quantity: productData.stock_quantity || 100,
      is_active: true,
      rating: productData.rating || 5.0,
      reviews: productData.reviews || 0
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding product:', error);
    return null;
  }
  return data;
}

/**
 * [MOBİL] Sipariş durumunu güncelle ("Kargoya Verildi", "Teslim Edildi" vs.)
 * Mobil endpoint: PATCH /rest/v1/orders?id=eq.<id>
 * @param {string} status - "pending" | "shipped" | "delivered" | "completed"
 */
export async function updateOrderStatus(orderId, status) {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) {
    console.error('Error updating order status:', error);
    return false;
  }
  return true;
}
