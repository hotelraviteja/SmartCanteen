import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/canteen_provider.dart';
import '../../models/canteen_model.dart';
import '../../models/food_item.dart';
import '../../models/order_token.dart';

class OwnerDashboardScreen extends StatefulWidget {
  const OwnerDashboardScreen({super.key});

  @override
  State<OwnerDashboardScreen> createState() => _OwnerDashboardScreenState();
}

class _OwnerDashboardScreenState extends State<OwnerDashboardScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _addFormKey = GlobalKey<FormState>();

  final _dishNameController = TextEditingController();
  final _priceController = TextEditingController();
  final _descController = TextEditingController();
  final _prepTimeController = TextEditingController();

  String _selectedCategory = "Veg Specials";
  bool _isVeg = true;
  String _selectedEmoji = "🍔";

  final List<String> _emojis = ["🍔", "🍛", "🥤", "🥪", "🍕", "🍰", "🍩", "🍟", "🥗", "🍇", "☕", "🍊"];
  final List<String> _categories = ["Veg Specials", "Non-Veg Specials", "Beverages & Juices", "Snacks & Desserts"];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    
    // Initial fetch of canteens, then load owner's canteen orders & menu items
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      final canteenProvider = Provider.of<CanteenProvider>(context, listen: false);
      
      await canteenProvider.loadCanteens();
      
      // Find the canteen matching this owner
      final ownerCanteen = canteenProvider.canteens.firstWhere(
        (c) => c.ownerId == auth.user?.email || c.name == auth.user?.canteenName,
        orElse: () => canteenProvider.canteens.isNotEmpty 
            ? canteenProvider.canteens.first 
            : CanteenModel(id: "canteen-owner-default", name: auth.user?.canteenName ?? "My Canteen", ownerId: auth.user?.email ?? ""),
      );
      
      // Load specific menu and orders
      canteenProvider.selectCanteen(ownerCanteen);
      await canteenProvider.loadCanteenOrders(ownerCanteen.id);
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _dishNameController.dispose();
    _priceController.dispose();
    _descController.dispose();
    _prepTimeController.dispose();
    super.dispose();
  }

  void _showAddDishDialog(BuildContext context, CanteenProvider provider) {
    _dishNameController.clear();
    _priceController.clear();
    _descController.clear();
    _prepTimeController.text = "10 min";
    _selectedCategory = "Veg Specials";
    _isVeg = true;
    _selectedEmoji = "🍔";

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            final isDark = Theme.of(context).brightness == Brightness.dark;
            return AlertDialog(
              backgroundColor: isDark ? const Color(0xFF0F1116) : Colors.white,
              title: const Text(
                "Add New Menu Item",
                style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.bold, fontSize: 18),
              ),
              content: SingleChildScrollView(
                child: Form(
                  key: _addFormKey,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Emoji Selection Row
                      const Text("Select Display Icon", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: _emojis.map((emoji) {
                          final bool isSelected = _selectedEmoji == emoji;
                          return GestureDetector(
                            onTap: () => setDialogState(() => _selectedEmoji = emoji),
                            child: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: isSelected 
                                    ? const Color(0xFFFC8019).withOpacity(0.2) 
                                    : (isDark ? const Color(0xFF1E222B) : const Color(0xFFEFECE6)),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: isSelected ? const Color(0xFFFC8019) : Colors.transparent,
                                  width: 1.5,
                                ),
                              ),
                              child: Text(emoji, style: const TextStyle(fontSize: 20)),
                            ),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 16),

                      // Dish Name
                      TextFormField(
                        controller: _dishNameController,
                        style: const TextStyle(fontSize: 13),
                        decoration: const InputDecoration(labelText: "Dish Name", hintText: "Masala Dosa"),
                        validator: (val) => val == null || val.isEmpty ? "Name is required" : null,
                      ),
                      const SizedBox(height: 12),

                      // Price & Prep Time Row
                      Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              controller: _priceController,
                              keyboardType: TextInputType.number,
                              style: const TextStyle(fontSize: 13),
                              decoration: const InputDecoration(labelText: "Price (₹)", hintText: "80"),
                              validator: (val) {
                                if (val == null || val.isEmpty) return "Price required";
                                if (double.tryParse(val) == null) return "Invalid price";
                                return null;
                              },
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: TextFormField(
                              controller: _prepTimeController,
                              style: const TextStyle(fontSize: 13),
                              decoration: const InputDecoration(labelText: "Prep Time", hintText: "10 min"),
                              validator: (val) => val == null || val.isEmpty ? "Time required" : null,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),

                      // Category Dropdown
                      const Text("Category", style: TextStyle(fontSize: 11, color: Colors.grey)),
                      DropdownButton<String>(
                        value: _selectedCategory,
                        isExpanded: true,
                        dropdownColor: isDark ? const Color(0xFF0F1116) : Colors.white,
                        items: _categories.map((cat) {
                          return DropdownMenuItem(value: cat, child: Text(cat, style: const TextStyle(fontSize: 13)));
                        }).toList(),
                        onChanged: (val) {
                          if (val != null) {
                            setDialogState(() => _selectedCategory = val);
                          }
                        },
                      ),
                      const SizedBox(height: 12),

                      // Veg Toggle
                      Row(
                        children: [
                          Switch(
                            value: _isVeg,
                            activeColor: const Color(0xFF10B981),
                            onChanged: (val) => setDialogState(() => _isVeg = val),
                          ),
                          const SizedBox(width: 8),
                          Text(_isVeg ? "Vegetarian (Veg)" : "Non-Vegetarian (Non-Veg)", style: const TextStyle(fontSize: 13)),
                        ],
                      ),
                      const SizedBox(height: 12),

                      // Description
                      TextFormField(
                        controller: _descController,
                        maxLines: 2,
                        style: const TextStyle(fontSize: 13),
                        decoration: const InputDecoration(labelText: "Short Description", hintText: "Served hot with coconut chutney..."),
                        validator: (val) => val == null || val.isEmpty ? "Description is required" : null,
                      ),
                    ],
                  ),
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text("Cancel", style: TextStyle(color: Colors.grey)),
                ),
                ElevatedButton(
                  onPressed: () async {
                    if (!_addFormKey.currentState!.validate()) return;
                    
                    final foodItem = FoodItem(
                      id: "item-${DateTime.now().millisecondsSinceEpoch}",
                      canteenId: provider.selectedCanteen?.id ?? "canteen-owner-default",
                      name: _dishNameController.text.trim(),
                      price: double.parse(_priceController.text.trim()),
                      prepTime: _prepTimeController.text.trim(),
                      rating: "4.5",
                      img: _selectedEmoji,
                      category: _selectedCategory,
                      isVeg: _isVeg,
                      desc: _descController.text.trim(),
                    );

                    try {
                      await provider.addNewMenuItem(foodItem);
                      if (context.mounted) {
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text("${foodItem.name} added to your menu!"), backgroundColor: const Color(0xFF10B981)),
                        );
                      }
                    } catch (e) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text("Error: $e"), backgroundColor: Colors.red),
                      );
                    }
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFFC8019), foregroundColor: Colors.white),
                  child: const Text("Add Item"),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final provider = Provider.of<CanteenProvider>(context);
    final user = auth.user;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF08090C) : const Color(0xFFFAF8F5),
      appBar: AppBar(
        backgroundColor: isDark ? const Color(0xFF0F1116) : Colors.white,
        elevation: 0.5,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(color: const Color(0xFFFC8019).withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
              child: const Icon(Icons.storefront_rounded, color: Color(0xFFFC8019), size: 22),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                user?.canteenName ?? "My Canteen",
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w800, fontSize: 18, color: Color(0xFFFC8019)),
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.account_circle_rounded, color: Color(0xFFFC8019)),
            onPressed: () => Navigator.pushNamed(context, '/profile'),
          ),
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: Color(0xFFEF4444)),
            onPressed: () => auth.logout(),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: const Color(0xFFFC8019),
          unselectedLabelColor: Colors.grey,
          indicatorColor: const Color(0xFFFC8019),
          tabs: const [
            Tab(icon: Icon(Icons.pending_actions_rounded), text: "Active Orders"),
            Tab(icon: Icon(Icons.restaurant_menu_rounded), text: "Manage Menu"),
          ],
        ),
      ),
      body: Column(
        children: [
          if (provider.selectedCanteen?.status == 'pending')
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              color: const Color(0xFFD97706),
              child: Row(
                children: [
                  const Icon(Icons.info_outline_rounded, color: Colors.white, size: 20),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          "Approval Pending",
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13, fontFamily: 'Poppins'),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          "Your canteen is not visible to students yet. An administrator will verify and approve it shortly.",
                          style: TextStyle(color: Colors.white.withOpacity(0.75), fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          if (provider.selectedCanteen?.status == 'rejected')
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              color: const Color(0xFFDC2626),
              child: Row(
                children: [
                  const Icon(Icons.error_outline_rounded, color: Colors.white, size: 20),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          "Verification Rejected",
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13, fontFamily: 'Poppins'),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          "Your canteen request has been rejected. Please contact support or update your canteen details.",
                          style: TextStyle(color: Colors.white.withOpacity(0.75), fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                // Tab 1: Orders Queue
                _buildOrdersQueueTab(provider, isDark),

                // Tab 2: Menu Catalog Manager
                _buildMenuManagerTab(provider, isDark),
              ],
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddDishDialog(context, provider),
        backgroundColor: const Color(0xFFFC8019),
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text("Add Dish", style: TextStyle(fontWeight: FontWeight.bold)),
      ),
    );
  }

  // Active Orders list view
  Widget _buildOrdersQueueTab(CanteenProvider provider, bool isDark) {
    // Filter active owner orders (preparing or ready)
    final activeOrders = provider.canteenOrders.where((o) => o.status != TokenStatus.collected).toList();

    if (provider.isLoading) {
      return const Center(child: CircularProgressIndicator(color: Color(0xFFFC8019)));
    }

    if (activeOrders.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.checklist_rounded, size: 56, color: Colors.grey[500]),
            const SizedBox(height: 12),
            const Text("No Active Orders", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 4),
            Text("Orders placed by students will show up here.", style: TextStyle(fontSize: 12, color: Colors.grey[500])),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () => provider.loadCanteenOrders(provider.selectedCanteen?.id ?? ""),
      color: const Color(0xFFFC8019),
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: activeOrders.length,
        itemBuilder: (context, index) {
          final order = activeOrders[index];
          final bool isReady = order.status == TokenStatus.ready;

          return Container(
            margin: const EdgeInsets.only(bottom: 14),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF0F1116) : Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isReady 
                    ? const Color(0xFF10B981) 
                    : (isDark ? const Color(0xFF1E222B) : const Color(0xFFEFECE6)),
                width: isReady ? 1.5 : 1.0,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "Order Pass #${order.id}",
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: (isReady ? const Color(0xFF10B981) : const Color(0xFFFC8019)).withOpacity(0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        order.statusText.toUpperCase(),
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: isReady ? const Color(0xFF10B981) : const Color(0xFFFC8019),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                
                // Items List
                ...order.items.map((item) => Padding(
                  padding: const EdgeInsets.only(bottom: 5),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        "${item.quantity}x ${item.foodItem.name}",
                        style: TextStyle(fontSize: 13.5, color: isDark ? Colors.white70 : Colors.black87),
                      ),
                    ],
                  ),
                )),
                const SizedBox(height: 16),
                
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "Received: ${order.createdAt.hour.toString().padLeft(2, '0')}:${order.createdAt.minute.toString().padLeft(2, '0')}",
                      style: TextStyle(fontSize: 11.5, color: Colors.grey[500]),
                    ),
                    ElevatedButton(
                      onPressed: () {
                        if (order.status == TokenStatus.preparing) {
                          provider.updateOrderStatus(order.id, 'ready');
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text("Order #${order.id} marked as READY!"), backgroundColor: const Color(0xFF10B981)),
                          );
                        } else if (order.status == TokenStatus.ready) {
                          provider.updateOrderStatus(order.id, 'collected');
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text("Order #${order.id} marked as DELIVERED!"), backgroundColor: const Color(0xFF10B981)),
                          );
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isReady ? const Color(0xFF10B981) : const Color(0xFFFC8019),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        elevation: 0,
                      ),
                      child: Text(
                        isReady ? "Mark Delivered" : "Mark Ready",
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  // Owner Menu catalog manager list
  Widget _buildMenuManagerTab(CanteenProvider provider, bool isDark) {
    final menuItems = provider.menuItems;

    if (provider.isLoading) {
      return const Center(child: CircularProgressIndicator(color: Color(0xFFFC8019)));
    }

    if (menuItems.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.restaurant_menu_rounded, size: 56, color: Colors.grey[500]),
            const SizedBox(height: 12),
            const Text("Your menu is empty", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 4),
            Text("Click 'Add Dish' below to register your first menu item.", style: TextStyle(fontSize: 12, color: Colors.grey[500])),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: menuItems.length,
      itemBuilder: (context, index) {
        final item = menuItems[index];
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF0F1116) : Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: isDark ? const Color(0xFF1E222B) : const Color(0xFFEFECE6)),
          ),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(color: const Color(0xFFFC8019).withOpacity(0.08), borderRadius: BorderRadius.circular(10)),
                alignment: Alignment.center,
                child: Text(item.img, style: const TextStyle(fontSize: 22)),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: item.isVeg ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            item.name,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      "₹${item.price.toStringAsFixed(0)} • ${item.category}",
                      style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: (isDark ? const Color(0xFF1E222B) : const Color(0xFFFAF8F5)),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.access_time_rounded, size: 12, color: Colors.grey),
                    const SizedBox(width: 4),
                    Text(item.prepTime, style: const TextStyle(fontSize: 11, color: Colors.grey)),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
