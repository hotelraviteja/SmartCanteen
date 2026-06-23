class UserModel {
  final String name;
  final String email;
  final String studentId;
  final String department;
  final String academicYear;
  final String phone;
  final String role;
  final String canteenName;

  UserModel({
    required this.name,
    required this.email,
    required this.studentId,
    required this.department,
    required this.academicYear,
    required this.phone,
    this.role = 'student',
    this.canteenName = '',
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      studentId: json['studentId'] ?? '',
      department: json['department'] ?? 'Computer Science & Engineering',
      academicYear: json['academicYear'] ?? '3rd Year',
      phone: json['phone'] ?? '',
      role: json['role'] ?? 'student',
      canteenName: json['canteenName'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'email': email,
      'studentId': studentId,
      'department': department,
      'academicYear': academicYear,
      'phone': phone,
      'role': role,
      'canteenName': canteenName,
    };
  }

  UserModel copyWith({
    String? name,
    String? email,
    String? studentId,
    String? department,
    String? academicYear,
    String? phone,
    String? role,
    String? canteenName,
  }) {
    return UserModel(
      name: name ?? this.name,
      email: email ?? this.email,
      studentId: studentId ?? this.studentId,
      department: department ?? this.department,
      academicYear: academicYear ?? this.academicYear,
      phone: phone ?? this.phone,
      role: role ?? this.role,
      canteenName: canteenName ?? this.canteenName,
    );
  }
}
