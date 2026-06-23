import 'package:flutter/foundation.dart';
import 'dart:math';
import '../models/food_item.dart';
import '../models/order_token.dart';
import '../models/canteen_model.dart';
import '../services/supabase_service.dart';

class TransactionItem {
  final String id;
  final String type; // 'credit' or 'debit'
  final double amount;
  final String title;
  final String date;
  final String status;

  TransactionItem({
    required this.id,
    required this.type,
    required this.amount,
    required this.title,
    required this.date,
    required this.status,
  });
}

class NotificationItem {
  final String id;
  final String title;
  final String body;
  final String time;
  bool unread;

  NotificationItem({
    required this.id,
    required this.title,
    required this.body,
    required this.time,
    this.unread = true,
  });
}

class CanteenProvider with ChangeNotifier {
  final SupabaseService _supabaseService = SupabaseService();

  double _walletBalance = 450.0;
  final Map<String, TokenItem> _cart = {};
  final List<OrderToken> _activeTokens = []; // Active tokens for the current logged-in student
  final List<TransactionItem> _transactions = [
    TransactionItem(id: "TXN-8291", type: "debit", amount: 120, title: "Paneer Butter Masala Combo", date: "Today, 12:42 PM", status: "Success"),
    TransactionItem(id: "TXN-1029", type: "credit", amount: 200, title: "Deposit (GPay UPI)", date: "Yesterday, 04:15 PM", status: "Success"),
    TransactionItem(id: "TXN-7362", type: "debit", amount: 65, title: "Cheese Grilled Sandwich", date: "14 Jun, 01:10 PM", status: "Success"),
    TransactionItem(id: "TXN-3921", type: "debit", amount: 45, title: "Chilled Mango Lassi", date: "12 Jun, 11:30 AM", status: "Success")
  ];
  final List<NotificationItem> _notifications = [
    NotificationItem(id: "notif-1", title: "Order Ready!", body: "Your Sandwich token is now READY.", time: "2m ago", unread: true),
    NotificationItem(id: "notif-2", title: "Wallet Credited", body: "₹200 deposited successfully into your Canteen Wallet.", time: "1d ago", unread: false),
    NotificationItem(id: "notif-3", title: "Brownie Back in Stock", body: "Chocolate Fudge Brownie is now serving.", time: "3d ago", unread: false)
  ];

  // Dynamic Lists for multi-canteen setup
  List<CanteenModel> _canteens = [];
  List<FoodItem> _menuItems = [];
  List<OrderToken> _canteenOrders = []; // Active orders for the canteen owner
  CanteenModel? _selectedCanteen; // Selected canteen by student
  bool _isLoading = false;

  // Getters
  double get walletBalance => _walletBalance;
  Map<String, TokenItem> get cart => _cart;
  List<OrderToken> get activeTokens => _activeTokens;
  List<TransactionItem> get transactions => _transactions;
  List<NotificationItem> get notifications => _notifications;

  List<CanteenModel> get canteens => _canteens;
  List<FoodItem> get menuItems => _menuItems;
  List<OrderToken> get canteenOrders => _canteenOrders;
  CanteenModel? get selectedCanteen => _selectedCanteen;
  bool get isLoading => _isLoading;

  int get cartCount => _cart.values.fold(0, (sum, item) => sum + item.quantity);
  double get cartSubtotal => _cart.values.fold(0.0, (sum, item) => sum + (item.foodItem.price * item.quantity));
  double get cartGST => cartSubtotal * 0.05;
  double get cartPlatformFee => cartSubtotal > 0 ? 5.0 : 0.0;
  double get cartTotal => cartSubtotal + cartGST + cartPlatformFee;

