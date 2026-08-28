@extends('admin.layouts.app')

@section('title', 'Customers')
@section('content')
    <div class="card">
        <div class="page-head">
            <h3 class="page-title">All Customers ({{ $customers->total() }})</h3>
            <form method="GET" class="toolbar">
                <input type="text" class="search-input" name="q" value="{{ request('q') }}" placeholder="Search name, email, phone..." style="width:280px;">
                <button class="btn btn-secondary">Search</button>
            </form>
        </div>
        @if($customers->isEmpty())
            <p class="muted">No customers found.</p>
        @else
        <div class="table-wrap">
        <table>
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Orders</th><th>Status</th><th></th></tr></thead>
            <tbody>
                @foreach($customers as $customer)
                <tr>
                    <td>{{ $customer->name }}</td>
                    <td>{{ $customer->email ?? '—' }}</td>
                    <td>{{ $customer->phone ?? '—' }}</td>
                    <td>{{ $customer->orders_count }}</td>
                    <td>@if($customer->status === 'active')<span class="badge badge-success">Active</span>@else<span class="badge badge-danger">Inactive</span>@endif</td>
                    <td><a href="{{ route('admin.customers.show', $customer) }}" class="btn btn-secondary btn-sm">View</a></td>
                </tr>
                @endforeach
            </tbody>
        </table>
        </div>
        <div class="pagination">{{ $customers->links() }}</div>
        @endif
    </div>
@endsection
