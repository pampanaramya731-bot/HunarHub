import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useNavigate
} from "react-router-dom";
import "./App.css";

const API = "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("hunarhub_token");
}

async function apiRequest(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(getToken()
      ? { Authorization: `Bearer ${getToken()}` }
      : {}),
    ...options.headers
  };

  const response = await fetch(`${API}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

function Header({ user, onLogout, cartCount }) {
  return (
    <header className="header">
      <Link to="/" className="brand">HunarHub</Link>

      <nav>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/entrepreneurs">Entrepreneurs</NavLink>
        <NavLink to="/products">Products</NavLink>
        <NavLink to="/cart">Cart ({cartCount})</NavLink>

        {user?.role === "entrepreneur" && (
          <NavLink to="/profile">My Profile</NavLink>
        )}

        {user ? (
          <>
            <span className="welcome">Hi, {user.name}</span>
            <button className="small-button" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink className="nav-register" to="/register">
              Register
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
}

function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    apiRequest("/products")
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  return (
    <>
      <section className="hero">
        <p className="eyebrow">CELEBRATING LOCAL CRAFTS</p>
        <h1>Discover Local Talent Near You</h1>
        <p>
          Connect with skilled entrepreneurs and discover
          handmade products and traditional services.
        </p>
        <div className="hero-actions">
          <Link className="button" to="/entrepreneurs">
            Explore Entrepreneurs
          </Link>
          <Link className="button button-light" to="/products">
            Browse Products
          </Link>
        </div>
      </section>

      <section className="section">
        <h2>Explore Categories</h2>
        <p className="muted">Discover the people behind traditional skills.</p>

        <div className="category-grid">
          {[
            ["👞", "Cobbler"],
            ["🏺", "Potter"],
            ["🧵", "Tailor"],
            ["🎨", "Artisan"],
            ["🛍️", "Small Vendor"]
          ].map(([icon, name]) => (
            <Link
              className="category-card"
              key={name}
              to={`/entrepreneurs?craft=${encodeURIComponent(name)}`}
            >
              <span>{icon}</span>
              <h3>{name}</h3>
            </Link>
          ))}
        </div>
      </section>

      <section className="section soft-section">
        <h2>Featured Products</h2>
        <div className="product-grid">
          {products.slice(0, 3).map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
        {products.length === 0 && (
          <p className="muted">
            No products yet. New products will appear here.
          </p>
        )}
        <Link className="text-link" to="/products">View all products →</Link>
      </section>

      <section className="section about">
        <h2>Keeping Traditional Skills Alive</h2>
        <p>
          HunarHub helps local craftspeople share their skills,
          showcase their products, and reach more customers.
        </p>
      </section>
    </>
  );
}

function ProductCard({ product, onAdd }) {
  return (
    <article className="product-card">
      <div className="product-art">🏺</div>
      <div className="product-content">
        <p className="eyebrow">{product.category || "Handmade"}</p>
        <h3>{product.name}</h3>
        <p>{product.description || "Handmade by a local entrepreneur."}</p>
        <div className="product-bottom">
          <strong>₹{Number(product.price).toLocaleString("en-IN")}</strong>
          {onAdd && (
            <button onClick={() => onAdd(product)}>Add to Cart</button>
          )}
        </div>
      </div>
    </article>
  );
}

function Products({ user, addToCart }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "Pottery"
  });

  async function loadProducts() {
    try {
      setProducts(await apiRequest("/products"));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submitProduct(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await apiRequest("/products", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          price: Number(form.price)
        })
      });

      setForm({
        name: "",
        description: "",
        price: "",
        category: "Pottery"
      });
      setMessage("Product added successfully!");
      await loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  const filtered = products.filter(product =>
    `${product.name} ${product.category} ${product.description}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <section className="section page-section">
      <h1>Handmade Products</h1>
      <p className="muted">Discover creations from local craftspeople.</p>

      <input
        className="search-input"
        placeholder="Search products or categories..."
        value={search}
        onChange={event => setSearch(event.target.value)}
      />

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <div className="product-grid">
        {filtered.map(product => (
          <ProductCard
            key={product._id}
            product={product}
            onAdd={addToCart}
          />
        ))}
      </div>

      {filtered.length === 0 && <p>No matching products found.</p>}

      {user?.role === "entrepreneur" && (
        <div className="form-card">
          <h2>Add a Product</h2>
          <form onSubmit={submitProduct}>
            <label>Product name</label>
            <input
              name="name"
              value={form.name}
              onChange={updateField}
              minLength={2}
              maxLength={120}
              required
            />

            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={updateField}
              maxLength={1000}
            />

            <label>Price (₹)</label>
            <input
              name="price"
              type="number"
              min="0"
              max="100000000"
              step="0.01"
              value={form.price}
              onChange={updateField}
              required
            />

            <label>Category</label>
            <select
              name="category"
              value={form.category}
              onChange={updateField}
            >
              <option>Pottery</option>
              <option>Footwear</option>
              <option>Tailoring</option>
              <option>Artisan Crafts</option>
              <option>Handmade</option>
              <option>Other</option>
            </select>

            <button type="submit">Save Product</button>
          </form>
        </div>
      )}

      {!user && (
        <p className="muted">
          <Link to="/login">Log in</Link> as an entrepreneur to add products.
        </p>
      )}
    </section>
  );
}

