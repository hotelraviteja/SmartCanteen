import 'food_item.dart';

enum TokenStatus {
  preparing,
  ready,
  collected
}

class TokenItem {
  final FoodItem foodItem;
  final int quantity;

  TokenItem({required this.foodItem, required this.quantity});
}

class OrderToken {
  final String id;
  final List<TokenItem> items;
  final double totalAmount;
  final DateTime createdAt;
  TokenStatus status;

  OrderToken({
    required this.id,
    required this.items,
    required this.totalAmount,
    required this.createdAt,
    this.status = TokenStatus.preparing,
  });

  String get statusText {
    switch (status) {
      case TokenStatus.preparing:
        return 'Preparing';
      case TokenStatus.ready:
        return 'Ready to Collect';
      case TokenStatus.collected:
        return 'Collected';
    }
  }
}
