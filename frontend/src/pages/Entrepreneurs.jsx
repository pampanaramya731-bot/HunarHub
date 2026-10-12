function Entrepreneurs() {
  const entrepreneurs = [
    {
      name: "Ravi Kumar",
      skill: "👞 Cobbler",
      location: "Kakinada",
      description: "Expert in footwear repair and traditional leather work.",
    },
    {
      name: "Lakshmi Devi",
      skill: "🏺 Potter",
      location: "Rajahmundry",
      description: "Creates beautiful traditional handmade pottery.",
    },
    {
      name: "Sita",
      skill: "🧵 Tailor",
      location: "Amalapuram",
      description: "Professional tailoring and traditional clothing services.",
    },
    {
      name: "Anjali",
      skill: "🎨 Artisan",
      location: "Visakhapatnam",
      description: "Creates unique handmade handicrafts and decorations.",
    },
    {
      name: "Ramesh",
      skill: "🛍️ Small Vendor",
      location: "Kakinada",
      description: "Local seller offering traditional handmade products.",
    },
  ];

  return (
    <div className="page">
      <h1>Local Entrepreneurs</h1>

      <p>
        Discover talented people and traditional skilled workers
        in your local community.
      </p>

      <div className="category-container">
        {entrepreneurs.map((entrepreneur) => (
          <div className="card" key={entrepreneur.name}>
            <h3>{entrepreneur.skill}</h3>

            <h4>{entrepreneur.name}</h4>

            <p>📍 {entrepreneur.location}</p>

            <p>{entrepreneur.description}</p>

            <button>View Profile</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Entrepreneurs;