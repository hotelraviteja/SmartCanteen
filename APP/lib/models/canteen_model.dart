class CanteenModel {
  final String id;
  final String name;
  final String ownerId;

  CanteenModel({
    required this.id,
    required this.name,
    required this.ownerId,
  });

  factory CanteenModel.fromJson(Map<String, dynamic> json) {
    return CanteenModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      ownerId: json['ownerId'] ?? json['owner_id'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'ownerId': ownerId,
    };
  }
}
