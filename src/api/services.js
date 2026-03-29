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
  // 1. Create Order
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert([{ total_amount: total, status: 'completed', user_id: userId }])
    .select()
    .single();

  if (orderError) {
    console.error('Error creating order:', orderError);
    showToast('Ödeme sırasında bir hata oluştu.', 'error');
    return false;
  }

  console.log('Order created:', orderData);

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
    console.error('Order items insertion error:', itemsError);
  }

  showToast(`Sipariş #${orderData.id} başarıyla alındı!`, 'success');
  if (clearCart) clearCart();
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
