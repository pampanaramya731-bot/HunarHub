
import { useParams, Link } from "react-router-dom";

function ProductDetails() {
  const { id } = useParams();

  const products = [
    {
      id: "clay-pots",
      name: "Handmade Clay Pots",
      price: "₹250",
      seller: "Lakshmi Devi",
      location: "Rajahmundry",
      description: "Beautiful traditional handmade clay pots.",
    },
    {
      id: "basket",
      name: "Traditional Basket",
      price: "₹350",
      seller: "Ramesh",
      location: "Kakinada",
      description: "Strong and eco-friendly handmade basket.",
    },
    {
      id: "wall-art",
      name: "Handmade Wall Art",
      price: "₹500",
      seller: "Anjali",
      location: "Visakhapatnam",
      description: "Unique handmade decorative artwork.",
    },
    {
      id: "traditional-dress",
      name: "Traditional Dress",
      price: "₹850",
      seller: "Sita",
      location: "Amalapuram",
      description: "Beautiful traditional handmade clothing.",
    },
  ];

  const product = products.find((item) => item.id === id);

  if (!product) {
    return (
      <div className="page">
        <h1>Product not found</h1>
        <Link to="/products">Back to Products</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="card">
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <h2>{product.price}</h2>
        <p><strong>Seller:</strong> {product.seller}</p>
        <p><strong>Location:</strong> {product.location}</p>

        <Link to="/products">
          <button>Back to Products</button>
        </Link>
      </div>
    </div>
  );
}

export default ProductDetails;