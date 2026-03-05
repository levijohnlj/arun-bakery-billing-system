import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, SaleRecord, Customer, CartItem } from '../types';

// Read Vite env vars via import.meta.env (typed because of vite/client types in tsconfig)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Validate that the URL is a real HTTP(S) URL and not a placeholder
const isValidUrl = SUPABASE_URL && SUPABASE_ANON_KEY && /^https?:\/\/.+/.test(SUPABASE_URL);

if (!isValidUrl) {
    console.warn('Supabase not configured. Please set VITE_SUPABASE_URL (must be a valid HTTP/HTTPS URL) and VITE_SUPABASE_ANON_KEY in your .env file.');
}

let _supabase: SupabaseClient | null = null;
try {
    if (isValidUrl) {
        _supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
    }
} catch (err) {
    console.error('Failed to initialize Supabase client:', err);
}

export const supabase: SupabaseClient | null = _supabase;

export const signIn = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase client not initialized.');
    return await supabase.auth.signInWithPassword({ email, password });
};

export const signOut = async () => {
    if (!supabase) throw new Error('Supabase client not initialized.');
    return await supabase.auth.signOut();
};

export const getUser = async () => {
    if (!supabase) return { data: { user: null }, error: null };
    return await supabase.auth.getUser();
};

// --- Data Services ---

// Products
export const getProducts = async (): Promise<Product[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    // Map DB fields to Type if needed, assuming 1:1 for now with camelCase conversion if DB is snake_case
    // But for simplicity, we'll assume the type matches or we map it. 
    // Let's assume DB columns are snake_case and Types are camelCase? 
    // For this fix, I will rely on the fact that valid JS props can be whatever, 
    // but ideally we should map snake_case (DB) to camelCase (App).
    // For now, let's just return data and assume we might need to adjust Types or DB.
    // Actually, to be safe, let's map it.
    return data.map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: Number(p.price),
        cost: Number(p.cost),
        stock: Number(p.stock),
        minStock: Number(p.min_stock),
        unit: p.unit
    }));
};

export const addProduct = async (product: Omit<Product, 'id'>) => {
    if (!supabase) throw new Error('No DB');
    const dbPayload = {
        name: product.name,
        category: product.category,
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        min_stock: product.minStock,
        unit: product.unit
    };
    const { data, error } = await supabase.from('products').insert(dbPayload).select().single();
    if (error) throw error;
    return data;
};

export const updateProduct = async (product: Product) => {
    if (!supabase) throw new Error('No DB');
    const dbPayload = {
        name: product.name,
        category: product.category,
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        min_stock: product.minStock,
        unit: product.unit
    };
    const { error } = await supabase.from('products').update(dbPayload).eq('id', product.id);
    if (error) throw error;
};

export const deleteProduct = async (id: string) => {
    if (!supabase) throw new Error('No DB');
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
};

// Customers
export const getCustomers = async (): Promise<Customer[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('customers').select('*');
    if (error) throw error;
    return data.map((c: any) => ({
        id: c.id,
        name: c.name,
        phone: c.phone || '',
        email: c.email || '',
        loyaltyPoints: Number(c.loyalty_points),
        totalSpent: Number(c.total_spent),
        joinDate: new Date(c.join_date)
    }));
};

export const addCustomer = async (customer: Omit<Customer, 'id' | 'joinDate' | 'loyaltyPoints' | 'totalSpent'>) => {
    if (!supabase) throw new Error('No DB');
    const dbPayload = {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        loyalty_points: 0,
        total_spent: 0
    };
    const { data, error } = await supabase.from('customers').insert(dbPayload).select().single();
    if (error) throw error;
    return data;
};

// Sales
export const createSale = async (sale: SaleRecord) => {
    if (!supabase) throw new Error('No DB');

    // 1. Create Sale Record
    const salePayload = {
        total: sale.total,
        customer_id: sale.customerId || null,
        points_earned: sale.pointsEarned ?? 0,
        points_redeemed: sale.pointsRedeemed ?? 0,
        discount_amount: sale.discountAmount ?? 0,
        timestamp: new Date().toISOString()
    };

    const { data: saleData, error: saleError } = await supabase.from('sales').insert(salePayload).select().single();
    if (saleError) throw saleError;

    const saleId = saleData.id;

    // 2. Create Sale Items
    const itemsPayload = sale.items.map(item => ({
        sale_id: saleId,
        product_id: item.id,
        quantity: item.quantity,
        price_at_sale: item.price,
        product_name: item.name
    }));

    const { error: itemsError } = await supabase.from('sale_items').insert(itemsPayload);
    if (itemsError) throw itemsError;

    // 3. Update Stock
    for (const item of sale.items) {
        // We initiate a simplified RPC or just fetch-update for now. 
        // Ideally use an RPC for atomicity, but client-side update is acceptable for this scale if RLS allows.
        // Fetch current stock
        const { data: prod } = await supabase.from('products').select('stock').eq('id', item.id).single();
        if (prod) {
            await supabase.from('products').update({ stock: prod.stock - item.quantity }).eq('id', item.id);
        }
    }

    // 4. Update Customer (if any)
    if (sale.customerId) {
        const { data: cust } = await supabase.from('customers').select('total_spent, loyalty_points').eq('id', sale.customerId).single();
        if (cust) {
            await supabase.from('customers').update({
                total_spent: Number(cust.total_spent) + sale.total,
                loyalty_points: Number(cust.loyalty_points) + (sale.pointsEarned ?? 0) - (sale.pointsRedeemed ?? 0)
            }).eq('id', sale.customerId);
        }
    }

    return saleId;
};

export const getSales = async (): Promise<SaleRecord[]> => {
    if (!supabase) return [];
    // Simplified fetch for dashboard (last 50 sales)
    const { data, error } = await supabase
        .from('sales')
        .select(`
      *,
      sale_items (*)
    `)
        .order('timestamp', { ascending: false })
        .limit(50);

    if (error) throw error;

    return data.map((s: any) => ({
        id: s.id,
        timestamp: new Date(s.timestamp),
        total: Number(s.total),
        customerId: s.customer_id,
        pointsEarned: Number(s.points_earned),
        pointsRedeemed: Number(s.points_redeemed),
        discountAmount: Number(s.discount_amount),
        items: s.sale_items.map((i: any) => ({
            id: i.product_id,
            name: i.product_name,
            price: Number(i.price_at_sale),
            quantity: Number(i.quantity),
            category: 'Unknown' // Not joined, simplified
        }))
    }));
};

export default supabase;
