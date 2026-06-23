# SmartCanteen Supabase & Deep Linking Setup Guide

This guide walks you through the step-by-step setup required to connect your SmartCanteen Flutter mobile application to your Supabase backend and enable Google/OAuth sign-in callbacks.

---

## Step 1: Run the Database SQL Schema

You need to create the tables, trigger functions, and security policies in your Supabase project.

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **SQL Editor** on the left menu.
3. Click **New query** (or **New Blank Query**).
4. Copy the complete contents of the [supabase_schema.sql](file:///c:/Users/ravil/OneDrive/Desktop/smartcanteen/supabase_schema.sql) file located at the root of your workspace.
5. Paste it into the editor and click **Run** (bottom right).
   *This will create the `profiles`, `canteens`, `menu_items`, and `orders` tables, establish references, setup Row-Level Security (RLS) policies, and configure a trigger function that automatically handles profile/canteen creation when users sign up.*

---

## Step 2: Configure Redirect URLs & Site URL in Supabase

To support both the website (React web app) and the mobile app (Flutter) concurrently without incorrect redirections, you must configure the URLs correctly in the Supabase console.

### 1. Configure Site URL (Main Web App)
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **Authentication** (Key icon) > **URL Configuration**.
3. Under **Site URL**, enter your local React website address (or your production website domain):
   ```text
   http://localhost:5173/
   ```
   *Note: If you run the Flutter App as a Web project, also add its port address here or under Redirect URLs.*

### 2. Configure Redirect URLs (Additional Whitelist)
Under **Redirect URLs**, click **Add URL** and add the following entries to the whitelist:

* **For the Mobile App (Deep Linking):**
  * `smartcanteen://login-callback` (OAuth callbacks)
  * `smartcanteen://reset-password` (Password recovery callbacks)

* **For the React Website (Development):**
  * `http://localhost:5173/**` (Wildcard allowing all local web routes)
  * `http://localhost:5173/dashboard` (Direct access to dashboard)
  * `http://localhost:5173/auth/login` (Direct access to login)

Click **Save** or **Add URL** for each.

---

## Step 3: Enable Google/OAuth Provider

If you are using Google Sign-In, configure it in your Supabase Auth Providers setting:

1. In the Supabase Dashboard, go to **Authentication** > **Providers** > **Google**.
2. Enable the Google Provider.
3. Input your **Client ID** and **Client Secret** (from the Google Cloud Console / credentials page).
4. Save the configuration.

---

## Step 4: Register Custom Protocol on Windows (Deep Linking)

On Windows desktop, Supabase triggers the default web browser for authentication. To ensure the browser redirects `smartcanteen://` URLs back into your running Flutter app, you must register the protocol in the Windows registry.

### Easy Registry Script
You can run this simple command in **PowerShell** on your machine to register the protocol pointing to the built debug executable:

```powershell
# Set variables
$protocolName = "smartcanteen"
$appPath = "$env:USERPROFILE\OneDrive\Desktop\smartcanteen\canteen_mobile\build\windows\x64\runner\Debug\canteen_mobile.exe"

# Create registry keys
$registryPath = "HKCU:\Software\Classes\$protocolName"
if (!(Test-Path $registryPath)) {
    New-Item -Path $registryPath -Force
}
New-ItemProperty -Path $registryPath -Name "URL Protocol" -Value "" -PropertyType String -Force

$commandPath = "$registryPath\shell\open\command"
if (!(Test-Path $commandPath)) {
    New-Item -Path $commandPath -Force
}
New-ItemProperty -Path $commandPath -Name "(Default)" -Value "`"$appPath`" `"%1`"" -PropertyType String -Force

Write-Host "Protocol handler '$protocolName' successfully registered to launch $appPath!" -ForegroundColor Green
```

*Note: If you run a release build, update `$appPath` to point to the `Release` folder executable instead.*

---

## Step 5: Configure Supabase Keys in Flutter

1. Open the [supabase_service.dart](file:///c:/Users/ravil/OneDrive/Desktop/smartcanteen/canteen_mobile/lib/services/supabase_service.dart) file.
2. Ensure `supabaseUrl` and `supabaseAnonKey` constants match your actual project credentials (found under **Project Settings** > **API** in the Supabase Dashboard).
3. If they are placeholders, the app automatically runs in a fully functional **Mock Mode** using in-memory databases (ideal for offline development or testing without configuration).

---

## Step 6: Run the App

Open your terminal, navigate to the `canteen_mobile` folder, and execute:
```powershell
flutter run -d windows
```
