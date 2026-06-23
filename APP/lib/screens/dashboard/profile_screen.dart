import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:math';
import '../../providers/auth_provider.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isEditing = false;
  String? _errorMessage;

  late TextEditingController _nameController;
  late TextEditingController _phoneController;
  late TextEditingController _studentIdController;
  late TextEditingController _departmentController;
  late TextEditingController _academicYearController;
  late TextEditingController _canteenNameController;

  @override
  void initState() {
    super.initState();
    final user = Provider.of<AuthProvider>(context, listen: false).user;
    
    _nameController = TextEditingController(text: user?.name ?? "");
    _phoneController = TextEditingController(text: user?.phone ?? "");
    _studentIdController = TextEditingController(text: user?.studentId ?? "");
    _departmentController = TextEditingController(text: user?.department ?? "");
    _academicYearController = TextEditingController(text: user?.academicYear ?? "");
    _canteenNameController = TextEditingController(text: user?.canteenName ?? "");
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _studentIdController.dispose();
    _departmentController.dispose();
    _academicYearController.dispose();
    _canteenNameController.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _errorMessage = null;
    });

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final user = authProvider.user;

    try {
      await authProvider.updateProfile(
        name: _nameController.text.trim(),
        phone: _phoneController.text.trim(),
        studentId: user?.role == 'student' ? _studentIdController.text.trim() : "",
        department: user?.role == 'student' ? _departmentController.text.trim() : "",
        academicYear: user?.role == 'student' ? _academicYearController.text.trim() : "",
        canteenName: user?.role == 'owner' ? _canteenNameController.text.trim() : "",
      );

      setState(() {
        _isEditing = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Profile updated successfully!"),
          backgroundColor: Color(0xFF10B981),
        ),
      );
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceAll("Exception: ", "");
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isStudent = user?.role == 'student';

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF08090C) : const Color(0xFFFAF8F5),
      appBar: AppBar(
        backgroundColor: isDark ? const Color(0xFF0F1116) : Colors.white,
        elevation: 0.5,
        title: const Text(
          "My Profile",
          style: TextStyle(
            fontFamily: 'Poppins',
            fontWeight: FontWeight.bold,
            fontSize: 18,
            color: Color(0xFFFC8019),
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Color(0xFFFC8019)),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          if (!_isEditing)
            IconButton(
              icon: const Icon(Icons.edit_rounded, color: Color(0xFFFC8019)),
              onPressed: () => setState(() => _isEditing = true),
            )
          else
            IconButton(
              icon: const Icon(Icons.close_rounded, color: Colors.red),
              onPressed: () {
                // Cancel editing, restore values
                setState(() {
                  _isEditing = false;
                  _nameController.text = user?.name ?? "";
                  _phoneController.text = user?.phone ?? "";
                  _studentIdController.text = user?.studentId ?? "";
                  _departmentController.text = user?.department ?? "";
                  _academicYearController.text = user?.academicYear ?? "";
                  _canteenNameController.text = user?.canteenName ?? "";
                  _errorMessage = null;
                });
              },
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Center(
          child: Container(
            constraints: const BoxConstraints(maxWidth: 500),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Top Avatar & Basic Info Card
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF0F1116) : Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: isDark ? const Color(0xFF1E222B) : const Color(0xFFEFECE6),
                    ),
                  ),
                  child: Column(
                    children: [
                      CircleAvatar(
                        radius: 46,
                        backgroundColor: const Color(0xFFFC8019).withOpacity(0.1),
                        child: Text(
                          user?.name.substring(0, min(2, user.name.length)) ?? "ST",
                          style: const TextStyle(
                            color: Color(0xFFFC8019),
                            fontWeight: FontWeight.bold,
                            fontSize: 32,
                            fontFamily: 'Poppins',
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        user?.name ?? "",
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFC8019).withOpacity(0.15),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          isStudent ? "STUDENT" : "CANTEEN OWNER",
                          style: const TextStyle(
                            color: Color(0xFFFC8019),
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.0,
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        user?.email ?? "",
                        style: TextStyle(fontSize: 13, color: Colors.grey[500]),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Form Fields Card
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF0F1116) : Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: isDark ? const Color(0xFF1E222B) : const Color(0xFFEFECE6),
                    ),
                  ),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text(
                          "Profile Information",
                          style: TextStyle(
                            fontFamily: 'Poppins',
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: isDark ? Colors.white : Colors.black87,
                          ),
                        ),
                        const Divider(height: 24),

                        // Error message
                        if (_errorMessage != null) ...[
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: const Color(0xFFEF4444).withOpacity(0.1),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              _errorMessage!,
                              style: const TextStyle(color: Color(0xFFEF4444), fontSize: 13),
                            ),
                          ),
                          const SizedBox(height: 16),
                        ],

                        // Full Name
                        TextFormField(
                          controller: _nameController,
                          enabled: _isEditing,
                          decoration: const InputDecoration(
                            labelText: "Full Name",
                            prefixIcon: Icon(Icons.person_outline_rounded),
                          ),
                          validator: (val) => val == null || val.isEmpty ? "Name is required" : null,
                        ),
                        const SizedBox(height: 16),

                        // Phone Number
                        TextFormField(
                          controller: _phoneController,
                          enabled: _isEditing,
                          keyboardType: TextInputType.phone,
                          decoration: const InputDecoration(
                            labelText: "Phone Number",
                            prefixIcon: Icon(Icons.phone_outlined),
                          ),
                          validator: (val) => val == null || val.isEmpty ? "Phone number is required" : null,
                        ),
                        const SizedBox(height: 16),

                        if (isStudent) ...[
                          // Student ID
                          TextFormField(
                            controller: _studentIdController,
                            enabled: _isEditing,
                            decoration: const InputDecoration(
                              labelText: "Student Registration ID",
                              prefixIcon: Icon(Icons.badge_outlined),
                            ),
                            validator: (val) => val == null || val.isEmpty ? "Student ID is required" : null,
                          ),
                          const SizedBox(height: 16),

                          // Department
                          TextFormField(
                            controller: _departmentController,
                            enabled: _isEditing,
                            decoration: const InputDecoration(
                              labelText: "Department",
                              prefixIcon: Icon(Icons.school_outlined),
                            ),
                            validator: (val) => val == null || val.isEmpty ? "Department is required" : null,
                          ),
                          const SizedBox(height: 16),

                          // Academic Year
                          TextFormField(
                            controller: _academicYearController,
                            enabled: _isEditing,
                            decoration: const InputDecoration(
                              labelText: "Academic Year",
                              prefixIcon: Icon(Icons.calendar_today_outlined),
                            ),
                            validator: (val) => val == null || val.isEmpty ? "Academic year is required" : null,
                          ),
                        ] else ...[
                          // Canteen Name
                          TextFormField(
                            controller: _canteenNameController,
                            enabled: _isEditing,
                            decoration: const InputDecoration(
                              labelText: "Registered Canteen Name",
                              prefixIcon: Icon(Icons.storefront_outlined),
                            ),
                            validator: (val) => val == null || val.isEmpty ? "Canteen name is required" : null,
                          ),
                        ],
                        const SizedBox(height: 24),

                        if (_isEditing)
                          ElevatedButton(
                            onPressed: authProvider.loading ? null : _handleSave,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFFC8019),
                              foregroundColor: Colors.white,
                              minimumSize: const Size.fromHeight(48),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              elevation: 0,
                            ),
                            child: authProvider.loading
                                ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                                  )
                                : const Text("Save Changes", style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                          ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
