import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter/foundation.dart';
import '../models/user_model.dart';
import '../models/food_item.dart';
import '../models/canteen_model.dart';
import '../models/order_token.dart';

class SupabaseService {
  // Singleton instance
  static final SupabaseService _instance = SupabaseService._internal();
  factory SupabaseService() => _instance;
  SupabaseService._internal();

  static const String supabaseUrl = 'https://uhcqbsgapavchsobmlbs.supabase.co';
  static const String supabaseAnonKey = 'sb_publishable_KOT0ItSMwvnZE-kUwyN_QQ_xan9z07D';

  bool _isRealInitialized = false;

  bool get isRealInitialized => _isRealInitialized;

  void setRealInitialized(bool val) {
    _isRealInitialized = val;
  }

  // Get current user model mapped from Supabase user metadata or Mock values
  UserModel? get currentUser {
    if (_isRealInitialized) {
      final user = Supabase.instance.client.auth.currentUser;
      if (user == null) return null;
      return UserModel(
        name: user.userMetadata?['full_name'] ?? user.email?.split('@')[0].toUpperCase() ?? '',
        email: user.email ?? '',
        studentId: user.userMetadata?['student_id'] ?? '',
        department: user.userMetadata?['department'] ?? 'Computer Science & Engineering',
        academicYear: user.userMetadata?['academic_year'] ?? '3rd Year',
        phone: user.phone ?? user.userMetadata?['phone'] ?? '',
        role: user.userMetadata?['role'] ?? 'student',
        canteenName: user.userMetadata?['canteen_name'] ?? '',
      );
    } else {
      return _mockCurrentUser;
    }
  }

  // Get current access token
  String? get sessionToken {
    if (_isRealInitialized) {
      return Supabase.instance.client.auth.currentSession?.accessToken;
    } else {
      return _mockSessionToken;
    }
  }

  // Local Mock Auth state fields
  UserModel? _mockCurrentUser;
  String? _mockSessionToken;

  // Local Mock DB Lists (for fallback in-memory testing)
  final List<CanteenModel> _mockCanteens = [
    CanteenModel(id: "canteen-1", name: "Central Canteen", ownerId: "owner-1"),
    CanteenModel(id: "canteen-2", name: "Spicy Bites", ownerId: "owner-2"),
    CanteenModel(id: "canteen-3", name: "Nescafe Corner", ownerId: "owner-3"),
  ];

  late final List<FoodItem> _mockMenuItems = List.from(canteenCatalogue);
  final List<OrderToken> _mockOrders = [];

  // Sign Up logic
  Future<Map<String, dynamic>> signUp({
    required String email,
    required String password,
    required String fullName,
    required String studentId,
    required String mobile,
    String department = "Computer Science & Engineering",
    String academicYear = "3rd Year",
    String role = "student",
    String canteenName = "",
  }) async {
    if (_isRealInitialized) {
      try {
        final response = await Supabase.instance.client.auth.signUp(
          email: email,
          password: password,
          data: {
            'full_name': fullName,
            'student_id': studentId,
            'phone': mobile,
            'department': department,
            'academic_year': academicYear,
            'role': role,
            'canteen_name': canteenName,
          },
        );
        if (response.user == null) {
          throw Exception("Registration failed. Please check credentials.");
        }
        return {
          'success': true,
          'message': "Registration successful! You can now log in.",
          'user': UserModel(
            name: fullName,
            email: email,
            studentId: studentId,
            department: department,
            academicYear: academicYear,
            phone: mobile,
            role: role,
            canteenName: canteenName,
          ),
        };
      } on AuthException catch (e) {
        throw Exception(e.message);
      } catch (e) {
        throw Exception(e.toString());
      }
    } else {
      // Mock signup delay & simulation
      await Future.delayed(const Duration(milliseconds: 800));
      _mockCurrentUser = UserModel(
        name: fullName.toUpperCase(),
        email: email,
        studentId: studentId,
        department: department,
        academicYear: academicYear,
        phone: mobile,
        role: role,
        canteenName: canteenName,
      );

      // If they are an owner, auto-add their canteen in memory
      if (role == 'owner') {
        final newCanteenId = "canteen-${DateTime.now().millisecondsSinceEpoch}";
        _mockCanteens.add(CanteenModel(
          id: newCanteenId,
          name: canteenName.isNotEmpty ? canteenName : "My Canteen",
          ownerId: _mockCurrentUser!.email,
        ));
      }

      return {
        'success': true,
        'message': "Registration successful! You can now log in.",
        'user': _mockCurrentUser,
      };
    }
  }

