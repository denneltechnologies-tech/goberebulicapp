<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GOBE Republic Admin Login</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #111827 55%, #1e293b 100%);
            min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        .blob { position: fixed; border-radius: 50%; filter: blur(70px); opacity: .35; z-index: 0; }
        .blob-a { width: 420px; height: 420px; background: #f59e0b; top: -120px; right: -80px; }
        .blob-b { width: 380px; height: 380px; background: #f59e0b; bottom: -140px; left: -90px; }
        .login-card {
            background: #fff; border-radius: 20px; padding: 44px 40px; width: 100%; max-width: 420px;
            box-shadow: 0 25px 60px rgba(0,0,0,.35); position: relative; z-index: 1;
        }
        .brand-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
        .mark {
            width: 46px; height: 46px; border-radius: 13px; background: #f59e0b;
            display: flex; align-items: center; justify-content: center; color: #fff;
            font-size: 22px; font-weight: 800; box-shadow: 0 6px 16px rgba(245,158,11,.4);
        }
        .login-card h1 { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #111827; }
        .login-card h1 span { color: #b45309; }
        .login-card .sub { color: #6b7280; font-size: 14px; margin-bottom: 28px; }
        .form-group { margin-bottom: 18px; }
        .form-group label { display: block; font-size: 13.5px; font-weight: 600; margin-bottom: 7px; color: #374151; }
        .form-group input {
            width: 100%; padding: 11px 15px; border: 1.5px solid #d1d5db; border-radius: 11px;
            font-size: 15px; transition: border-color .15s ease, box-shadow .15s ease;
        }
        .form-group input:focus { outline: none; border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,.2); }
        .btn {
            width: 100%; padding: 13px; border: none; border-radius: 11px; background: #f59e0b; color: #fff;
            font-size: 15.5px; font-weight: 700; cursor: pointer; transition: background .15s ease, transform .1s ease;
            box-shadow: 0 4px 12px rgba(245,158,11,.35);
        }
        .btn:hover { background: #d97706; }
        .btn:active { transform: translateY(1px); }
        .error {
            background: #fef2f2; border: 1px solid #fecaca; color: #991b1b;
            padding: 12px 14px; border-radius: 11px; font-size: 14px; margin-bottom: 18px;
        }
        .error div + div { margin-top: 4px; }
        .foot { margin-top: 22px; text-align: center; color: #9ca3af; font-size: 12.5px; }
    </style>
</head>
<body>
    <div class="blob blob-a"></div>
    <div class="blob blob-b"></div>
    <div class="login-card">
        <div class="brand-row">
            <div class="mark">G</div>
            <h1>GOBE <span>Republic</span></h1>
        </div>
        <p class="sub">Sign in to the administration dashboard</p>
        @if ($errors->any())
            <div class="error">
                @foreach ($errors->all() as $error)
                    <div>{{ $error }}</div>
                @endforeach
            </div>
        @endif
        <form method="POST" action="{{ route('admin.login.submit') }}">
            @csrf
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" name="email" id="email" value="{{ old('email') }}" required autofocus>
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" name="password" id="password" required>
            </div>
            <button type="submit" class="btn">Sign In</button>
        </form>
        <div class="foot">GOBE Republic Commerce Platform</div>
    </div>
</body>
</html>