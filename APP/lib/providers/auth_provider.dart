import 'package:flutter/foundation.dart';
import 'dart:io';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/user_model.dart';
import '../services/supabase_service.dart';

class AuthProvider with ChangeNotifier {
  final SupabaseService _supabaseService = SupabaseService();

  UserModel? _user;
  String? _token;
  bool _isAuthenticated = false;
  bool _loading = false;
  bool _isLocked = false;
  bool _isSessionExpired = false;
  int _loginAttempts = 0;
  String _pendingOAuthRole = 'student';

  AuthProvider() {
    _loadSession();
    _listenToAuthChanges();
  }

  void _savePendingRole(String role) {
    _pendingOAuthRole = role;
    if (!kIsWeb) {
      try {
        final tempDir = Directory.systemTemp;
        final file = File('${tempDir.path}/smartcanteen_pending_role.txt');
        file.writeAsStringSync(role);
      } catch (e) {
        debugPrint("Error saving pending role: $e");
      }
    }
  }

  String _loadPendingRole() {
    if (!kIsWeb) {
      try {
        final tempDir = Directory.systemTemp;
        final file = File('${tempDir.path}/smartcanteen_pending_role.txt');
        if (file.existsSync()) {
          return file.readAsStringSync().trim();
        }
      } catch (e) {
        debugPrint("Error loading pending role: $e");
      }
    }
    return _pendingOAuthRole;
  }

  void _clearPendingRole() {
    _pendingOAuthRole = 'student';
    if (!kIsWeb) {
      try {
        final tempDir = Directory.systemTemp;
        final file = File('${tempDir.path}/smartcanteen_pending_role.txt');
        if (file.existsSync()) {
          file.deleteSync();
        }
      } catch (e) {
        debugPrint("Error clearing pending role: $e");
      }
    }
  }

  void _loadSession() {
    final currentUser = _supabaseService.currentUser;
    final token = _supabaseService.sessionToken;
    if (currentUser != null && token != null) {
      _user = currentUser;
      _token = token;
      _isAuthenticated = true;
    }
  }

  void _listenToAuthChanges() {
    if (_supabaseService.isRealInitialized) {
      Supabase.instance.client.auth.onAuthStateChange.listen((data) async {
        final AuthChangeEvent event = data.event;
        final Session? session = data.session;
        if (event == AuthChangeEvent.signedIn && session != null) {
          final user = session.user;
          
          String role = 'student';
          String canteenName = '';
          String name = user.userMetadata?['full_name'] ?? user.email?.split('@')[0].toUpperCase() ?? '';
          String studentId = user.userMetadata?['student_id'] ?? '';
          String department = user.userMetadata?['department'] ?? 'Computer Science & Engineering';
          String academicYear = user.userMetadata?['academic_year'] ?? '3rd Year';
          String phone = user.phone ?? user.userMetadata?['phone'] ?? '';

          try {
            // 1. Fetch profile from database to check true role
            var profileData = await Supabase.instance.client
                .from('profiles')
                .select()
                .eq('id', user.id)
                .maybeSingle();

            // 2. If user signed in from Canteen Owner tab, promote the role
            final pendingRole = _loadPendingRole();
            if (pendingRole == 'owner') {
              if (profileData == null || profileData['role'] != 'owner') {
                await Supabase.instance.client.from('profiles').upsert({
                  'id': user.id,
                  'full_name': name,
                  'role': 'owner',
                  'canteen_name': canteenName.isNotEmpty ? canteenName : 'My Canteen',
                });
                
                // Re-fetch profiles record
                profileData = await Supabase.instance.client
                    .from('profiles')
                    .select()
                    .eq('id', user.id)
                    .maybeSingle();
              }
            }

            if (profileData != null) {
              role = profileData['role'] ?? 'student';
              canteenName = profileData['canteen_name'] ?? '';
              name = profileData['full_name'] ?? name;
              studentId = profileData['student_id'] ?? studentId;
              department = profileData['department'] ?? department;
              academicYear = profileData['academic_year'] ?? academicYear;
              phone = profileData['phone'] ?? phone;
            }
          } catch (e) {
            print("Error synchronizing profile trigger: $e");
          }

          _user = UserModel(
            name: name,
            email: user.email ?? '',
            studentId: studentId,
            department: department,
            academicYear: academicYear,
            phone: phone,
            role: role,
            canteenName: canteenName,
          );
          _token = session.accessToken;
          _isAuthenticated = true;
          _clearPendingRole();
          notifyListeners();
        } else if (event == AuthChangeEvent.signedOut) {
          _user = null;
          _token = null;
          _isAuthenticated = false;
          _clearPendingRole();
          notifyListeners();
        }
      });
    }
  }

