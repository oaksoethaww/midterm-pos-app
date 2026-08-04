import { useMemo, useState } from "react";
import { products as initialProducts, categories } from "./assets/data";
import {
  Cable,
  Headphones,
  Laptop,
  Mouse,
  Settings,
  ShoppingCart,
  TabletSmartphone,
} from "lucide-react";
import "./App.css";

function CategoryIcon({ category }) {
  const iconProps = { size: 20, strokeWidth: 2, "aria-hidden": true };

  switch (category?.icon) {
    case "mouse":
      return <Mouse {...iconProps} />;
    case "laptop":
      return <Laptop {...iconProps} />;
    case "tablet-smartphone":
      return <TabletSmartphone {...iconProps} />;
    case "headphones":
      return <Headphones {...iconProps} />;
    case "cable":
      return <Cable {...iconProps} />;
    default:
      return <Settings {...iconProps} />;
  }
}

const money = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function App() {
  const [productList, setProductList] = useState(initialProducts);
  const [categoryId, setCategoryId] = useState("all");
  const [productId, setProductId] = useState("");
  const [amount, setAmount] = useState(0);
  const [purchases, setPurchases] = useState([]);
  const [error, setError] = useState("");

  const filteredProducts = useMemo(
    () =>
      categoryId === "all"
        ? productList
        : productList.filter((product) => product.category === Number(categoryId)),
    [categoryId, productList],
  );

  const selectedProduct = productList.find(
    (product) => product.id === Number(productId),
  );

  const grandTotal = purchases.reduce((sum, item) => sum + item.subtotal, 0);

  function handleCategoryChange(event) {
    setCategoryId(event.target.value);
    setProductId("");
    setAmount(0);
    setError("");
  }

  function handleProductChange(event) {
    setProductId(event.target.value);
    setAmount(0);
    setError("");
  }

  function handleAmountChange(event) {
    setAmount(event.target.value);
    setError("");
  }

  function addItem() {
    const quantity = Number(amount);

    if (!selectedProduct) {
      setError("Please select a product.");
      return;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      setError("Amount must be a positive whole number.");
      return;
    }

    if (quantity > selectedProduct.inventory) {
      setError(`Not enough stock. Only ${selectedProduct.inventory} left.`);
      return;
    }

    const discountedPrice =
      selectedProduct.sellPrice * (1 - selectedProduct.discount / 100);

    setPurchases((current) => {
      const existingItem = current.find(
        (item) => item.id === selectedProduct.id,
      );

      if (existingItem) {
        return current.map((item) =>
          item.id === selectedProduct.id
            ? {
                ...item,
                amount: item.amount + quantity,
                subtotal: item.subtotal + discountedPrice * quantity,
              }
            : item,
        );
      }

      return [
        ...current,
        {
          ...selectedProduct,
          amount: quantity,
          subtotal: discountedPrice * quantity,
        },
      ];
    });

    setProductList((current) =>
      current.map((product) =>
        product.id === selectedProduct.id
          ? { ...product, inventory: product.inventory - quantity }
          : product,
      ),
    );
    setAmount(0);
    setError("");
  }

  return (
    <main className="page-shell">
      <section className="pos-card" aria-labelledby="page-title">
        <header className="card-heading">
          <div className="heading-icon">
            <ShoppingCart aria-hidden="true" />
          </div>
          <div>
            <h1 id="page-title">Point of Sale</h1>
            <p>Select products and build a purchase list</p>
          </div>
        </header>

        <div className="controls">
          <label>
            <span>Select Category</span>
            <select value={categoryId} onChange={handleCategoryChange}>
              <option value="all">All</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.title}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Select Product</span>
            <select value={productId} onChange={handleProductChange}>
              <option value="">Please Select An Item</option>
              {filteredProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.title} ({product.inventory} in stock)
                </option>
              ))}
            </select>
          </label>

          <label className="amount-field">
            <span>Amount</span>
            <input
              type="number"
              min="0"
              step="1"
              value={amount}
              onChange={handleAmountChange}
              disabled={!selectedProduct}
            />
          </label>

          <button
            className="add-button"
            type="button"
            onClick={addItem}
            disabled={!selectedProduct || Number(amount) <= 0}
          >
            Add Item
          </button>
        </div>

        <div className="message-row" aria-live="polite">
          {error && <p className="error-message">{error}</p>}
          {!error && selectedProduct && (
            <p className="stock-message">
              Available inventory: {selectedProduct.inventory}
            </p>
          )}
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>ID</th>
                <th>Item</th>
                <th>Category</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Amount</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {purchases.length === 0 ? (
                <tr>
                  <td className="empty-state" colSpan="8">
                    No products have been added yet.
                  </td>
                </tr>
              ) : (
                purchases.map((item, index) => {
                  const category = categories.find(
                    (entry) => entry.id === item.category,
                  );

                  return (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{item.id}</td>
                      <td className="item-name">{item.title}</td>
                      <td>
                        <span className="category-cell" title={category?.title}>
                          <CategoryIcon category={category} />
                          <span>{category?.title}</span>
                        </span>
                      </td>
                      <td>{money.format(item.sellPrice)}</td>
                      <td>{item.discount}%</td>
                      <td>{item.amount}</td>
                      <td>{money.format(item.subtotal)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <footer className="total-row">
          <span>Grand Total</span>
          <strong>{money.format(grandTotal)}</strong>
        </footer>
      </section>
    </main>
  );
}
