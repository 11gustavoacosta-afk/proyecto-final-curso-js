const CartStorageKey = "starwars_fanpage_carrito";

const Cart = {
  storageKey: CartStorageKey,

  load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      console.error("Error leyendo el carrito desde localStorage:", error);
      return [];
    }
  },

  save(items) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
      this.notify(items);
    } catch (error) {
      console.error("Error guardando el carrito en localStorage:", error);
    }
  },

  getItems() {
    return this.load();
  },

  addItem(product) {
    const items = this.load();
    const existing = items.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({ ...product, quantity: 1 });
    }

    this.save(items);
  },

  removeItem(productId) {
    const items = this.load().filter((item) => item.id !== productId);
    this.save(items);
  },

  updateQuantity(productId, quantity) {
    const items = this.load().map((item) => {
      if (item.id !== productId) return item;
      return { ...item, quantity: Math.max(1, quantity) };
    });
    this.save(items);
  },

  clear() {
    this.save([]);
  },

  getCount() {
    return this.load().reduce((sum, item) => sum + item.quantity, 0);
  },

  getTotal() {
    return this.load().reduce((sum, item) => sum + item.precio * item.quantity, 0);
  },

  notify(items) {
    window.dispatchEvent(new CustomEvent("cartUpdated", {
      detail: { items },
    }));
  },
};

window.Cart = Cart;

window.addEventListener("storage", (event) => {
  if (event.key === Cart.storageKey) {
    Cart.notify(Cart.load());
  }
});

window.formatCurrency = function (value) {
  return value.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  });
};


function loadPageScript() {
  const currentUrl = window.location.href;
  let scriptPath = "";
  if (currentUrl.includes("/pages/compras.html") || currentUrl.endsWith("compras.html")) {
    scriptPath = "../js/pages/compras.js";
  }
   else if (currentUrl.includes("/pages/peliculas.html") || currentUrl.endsWith("peliculas.html")) 
    {
    scriptPath = "../js/pages/peliculas.js";
  }

  if (scriptPath) {
    console.log("Cargando script de página:", scriptPath);
    loadScript(scriptPath);
  } else {
    console.log("No se detectó una página con scripts dinámicos");
  }
}

function loadScript(src) {
  const script = document.createElement("script");
  script.src = src;
  script.async = false;
  document.head.appendChild(script);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadPageScript);
} else {
  loadPageScript();
}