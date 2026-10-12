
import { useEffect, useState } from "react";

function Products() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Pottery");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadProducts() {
    try {
      const response = await fetch(
        "http://localhost:5000/api/products"
      );

      if (!response.ok) {
        throw new Error("Could not load products");
      }

      const data = await response.json();
      setProducts(data);
      setMessage("");
    } catch (error) {
      console.error("Products error:", error);
      setMessage("Could not load products. Check the backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/products",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            description,
            price: Number(price),
            category,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not add product");
      }

      setProducts((previous) => [...previous, data]);
      setName("");
      setDescription("");
      setPrice("");
      setCategory("Pottery");
      setMessage("Product added successfully!");
    } catch (error) {
      console.error("Add product error:", error);
      setMessage(error.message);
    }
  }

  return (
    <main style={{ maxWidth: "1000px", margin: "auto", padding: "24px" }}>
      <h1>HunarHub Products</h1>
      <p>Discover handmade products from local entrepreneurs.</p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: "12px",
          maxWidth: "450px",
          marginBottom: "32px",
        }}
      >
        <h2>Add a New Product</h2>

        <input
          placeholder="Product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <textarea
          placeholder="Product description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Price in rupees"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          min="1"
          required
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="Pottery">Pottery</option>
          <option value="Handmade">Handmade</option>
          <option value="Footwear">Footwear</option>
          <option value="Clothing">Clothing</option>
          <option value="Artisan">Artisan</option>
        </select>

        <button type="submit">Add Product</button>
      </form>

      {message && <p role="status">{message}</p>}

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
          }}
        >
          {products.map((product) => (
            <article
              key={product._id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "12px",
                padding: "18px",
              }}
            >
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p>Category: {product.category}</p>
              <strong>₹{product.price}</strong>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default Products;