function Entrepreneurs({ user }) {
  const [profiles, setProfiles] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/entrepreneurs")
      .then(setProfiles)
      .catch(err => setError(err.message));
  }, []);

  const params = new URLSearchParams(window.location.search);
  const initialCraft = params.get("craft") || "";

  const filtered = profiles.filter(profile =>
    `${profile.name} ${profile.craft} ${profile.location}`
      .toLowerCase()
      .includes((search || initialCraft).toLowerCase())
  );

  return (
    <section className="section page-section">
      <h1>Local Entrepreneurs</h1>
      <p className="muted">
        Meet the people preserving traditional skills.
      </p>

      <input
        className="search-input"
        placeholder="Search by craft or location..."
        value={search}
        onChange={event => setSearch(event.target.value)}
      />

      {error && <p className="error">{error}</p>}

      <div className="profile-grid">
        {filtered.map(profile => (
          <article className="profile-card" key={profile._id}>
            <div className="avatar">✦</div>
            <h3>{profile.name}</h3>
            <p className="craft-label">{profile.craft}</p>
            <p>📍 {profile.location}</p>
            <p>{profile.description}</p>
            {profile.phone && <p>Contact: {profile.phone}</p>}
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <p>No profiles found. Be the first to share your craft!</p>
      )}

      {user?.role === "entrepreneur" ? (
        <Link className="button" to="/profile">Create or edit my profile</Link>
      ) : (
        <p>
          <Link to="/register">Register as an entrepreneur</Link> to
          create your profile.
        </p>
      )}
    </section>
  );
}

function ProfilePage({ user }) {
  const [form, setForm] = useState({
    name: user?.name || "",
    craft: "",
    location: "",
    description: "",
    phone: ""
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    apiRequest("/entrepreneurs/me")
      .then(data => {
        if (data.profile) {
          setForm({
            name: data.profile.name || user?.name || "",
            craft: data.profile.craft || "",
            location: data.profile.location || "",
            description: data.profile.description || "",
            phone: data.profile.phone || ""
          });
        }
      })
      .catch(err => setError(err.message));
  }, []);

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function save(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const data = await apiRequest("/entrepreneurs", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    }
  }

  if (user?.role !== "entrepreneur") {
    return (
      <section className="section page-section">
        <h1>Entrepreneur profile</h1>
        <p>Register or log in with an entrepreneur account to continue.</p>
        <Link className="button" to="/register">Register</Link>
      </section>
    );
  }

  return (
    <section className="section page-section">
      <div className="form-card">
        <h1>My Entrepreneur Profile</h1>
        <p className="muted">
          Tell customers about your craft and traditional skills.
        </p>

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        <form onSubmit={save}>
          <label>Display name</label>
          <input
            name="name"
            value={form.name}
            onChange={update}
            minLength={2}
            maxLength={80}
            required
          />

          <label>Craft or profession</label>
          <input
            name="craft"
            placeholder="e.g. Potter, Tailor, Cobbler"
            value={form.craft}
            onChange={update}
            minLength={2}
            maxLength={80}
            required
          />

          <label>Location</label>
          <input
            name="location"
            placeholder="Town or city"
            value={form.location}
            onChange={update}
            minLength={2}
            maxLength={120}
            required
          />

          <label>About your work</label>
          <textarea
            name="description"
            value={form.description}
            onChange={update}
            minLength={10}
            maxLength={1000}
            required
          />

          <label>Contact phone (optional)</label>
          <input
            name="phone"
            type="tel"
            value={form.phone}
            onChange={update}
            maxLength={20}
          />

          <button type="submit">Save My Profile</button>
        </form>
      </div>
    </section>
  );
}