  // Sign In logic
  Future<Map<String, dynamic>> signIn({
    required String email,
    required String password,
    String role = 'student',
  }) async {
    if (_isRealInitialized) {
      try {
        final response = await Supabase.instance.client.auth.signInWithPassword(
          email: email,
          password: password,
        );
        final user = response.user;
        final session = response.session;
        if (user == null || session == null) {
          throw Exception("Authentication failed.");
        }
        final userModel = UserModel(
          name: user.userMetadata?['full_name'] ?? email.split('@')[0].toUpperCase(),
          email: user.email ?? email,
          studentId: user.userMetadata?['student_id'] ?? '',
          department: user.userMetadata?['department'] ?? 'Computer Science & Engineering',
          academicYear: user.userMetadata?['academic_year'] ?? '3rd Year',
          phone: user.phone ?? user.userMetadata?['phone'] ?? '',
          role: user.userMetadata?['role'] ?? 'student',
          canteenName: user.userMetadata?['canteen_name'] ?? '',
        );
        return {
          'user': userModel,
          'token': session.accessToken,
        };
      } on AuthException catch (e) {
        throw Exception(e.message);
      } catch (e) {
        throw Exception(e.toString());
      }
    } else {
      // Mock signin simulation
      await Future.delayed(const Duration(milliseconds: 800));
      if (password.toLowerCase().contains("wrong") || email.isEmpty || password.isEmpty) {
        throw Exception("Invalid email or password. Please try again.");
      }
      
      // Keep existing mock account if generated via register, else mock default
      _mockCurrentUser ??= UserModel(
        name: email.split("@")[0].replaceAll(".", " ").toUpperCase(),
        email: email,
        studentId: "CS-2026-928",
        department: "Computer Science & Engineering",
        academicYear: "3rd Year",
        phone: "+91 98765 43210",
        role: role,
        canteenName: role == 'owner' ? "Express Bite Canteen" : "",
      );

      // Add their canteen in mock list if they are an owner and not listed
      if (_mockCurrentUser!.role == 'owner' && !_mockCanteens.any((c) => c.ownerId == _mockCurrentUser!.email)) {
        _mockCanteens.add(CanteenModel(
          id: "canteen-owner-default",
          name: _mockCurrentUser!.canteenName,
          ownerId: _mockCurrentUser!.email,
        ));
      }

      _mockSessionToken = "mock-supabase-jwt-token-xyz-123";
      return {
        'user': _mockCurrentUser!,
        'token': _mockSessionToken!,
      };
    }
  }

  // Sign Out logic
  Future<void> signOut() async {
    if (_isRealInitialized) {
      try {
        await Supabase.instance.client.auth.signOut();
      } catch (e) {
        debugPrint("Error signing out from Supabase: $e");
      }
    } else {
      await Future.delayed(const Duration(milliseconds: 400));
      _mockCurrentUser = null;
      _mockSessionToken = null;
    }
  }

  // Request OTP (reset password link)
  Future<Map<String, dynamic>> requestOTP(String email) async {
    if (_isRealInitialized) {
      try {
        await Supabase.instance.client.auth.resetPasswordForEmail(
          email,
          redirectTo: kIsWeb ? '${Uri.base.origin}/#/reset-password' : 'smartcanteen://reset-password',
        );
        return {
          'success': true,
          'message': "Password reset link sent to your email.",
        };
      } on AuthException catch (e) {
        throw Exception(e.message);
      } catch (e) {
        throw Exception(e.toString());
      }
    } else {
      await Future.delayed(const Duration(milliseconds: 800));
      return {
        'success': true,
        'message': "Password reset link sent to your email.",
      };
    }
  }

  // Verify OTP for password recovery
  Future<Map<String, dynamic>> verifyOTP(String email, String otp) async {
    if (_isRealInitialized) {
      try {
        final response = await Supabase.instance.client.auth.verifyOTP(
          email: email,
          token: otp,
          type: OtpType.recovery,
        );
        final user = response.user;
        final session = response.session;
        if (user == null || session == null) {
          throw Exception("Incorrect OTP code. Please check and try again.");
        }
        final userModel = UserModel(
          name: user.userMetadata?['full_name'] ?? email.split('@')[0].toUpperCase(),
          email: user.email ?? email,
          studentId: user.userMetadata?['student_id'] ?? '',
          department: user.userMetadata?['department'] ?? 'Computer Science & Engineering',
          academicYear: user.userMetadata?['academic_year'] ?? '3rd Year',
          phone: user.phone ?? user.userMetadata?['phone'] ?? '',
          role: user.userMetadata?['role'] ?? 'student',
          canteenName: user.userMetadata?['canteen_name'] ?? '',
        );
        return {
          'success': true,
          'user': userModel,
          'token': session.accessToken,
        };
      } on AuthException catch (e) {
        throw Exception(e.message);
      } catch (e) {
        throw Exception(e.toString());
      }
    } else {
      await Future.delayed(const Duration(milliseconds: 800));
      if (otp != "123456" && otp != "000000") {
        throw Exception("Incorrect OTP code. Please check and try again. (Hint: Use 123456)");
      }
      _mockCurrentUser = UserModel(
        name: email.split("@")[0].replaceAll(".", " ").toUpperCase(),
        email: email,
        studentId: "CB-OTP-${DateTime.now().millisecond}",
        department: "Computer Science & Engineering",
        academicYear: "3rd Year",
        phone: "+91 98765 43210",
        role: "student",
        canteenName: "",
      );
      _mockSessionToken = "mock-supabase-otp-jwt";
      return {
        'success': true,
        'user': _mockCurrentUser!,
        'token': _mockSessionToken!,
      };
    }
  }

