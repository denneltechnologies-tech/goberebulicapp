<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'GOBE Republic Admin')</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f3f4f6; color: #1f2937; }
        a { color: inherit; }

        /* ---------- Shell ---------- */
        .layout { display: flex; min-height: 100vh; }
        .sidebar {
            width: 250px; background: linear-gradient(180deg, #111827 0%, #0f172a 100%);
            color: #9ca3af; flex-shrink: 0; display: flex; flex-direction: column;
            position: sticky; top: 0; height: 100vh;
        }
        .sidebar .brand {
            display: flex; align-items: center; gap: 10px;
            padding: 22px 20px; font-size: 19px; font-weight: 800; color: #fff;
            border-bottom: 1px solid rgba(255,255,255,0.06); letter-spacing: -0.5px;
        }
        .sidebar .brand .mark {
            width: 34px; height: 34px; border-radius: 10px; background: #f59e0b;
            display: flex; align-items: center; justify-content: center;
            color: #fff; font-size: 16px; box-shadow: 0 4px 12px rgba(245,158,11,.4);
        }
        .sidebar .brand span { color: #f59e0b; }
        .sidebar nav { flex: 1; padding: 14px 12px; overflow-y: auto; }
        .sidebar nav a {
            display: block; position: relative; padding: 12px 16px; color: #9ca3af;
            text-decoration: none; font-size: 14px; font-weight: 500; border-radius: 10px;
            margin-bottom: 4px; transition: background .15s ease, color .15s ease;
        }
        .sidebar nav a::before {
            content: ""; position: absolute; left: 0; top: 50%; transform: translateY(-50%);
            width: 4px; height: 0; border-radius: 4px; background: #f59e0b;
            transition: height .15s ease;
        }
        .sidebar nav a:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .sidebar nav a.active { background: rgba(245,158,11,0.12); color: #fff; font-weight: 700; }
        .sidebar nav a.active::before { height: 60%; }
        .sidebar .sidebar-foot {
            padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 13px;
        }
        .sidebar .sidebar-foot .who { color: #d1d5db; margin-bottom: 10px; }
        .sidebar .sidebar-foot .who strong { color: #fff; }
        .main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
        .topbar {
            background: #fff; padding: 16px 28px; border-bottom: 1px solid #e5e7eb;
            display: flex; justify-content: space-between; align-items: center;
            position: sticky; top: 0; z-index: 20;
        }
        .topbar h1 { font-size: 20px; font-weight: 700; letter-spacing: -0.3px; }
        .topbar .crumb { font-size: 12px; color: #9ca3af; font-weight: 600; text-transform: uppercase; letter-spacing: .6px; margin-top: 2px; }
        .content { padding: 28px; flex: 1; }

        /* ---------- Page head / toolbar ---------- */
        .page-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        .page-title { font-size: 18px; font-weight: 700; letter-spacing: -0.3px; }
        .toolbar { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .search-input {
            padding: 9px 14px; border: 1px solid #d1d5db; border-radius: 10px; font-size: 14px;
            background: #fff; min-width: 180px; transition: border-color .15s ease, box-shadow .15s ease;
        }
        .search-input:focus { outline: none; border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,.18); }

        /* ---------- Cards & stats ---------- */
        .card {
            background: #fff; border-radius: 16px; border: 1px solid #e5e7eb; padding: 22px;
            margin-bottom: 20px; box-shadow: 0 1px 3px rgba(15,23,42,.05), 0 1px 2px rgba(15,23,42,.04);
        }
        .card h3 { font-size: 16px; font-weight: 700; color: #111827; }
        .grid { display: grid; gap: 16px; }
        .grid-4 { grid-template-columns: repeat(4, 1fr); }
        .grid-3 { grid-template-columns: repeat(3, 1fr); }
        .stat {
            padding: 20px; border-radius: 16px; color: #fff; position: relative; overflow: hidden;
            box-shadow: 0 1px 3px rgba(15,23,42,.12), 0 4px 10px rgba(15,23,42,.08);
            transition: transform .15s ease, box-shadow .15s ease;
        }
        .stat:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(15,23,42,.16); }
        .stat::after {
            content: ""; position: absolute; right: -28px; top: -28px; width: 96px; height: 96px;
            border-radius: 50%; background: rgba(255,255,255,0.14);
        }
        .stat .value { font-size: 27px; font-weight: 800; letter-spacing: -0.5px; }
        .stat .label { font-size: 12.5px; opacity: .92; margin-top: 2px; font-weight: 600; letter-spacing: .2px; }

        /* ---------- Tables ---------- */
        .table-wrap { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; }
        th, td { padding: 13px 16px; text-align: left; border-bottom: 1px solid #eef0f3; font-size: 14px; }
        th { background: #f9fafb; font-weight: 700; color: #6b7280; text-transform: uppercase; font-size: 11.5px; letter-spacing: .5px; }
        tbody tr { transition: background .12s ease; }
        tbody tr:hover { background: #fffbeb; }
        tbody tr:last-child td { border-bottom: none; }

        /* ---------- Buttons ---------- */
        .btn {
            display: inline-flex; align-items: center; justify-content: center; gap: 6px;
            padding: 9px 16px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer;
            border: none; text-decoration: none; transition: background .15s ease, transform .1s ease, box-shadow .15s ease;
        }
        .btn:active { transform: translateY(1px); }
        .btn-primary { background: #f59e0b; color: #fff; box-shadow: 0 2px 6px rgba(245,158,11,.35); }
        .btn-primary:hover { background: #d97706; }
        .btn-secondary { background: #e5e7eb; color: #374151; }
        .btn-secondary:hover { background: #d1d5db; }
        .btn-danger { background: #ef4444; color: #fff; }
        .btn-danger:hover { background: #dc2626; }
        .btn-sm { padding: 6px 12px; font-size: 12.5px; border-radius: 8px; }

        /* ---------- Forms ---------- */
        .form-group { margin-bottom: 18px; }
        .form-group label { display: block; font-size: 13.5px; font-weight: 600; margin-bottom: 7px; color: #374151; }
        .form-group input, .form-group select, .form-group textarea {
            width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 10px; font-size: 14px;
            background: #fff; color: #1f2937; transition: border-color .15s ease, box-shadow .15s ease;
        }
        .form-group textarea { min-height: 110px; resize: vertical; }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
            outline: none; border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,.18);
        }
        .form-group .hint { font-size: 12.5px; color: #9ca3af; margin-top: 6px; }

        /* ---------- Badges ---------- */
        .badge { display: inline-flex; align-items: center; padding: 4px 11px; border-radius: 9999px; font-size: 12px; font-weight: 700; }
        .badge-success { background: #d1fae5; color: #065f46; }
        .badge-warning { background: #fef3c7; color: #92400e; }
        .badge-danger { background: #fee2e2; color: #991b1b; }
        .badge-info { background: #dbeafe; color: #1e40af; }
        .badge-gray { background: #f3f4f6; color: #374151; }

        /* ---------- Alerts ---------- */
        .alert { padding: 13px 16px; border-radius: 12px; margin-bottom: 18px; font-size: 14px; display: flex; gap: 8px; align-items: center; }
        .alert-success { background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; }
        .alert-error { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }

        /* ---------- Misc ---------- */
        .muted { color: #6b7280; font-size: 13px; }
        .img-thumb { width: 48px; height: 48px; object-fit: cover; border-radius: 10px; border: 1px solid #e5e7eb; background: #f9fafb; }
        .actions { display: flex; gap: 6px; }
        form.inline { display: inline; }
        .pagination { margin-top: 20px; }
        .pagination nav div:first-child { margin-bottom: 10px; font-size: 13px; color: #6b7280; }
        .pagination nav { display: flex; justify-content: space-between; flex-wrap: wrap; }
        .pagination a, .pagination span[aria-current] { display: inline-flex; align-items: center; padding: 7px 14px; border-radius: 9px; font-size: 13.5px; font-weight: 600; }
        .pagination a { background: #fff; border: 1px solid #e5e7eb; color: #374151; text-decoration: none; margin: 0 2px; transition: all .12s ease; }
        .pagination a:hover { border-color: #f59e0b; color: #b45309; }
        .pagination span[aria-current] { background: #f59e0b; color: #fff; margin: 0 2px; }
        .text-right { text-align: right; }
        .mt-0 { margin-top: 0; }
        .mt-2 { margin-top: 8px; }
        .mb-2 { margin-bottom: 8px; }
        .flex-between { display: flex; justify-content: space-between; align-items: center; }

        @media (max-width: 900px) {
            .grid-4 { grid-template-columns: repeat(2, 1fr); }
            .grid-3 { grid-template-columns: 1fr; }
            .sidebar { display: none; }
            .content { padding: 16px; }
            .topbar { padding: 14px 16px; }
        }
    </style>
</head>
<body>
<div class="layout">
    <aside class="sidebar">
        <div class="brand"><div class="mark">G</div>GOBE <span>Republic</span></div>
        <nav>
            <a href="{{ route('admin.dashboard') }}" class="{{ request()->routeIs('admin.dashboard') ? 'active' : '' }}">Dashboard</a>
            <a href="{{ route('admin.products.index') }}" class="{{ request()->routeIs('admin.products.*') ? 'active' : '' }}">Products</a>
            <a href="{{ route('admin.categories.index') }}" class="{{ request()->routeIs('admin.categories.*') ? 'active' : '' }}">Categories</a>
            <a href="{{ route('admin.customers.index') }}" class="{{ request()->routeIs('admin.customers.*') ? 'active' : '' }}">Customers</a>
            <a href="{{ route('admin.orders.index') }}" class="{{ request()->routeIs('admin.orders.*') ? 'active' : '' }}">Orders</a>
            <a href="{{ route('admin.users.index') }}" class="{{ request()->routeIs('admin.users.*') ? 'active' : '' }}">Admin Users</a>
        </nav>
        <div class="sidebar-foot">
            <div class="who">Signed in as <strong>{{ auth()->user()->name }}</strong></div>
            <form method="POST" action="{{ route('admin.logout') }}">
                @csrf
                <button type="submit" class="btn btn-danger btn-sm" style="width:100%;">Logout</button>
            </form>
        </div>
    </aside>
    <div class="main">
        <div class="topbar">
            <div>
                <div class="crumb">GOBE Republic Admin</div>
                <h1>@yield('title', 'Dashboard')</h1>
            </div>
            <span class="badge badge-warning">{{ now()->format('M d, Y') }}</span>
        </div>
        <div class="content">
            @if (session('status'))
                <div class="alert alert-success">{{ session('status') }}</div>
            @endif
            @if (session('error'))
                <div class="alert alert-error">{{ session('error') }}</div>
            @endif
            @yield('content')
        </div>
    </div>
</div>
</body>
</html>