function AuthPage({ mode, onLogin }) {
  const navigate = useNavigate();
  const registering = mode === "register";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiRequest(
        registering ? "/auth/register" : "/auth/login",
        {
          method: "POST",
          body: JSON.stringify(
            registering
              ? form
              : { email: form.email, password: form.password }
          )
        }
      );

      onLogin(data.token, data.user);
      navigate(
        data.user.role === "entrepreneur" ? "/profile" : "/"
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-wrap">
      <div className="form-card auth-card">
        <h1>{registering ? "Create Your Account" : "Welcome Back"}</h1>
        <p className="muted">
          {registering
            ? "Join the HunarHub community."
            : "Log in to your HunarHub account."}
        </p>

        {error && <p className="error">{error}</p>}

        <form onSubmit={submit}>
          {registering && (
            <>
              <label>Full name</label>
              <input
                name="name"
                value={form.name}
                onChange={update}
                minLength={2}
                maxLength={80}
                autoComplete="name"
                required
              />

              <label>Account type</label>
              <select name="role" value={form.role} onChange={update}>
                <option value="customer">Customer</option>
                <option value="entrepreneur">Entrepreneur</option>
              </select>
            </>
          )}

          <label>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={update}
            autoComplete="email"
            maxLength={254}
            required
          />

          <label>Password (minimum 8 characters)</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={update}
            autoComplete={registering ? "new-password" : "current-password"}
            minLength={8}
            maxLength={72}
            required
          />

          <button type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : registering ? "Register" : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          {registering ? "Already have an account?" : "New to HunarHub?"}{" "}
          <Link to={registering ? "/login" : "/register"}>
            {registering ? "Login" : "Register"}
          </Link>
        </p>
      </div>
    </section>
  );
}

function Cart({ cart, updateQuantity, removeFromCart }) {
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <section className="section page-section">
      <h1>Your Shopping Cart</h1>

      {cart.length === 0 ? (
        <p>Your cart is empty. <Link to="/products">Browse products</Link>.</p>
      ) : (
        <>
          <div className="cart-list">
            {cart.map(item => (
              <article className="cart-item" key={item._id}>
                <div>
                  <h3>{item.name}</h3>
                  <p>₹{item.price.toLocaleString("en-IN")} each</p>
                </div>
                <div className="quantity">
                  <button onClick={() =>
                    updateQuantity(item._id, item.quantity - 1)
                  }>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() =>
                    updateQuantity(item._id, item.quantity + 1)
                  }>+</button>
                </div>
                <button className="remove-button" onClick={() =>
                  removeFromCart(item._id)
                }>Remove</button>
              </article>
            ))}
          </div>
          <h2>Total: ₹{total.toLocaleString("en-IN")}</h2>
          <p className="muted">
            This is a demonstration cart; online payments are not enabled.
          </p>
        </>
      )}
    </section>
  );
}

function NotFound() {
  return (
    <section className="section page-section">
      <h1>Page not found</h1>
      <Link to="/">Return home</Link>
    </section>
  );
}

function AppContent() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("hunarhub_user"));
    } catch {
      return null;
    }
  });

  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("hunarhub_cart")) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!getToken()) {
      setUser(null);
      return;
    }

    apiRequest("/auth/me")
      .then(data => {
        setUser(data.user);
        localStorage.setItem("hunarhub_user", JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem("hunarhub_token");
        localStorage.removeItem("hunarhub_user");
        setUser(null);
      });
  }, []);

  function login(token, currentUser) {
    localStorage.setItem("hunarhub_token", token);
    localStorage.setItem("hunarhub_user", JSON.stringify(currentUser));
    setUser(currentUser);
  }

  function logout() {
    localStorage.removeItem("hunarhub_token");
    localStorage.removeItem("hunarhub_user");
    setUser(null);
  }

  function saveCart(nextCart) {
    setCart(nextCart);
    localStorage.setItem("hunarhub_cart", JSON.stringify(nextCart));
  }

  function addToCart(product) {
    const existing = cart.find(item => item._id === product._id);

    if (existing) {
      saveCart(cart.map(item =>
        item._id === product._id
          ? { ...item, quantity: Math.min(item.quantity + 1, 99) }
          : item
      ));
    } else {
      saveCart([...cart, { ...product, quantity: 1 }]);
    }
  }

  function updateQuantity(id, quantity) {
    if (quantity <= 0) {
      saveCart(cart.filter(item => item._id !== id));
      return;
    }

    saveCart(cart.map(item =>
      item._id === id
        ? { ...item, quantity: Math.min(quantity, 99) }
        : item
    ));
  }

  function removeFromCart(id) {
    saveCart(cart.filter(item => item._id !== id));
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <Header user={user} onLogout={logout} cartCount={cartCount} />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/products"
            element={<Products user={user} addToCart={addToCart} />}
          />
          <Route
            path="/entrepreneurs"
            element={<Entrepreneurs user={user} />}
          />
          <Route
            path="/profile"
            element={<ProfilePage user={user} />}
          />
          <Route
            path="/cart"
            element={
              <Cart
                cart={cart}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
              />
            }
          />
          <Route
            path="/login"
            element={<AuthPage mode="login" onLogin={login} />}
          />
          <Route
            path="/register"
            element={<AuthPage mode="register" onLogin={login} />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="footer">
        <strong>HunarHub</strong>
        <p>Connecting local talent with the world.</p>
        <small>© {new Date().getFullYear()} HunarHub</small>
      </footer>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}