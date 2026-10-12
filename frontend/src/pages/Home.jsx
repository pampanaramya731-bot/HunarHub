import { useState } from "react";

function Home() {
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const handleSearch = () => {
    const value = search.trim().toLowerCase();

    if (!value) {
      setMessage("Please enter something to search.");
      return;
    }

    if (
      value.includes("cobbler") ||
      value.includes("potter") ||
      value.includes("tailor") ||
      value.includes("artisan") ||
      value.includes("vendor") ||
      value.includes("basket") ||
      value.includes("pot") ||
      value.includes("clay")
    ) {
      setMessage(`Results found for "${search}"`);
    } else {
      setMessage(`No results found for "${search}"`);
    }
  };

  return (
    <div>
      <section className="hero">
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

        {message && <p>{message}</p>}
      </section>

      <section className="categories">
        <h2>Explore Categories</h2>

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

      <section className="about">
        <h2>Support Local. Support Talent.</h2>

        <p>
          HunarHub helps local micro-entrepreneurs showcase their
          skills, sell products and connect directly with customers.
        </p>
      </section>
    </div>
  );
}

export default Home;