  // Reset Password (updating user password)
  Future<Map<String, dynamic>> resetPassword(String email, String newPassword) async {
    if (_isRealInitialized) {
      try {
        await Supabase.instance.client.auth.updateUser(
          UserAttributes(password: newPassword),
        );
        return {
          'success': true,
          'message': "Password reset completed successfully.",
        };
      } on AuthException catch (e) {
        throw Exception(e.message);
      } catch (e) {
        throw Exception(e.toString());
      }
    } else {
      await Future.delayed(const Duration(milliseconds: 800));
      return {
        'success': true,
        'message': "Password reset completed successfully.",
      };
    }
  }

  // Update user profile details
  Future<void> updateProfile({
    required String name,
    required String phone,
    String studentId = "",
    String department = "Computer Science & Engineering",
    String academicYear = "3rd Year",
    String canteenName = "",
  }) async {
    if (_isRealInitialized) {
      try {
        final userId = Supabase.instance.client.auth.currentUser?.id;
        if (userId == null) throw Exception("User not signed in.");

        await Supabase.instance.client.from('profiles').update({
          'full_name': name,
          'phone': phone,
          'student_id': studentId,
          'department': department,
          'academic_year': academicYear,
          'canteen_name': canteenName,
        }).eq('id', userId);
        
        // Also update auth user metadata so local session matches
        await Supabase.instance.client.auth.updateUser(
          UserAttributes(
            data: {
              'full_name': name,
              'student_id': studentId,
              'phone': phone,
              'department': department,
              'academic_year': academicYear,
              'canteen_name': canteenName,
            },
          ),
        );
      } catch (e) {
        throw Exception("Failed to update profile: $e");
      }
    } else {
      // Mock mode
      if (_mockCurrentUser != null) {
        _mockCurrentUser = UserModel(
          name: name,
          email: _mockCurrentUser!.email,
          studentId: studentId,
          department: department,
          academicYear: academicYear,
          phone: phone,
          role: _mockCurrentUser!.role,
          canteenName: canteenName,
        );
        
        if (_mockCurrentUser!.role == 'owner') {
          final index = _mockCanteens.indexWhere((c) => c.ownerId == _mockCurrentUser!.email);
          if (index != -1) {
            _mockCanteens[index] = CanteenModel(
              id: _mockCanteens[index].id,
              name: canteenName,
              ownerId: _mockCanteens[index].ownerId,
            );
          }
        }
      }
    }
  }

  // Sign in with Google (OAuth)
  Future<Map<String, dynamic>> signInWithGoogle({String role = 'student'}) async {
    if (_isRealInitialized) {
      try {
        await Supabase.instance.client.auth.signInWithOAuth(
          OAuthProvider.google,
          redirectTo: kIsWeb ? '${Uri.base.origin}/' : 'smartcanteen://login-callback',
        );
        return {'success': true};
      } on AuthException catch (e) {
        throw Exception(e.message);
      } catch (e) {
        throw Exception(e.toString());
      }
    } else {
      // Mock logic: set mock user details
      await Future.delayed(const Duration(milliseconds: 800));
      _mockCurrentUser = UserModel(
        name: role == 'owner' ? "GOOGLE OWNER" : "GOOGLE STUDENT",
        email: role == 'owner' ? "google.owner@college.edu" : "google.student@college.edu",
        studentId: role == 'owner' ? "CB-GOOGLE-OWNER" : "CB-GOOGLE-839",
        department: "Computer Science & Engineering",
        academicYear: "3rd Year",
        phone: "+91 98765 43210",
        role: role,
        canteenName: role == 'owner' ? "Express Bite Canteen" : "",
      );
      _mockSessionToken = "mock-supabase-google-jwt";
      return {
        'success': true,
        'user': _mockCurrentUser,
        'token': _mockSessionToken,
      };
    }
  }

  // ==========================================
  // MULTI-CANTEEN DATABASE OPERATIONS
  // ==========================================

