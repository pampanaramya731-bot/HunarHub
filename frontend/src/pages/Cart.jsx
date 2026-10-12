import { useState } from "react";

function Cart() {
const [cart, setCart] = useState(() =>
JSON.parse(localStorage.getItem("cart") || "[]")
);

function updateQuantity(id, change) {
const updated = cart
.map((item) =>
item.id === id
? { ...item, quantity: (item.quantity || 1) + change }
: item
)
.filter((item) => item.quantity > 0);

```
localStorage.setItem("cart", JSON.stringify(updated));
setCart(updated);
```

}

const total = cart.reduce(
(sum, item) =>
sum + Number(String(item.price).replace("₹", "")) * (item.quantity || 1),
0
);

return ( <div className="page"> <h1>My Shopping Cart 🛒</h1>

```
  {cart.length === 0 ? (
    <p>Your cart is empty. Please add products!</p>
  ) : (
    <>
      {cart.map((item) => (
        <div className="card" key={item.id}>
          <h3>{item.name}</h3>
          <p>Price: {item.price}</p>
          <button onClick={() => updateQuantity(item.id, -1)}>-</button>
          <span style={{ margin: "0 15px" }}>{item.quantity || 1}</span>
          <button onClick={() => updateQuantity(item.id, 1)}>+</button>
        </div>
      ))}

      <h2>Total Price: ₹{total}</h2>
      <button onClick={() => alert("Order placed successfully!")}>
        Place Order
      </button>
    </>
  )}
</div>


);
}

export default Cart;
