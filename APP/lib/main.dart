import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:supabase_flutter/supabase_flutter.dart';
import 'services/supabase_service.dart';
import 'providers/auth_provider.dart';
import 'providers/canteen_provider.dart';

import 'screens/auth/login_screen.dart';
import 'screens/auth/register_screen.dart';
import 'screens/auth/forgot_password_screen.dart';
import 'screens/auth/otp_verify_screen.dart';
import 'screens/auth/reset_password_screen.dart';
import 'screens/auth/locked_screen.dart';
import 'screens/auth/session_expired_screen.dart';
import 'screens/dashboard/dashboard_screen.dart';
import 'screens/dashboard/owner_dashboard_screen.dart';
import 'screens/dashboard/profile_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final supabaseService = SupabaseService();
  bool isInitialized = false;

  // Note: Ensure these are your REAL Supabase Project URL and Anon Key from the Dashboard Settings.
  // Standard Supabase Anon Keys usually start with 'eyJ...'
  const String url = SupabaseService.supabaseUrl;
  const String anonKey = SupabaseService.supabaseAnonKey;

  final bool isValidConfig = url.isNotEmpty &&
      !url.contains("your-project-id") &&
      anonKey.isNotEmpty &&
      !anonKey.contains("your-anon-key-here");

  if (isValidConfig) {
    try {
      await Supabase.initialize(
        url: url,
        anonKey: anonKey,
      );
      isInitialized = true;
      debugPrint("Supabase initialized successfully.");
    } catch (e) {
      debugPrint("Error initializing Supabase: $e. Falling back to Mock Auth.");
    }
  } else {
    debugPrint("Supabase configuration is placeholder or empty. Falling back to Mock Auth.");
  }

  supabaseService.setRealInitialized(isInitialized);

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => CanteenProvider()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  ThemeMode _themeMode = ThemeMode.system;

  void toggleTheme() {
    setState(() {
      _themeMode = _themeMode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
    });
  }

  @override
  Widget build(BuildContext context) {
    // Premium theme settings modeled on original css style tokens
    final lightTheme = ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: const Color(0xFFFC8019),
      scaffoldBackgroundColor: const Color(0xFFFAF8F5),
      colorScheme: ColorScheme.fromSeed(
        seedColor: const Color(0xFFFC8019),
        primary: const Color(0xFFFC8019),
        surface: Colors.white,
        background: const Color(0xFFFAF8F5),
      ),
      textTheme: GoogleFonts.interTextTheme(ThemeData.light().textTheme).copyWith(
        titleLarge: GoogleFonts.poppins(fontWeight: FontWeight.bold),
        titleMedium: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        titleSmall: GoogleFonts.poppins(fontWeight: FontWeight.w600),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white.withOpacity(0.4),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFEFECE6)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFEFECE6)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFFC8019), width: 1.5),
        ),
      ),
    );

    final darkTheme = ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: const Color(0xFFFC8019),
      scaffoldBackgroundColor: const Color(0xFF08090C),
      colorScheme: ColorScheme.fromSeed(
        brightness: Brightness.dark,
        seedColor: const Color(0xFFFC8019),
        primary: const Color(0xFFFC8019),
        surface: const Color(0xFF0F1116),
        background: const Color(0xFF08090C),
      ),
      textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme).copyWith(
        titleLarge: GoogleFonts.poppins(fontWeight: FontWeight.bold),
        titleMedium: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        titleSmall: GoogleFonts.poppins(fontWeight: FontWeight.w600),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFF0F1116).withOpacity(0.5),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF1E222B)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF1E222B)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFFC8019), width: 1.5),
        ),
      ),
    );

    return MaterialApp(
      title: 'SmartCanteen Mobile',
      debugShowCheckedModeBanner: false,
      theme: lightTheme,
      darkTheme: darkTheme,
      themeMode: _themeMode,
      builder: (context, child) => MobileAppFrame(child: child ?? const SizedBox()),
      routes: {
        '/login': (_) => const LoginScreen(),
        '/register': (_) => const RegisterScreen(),
        '/forgot_password': (_) => const ForgotPasswordScreen(),
        '/verify_otp': (_) => const OtpVerifyScreen(),
        '/reset_password': (_) => const ResetPasswordScreen(),
        '/locked': (_) => const LockedScreen(),
        '/session_expired': (_) => const SessionExpiredScreen(),
        '/dashboard': (_) => const DashboardScreen(),
        '/profile': (_) => const ProfileScreen(),
      },
      home: const RootScreen(),
    );
  }
}

// RootScreen routes dynamically based on reactive provider states
class RootScreen extends StatelessWidget {
  const RootScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, _) {
        if (authProvider.isLocked) {
          return const LockedScreen();
        }
        
        if (authProvider.isSessionExpired) {
          return const SessionExpiredScreen();
        }

        if (authProvider.isAuthenticated) {
          final user = authProvider.user;
          if (user?.role == 'owner') {
            return const OwnerDashboardScreen();
          }
          return const DashboardScreen();
        }

        return const LoginScreen();
      },
    );
  }
}

// MobileAppFrame wraps the application views on desktop viewports to simulate a premium native mobile layout
class MobileAppFrame extends StatelessWidget {
  final Widget child;
  const MobileAppFrame({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    if (mediaQuery.size.width > 500) {
      const double frameWidth = 430;
      final double frameHeight = mediaQuery.size.height.clamp(600.0, 950.0);
      
      return Container(
        color: isDark ? const Color(0xFF030406) : const Color(0xFFEBE8E2),
        child: Center(
          child: Container(
            width: frameWidth,
            height: frameHeight,
            margin: const EdgeInsets.symmetric(vertical: 16),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF08090C) : const Color(0xFFFAF8F5),
              borderRadius: BorderRadius.circular(36),
              border: Border.all(
                color: isDark ? const Color(0xFF232936) : const Color(0xFFD6D1C4),
                width: 8,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(isDark ? 0.6 : 0.15),
                  blurRadius: 40,
                  spreadRadius: 4,
                  offset: const Offset(0, 12),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(28),
              child: MediaQuery(
                data: mediaQuery.copyWith(
                  size: Size(frameWidth - 16, frameHeight - 16),
                  padding: mediaQuery.padding.copyWith(top: 20, bottom: 20),
                ),
                child: child,
              ),
            ),
          ),
        ),
      );
    }
    
    return child;
  }
}