  // Load registered canteens
  Future<void> loadCanteens() async {
    _isLoading = true;
    notifyListeners();
    try {
      _canteens = await _supabaseService.fetchCanteens();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Set selected canteen and fetch its menu
  void selectCanteen(CanteenModel? canteen) async {
    _selectedCanteen = canteen;
    _cart.clear(); // Clear cart when switching canteens
    notifyListeners();
    if (canteen != null) {
      await loadMenuItems(canteen.id);
    }
  }

  // Load menu items for a specific canteen
  Future<void> loadMenuItems(String canteenId) async {
    _isLoading = true;
    notifyListeners();
    try {
      _menuItems = await _supabaseService.fetchMenuItems(canteenId);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Add new food item to owner's canteen menu
  Future<void> addNewMenuItem(FoodItem item) async {
    _isLoading = true;
    notifyListeners();
    try {
      final addedItem = await _supabaseService.addMenuItem(item);
      _menuItems.add(addedItem);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Load active orders for owner
  Future<void> loadCanteenOrders(String canteenId) async {
    _isLoading = true;
    notifyListeners();
    try {
      _canteenOrders = await _supabaseService.fetchOrdersForCanteen(canteenId);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Update order status (Owner accept, prepare, claim)
  Future<void> updateOrderStatus(String orderId, String status) async {
    _isLoading = true;
    notifyListeners();
    try {
      await _supabaseService.updateOrderStatus(orderId, status);
      
      // Update locally in canteen owner orders list
      final cIndex = _canteenOrders.indexWhere((o) => o.id == orderId);
      if (cIndex != -1) {
        TokenStatus newStatus = TokenStatus.preparing;
        if (status == 'ready') newStatus = TokenStatus.ready;
        if (status == 'collected') newStatus = TokenStatus.collected;
        
        _canteenOrders[cIndex] = OrderToken(
          id: _canteenOrders[cIndex].id,
          items: _canteenOrders[cIndex].items,
          totalAmount: _canteenOrders[cIndex].totalAmount,
          createdAt: _canteenOrders[cIndex].createdAt,
          status: newStatus,
        );
      }

      // Update locally in student active tokens list
      final sIndex = _activeTokens.indexWhere((o) => o.id == orderId);
      if (sIndex != -1) {
        TokenStatus newStatus = TokenStatus.preparing;
        if (status == 'ready') newStatus = TokenStatus.ready;
        if (status == 'collected') newStatus = TokenStatus.collected;
        
        _activeTokens[sIndex].status = newStatus;
        
        // Notify Student via Notification list
        final notifId = "notif-${100 + Random().nextInt(900)}";
        _notifications.insert(0, NotificationItem(
          id: notifId,
          title: status == 'ready' ? "Order Ready!" : "Order Collected",
          body: status == 'ready' 
              ? "Your order pass #$orderId is now READY. Pick it up from counter."
              : "Your order pass #$orderId has been collected.",
          time: "Just now",
          unread: true
        ));
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void depositCash() {
    _walletBalance += 100.0;
    
    final txId = "TXN-${1000 + Random().nextInt(9000)}";
    _transactions.insert(0, TransactionItem(
      id: txId,
      type: "credit",
      amount: 100.0,
      title: "Deposit (Wallet Top-Up)",
      date: "Just now",
      status: "Success"
    ));

    final notifId = "notif-${100 + Random().nextInt(900)}";
    _notifications.insert(0, NotificationItem(
      id: notifId,
      title: "Wallet Credited",
      body: "₹100 deposited successfully into your Canteen Wallet.",
      time: "Just now",
      unread: true
    ));

    notifyListeners();
  }

  void addToCart(FoodItem item) {
    if (_cart.containsKey(item.id)) {
      _cart[item.id] = TokenItem(
        foodItem: item,
        quantity: _cart[item.id]!.quantity + 1,
      );
    } else {
      _cart[item.id] = TokenItem(foodItem: item, quantity: 1);
    }
    notifyListeners();
  }

  void removeFromCart(FoodItem item) {
    if (!_cart.containsKey(item.id)) return;
    
    if (_cart[item.id]!.quantity > 1) {
      _cart[item.id] = TokenItem(
        foodItem: item,
        quantity: _cart[item.id]!.quantity - 1,
      );
    } else {
      _cart.remove(item.id);
    }
    notifyListeners();
  }

  void clearCart() {
    _cart.clear();
    notifyListeners();
  }

  Future<void> checkout() async {
    final double total = cartTotal;
    if (_walletBalance < total) {
      throw Exception("Insufficient wallet balance. Please add cash to proceed.");
    }

    if (_selectedCanteen == null) {
      throw Exception("Please select a canteen to order from.");
    }

    _walletBalance -= total;

    // Create Order Token
    final tokenCode = "CB-${1000 + Random().nextInt(9000)}";
    final cartList = _cart.values.toList();
    final newOrder = OrderToken(
      id: tokenCode,
      items: cartList,
      totalAmount: total,
      createdAt: DateTime.now(),
      status: TokenStatus.preparing,
    );

    // Persist order in Database
    await _supabaseService.placeOrder(newOrder, _selectedCanteen!.id);

    _activeTokens.insert(0, newOrder);

    // Create transaction
    final txId = "TXN-${1000 + Random().nextInt(9000)}";
    final itemsSummary = cartList.map((e) => "${e.quantity}x ${e.foodItem.name}").join(", ");
    _transactions.insert(0, TransactionItem(
      id: txId,
      type: "debit",
      amount: total,
      title: itemsSummary.length > 30 ? "${itemsSummary.substring(0, 27)}..." : itemsSummary,
      date: "Just now",
      status: "Success"
    ));

    // Clear cart
    _cart.clear();

    // Create notification
    final notifId = "notif-${100 + Random().nextInt(900)}";
    _notifications.insert(0, NotificationItem(
      id: notifId,
      title: "Order Placed",
      body: "Your order pass #$tokenCode has been submitted to ${_selectedCanteen!.name}. Preparing now.",
      time: "Just now",
      unread: true
    ));

    notifyListeners();

    // In mock mode (fallback), simulate automatic prepare -> ready flow if not real Supabase
    if (!_supabaseService.isRealInitialized) {
      Future.delayed(const Duration(seconds: 8), () {
        final orderIndex = _activeTokens.indexWhere((t) => t.id == tokenCode);
        if (orderIndex != -1 && _activeTokens[orderIndex].status == TokenStatus.preparing) {
          updateOrderStatus(tokenCode, 'ready');
        }
      });
    }
  }

  void claimOrder(String tokenId) async {
    await updateOrderStatus(tokenId, 'collected');
  }

  void markAllNotificationsRead() {
    for (var n in _notifications) {
      n.unread = false;
    }
    notifyListeners();
  }
}
