import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:math';
import '../../providers/auth_provider.dart';
import '../../providers/canteen_provider.dart';
import '../../models/user_model.dart';
import '../../models/food_item.dart';
import '../../models/order_token.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  String _searchQuery = "";
  String _canteenSearchQuery = "";
  String _selectedCategory = "All";
  bool _vegOnly = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<CanteenProvider>(context, listen: false).loadCanteens();
    });
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final canteenProvider = Provider.of<CanteenProvider>(context);
    final user = authProvider.user;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Filter items based on category, search query, and veg-only filter
    final menuSource = canteenProvider.menuItems;
    final filteredItems = menuSource.where((item) {
      final matchesCategory = _selectedCategory == "All" || item.category == _selectedCategory;
      final matchesSearch = item.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          item.desc.toLowerCase().contains(_searchQuery.toLowerCase());
      final matchesVeg = !_vegOnly || item.isVeg;
      return matchesCategory && matchesSearch && matchesVeg;
    }).toList();

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: isDark ? const Color(0xFF08090C) : const Color(0xFFFAF8F5),
      endDrawer: _buildNotificationDrawer(context, canteenProvider, isDark),
      appBar: AppBar(
        backgroundColor: isDark ? const Color(0xFF0F1116) : Colors.white,
        elevation: 0.5,
        leading: canteenProvider.selectedCanteen != null
            ? IconButton(
                icon: const Icon(Icons.arrow_back_rounded, color: Color(0xFFFC8019)),
                onPressed: () {
                  canteenProvider.selectCanteen(null);
                },
              )
            : null,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFFFC8019).withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                canteenProvider.selectedCanteen != null ? Icons.storefront_rounded : Icons.lunch_dining_rounded,
                color: const Color(0xFFFC8019),
                size: 22,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                canteenProvider.selectedCanteen != null
                    ? canteenProvider.selectedCanteen!.name
                    : "CampusBite",
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontFamily: 'Poppins',
                  fontWeight: FontWeight.w800,
                  fontSize: 18,
                  color: Color(0xFFFC8019),
                  letterSpacing: -0.5,
                ),
              ),
            ),
          ],
        ),
        actions: [
          // Theme Toggle
          IconButton(
            icon: Icon(
              isDark ? Icons.light_mode_rounded : Icons.dark_mode_rounded,
              color: isDark ? Colors.amber[400] : Colors.grey[700],
              size: 20,
            ),
            onPressed: () {
              // Toggle theme using MaterialApp's state if we set it up, otherwise just feedback
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text("Theme toggle triggered"), duration: Duration(milliseconds: 600)),
              );
            },
          ),
          // Notification Bell
          Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                icon: Icon(Icons.notifications_none_rounded, color: isDark ? Colors.white : Colors.grey[700]),
                onPressed: () {
                  _scaffoldKey.currentState?.openEndDrawer();
                },
              ),
              if (canteenProvider.notifications.any((n) => n.unread))
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    padding: const EdgeInsets.all(2),
                    decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                    constraints: const BoxConstraints(minWidth: 8, minHeight: 8),
                  ),
                ),
            ],
          ),
          // Logout Button
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: Color(0xFFEF4444)),
            onPressed: () => authProvider.logout(),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Student Profile & Wallet Details
            _buildProfileAndWallet(user, canteenProvider, isDark),
            const SizedBox(height: 20),

            // Simulation Control Panel
            _buildSimulationControls(authProvider, isDark),
            const SizedBox(height: 20),

            // Active digital token passes
            if (canteenProvider.activeTokens.isNotEmpty) ...[
              _buildActiveTokensSection(canteenProvider, isDark),
              const SizedBox(height: 20),
            ],

            if (canteenProvider.selectedCanteen == null) ...[
              _buildCanteenListSection(canteenProvider, isDark),
            ] else ...[
              // Menu Section Title & Filters
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    "Canteen Menu",
                    style: TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : Colors.black,
                    ),
                  ),
                  TextButton.icon(
                    onPressed: () => canteenProvider.selectCanteen(null),
                    icon: const Icon(Icons.swap_horiz_rounded, size: 16, color: Color(0xFFFC8019)),
                    label: const Text("Change Canteen", style: TextStyle(fontSize: 12, color: Color(0xFFFC8019), fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              _buildMenuFilters(isDark),
              const SizedBox(height: 16),

              // Food Catalog list
              canteenProvider.isLoading
                  ? const Center(
                      child: Padding(
                        padding: EdgeInsets.symmetric(vertical: 40.0),
                        child: CircularProgressIndicator(color: Color(0xFFFC8019)),
                      ),
                    )
                  : filteredItems.isEmpty
                      ? _buildEmptyState(isDark)
                      : ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: filteredItems.length,
                          itemBuilder: (context, index) {
                            return _buildFoodItemCard(filteredItems[index], canteenProvider, isDark);
                          },
                        ),
            ],
            const SizedBox(height: 80), // Padding to avoid overlap with FAB
          ],
        ),
      ),
      floatingActionButton: _buildCartFAB(context, canteenProvider),
    );
  }

  // Welcome profile & wallet balance row
  Widget _buildProfileAndWallet(UserModel? user, CanteenProvider provider, bool isDark) {
    return Column(
      children: [
        // Welcome student card
        Material(
          color: isDark ? const Color(0xFF0F1116) : Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: BorderSide(color: isDark ? const Color(0xFF1E222B) : const Color(0xFFEFECE6)),
          ),
          child: InkWell(
            borderRadius: BorderRadius.circular(20),
            onTap: () => Navigator.pushNamed(context, '/profile'),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 26,
                    backgroundColor: const Color(0xFFFC8019).withOpacity(0.1),
                    child: Text(
                      user?.name.substring(0, min(2, user.name.length)) ?? "ST",
                      style: const TextStyle(color: Color(0xFFFC8019), fontWeight: FontWeight.bold, fontSize: 18),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "Welcome, ${user?.name ?? 'Student'}",
                          style: TextStyle(
                            fontFamily: 'Poppins',
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: isDark ? Colors.white : Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          "${user?.studentId ?? 'CB-9281'} • ${user?.department ?? 'Computer Science'}",
                          style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                        ),
                      ],
                    ),
                  ),
                  const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: Color(0xFFFC8019)),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: 12),

        // Wallet card
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: isDark
                  ? [const Color(0xFF161920), const Color(0xFF0F1116)]
                  : [const Color(0xFFFC8019).withOpacity(0.9), const Color(0xFFE36D0B)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: isDark ? const Color(0xFF1E222B) : Colors.transparent),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFFFC8019).withOpacity(isDark ? 0 : 0.2),
                blurRadius: 15,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "CANTEEN WALLET BALANCE",
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.0,
                      color: isDark ? const Color(0xFF8E939E) : Colors.white70,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    "₹${provider.walletBalance.toStringAsFixed(2)}",
                    style: const TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              ElevatedButton.icon(
                onPressed: () {
                  provider.depositCash();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text("₹100 credited to your wallet!"), duration: Duration(seconds: 1)),
                  );
                },
                icon: const Icon(Icons.add_circle_outline_rounded, size: 18),
                label: const Text("Add Cash"),
                style: ElevatedButton.styleFrom(
                  backgroundColor: isDark ? const Color(0xFFFC8019) : Colors.white,
                  foregroundColor: isDark ? Colors.white : const Color(0xFFFC8019),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // Simulation settings panel
  Widget _buildSimulationControls(AuthProvider authProvider, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F1116) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? const Color(0xFF1E222B) : const Color(0xFFEFECE6)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.settings_suggest_rounded, color: Color(0xFFFC8019), size: 18),
              const SizedBox(width: 8),
              Text(
                "E2E Simulation Controls",
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white70 : Colors.grey[800],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {
                    authProvider.simulateSessionExpired();
                  },
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFFFC8019),
                    side: const BorderSide(color: Color(0xFFFC8019)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text("Expire Session", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton(
                  onPressed: () {
                    authProvider.simulateAccountLocked();
                  },
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFFEF4444),
                    side: const BorderSide(color: Color(0xFFEF4444)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text("Lock Account", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // Active Passes / digital order tokens
  Widget _buildActiveTokensSection(CanteenProvider provider, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          "Digital Order Passes",
          style: TextStyle(
            fontFamily: 'Poppins',
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : Colors.black,
          ),
        ),
        const SizedBox(height: 10),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: provider.activeTokens.length,
          itemBuilder: (context, index) {
            final token = provider.activeTokens[index];
            if (token.status == TokenStatus.collected) return const SizedBox.shrink();

            final bool isReady = token.status == TokenStatus.ready;

            return Container(
              margin: const EdgeInsets.only(bottom: 12),
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
                      Row(
                        children: [
                          Icon(
                            isReady ? Icons.check_circle_outline_rounded : Icons.pending_actions_rounded,
                            color: isReady ? const Color(0xFF10B981) : const Color(0xFFFC8019),
                            size: 20,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            "Token Pass #${token.id}",
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: isDark ? Colors.white : Colors.black87,
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: (isReady ? const Color(0xFF10B981) : const Color(0xFFFC8019)).withOpacity(0.15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          token.statusText,
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: isReady ? const Color(0xFF10B981) : const Color(0xFFFC8019),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  // Items summary
                  ...token.items.map((item) => Padding(
                        padding: const EdgeInsets.only(bottom: 4),
                        child: Text(
                          "${item.quantity}x ${item.foodItem.name} (₹${item.foodItem.price.toStringAsFixed(0)})",
                          style: TextStyle(fontSize: 13, color: isDark ? const Color(0xFF8E939E) : Colors.grey[700]),
                        ),
                      )),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        "Total paid: ₹${token.totalAmount.toStringAsFixed(2)}",
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
                      ),
                      ElevatedButton(
                        onPressed: () {
                          provider.claimOrder(token.id);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text("Pass #${token.id} claimed! Enjoy your meal!"),
                              backgroundColor: const Color(0xFF10B981),
                            ),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF10B981),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                        ),
                        child: const Text("Claim Order", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }

  // Menu Search & Filter widgets
  Widget _buildMenuFilters(bool isDark) {
    final categories = ["All", "Veg Specials", "Non-Veg Specials", "Beverages & Juices", "Snacks & Desserts"];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Search bar
        TextField(
          onChanged: (val) => setState(() => _searchQuery = val),
          style: const TextStyle(fontSize: 13),
          decoration: InputDecoration(
            prefixIcon: const Icon(Icons.search_rounded, size: 18),
            hintText: "Search dishes (paneer, brownie, juice...)",
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            contentPadding: const EdgeInsets.symmetric(vertical: 8),
            fillColor: isDark ? const Color(0xFF0F1116) : Colors.white,
            filled: true,
          ),
        ),
        const SizedBox(height: 12),

        // Categories list
        SizedBox(
          height: 36,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: categories.length,
            itemBuilder: (context, index) {
              final cat = categories[index];
              final bool isSelected = _selectedCategory == cat;
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ChoiceChip(
                  label: Text(
                    cat,
                    style: TextStyle(
                      fontSize: 11.5,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      color: isSelected ? Colors.white : (isDark ? Colors.white70 : Colors.black87),
                    ),
                  ),
                  selected: isSelected,
                  selectedColor: const Color(0xFFFC8019),
                  backgroundColor: isDark ? const Color(0xFF0F1116) : Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                    side: BorderSide(
                      color: isSelected
                          ? Colors.transparent
                          : (isDark ? const Color(0xFF1E222B) : const Color(0xFFEFECE6)),
                    ),
                  ),
                  onSelected: (selected) {
                    if (selected) {
                      setState(() => _selectedCategory = cat);
                    }
                  },
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 10),

        // Veg only toggle
        Row(
          children: [
            Switch(
              value: _vegOnly,
              activeColor: const Color(0xFF10B981),
              onChanged: (val) => setState(() => _vegOnly = val),
            ),
            const SizedBox(width: 8),
            const Text(
              "Veg Only Specials",
              style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600),
            ),
            const SizedBox(width: 6),
            Container(
              width: 8,
              height: 8,
              decoration: const BoxDecoration(
                color: Color(0xFF10B981),
                shape: BoxShape.circle,
              ),
            ),
          ],
        ),
      ],
    );
  }

  // Food Item Card
  Widget _buildFoodItemCard(FoodItem item, CanteenProvider provider, bool isDark) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F1116) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? const Color(0xFF1E222B) : const Color(0xFFEFECE6)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Emoji Avatar representing image
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: const Color(0xFFFC8019).withOpacity(0.08),
              borderRadius: BorderRadius.circular(12),
            ),
            alignment: Alignment.center,
            child: Text(item.img, style: const TextStyle(fontSize: 26)),
          ),
          const SizedBox(width: 12),

          // Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(
                        border: Border.all(color: item.isVeg ? const Color(0xFF10B981) : const Color(0xFFEF4444), width: 1.5),
                        borderRadius: BorderRadius.circular(2),
                      ),
                      alignment: Alignment.center,
                      child: Container(
                        width: 5,
                        height: 5,
                        decoration: BoxDecoration(
                          color: item.isVeg ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                          shape: BoxShape.circle,
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        item.name,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : Colors.black87,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  item.desc,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(fontSize: 11.5, color: isDark ? const Color(0xFF8E939E) : Colors.grey[600]),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Text(
                      "₹${item.price.toStringAsFixed(0)}",
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFFFC8019)),
                    ),
                    const Spacer(),
                    Icon(Icons.star_rounded, color: Colors.amber[600], size: 14),
                    const SizedBox(width: 2),
                    Text(item.rating, style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
                    const SizedBox(width: 8),
                    Icon(Icons.access_time_rounded, color: Colors.grey[500], size: 13),
                    const SizedBox(width: 2),
                    Text(item.prepTime, style: TextStyle(fontSize: 11.5, color: Colors.grey[500])),
                    const SizedBox(width: 12),
                    
                    // Add Button
                    ElevatedButton(
                      onPressed: () {
                        provider.addToCart(item);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text("Added ${item.name} to cart"),
                            duration: const Duration(milliseconds: 600),
                            action: SnackBarAction(
                              label: "UNDO",
                              textColor: const Color(0xFFFC8019),
                              onPressed: () => provider.removeFromCart(item),
                            ),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFFC8019),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                        minimumSize: const Size(54, 28),
                      ),
                      child: const Text("ADD", style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F1116) : Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Icon(Icons.search_off_rounded, size: 48, color: Colors.grey[500]),
          const SizedBox(height: 12),
          const Text("No Items Found", style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(
            "Try modifying your filters or search keywords.",
            style: TextStyle(fontSize: 12, color: Colors.grey[500]),
          ),
        ],
      ),
    );
  }

  // Floating Cart Badge Button
  Widget? _buildCartFAB(BuildContext context, CanteenProvider provider) {
    if (provider.cart.isEmpty) return null;

    return FloatingActionButton.extended(
      onPressed: () => _openCartBottomSheet(context, provider),
      backgroundColor: const Color(0xFFFC8019),
      foregroundColor: Colors.white,
      icon: Stack(
        clipBehavior: Clip.none,
        children: [
          const Icon(Icons.shopping_basket_rounded),
          Positioned(
            right: -6,
            top: -6,
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
              constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
              child: Text(
                provider.cartCount.toString(),
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
      label: Text("Pay & Checkout (₹${provider.cartTotal.toStringAsFixed(0)})", style: const TextStyle(fontWeight: FontWeight.bold)),
    );
  }

  // Cart bottom sheet checkout pane
  void _openCartBottomSheet(BuildContext context, CanteenProvider provider) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) {
        return Consumer<CanteenProvider>(
          builder: (context, provider, child) {
            final isDark = Theme.of(context).brightness == Brightness.dark;
            final cartItems = provider.cart.values.toList();

            if (cartItems.isEmpty) {
              Navigator.pop(context);
              return const SizedBox.shrink();
            }

            return DraggableScrollableSheet(
              initialChildSize: 0.6,
              maxChildSize: 0.9,
              minChildSize: 0.4,
              expand: false,
              builder: (context, scrollController) {
                return Container(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Center(
                        child: Container(
                          width: 40,
                          height: 4,
                          decoration: BoxDecoration(color: Colors.grey[400], borderRadius: BorderRadius.circular(10)),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        "Review Order Pass",
                        style: TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : Colors.black,
                        ),
                      ),
                      const SizedBox(height: 12),

                      // Cart item list
                      Expanded(
                        child: ListView.builder(
                          controller: scrollController,
                          itemCount: cartItems.length,
                          itemBuilder: (context, index) {
                            final item = cartItems[index];
                            return Padding(
                              padding: const EdgeInsets.symmetric(vertical: 8.0),
                              child: Row(
                                children: [
                                  Text(item.foodItem.img, style: const TextStyle(fontSize: 22)),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(item.foodItem.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5)),
                                        Text("₹${item.foodItem.price.toStringAsFixed(0)} each", style: TextStyle(fontSize: 11, color: Colors.grey[500])),
                                      ],
                                    ),
                                  ),
                                  // Quantity controllers
                                  IconButton(
                                    icon: const Icon(Icons.remove_circle_outline_rounded, size: 20),
                                    onPressed: () => provider.removeFromCart(item.foodItem),
                                  ),
                                  Text(item.quantity.toString(), style: const TextStyle(fontWeight: FontWeight.bold)),
                                  IconButton(
                                    icon: const Icon(Icons.add_circle_outline_rounded, size: 20, color: Color(0xFFFC8019)),
                                    onPressed: () => provider.addToCart(item.foodItem),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      ),

                      // Billing Details
                      const Divider(),
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 4.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text("Subtotal", style: TextStyle(fontSize: 12, color: Colors.grey)),
                            Text("₹${provider.cartSubtotal.toStringAsFixed(2)}", style: const TextStyle(fontSize: 12)),
                          ],
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 4.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text("GST (5%)", style: TextStyle(fontSize: 12, color: Colors.grey)),
                            Text("₹${provider.cartGST.toStringAsFixed(2)}", style: const TextStyle(fontSize: 12)),
                          ],
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 4.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text("Platform Fee", style: TextStyle(fontSize: 12, color: Colors.grey)),
                            Text("₹${provider.cartPlatformFee.toStringAsFixed(2)}", style: const TextStyle(fontSize: 12)),
                          ],
                        ),
                      ),
                      const Divider(),
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text("Total Payable", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                            Text("₹${provider.cartTotal.toStringAsFixed(2)}", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFFFC8019))),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Checkout button
                      ElevatedButton(
                        onPressed: () async {
                          try {
                            await provider.checkout();
                            Navigator.pop(context); // Close bottom sheet
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text("Order checkout successful! Pass generated."),
                                backgroundColor: Color(0xFF10B981),
                              ),
                            );
                          } catch (e) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(e.toString().replaceAll("Exception: ", "")),
                                backgroundColor: const Color(0xFFEF4444),
                              ),
                            );
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFFC8019),
                          foregroundColor: Colors.white,
                          minimumSize: const Size.fromHeight(48),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          elevation: 0,
                        ),
                        child: const Text("Pay & Generate Pass", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                      ),
                    ],
                  ),
                );
              },
            );
          },
        );
      },
    );
  }

  // Right-side notifications panel drawer
  Widget _buildNotificationDrawer(BuildContext context, CanteenProvider provider, bool isDark) {
    return Drawer(
      backgroundColor: isDark ? const Color(0xFF0F1116) : Colors.white,
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    "Notifications",
                    style: TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : Colors.black,
                    ),
                  ),
                  TextButton(
                    onPressed: () {
                      provider.markAllNotificationsRead();
                    },
                    child: const Text("Mark read", style: TextStyle(color: Color(0xFFFC8019), fontSize: 12)),
                  ),
                ],
              ),
            ),
            const Divider(),
            Expanded(
              child: provider.notifications.isEmpty
                  ? Center(child: Text("No alerts yet", style: TextStyle(color: Colors.grey[500])))
                  : ListView.separated(
                      padding: const EdgeInsets.all(12),
                      itemCount: provider.notifications.length,
                      separatorBuilder: (context, index) => const SizedBox(height: 8),
                      itemBuilder: (context, index) {
                        final notif = provider.notifications[index];
                        return Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: notif.unread
                                ? const Color(0xFFFC8019).withOpacity(0.05)
                                : Colors.transparent,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isDark
                                  ? const Color(0xFF1E222B)
                                  : (notif.unread ? const Color(0xFFFC8019).withOpacity(0.15) : const Color(0xFFEFECE6)),
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    notif.title,
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 13,
                                      color: isDark ? Colors.white : Colors.black87,
                                    ),
                                  ),
                                  Text(notif.time, style: const TextStyle(fontSize: 10, color: Colors.grey)),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text(
                                notif.body,
                                style: TextStyle(
                                  fontSize: 11.5,
                                  color: isDark ? const Color(0xFF8E939E) : Colors.grey[700],
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  String _getCanteenEmoji(String name) {
    final n = name.toLowerCase();
    if (n.contains("central")) return "🏢";
    if (n.contains("spicy") || n.contains("taco") || n.contains("roll")) return "🌶️";
    if (n.contains("nescafe") || n.contains("coffee") || n.contains("beverage") || n.contains("juice")) return "☕";
    if (n.contains("sweet") || n.contains("bakery") || n.contains("dessert")) return "🍰";
    return "🍛";
  }

  Widget _buildCanteenListSection(CanteenProvider provider, bool isDark) {
    final filteredCanteens = provider.canteens.where((c) {
      return c.status == 'approved' && c.name.toLowerCase().contains(_canteenSearchQuery.toLowerCase());
    }).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          "Select a Canteen",
          style: TextStyle(
            fontFamily: 'Poppins',
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : Colors.black,
          ),
        ),
        const SizedBox(height: 12),
        // Canteen search bar
        TextField(
          onChanged: (val) => setState(() => _canteenSearchQuery = val),
          style: const TextStyle(fontSize: 13),
          decoration: InputDecoration(
            prefixIcon: const Icon(Icons.storefront_rounded, size: 18),
            hintText: "Search canteens (central, spicy, nescafe...)",
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            contentPadding: const EdgeInsets.symmetric(vertical: 8),
            fillColor: isDark ? const Color(0xFF0F1116) : Colors.white,
            filled: true,
          ),
        ),
        const SizedBox(height: 16),

        if (provider.isLoading)
          const Center(
            child: Padding(
              padding: EdgeInsets.symmetric(vertical: 40.0),
              child: CircularProgressIndicator(color: Color(0xFFFC8019)),
            ),
          )
        else if (filteredCanteens.isEmpty)
          Container(
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF0F1116) : Colors.white,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              children: [
                Icon(Icons.storefront_outlined, size: 48, color: Colors.grey[500]),
                const SizedBox(height: 12),
                const Text("No Canteens Found", style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(
                  "No canteens match your search query.",
                  style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                ),
              ],
            ),
          )
        else
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: filteredCanteens.length,
            itemBuilder: (context, index) {
              final canteen = filteredCanteens[index];
              final emoji = _getCanteenEmoji(canteen.name);
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                child: Material(
                  color: isDark ? const Color(0xFF0F1116) : Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: BorderSide(
                      color: isDark ? const Color(0xFF1E222B) : const Color(0xFFEFECE6),
                    ),
                  ),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(16),
                    onTap: () {
                      provider.selectCanteen(canteen);
                    },
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Row(
                        children: [
                          Container(
                            width: 50,
                            height: 50,
                            decoration: BoxDecoration(
                              color: const Color(0xFFFC8019).withOpacity(0.08),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            alignment: Alignment.center,
                            child: Text(emoji, style: const TextStyle(fontSize: 26)),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  canteen.name,
                                  style: TextStyle(
                                    fontFamily: 'Poppins',
                                    fontSize: 15,
                                    fontWeight: FontWeight.bold,
                                    color: isDark ? Colors.white : Colors.black87,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  "Tap to view menu & place order",
                                  style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                                ),
                              ],
                            ),
                          ),
                          const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: Color(0xFFFC8019)),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
      ],
    );
  }
}
