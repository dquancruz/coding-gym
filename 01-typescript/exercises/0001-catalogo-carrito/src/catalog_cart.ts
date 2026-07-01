export interface Product {
  id: string;
  name: string;
  price: number;
  state: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export type CartItem = Product & {quantity: number };

function addToCart(cart: CartItem[], product: Product, quantity: number): CartItem[] {
  const existe = cart.some(item => item.id === product.id);
  if (!existe) {
    return [...cart, { ...product, quantity }];
  }
  return cart.map(item =>
    item.id === product.id
      ? { ...item, quantity: item.quantity + quantity }
      : item
  );
}

function calculateTotal(cart: CartItem[]): number{
  return cart.reduce((acumulado, item) => {
    const subtotal = item.price * item.quantity;
    return subtotal + acumulado;
  }, 0);
};

function applyDiscount(product: Product, discountpercentage: number): Product {
  const factorDescuento = 1 - (discountpercentage / 100);
  return {
    ...product,
    price: product.price * factorDescuento
  };
}
