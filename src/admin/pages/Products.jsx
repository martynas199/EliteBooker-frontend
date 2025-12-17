import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Package } from "lucide-react";
import { ProductsAPI } from "../../tenant/pages/products.api";
import { api } from "../../shared/lib/apiClient";
import Button from "../../shared/components/ui/Button";
import Card from "../../shared/components/ui/Card";
import FormField from "../../shared/components/forms/FormField";
import ConfirmDeleteModal from "../../shared/components/forms/ConfirmDeleteModal";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    description: "",
    keyBenefits: "",
    ingredients: "",
    howToApply: "",
    category: "Skincare",
    specialistId: "",
    featured: false,
    active: true,
    order: 0,
    variants: [
      {
        size: "",
        price: "",
        priceEUR: "",
        originalPrice: "",
        originalPriceEUR: "",
        purchasePrice: "",
        stock: 0,
        sku: "",
        weight: 0,
      },
    ],
  });
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [existingGalleryImages, setExistingGalleryImages] = useState([]);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    product: null,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, specialistsData] = await Promise.all([
        ProductsAPI.list(),
        api.get("/specialists", { params: { limit: 1000 } }),
      ]);
      setProducts(productsData);
      setSpecialists(specialistsData.data || []);

      // Extract unique brands from products
      const uniqueBrands = [
        ...new Set(
          productsData
            .map((p) => p.brand)
            .filter((brand) => brand && brand.trim() !== "")
        ),
      ].sort();

      console.log("Products loaded:", productsData.length);
      console.log(
        "Products with brands:",
        productsData.filter((p) => p.brand).length
      );
      console.log("Unique brands found:", uniqueBrands);

      setBrands(uniqueBrands);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await ProductsAPI.list();
      setProducts(data);

      // Update brands list
      const uniqueBrands = [
        ...new Set(
          data
            .map((p) => p.brand)
            .filter((brand) => brand && brand.trim() !== "")
        ),
      ].sort();
      setBrands(uniqueBrands);
    } catch (error) {
      console.error("Failed to load products:", error);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGallerySelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setGalleryFiles((prev) => [...prev, ...files]);

      // Create previews for new files
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setGalleryPreviews((prev) => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeGalleryPreview = (index) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingGalleryImage = async (index) => {
    if (!editingId) return;

    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <span>Delete this image? This cannot be undone.</span>
          <button
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                // Show loading state
                const loadingToastId = toast.loading("Deleting image...");

                const product = await ProductsAPI.deleteImage(editingId, index);
                setExistingGalleryImages(product.images || []);

                // Dismiss loading and show success
                toast.dismiss(loadingToastId);
                toast.success("Image deleted successfully", {
                  duration: 3000,
                  id: "delete-success",
                });
              } catch (error) {
                console.error("Error deleting image:", error);
                console.error("Product ID:", editingId, "Image Index:", index);

                // Dismiss all toasts first to prevent stacking
                toast.dismiss();

                // Show error with auto-dismiss
                const errorMessage =
                  error.response?.data?.error ||
                  error.message ||
                  "Unknown error occurred";
                toast.error(`Failed to delete image: ${errorMessage}`, {
                  duration: 5000,
                  id: "delete-error",
                  style: {
                    maxWidth: "400px",
                  },
                });

                // Auto-dismiss error toast after duration
                setTimeout(() => {
                  toast.dismiss("delete-error");
                }, 5000);
              }
            }}
          >
            Yes, Delete
          </button>
          <button
            className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
        </div>
      ),
      {
        duration: 10000,
        id: "delete-confirmation",
        style: {
          background: "#fff",
          color: "#374151",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "12px",
        },
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate variants
      const validVariants = formData.variants.filter(
        (v) => v.size.trim() && v.price
      );
      if (validVariants.length === 0) {
        toast.error("Please add at least one variant with size and price");
        setSubmitting(false);
        return;
      }

      const data = {
        ...formData,
        order: parseInt(formData.order) || 0,
        variants: validVariants.map((v) => ({
          size: v.size.trim(),
          price: parseFloat(v.price),
          priceEUR: v.priceEUR ? parseFloat(v.priceEUR) : null,
          originalPrice: v.originalPrice ? parseFloat(v.originalPrice) : null,
          originalPriceEUR: v.originalPriceEUR
            ? parseFloat(v.originalPriceEUR)
            : null,
          purchasePrice: v.purchasePrice ? parseFloat(v.purchasePrice) : null,
          stock: parseInt(v.stock) || 0,
          sku: v.sku?.trim() || "",
          weight: parseFloat(v.weight) || 0,
        })),
      };

      let product;
      if (editingId) {
        product = await ProductsAPI.update(editingId, data);
      } else {
        product = await ProductsAPI.create(data);
      }

      // Upload main image if selected
      if (imageFile && product._id) {
        product = await ProductsAPI.uploadImage(product._id, imageFile);
      }

      // Upload gallery images if selected
      if (galleryFiles.length > 0 && product._id) {
        product = await ProductsAPI.uploadImages(product._id, galleryFiles);
      }

      await loadProducts();
      resetForm();
      toast.success(
        editingId
          ? "Product updated successfully!"
          : "Product created successfully!"
      );
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setShowForm(true);
    setFormData({
      title: product.title || "",
      brand: product.brand || "",
      description: product.description || "",
      keyBenefits: Array.isArray(product.keyBenefits)
        ? product.keyBenefits.join("\n")
        : "",
      ingredients: product.ingredients || "",
      howToApply: product.howToApply || "",
      category: product.category || "Skincare",
      specialistId: product.specialistId || "",
      featured: product.featured || false,
      active: product.active ?? true,
      order: product.order || 0,
      variants:
        product.variants && product.variants.length > 0
          ? product.variants.map((v) => ({
              size: v.size || "",
              price: v.price?.toString() || "",
              priceEUR: v.priceEUR?.toString() || "",
              originalPrice: v.originalPrice?.toString() || "",
              originalPriceEUR: v.originalPriceEUR?.toString() || "",
              purchasePrice: v.purchasePrice?.toString() || "",
              stock: v.stock || 0,
              sku: v.sku || "",
              weight: v.weight || 0,
            }))
          : [
              {
                size: product.size || "",
                price: product.price?.toString() || "",
                priceEUR: product.priceEUR?.toString() || "",
                originalPrice: product.originalPrice?.toString() || "",
                originalPriceEUR: product.originalPriceEUR?.toString() || "",
                purchasePrice: product.purchasePrice?.toString() || "",
                stock: product.stock || 0,
                sku: "",
                weight: 0,
              },
            ],
    });
    setImagePreview(product.image?.url || null);
    setImageFile(null);
    setExistingGalleryImages(product.images || []);
    setGalleryFiles([]);
    setGalleryPreviews([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async () => {
    if (!deleteModal.product) return;

    try {
      await ProductsAPI.delete(deleteModal.product._id);
      await loadProducts();
      setDeleteModal({ open: false, product: null });
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product: " + error.message);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({
      title: "",
      brand: "",
      description: "",
      keyBenefits: "",
      ingredients: "",
      howToApply: "",
      category: "Skincare",
      specialistId: "",
      featured: false,
      active: true,
      order: 0,
      variants: [
        {
          size: "",
          price: "",
          originalPrice: "",
          purchasePrice: "",
          stock: 0,
          sku: "",
          weight: 0,
        },
      ],
    });
    setImageFile(null);
    setImagePreview(null);
    setGalleryFiles([]);
    setGalleryPreviews([]);
    setExistingGalleryImages([]);
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        {
          size: "",
          price: "",
          originalPrice: "",
          purchasePrice: "",
          stock: 0,
          sku: "",
          weight: 0,
        },
      ],
    });
  };

  const removeVariant = (index) => {
    if (formData.variants.length <= 1) {
      toast.error("Product must have at least one variant");
      return;
    }
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index),
    });
  };

  const updateVariant = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mb-2"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  // Filter products by selected brand
  const filteredProducts = selectedBrand
    ? products.filter((p) => p.brand === selectedBrand)
    : products;

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-0 sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg hidden sm:flex">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Products
            </h2>
            <p className="text-sm text-gray-600">
              Manage your product catalog and collections
            </p>
          </div>
        </div>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            variant="primary"
            className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2 inline-block" />
            Add New Product
          </Button>
        )}
      </div>

      {/* Brand Filter Pills */}
      {!showForm && brands.length > 0 && (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border-2 border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-sm font-medium text-gray-700 flex-shrink-0">
              Filter by Brand:
            </span>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap scrollbar-hide">
              <button
                onClick={() => setSelectedBrand(null)}
                className={`px-4 py-2 sm:px-3 sm:py-1.5 rounded-full text-sm sm:text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  selectedBrand === null
                    ? "bg-brand-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300"
                }`}
              >
                All ({products.length})
              </button>
              {brands.map((brand) => {
                const count = products.filter((p) => p.brand === brand).length;
                return (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={`px-4 py-2 sm:px-3 sm:py-1.5 rounded-full text-sm sm:text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                      selectedBrand === brand
                        ? "bg-brand-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300"
                    }`}
                  >
                    {brand} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {editingId ? "Edit Product" : "Add New Product"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 sm:space-y-6 overflow-x-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <FormField label="Product Title" htmlFor="title" required>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="Chanel Perfume"
                  required
                />
              </FormField>

              {/* Brand */}
              <FormField
                label="Brand"
                htmlFor="brand"
                help="Product brand or manufacturer name (optional)"
              >
                <input
                  type="text"
                  id="brand"
                  list="brand-suggestions"
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="e.g., Chanel, L'Oréal, Nivea"
                />
                <datalist id="brand-suggestions">
                  {brands.map((brand, index) => (
                    <option key={index} value={brand} />
                  ))}
                </datalist>
              </FormField>

              {/* Category */}
              <FormField label="Category" htmlFor="category" required>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  required
                >
                  <option value="Skincare">Skincare</option>
                  <option value="Makeup">Makeup</option>
                  <option value="Fragrance">Fragrance</option>
                  <option value="Haircare">Haircare</option>
                  <option value="Body Care">Body Care</option>
                  <option value="Tools">Tools & Accessories</option>
                </select>
              </FormField>

              {/* Specialist (Product Owner) */}
              <FormField
                label="Product Owner"
                htmlFor="specialistId"
                help="Leave empty for platform-owned products. Select specialist for Stripe Connect payments."
              >
                <select
                  id="specialistId"
                  value={formData.specialistId}
                  onChange={(e) =>
                    setFormData({ ...formData, specialistId: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  <option value="">Platform (No Specialist)</option>
                  {specialists
                    .filter((b) => b.active)
                    .map((specialist) => (
                      <option key={specialist._id} value={specialist._id}>
                        {specialist.name}
                        {specialist.stripeStatus === "connected"
                          ? " ✓"
                          : " (Not connected to Stripe)"}
                      </option>
                    ))}
                </select>
              </FormField>

              {/* Order */}
              <FormField
                label="Display Order"
                htmlFor="order"
                help="Lower numbers appear first"
              >
                <input
                  type="number"
                  id="order"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="0"
                />
              </FormField>
            </div>

            {/* Variants Section */}
            <div className="border border-gray-200 rounded-lg p-3 sm:p-4 overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                    Product Variants
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Add different sizes with their own prices and stock levels
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVariant}
                  className="w-full sm:w-auto flex-shrink-0"
                >
                  + Add Variant
                </Button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {formData.variants.map((variant, index) => (
                  <div
                    key={index}
                    className="p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 hover:border-brand-300 transition-colors overflow-hidden"
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <h4 className="text-sm font-semibold text-gray-700 break-words">
                        Variant #{index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove variant"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Size */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Size <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={variant.size}
                          onChange={(e) =>
                            updateVariant(index, "size", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                          placeholder="50ml"
                          required
                        />
                      </div>

                      {/* Price */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price (£) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={variant.price}
                          onChange={(e) =>
                            updateVariant(index, "price", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                          placeholder="99.99"
                          required
                        />
                      </div>

                      {/* Price EUR */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price (€)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={variant.priceEUR}
                          onChange={(e) =>
                            updateVariant(index, "priceEUR", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-blue-50"
                          placeholder="119.99"
                        />
                        <p className="text-xs text-blue-600 mt-1">
                          EUR price for multi-currency
                        </p>
                      </div>

                      {/* Original Price */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Original Price (£)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={variant.originalPrice}
                          onChange={(e) =>
                            updateVariant(
                              index,
                              "originalPrice",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                          placeholder="149.99"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          RRP/Strike-through price
                        </p>
                      </div>

                      {/* Original Price EUR */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Original Price (€)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={variant.originalPriceEUR}
                          onChange={(e) =>
                            updateVariant(
                              index,
                              "originalPriceEUR",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-blue-50"
                          placeholder="179.99"
                        />
                        <p className="text-xs text-blue-600 mt-1">
                          EUR strike-through price
                        </p>
                      </div>

                      {/* Purchase Price */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Purchase Price (£)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={variant.purchasePrice}
                          onChange={(e) =>
                            updateVariant(
                              index,
                              "purchasePrice",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm bg-yellow-50"
                          placeholder="29.99"
                        />
                        <p className="text-xs text-yellow-600 mt-1">
                          Cost price for profit calculation
                        </p>
                      </div>

                      {/* Stock */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stock Quantity
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={variant.stock}
                          onChange={(e) =>
                            updateVariant(index, "stock", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                          placeholder="0"
                        />
                      </div>

                      {/* Weight */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Weight (g)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={variant.weight}
                          onChange={(e) =>
                            updateVariant(index, "weight", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                          placeholder="100"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          For shipping calculations
                        </p>
                      </div>

                      {/* SKU */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          SKU
                        </label>
                        <input
                          type="text"
                          value={variant.sku}
                          onChange={(e) =>
                            updateVariant(index, "sku", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                          placeholder="SKU123"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <FormField label="Description" htmlFor="description" required>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Detailed product description..."
                required
              />
            </FormField>

            {/* Key Benefits */}
            <FormField
              label="Key Benefits"
              htmlFor="keyBenefits"
              help="One benefit per line"
            >
              <textarea
                id="keyBenefits"
                value={formData.keyBenefits}
                onChange={(e) =>
                  setFormData({ ...formData, keyBenefits: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Hydrates skin&#10;Reduces wrinkles&#10;Brightens complexion"
              />
            </FormField>

            {/* Ingredients */}
            <FormField label="Ingredients" htmlFor="ingredients">
              <textarea
                id="ingredients"
                value={formData.ingredients}
                onChange={(e) =>
                  setFormData({ ...formData, ingredients: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="List all ingredients..."
              />
            </FormField>

            {/* How to Apply */}
            <FormField label="How to Apply" htmlFor="howToApply">
              <textarea
                id="howToApply"
                value={formData.howToApply}
                onChange={(e) =>
                  setFormData({ ...formData, howToApply: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Step-by-step application instructions..."
              />
            </FormField>

            {/* Main Image Upload */}
            <FormField label="Main Product Image" htmlFor="image">
              <div className="space-y-4">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                />
                {imagePreview && (
                  <div className="relative w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </FormField>

            {/* Gallery Images Upload */}
            <FormField
              label="Gallery Images"
              htmlFor="gallery"
              help="Upload multiple images to create a product gallery"
            >
              <div className="space-y-4">
                <input
                  type="file"
                  id="gallery"
                  accept="image/*"
                  multiple
                  onChange={handleGallerySelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                />

                {/* Existing Gallery Images (when editing) */}
                {existingGalleryImages.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2 font-medium">
                      Current Gallery Images:
                    </p>
                    <div className="grid grid-cols-4 gap-3">
                      {existingGalleryImages.map((img, index) => (
                        <div
                          key={index}
                          className="relative group border-2 border-gray-200 rounded-lg overflow-hidden aspect-square"
                        >
                          <img
                            src={img.url}
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingGalleryImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            title="Delete image"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Gallery Images Preview */}
                {galleryPreviews.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2 font-medium">
                      New Images to Upload:
                    </p>
                    <div className="grid grid-cols-4 gap-3">
                      {galleryPreviews.map((preview, index) => (
                        <div
                          key={index}
                          className="relative group border-2 border-brand-200 rounded-lg overflow-hidden aspect-square"
                        >
                          <img
                            src={preview}
                            alt={`New ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryPreview(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            title="Remove image"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </FormField>

            {/* Checkboxes */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData({ ...formData, featured: e.target.checked })
                  }
                  className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 flex-shrink-0"
                />
                <span className="text-sm font-medium text-gray-700">
                  Featured in Popular Collections
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData({ ...formData, active: e.target.checked })
                  }
                  className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 flex-shrink-0"
                />
                <span className="text-sm font-medium text-gray-700">
                  Active (visible to customers)
                </span>
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                variant="brand"
                size="lg"
                loading={submitting}
                disabled={submitting}
                className="w-full sm:w-auto"
              >
                {editingId ? "Update Product" : "Create Product"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={resetForm}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Products List */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {selectedBrand ? (
            <>
              {selectedBrand} Products ({filteredProducts.length})
            </>
          ) : (
            <>All Products ({filteredProducts.length})</>
          )}
        </h2>

        {filteredProducts.length === 0 ? (
          <p className="text-sm sm:text-base text-gray-500 text-center py-8">
            {selectedBrand
              ? `No products found for ${selectedBrand}.`
              : "No products yet. Create your first product above."}
          </p>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-brand-300 transition-colors overflow-hidden"
              >
                {/* Product Image */}
                <div className="w-full sm:w-20 h-32 sm:h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {product.image?.url ? (
                    <img
                      src={product.image.url}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0 w-full">
                  <h3 className="font-semibold text-gray-900 break-words">
                    {product.title}
                    {product.brand && (
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        by {product.brand}
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500 break-words">
                    {product.category}
                    {product.variants && product.variants.length > 0 && (
                      <span>
                        {" "}
                        • {product.variants.length} variant
                        {product.variants.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </p>
                  {/* Owner Info */}
                  {product.specialistId && (
                    <p className="text-xs text-[#2563EB] font-medium mt-0.5 break-words">
                      👤 Owned by:{" "}
                      {specialists.find((b) => b._id === product.specialistId)
                        ?.name || "Unknown"}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {product.variants && product.variants.length > 0 ? (
                      <>
                        {product.variants.length === 1 ? (
                          <>
                            <span className="text-sm font-semibold text-brand-600">
                              £{product.variants[0].price.toFixed(2)}
                            </span>
                            {product.variants[0].originalPrice && (
                              <span className="text-xs text-gray-400 line-through">
                                £{product.variants[0].originalPrice.toFixed(2)}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-sm font-semibold text-brand-600">
                            from £
                            {Math.min(
                              ...product.variants.map((v) => v.price)
                            ).toFixed(2)}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="text-sm font-semibold text-brand-600">
                          £{product.price?.toFixed(2) || "0.00"}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            £{product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </>
                    )}
                    {product.specialistId && (
                      <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                        💰 Specialist Product
                      </span>
                    )}
                    {!product.specialistId && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        🏢 Platform Product
                      </span>
                    )}
                    {product.featured && (
                      <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                        Featured
                      </span>
                    )}
                    {!product.active && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(product)}
                    className="flex-1 sm:flex-initial"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setDeleteModal({ open: true, product: product })
                    }
                    className="text-red-600 hover:text-red-700 hover:border-red-300 flex-1 sm:flex-initial"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, product: null })}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteModal.product?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