  // Fetch Canteens
  Future<List<CanteenModel>> fetchCanteens() async {
    if (_isRealInitialized) {
      try {
        final List<dynamic> data = await Supabase.instance.client
            .from('canteens')
            .select('id, name, owner_id, status');
        return data.map((json) => CanteenModel.fromJson(json)).toList();
      } catch (e) {
        debugPrint("Error fetching canteens: $e. Falling back to mock.");
        return _mockCanteens;
      }
    } else {
      return _mockCanteens;
    }
  }

  // Fetch Menu Items for a Canteen
  Future<List<FoodItem>> fetchMenuItems(String canteenId) async {
    if (_isRealInitialized) {
      try {
        final List<dynamic> data = await Supabase.instance.client
            .from('menu_items')
            .select()
            .eq('canteen_id', canteenId);
        return data.map((json) => FoodItem.fromJson(json)).toList();
      } catch (e) {
        debugPrint("Error fetching menu: $e. Falling back to mock.");
        return _mockMenuItems.where((item) => item.canteenId == canteenId).toList();
      }
    } else {
      return _mockMenuItems.where((item) => item.canteenId == canteenId).toList();
    }
  }

  // Add Menu Item
  Future<FoodItem> addMenuItem(FoodItem item) async {
    if (_isRealInitialized) {
      try {
        final Map<String, dynamic> data = await Supabase.instance.client
            .from('menu_items')
            .insert({
              'canteen_id': item.canteenId,
              'name': item.name,
              'price': item.price,
              'prep_time': item.prepTime,
              'category': item.category,
              'is_veg': item.isVeg,
              'desc_text': item.desc,
              'img': item.img,
            })
            .select()
            .single();
        return FoodItem.fromJson(data);
      } catch (e) {
        throw Exception("Failed to save menu item to database: $e");
      }
    } else {
      _mockMenuItems.add(item);
      return item;
    }
  }

  // Place Order
  Future<void> placeOrder(OrderToken order, String canteenId) async {
    if (_isRealInitialized) {
      try {
        final studentId = Supabase.instance.client.auth.currentUser?.id;
        if (studentId == null) throw Exception("User not signed in.");

        await Supabase.instance.client.from('orders').insert({
          'id': order.id,
          'student_id': studentId,
          'canteen_id': canteenId,
          'status': 'preparing',
          'total_amount': order.totalAmount,
          'items': order.items.map((e) => {
            'id': e.foodItem.id,
            'name': e.foodItem.name,
            'price': e.foodItem.price,
            'quantity': e.quantity,
          }).toList(),
        });
      } catch (e) {
        throw Exception("Failed to submit order to database: $e");
      }
    } else {
      _mockOrders.add(order);
    }
  }

  // Fetch Orders for Canteen Owner
  Future<List<OrderToken>> fetchOrdersForCanteen(String canteenId) async {
    if (_isRealInitialized) {
      try {
        final List<dynamic> data = await Supabase.instance.client
            .from('orders')
            .select()
            .eq('canteen_id', canteenId)
            .order('created_at', ascending: false);
            
        return data.map((json) {
          final itemsList = (json['items'] as List<dynamic>).map((e) {
            return TokenItem(
              foodItem: FoodItem(
                id: e['id'] ?? '',
                canteenId: canteenId,
                name: e['name'] ?? '',
                price: (e['price'] as num?)?.toDouble() ?? 0.0,
                prepTime: '',
                rating: '',
                img: '🍔',
                category: '',
                isVeg: true,
                desc: '',
              ),
              quantity: e['quantity'] ?? 1,
            );
          }).toList();

          final statusStr = json['status'] ?? 'preparing';
          TokenStatus status = TokenStatus.preparing;
          if (statusStr == 'ready') status = TokenStatus.ready;
          if (statusStr == 'collected') status = TokenStatus.collected;

          return OrderToken(
            id: json['id'],
            items: itemsList,
            totalAmount: (json['total_amount'] as num).toDouble(),
            createdAt: DateTime.parse(json['created_at']),
            status: status,
          );
        }).toList();
      } catch (e) {
        debugPrint("Error fetching canteen orders: $e. Falling back to mock.");
        return _mockOrders;
      }
    } else {
      return _mockOrders;
    }
  }

  // Update Order Status (Canteen Owner updates status)
  Future<void> updateOrderStatus(String orderId, String status) async {
    if (_isRealInitialized) {
      try {
        await Supabase.instance.client
            .from('orders')
            .update({'status': status})
            .eq('id', orderId);
      } catch (e) {
        throw Exception("Failed to update order status: $e");
      }
    } else {
      final index = _mockOrders.indexWhere((o) => o.id == orderId);
      if (index != -1) {
        TokenStatus newStatus = TokenStatus.preparing;
        if (status == 'ready') newStatus = TokenStatus.ready;
        if (status == 'collected') newStatus = TokenStatus.collected;
        _mockOrders[index].status = newStatus;
      }
    }
  }
}
