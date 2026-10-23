
import { useEffect, useState } from "react";

function Home() {
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      } catch (error) {
        console.error("Home products error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const handleSearch = () => {
    const value = search.trim().toLowerCase();

    if (!value) {
      setMessage("Please enter something to search.");
      return;
    }

    const found = products.filter((product) =>
      `${product.name} ${product.description} ${product.category}`
        .toLowerCase()
        .includes(value)
    );

    if (found.length > 0) {
      setMessage(
        `Found ${found.length} product(s) matching "${search}". Visit Products to view them.`
      );
    } else {
      setMessage(`No products found for "${search}".`);
    }
  };

  return (
    <div>
      <section className="hero">
        <p>CELEBRATING LOCAL CRAFTS</p>
        <h1>Discover Local Talent Near You</h1>

        <p>
          Connect with skilled local entrepreneurs and discover
          handmade products and traditional services.
        </p>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search skills, products or services..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <button onClick={handleSearch}>Search</button>
        </div>

        {message && <p role="status">{message}</p>}
      </section>

      <section className="categories">
        <h2>Explore Categories</h2>
        <p>Discover the people behind traditional skills.</p>

        <div className="category-container">
          <div className="card">
            <h3>👞 Cobbler</h3>
            <p>Find skilled footwear professionals.</p>
          </div>

          <div className="card">
            <h3>🏺 Potter</h3>
            <p>Discover traditional handmade pottery.</p>
          </div>

          <div className="card">
            <h3>🧵 Tailor</h3>
            <p>Connect with local tailoring experts.</p>
          </div>

          <div className="card">
            <h3>🎨 Artisan</h3>
            <p>Explore unique handmade products.</p>
          </div>

          <div className="card">
            <h3>🛍️ Small Vendor</h3>
            <p>Support local small businesses.</p>
          </div>
        </div>
      </section>

      <section className="featured-products" style={{ padding: "24px" }}>
        <h2>Featured Products</h2>

        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products yet. New products will appear here.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
            }}
          >
            {products.slice(0, 4).map((product) => (
              <article
                key={product._id}
                className="card"
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "12px",
                  padding: "18px",
                }}
              >
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <p>Category: {product.category}</p>
                <strong>
                  ₹{Number(product.price).toFixed(2)}
                </strong>
              </article>
            ))}
          </div>
        )}

        <p>
          <a href="/products">View all products →</a>
        </p>
      </section>

      <section className="about">
        <h2>Keeping Traditional Skills Alive</h2>

        <p>
          HunarHub helps local craftspeople share their skills,
          showcase their products, and reach more customers.
        </p>
      </section>
    </div>
  );
}

export default Home;

