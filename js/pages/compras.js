const products = [
  {
    id: "remera-stwfp",
    categoria: "remeras",
    nombre: "Remera Star Wars FP",
    descripcion: "Remera oficial con logo de Star Wars Fan Page.",
    precio: 450,
    imagen: "../img/remera-fp.png",
  },
  {
    id: "pantalones-stwfp",
    categoria: "pantalones",
    nombre: "Pantalones Star Wars FP",
    descripcion: "Pantalones oficiales con logo de Star Wars Fan Page.",
    precio: 700,
    imagen: "../img/pantalones-fp.png",
  },
  {
    id: "gorra-stwfp",
    categoria: "gorras",
    nombre: "Gorra Star Wars FP",
    descripcion: "Gorra oficial con logo de Star Wars Fan Page.",
    precio: 320,
    imagen: "../img/gorra-fp.png",
  },
  {
    id: "zapatillas-stwfp",
    categoria: "zapatillas",
    nombre: "Zapatillas Star Wars FP",
    descripcion: "Zapatillas deportivas oficiales con logo de Star Wars Fan Page.",
    precio: 1850,
    imagen: "../img/zapatillas-fp.png",
  },
];

const ShopApp = {
  state: {
    currentPage: 1,
    productsPerPage: 4,
    filteredProducts: products,
  },

  elements: {
    productosGrid: document.getElementById("productos-grid"),
    cartItemsContainer: document.getElementById("cart-items"),
    cartTotalElement: document.getElementById("cart-total"),
    clearCartBtn: document.getElementById("clear-cart-btn"),
    checkoutBtn: document.getElementById("checkout-btn"),
    searchInput: document.getElementById("search-input"),
    searchBtn: document.getElementById("search-btn"),
    categoryFilter: document.getElementById("category-filter"),
    priceFilter: document.getElementById("price-filter"),
    paginationContainer: document.getElementById("pagination"),
    cartFab: document.getElementById("cart-fab"),
    cartModal: document.getElementById("cart-modal"),
    cartCloseBtn: document.getElementById("cart-close"),
    cartBadge: document.getElementById("cart-badge"),
  },

  createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);

    Object.entries(attributes).forEach(([name, value]) => {
      if (name === "className") {
        element.className = value;
      } else if (name === "textContent") {
        element.textContent = value;
      } else if (name === "dataset") {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue;
        });
      } else {
        element.setAttribute(name, value);
      }
    });

    children.flat().forEach((child) => {
      if (child instanceof Node) {
        element.appendChild(child);
      } else if (child != null) {
        element.appendChild(document.createTextNode(child));
      }
    });

    return element;
  },

  renderProductCard(product) {
    const productImage = this.createElement("img", {
      src: product.imagen,
      alt: product.nombre,
    });

    const productTitle = this.createElement("h3", { textContent: product.nombre });
    const productDescription = this.createElement("p", { textContent: product.descripcion });
    const productPrice = this.createElement("p", {
      className: "producto-price",
      textContent: window.formatCurrency(product.precio),
    });
    const addButton = this.createElement("button", {
      type: "button",
      className: "btn-secondary add-to-cart",
      dataset: { productId: product.id },
      textContent: "Agregar al carrito",
    });
    const cardContent = this.createElement("div", { className: "producto-content" }, [
      productTitle,
      productDescription,
      productPrice,
      this.createElement("div", { className: "producto-actions" }, [addButton]),
    ]);
    return this.createElement("article", { className: "producto-card" }, [productImage, cardContent]);
  },

  renderProducts() {
    const { productosGrid } = this.elements;
    const { currentPage, productsPerPage, filteredProducts } = this.state;
    const start = (currentPage - 1) * productsPerPage;
    const pageProducts = filteredProducts.slice(start, start + productsPerPage);
    productosGrid.innerHTML = "";

    if (pageProducts.length === 0) {
      productosGrid.appendChild(
        this.createElement("div", {
          className: "loading-message",
          textContent: "No se encontraron productos.",
        })
      );

      this.elements.paginationContainer.innerHTML = "";
      return;
    }
    pageProducts.forEach((product) => {
      productosGrid.appendChild(this.renderProductCard(product));
    });
    this.renderPagination();
  },

  applyFilters() {
    const searchTerm = this.elements.searchInput.value.trim().toLowerCase();
    const category = this.elements.categoryFilter.value;
    const priceRange = this.elements.priceFilter.value;

    this.state.filteredProducts = products.filter((product) => {
      const matchSearch = [product.nombre, product.descripcion].some((text) =>
        text.toLowerCase().includes(searchTerm)
      );
      const matchCategory = category ? product.categoria === category : true;
      const matchPrice = this.matchPriceRange(product.precio, priceRange);

      return matchSearch && matchCategory && matchPrice;
    });

    this.state.currentPage = 1;
    this.renderProducts();
  },

  matchPriceRange(price, range) {
    if (!range) return true;
    const [min, max] = range.split("-").map(Number);
    return max ? price >= min && price <= max : price >= min;
  },

  renderPagination() {
    const { paginationContainer } = this.elements;
    const { filteredProducts, productsPerPage, currentPage } = this.state;
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    paginationContainer.innerHTML = "";
    if (totalPages <= 1) return;

    for (let page = 1; page <= totalPages; page += 1) {
      const button = this.createElement("button", {
        type: "button",
        className: "btn-secondary",
        textContent: page,
      });
      if (page === currentPage) {
        button.disabled = true;
        button.style.opacity = "0.65";
      }
      button.addEventListener("click", () => {
        this.state.currentPage = page;
        this.renderProducts();
      });

      paginationContainer.appendChild(button);
    }
  },

  renderCart() {
    const items = Cart.getItems();
    const { cartItemsContainer, cartTotalElement } = this.elements;
    cartItemsContainer.innerHTML = "";
    if (items.length === 0) {
      cartItemsContainer.appendChild(
        this.createElement("p", {
          className: "cart-empty",
          textContent: "El carrito está vacío.",
        })
      );
      cartTotalElement.textContent = "$0";
      return;
    }

    items.forEach((item) => {
      const itemInfo = this.createElement("div", { className: "cart-item-info" }, [
        this.createElement("strong", { textContent: item.nombre }),
        this.createElement("span", { textContent: `Cantidad: ${item.quantity}` }),
        this.createElement("span", {
          textContent: `Precio unitario: ${window.formatCurrency(item.precio)}`,
        }),
      ]);

      const itemActions = this.createElement("div", { className: "cart-item-actions" }, [
        this.createElement("button", {
          type: "button",
          textContent: "-",
          dataset: { action: "decrease", id: item.id },
        }),
        this.createElement("button", {
          type: "button",
          textContent: "+",
          dataset: { action: "increase", id: item.id },
        }),
        this.createElement("button", {
          type: "button",
          textContent: "Eliminar",
          dataset: { action: "remove", id: item.id },
        }),
      ]);

      cartItemsContainer.appendChild(
        this.createElement("div", { className: "cart-item" }, [itemInfo, itemActions])
      );
    });

    cartTotalElement.textContent = window.formatCurrency(Cart.getTotal());
  },

  handleProductGridClick(event) {
    const button = event.target.closest(".add-to-cart");
    if (!button) return;

    const product = products.find((item) => item.id === button.dataset.productId);
    if (!product) return;

    Cart.addItem({
      id: product.id,
      nombre: product.nombre,
      precio: product.precio,
    });
  },

  handleCartContainerClick(event) {
    const button = event.target.closest("button");
    if (!button || !button.dataset.action) return;

    const productId = button.dataset.id;
    const items = Cart.getItems();
    const item = items.find((entry) => entry.id === productId);
    if (!item) return;

    switch (button.dataset.action) {
      case "decrease":
        Cart.updateQuantity(productId, Math.max(item.quantity - 1, 1));
        break;
      case "increase":
        Cart.updateQuantity(productId, item.quantity + 1);
        break;
      case "remove":
        Cart.removeItem(productId);
        break;
    }
  },

  updateCartBadge() {
    const count = Cart.getCount();
    const { cartBadge } = this.elements;

    cartBadge.textContent = count;
    cartBadge.style.display = count > 0 ? "flex" : "none";
  },

  toggleCartModal() {
    this.elements.cartModal.classList.toggle("hidden");
  },

  closeCartModal() {
    this.elements.cartModal.classList.add("hidden");
  },

  bindEvents() {
    const {
      productosGrid,
      searchBtn,
      searchInput,
      categoryFilter,
      priceFilter,
      clearCartBtn,
      checkoutBtn,
      cartItemsContainer,
      cartFab,
      cartCloseBtn,
    } = this.elements;

    productosGrid.addEventListener("click", this.handleProductGridClick.bind(this));
    searchBtn.addEventListener("click", this.applyFilters.bind(this));
    searchInput.addEventListener("keyup", (event) => {
      if (event.key === "Enter") this.applyFilters();
    });
    categoryFilter.addEventListener("change", this.applyFilters.bind(this));
    priceFilter.addEventListener("change", this.applyFilters.bind(this));
    clearCartBtn.addEventListener("click", () => Cart.clear());
    checkoutBtn.addEventListener("click", () => Cart.clear());
    cartItemsContainer.addEventListener("click", this.handleCartContainerClick.bind(this));
    cartFab.addEventListener("click", this.toggleCartModal.bind(this));
    cartCloseBtn.addEventListener("click", this.closeCartModal.bind(this));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") this.closeCartModal();
    });

    window.addEventListener("cartUpdated", () => {
      this.renderCart();
      this.updateCartBadge();
    });
  },

  init() {
    this.bindEvents();
    this.applyFilters();
    this.renderCart();
    this.updateCartBadge();
  },
};

function initShopPage() {
  ShopApp.init();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initShopPage);
} else {
  initShopPage();
}