import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Utensils, ChevronRight, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useMyRestaurant } from "@/hooks/useRestaurantSettings";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useCategories";
import { useMenuItems, useCreateMenuItem, useUpdateMenuItem, useDeleteMenuItem } from "@/hooks/useMenuItems";

export default function ManageMenu() {
  const { data: restaurant } = useMyRestaurant();
  const restaurantId = restaurant?._id;

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  
  // Category Mutations
  const { data: categories = [], isLoading: categoriesLoading } = useCategories(restaurantId);
  const { mutate: createCategory, isPending: isCreatingCategory } = useCreateCategory(restaurantId);
  const { mutate: updateCategory, isPending: isUpdatingCategory } = useUpdateCategory(restaurantId);
  const { mutate: deleteCategory } = useDeleteCategory(restaurantId);

  // Menu Item Mutations
  const { data: menuItems = [], isLoading: itemsLoading } = useMenuItems(restaurantId, selectedCategoryId);
  const { mutate: createMenuItem, isPending: isCreatingItem } = useCreateMenuItem(restaurantId, selectedCategoryId);
  const { mutate: updateMenuItem, isPending: isUpdatingItem } = useUpdateMenuItem(restaurantId, selectedCategoryId);
  const { mutate: deleteMenuItem } = useDeleteMenuItem(restaurantId, selectedCategoryId);

  // Modals State
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });

  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    isVeg: true,
    isAvailable: true,
    imageFile: null,
  });

  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0]._id);
    }
  }, [categories, selectedCategoryId]);

  // Category Actions
  const handleOpenCategoryDialog = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryForm({ name: cat.name, description: cat.description || "" });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: "", description: "" });
    }
    setCategoryDialogOpen(true);
  };

  const handleSaveCategory = () => {
    if (!categoryForm.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (editingCategory) {
      updateCategory({ categoryId: editingCategory._id, data: categoryForm }, {
        onSuccess: () => setCategoryDialogOpen(false),
      });
    } else {
      createCategory(categoryForm, {
        onSuccess: () => setCategoryDialogOpen(false),
      });
    }
  };

  const handleDeleteCategory = (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this category? All items in it will be affected.")) {
      deleteCategory(id);
    }
  };

  // Item Actions
  const handleOpenItemDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        name: item.name,
        description: item.description || "",
        price: item.price,
        category: item.category?._id || item.category || selectedCategoryId,
        isVeg: item.isVeg,
        isAvailable: item.isAvailable,
        imageFile: null,
      });
      setImagePreview(item.image || null);
    } else {
      setEditingItem(null);
      setItemForm({
        name: "",
        description: "",
        price: "",
        category: selectedCategoryId || "",
        isVeg: true,
        isAvailable: true,
        imageFile: null,
      });
      setImagePreview(null);
    }
    setItemDialogOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setItemForm({ ...itemForm, imageFile: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveItem = () => {
    if (!itemForm.name.trim() || !itemForm.price || !itemForm.category) {
      toast.error("Name, Price, and Category are required");
      return;
    }

    const formData = new FormData();
    formData.append("name", itemForm.name);
    formData.append("description", itemForm.description);
    formData.append("price", itemForm.price);
    formData.append("category", itemForm.category);
    formData.append("isVeg", itemForm.isVeg);
    formData.append("isAvailable", itemForm.isAvailable);
    if (itemForm.imageFile) {
      formData.append("image", itemForm.imageFile);
    }

    if (editingItem) {
      updateMenuItem({ itemId: editingItem._id, data: formData }, {
        onSuccess: () => setItemDialogOpen(false),
      });
    } else {
      createMenuItem(formData, {
        onSuccess: () => setItemDialogOpen(false),
      });
    }
  };

  const handleDeleteItem = (id) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      deleteMenuItem(id);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-background">
      <div className="container mx-auto px-4 py-8 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Menu</h1>
              <p className="text-muted-foreground mt-1">Organize your categories and menu items</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => handleOpenCategoryDialog()} variant="outline" className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" /> Add Category
              </Button>
              <Button onClick={() => handleOpenItemDialog()} className="gap-2 rounded-xl" disabled={!selectedCategoryId}>
                <Utensils className="h-4 w-4" /> Add Item
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Panel: Categories */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Categories</h2>
                <Badge variant="secondary" className="rounded-full px-2">{categories.length}</Badge>
              </div>
              <ScrollArea className="h-[calc(100vh-18rem)] lg:h-[calc(100vh-14rem)] pr-4">
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <div
                      key={cat._id}
                      onClick={() => setSelectedCategoryId(cat._id)}
                      className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                        selectedCategoryId === cat._id
                          ? "bg-primary/10 border-primary/20 text-primary"
                          : "bg-card border-border/40 hover:border-border hover:bg-muted/50"
                      }`}
                    >
                      <span className="font-medium truncate">{cat.name}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={(e) => { e.stopPropagation(); handleOpenCategoryDialog(cat); }}>
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10" onClick={(e) => handleDeleteCategory(e, cat._id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {categories.length === 0 && !categoriesLoading && (
                    <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-border/60">
                      <p className="text-xs text-muted-foreground">No categories yet</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Right Panel: Items */}
            <div className="lg:col-span-9 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border/40">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search items..." className="pl-9 bg-muted/30 border-none rounded-xl" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="h-9 px-4 gap-2 rounded-xl text-xs font-medium cursor-pointer">
                    <Filter className="h-3.5 w-3.5" /> All Items
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {menuItems.map((item) => (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group bg-card rounded-2xl border border-border/40 p-4 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                    >
                      {item.image ? (
                        <div className="w-full h-32 mb-3 rounded-xl overflow-hidden relative bg-muted/30">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-full h-32 mb-3 rounded-xl overflow-hidden bg-muted/30 flex items-center justify-center">
                          <Utensils className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                      )}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`h-2.5 w-2.5 rounded-full ${item.isVeg ? "bg-green-500" : "bg-red-500"}`} />
                          <Badge variant="secondary" className="text-[10px] uppercase font-bold py-0.5">{item.isVeg ? "Veg" : "Non-Veg"}</Badge>
                        </div>
                        <Badge variant={item.isAvailable ? "outline" : "secondary"} className="text-[10px] rounded-lg">
                          {item.isAvailable ? "Available" : "Sold Out"}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 mb-4">
                        <h3 className="font-bold text-card-foreground group-hover:text-primary transition-colors">{item.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">{item.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border/40">
                        <span className="text-lg font-black text-foreground">₹{item.price}</span>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => handleOpenItemDialog(item)}>
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-destructive hover:bg-destructive/10" onClick={() => handleDeleteItem(item._id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {menuItems.length === 0 && !itemsLoading && (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-card rounded-3xl border-2 border-dashed border-border/40">
                    <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mb-4 text-muted-foreground">
                      <Utensils className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-lg">No items found</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto mt-1">
                      {selectedCategoryId ? "Add your first dish to this category to get started." : "Select a category to view or add items."}
                    </p>
                    {selectedCategoryId && (
                      <Button onClick={() => handleOpenItemDialog()} className="mt-6 gap-2 rounded-xl">
                        <Plus className="h-4 w-4" /> Add First Dish
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "New Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Category Name</Label>
              <Input
                id="cat-name"
                placeholder="e.g. Appetizers"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-desc">Description (Optional)</Label>
              <Input
                id="cat-desc"
                placeholder="e.g. Small bites and starters"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleSaveCategory} disabled={isCreatingCategory || isUpdatingCategory} className="rounded-xl">
              {isCreatingCategory || isUpdatingCategory ? "Saving..." : "Save Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item Dialog */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="item-name">Dish Name</Label>
              <Input
                id="item-name"
                placeholder="e.g. Grilled Chicken Wings"
                value={itemForm.name}
                onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="item-desc">Description</Label>
              <Input
                id="item-desc"
                placeholder="Briefly describe the dish"
                value={itemForm.description}
                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-price">Price (₹)</Label>
              <Input
                id="item-price"
                type="number"
                placeholder="299"
                value={itemForm.price}
                onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-cat">Category</Label>
              <Select value={itemForm.category} onValueChange={(v) => setItemForm({ ...itemForm, category: v })}>
                <SelectTrigger id="item-cat" className="rounded-xl">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label>Dish Image</Label>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-xl overflow-hidden bg-muted border border-border/40 shrink-0 flex items-center justify-center relative">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <Utensils className="h-8 w-8 text-muted-foreground/40" />
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="rounded-xl cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Recommended: 800x800px or larger. Max 5MB.</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/40 rounded-xl border border-border/40">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Vegetarian</Label>
                <p className="text-xs text-muted-foreground">Is this a veg dish?</p>
              </div>
              <Switch checked={itemForm.isVeg} onCheckedChange={(v) => setItemForm({ ...itemForm, isVeg: v })} />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/40 rounded-xl border border-border/40">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Available</Label>
                <p className="text-xs text-muted-foreground">In stock for orders?</p>
              </div>
              <Switch checked={itemForm.isAvailable} onCheckedChange={(v) => setItemForm({ ...itemForm, isAvailable: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialogOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleSaveItem} disabled={isCreatingItem || isUpdatingItem} className="rounded-xl">
              {isCreatingItem || isUpdatingItem ? "Saving..." : "Save Dish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