  UserModel? get user => _user;
  String? get token => _token;
  bool get isAuthenticated => _isAuthenticated;
  bool get loading => _loading;
  bool get isLocked => _isLocked;
  bool get isSessionExpired => _isSessionExpired;
  int get loginAttempts => _loginAttempts; // renamed slightly or kept as is

  Future<void> login(String email, String password, {String role = 'student'}) async {
    _loading = true;
    notifyListeners();

    try {
      if (_isLocked) {
        throw Exception("Account is currently locked. Please recover your account.");
      }

      final result = await _supabaseService.signIn(email: email, password: password, role: role);
      _user = result['user'] as UserModel;
      _token = result['token'] as String;
      _isAuthenticated = true;
      _loginAttempts = 0;
      _isSessionExpired = false;
    } catch (e) {
      final errMsg = e.toString().toLowerCase();
      if (errMsg.contains("invalid email or password")) {
        _loginAttempts++;
        if (_loginAttempts >= 5) {
          simulateAccountLocked();
          throw Exception("Account locked due to 5 consecutive failed login attempts.");
        }
      }
      rethrow;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> loginWithGoogle(String targetRole) async {
    _loading = true;
    _savePendingRole(targetRole);
    notifyListeners();

    try {
      final result = await _supabaseService.signInWithGoogle(role: targetRole);
      if (!_supabaseService.isRealInitialized) {
        _user = result['user'] as UserModel;
        _token = result['token'] as String;
        _isAuthenticated = true;
      }
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> register({
    required String email,
    required String password,
    required String fullName,
    required String studentId,
    required String mobile,
    required String department,
    required String academicYear,
    String role = 'student',
    String canteenName = '',
  }) async {
    _loading = true;
    notifyListeners();

    try {
      await _supabaseService.signUp(
        email: email,
        password: password,
        fullName: fullName,
        studentId: studentId,
        mobile: mobile,
        department: department,
        academicYear: academicYear,
        role: role,
        canteenName: canteenName,
      );
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    _loading = true;
    notifyListeners();

    try {
      await _supabaseService.signOut();
      _user = null;
      _token = null;
      _isAuthenticated = false;
      _isSessionExpired = false;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> requestOTP(String email) async {
    _loading = true;
    notifyListeners();
    try {
      await _supabaseService.requestOTP(email);
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> verifyOTP(String email, String otp) async {
    _loading = true;
    notifyListeners();
    try {
      final result = await _supabaseService.verifyOTP(email, otp);
      _user = result['user'] as UserModel;
      _token = result['token'] as String;
      _isAuthenticated = true;
      _loginAttempts = 0;
      _isSessionExpired = false;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> resetPassword(String email, String newPassword) async {
    _loading = true;
    notifyListeners();
    try {
      await _supabaseService.resetPassword(email, newPassword);
      if (_isLocked) {
        unlockAccount();
      }
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> updateProfile({
    required String name,
    required String phone,
    String studentId = "",
    String department = "Computer Science & Engineering",
    String academicYear = "3rd Year",
    String canteenName = "",
  }) async {
    _loading = true;
    notifyListeners();

    try {
      await _supabaseService.updateProfile(
        name: name,
        phone: phone,
        studentId: studentId,
        department: department,
        academicYear: academicYear,
        canteenName: canteenName,
      );

      // Update local state user model
      _user = UserModel(
        name: name,
        email: _user!.email,
        studentId: studentId,
        department: department,
        academicYear: academicYear,
        phone: phone,
        role: _user!.role,
        canteenName: canteenName,
      );
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  void unlockAccount() {
    _isLocked = false;
    _loginAttempts = 0;
    notifyListeners();
  }

  void clearSessionExpiry() {
    _isSessionExpired = false;
    notifyListeners();
  }

  void simulateSessionExpired() {
    _user = null;
    _token = null;
    _isAuthenticated = false;
    _isSessionExpired = true;
    notifyListeners();
  }

  void simulateAccountLocked() {
    _user = null;
    _token = null;
    _isAuthenticated = false;
    _isLocked = true;
    notifyListeners();
  }
}
