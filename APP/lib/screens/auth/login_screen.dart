import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  late PageController _pageController;
  int _currentIndex = 0;

  final _studentFormKey = GlobalKey<FormState>();
  final _ownerFormKey = GlobalKey<FormState>();

  final _studentEmailController = TextEditingController();
  final _studentPasswordController = TextEditingController();
  final _ownerEmailController = TextEditingController();
  final _ownerPasswordController = TextEditingController();

  bool _studentObscure = true;
  bool _ownerObscure = true;

  bool _studentRemember = false;
  bool _ownerRemember = false;

  String? _studentError;
  String? _ownerError;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: 0);
  }

  @override
  void dispose() {
    _pageController.dispose();
    _studentEmailController.dispose();
    _studentPasswordController.dispose();
    _ownerEmailController.dispose();
    _ownerPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin(bool isStudent) async {
    final formKey = isStudent ? _studentFormKey : _ownerFormKey;
    if (!formKey.currentState!.validate()) return;

    setState(() {
      if (isStudent) {
        _studentError = null;
      } else {
        _ownerError = null;
      }
    });

    final emailController = isStudent ? _studentEmailController : _ownerEmailController;
    final passwordController = isStudent ? _studentPasswordController : _ownerPasswordController;

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    try {
      await authProvider.login(
        emailController.text.trim(),
        passwordController.text,
        role: isStudent ? 'student' : 'owner',
      );
    } catch (e) {
      setState(() {
        if (isStudent) {
          _studentError = e.toString().replaceAll("Exception: ", "");
        } else {
          _ownerError = e.toString().replaceAll("Exception: ", "");
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF08090C) : const Color(0xFFFAF8F5),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Container(
              constraints: const BoxConstraints(maxWidth: 400),
              padding: const EdgeInsets.all(28.0),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF0F1116) : Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                  color: isDark ? const Color(0xFF1E222B) : const Color(0xFFEFECE6),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.02),
                    blurRadius: 15,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Brand Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFC8019).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.lunch_dining_rounded,
                          color: Color(0xFFFC8019),
                          size: 28,
                        ),
                      ),
                      const SizedBox(width: 12),
                      const Text(
                        "CampusBite",
                        style: TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFFFC8019),
                          letterSpacing: -0.5,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Segmented Switch Control
                  CustomSegmentedControl(
                    selectedIndex: _currentIndex,
                    onValueChanged: (index) {
                      setState(() {
                        _currentIndex = index;
                      });
                      _pageController.animateToPage(
                        index,
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeInOut,
                      );
                    },
                  ),
                  const SizedBox(height: 24),

                  // Swipeable Login Pages
                  SizedBox(
                    height: 550,
                    child: PageView(
                      controller: _pageController,
                      onPageChanged: (index) {
                        setState(() {
                          _currentIndex = index;
                        });
                      },
                      children: [
                        _buildLoginForm(isStudent: true, isDark: isDark, authProvider: authProvider),
                        _buildLoginForm(isStudent: false, isDark: isDark, authProvider: authProvider),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLoginForm({required bool isStudent, required bool isDark, required AuthProvider authProvider}) {
    final formKey = isStudent ? _studentFormKey : _ownerFormKey;
    final emailController = isStudent ? _studentEmailController : _ownerEmailController;
    final passwordController = isStudent ? _studentPasswordController : _ownerPasswordController;
    final obscurePassword = isStudent ? _studentObscure : _ownerObscure;
    final rememberMe = isStudent ? _studentRemember : _ownerRemember;
    final errorMessage = isStudent ? _studentError : _ownerError;

    return SingleChildScrollView(
      physics: const NeverScrollableScrollPhysics(),
      child: Form(
        key: formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              isStudent ? "Student Login" : "Canteen Owner Login",
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: 'Poppins',
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : Colors.black,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              isStudent 
                  ? "Order fast. Skip the canteen queues." 
                  : "Manage your menu & track active orders.",
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                color: isDark ? const Color(0xFF8E939E) : Colors.grey[600],
              ),
            ),
            const SizedBox(height: 20),

            // Error Alert Bar
            if (errorMessage != null) ...[
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFEF4444).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.2)),
                ),
                child: Text(
                  errorMessage,
                  style: const TextStyle(
                    color: Color(0xFFEF4444),
                    fontSize: 12.5,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Email Field
            TextFormField(
              controller: emailController,
              keyboardType: TextInputType.emailAddress,
              style: const TextStyle(fontSize: 14),
              decoration: InputDecoration(
                prefixIcon: const Icon(Icons.mail_outline_rounded, size: 20),
                hintText: isStudent ? "student@college.edu" : "owner@canteen.edu",
                labelText: "Email Address",
                labelStyle: TextStyle(color: isDark ? const Color(0xFF8E939E) : Colors.grey[700]),
                floatingLabelBehavior: FloatingLabelBehavior.always,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                contentPadding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) return "Email is required";
                if (!value.contains("@")) return "Invalid email address";
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Password Field
            TextFormField(
              controller: passwordController,
              obscureText: obscurePassword,
              style: const TextStyle(fontSize: 14),
              decoration: InputDecoration(
                prefixIcon: const Icon(Icons.lock_outline_rounded, size: 20),
                suffixIcon: IconButton(
                  icon: Icon(
                    obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                    size: 20,
                  ),
                  onPressed: () {
                    setState(() {
                      if (isStudent) {
                        _studentObscure = !_studentObscure;
                      } else {
                        _ownerObscure = !_ownerObscure;
                      }
                    });
                  },
                ),
                hintText: "••••••••",
                labelText: "Password",
                labelStyle: TextStyle(color: isDark ? const Color(0xFF8E939E) : Colors.grey[700]),
                floatingLabelBehavior: FloatingLabelBehavior.always,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                contentPadding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) return "Password is required";
                return null;
              },
            ),
            const SizedBox(height: 8),

            // Remember & Forgot Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    SizedBox(
                      height: 24,
                      width: 24,
                      child: Checkbox(
                        value: rememberMe,
                        activeColor: const Color(0xFFFC8019),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                        onChanged: (val) {
                          setState(() {
                            if (isStudent) {
                              _studentRemember = val ?? false;
                            } else {
                              _ownerRemember = val ?? false;
                            }
                          });
                        },
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text("Remember me", style: TextStyle(fontSize: 12)),
                  ],
                ),
                TextButton(
                  onPressed: () => Navigator.pushNamed(context, '/forgot_password'),
                  style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: Size.zero),
                  child: const Text(
                    "Forgot Password?",
                    style: TextStyle(
                      color: Color(0xFFFC8019),
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Sign In Button
            ElevatedButton(
              onPressed: authProvider.loading ? null : () => _handleLogin(isStudent),
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
                  : const Text("Sign In", style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
            ),
            if (isStudent) ...[
              const SizedBox(height: 12),

              // Divider
              Row(
                children: [
                  Expanded(child: Divider(color: isDark ? const Color(0xFF1E222B) : Colors.grey[200])),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    child: Text("or", style: TextStyle(fontSize: 12, color: Colors.grey[500])),
                  ),
                  Expanded(child: Divider(color: isDark ? const Color(0xFF1E222B) : Colors.grey[200])),
                ],
              ),
              const SizedBox(height: 12),

              // Google OAuth Button
              OutlinedButton(
                onPressed: authProvider.loading
                    ? null
                    : () async {
                        setState(() {
                          _studentError = null;
                        });
                        try {
                          await authProvider.loginWithGoogle('student');
                        } catch (e) {
                          setState(() {
                            _studentError = e.toString().replaceAll("Exception: ", "");
                          });
                        }
                      },
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size.fromHeight(48),
                  side: BorderSide(color: isDark ? const Color(0xFF1E222B) : const Color(0xFFEFECE6)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.g_mobiledata_rounded, color: Colors.grey[600], size: 28),
                    const SizedBox(width: 4),
                    Text(
                      "Sign In with Google",
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: isDark ? Colors.white : Colors.black87,
                      ),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 16),

            // Register Link
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  "Don't have an account? ",
                  style: TextStyle(fontSize: 13, color: Colors.grey[600]),
                ),
                TextButton(
                  onPressed: () => Navigator.pushNamed(context, '/register'),
                  style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: Size.zero),
                  child: const Text(
                    "Sign Up",
                    style: TextStyle(
                      color: Color(0xFFFC8019),
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Mock Credentials Info
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E222B) : const Color(0xFFFFF8F1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isDark ? Colors.transparent : const Color(0xFFFC8019).withOpacity(0.15),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.info_outline_rounded, color: Color(0xFFFC8019), size: 16),
                      SizedBox(width: 6),
                      Text(
                        "Mock Testing Credentials",
                        style: TextStyle(
                          color: Color(0xFFFC8019),
                          fontSize: 11.5,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    isStudent
                        ? "Email: john.doe@college.edu\nPassword: Password123!"
                        : "Email: owner@canteen.edu\nPassword: Password123!",
                    style: TextStyle(
                      fontSize: 11,
                      height: 1.4,
                      color: isDark ? const Color(0xFF8E939E) : Colors.grey[700],
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    "Type 'wrong' in password to simulate credential errors.",
                    style: TextStyle(
                      fontSize: 10,
                      fontStyle: FontStyle.italic,
                      color: isDark ? Colors.grey[500] : Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class CustomSegmentedControl extends StatelessWidget {
  final int selectedIndex;
  final ValueChanged<int> onValueChanged;

  const CustomSegmentedControl({
    super.key,
    required this.selectedIndex,
    required this.onValueChanged,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      height: 46,
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E222B) : const Color(0xFFEFECE6).withOpacity(0.5),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Stack(
        children: [
          // Sliding Background Pill
          AnimatedAlign(
            alignment: selectedIndex == 0 ? Alignment.centerLeft : Alignment.centerRight,
            duration: const Duration(milliseconds: 250),
            curve: Curves.easeInOut,
            child: FractionallySizedBox(
              widthFactor: 0.5,
              child: Container(
                margin: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: const Color(0xFFFC8019),
                  borderRadius: BorderRadius.circular(8),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFFC8019).withOpacity(0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
              ),
            ),
          ),
          // Buttons
          Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () => onValueChanged(0),
                  behavior: HitTestBehavior.opaque,
                  child: Center(
                    child: Text(
                      "Student",
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: selectedIndex == 0
                            ? Colors.white
                            : (isDark ? Colors.white70 : Colors.black87),
                      ),
                    ),
                  ),
                ),
              ),
              Expanded(
                child: GestureDetector(
                  onTap: () => onValueChanged(1),
                  behavior: HitTestBehavior.opaque,
                  child: Center(
                    child: Text(
                      "Canteen Owner",
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: selectedIndex == 1
                            ? Colors.white
                            : (isDark ? Colors.white70 : Colors.black87),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
