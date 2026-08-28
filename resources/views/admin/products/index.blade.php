@extends('admin.layouts.app')

@section('title', 'Products')
@section('content')
    <div class="card">
        <div class="page-head">
            <h3 class="page-title">All Products ({{ $products->total() }})</h3>
            <div class="toolbar">
                <form method="GET" class="toolbar">
                    <input type="text" class="search-input" name="q" value="{{ request('q') }}" placeholder="Search products...">
                    <button class="btn btn-secondary">Search</button>
                </form>
                <a href="{{ route('admin.products.create') }}" class="btn btn-primary">Add Product</a>
            </div>
        </div>

        @if($products->isEmpty())
            <p class="muted">No products found.</p>
        @else
        <div class="table-wrap">
        <table>
            <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
                @foreach($products as $product)
                <tr>
                    <td>@if($product->image)<img class="img-thumb" src="{{ asset('storage/'.$product->image) }}" alt="">@else<span class="muted">—</span>@endif</td>
                    <td>{{ $product->name }}</td>
                    <td>{{ $product->category->name ?? '—' }}</td>
                    <td>₦{{ number_format($product->price, 2) }}</td>
                    <td>@if($product->status === 'active')<span class="badge badge-success">Active</span>@else<span class="badge badge-danger">Inactive</span>@endif</td>
                    <td>
                        <div class="actions">
                            <a href="{{ route('admin.products.edit', $product) }}" class="btn btn-secondary btn-sm">Edit</a>
                            <form method="POST" action="{{ route('admin.products.destroy', $product) }}" class="inline" onsubmit="return confirm('Delete this product?');">
                                @csrf @method('DELETE')
                                <button class="btn btn-danger btn-sm">Delete</button>
                            </form>
                        </div>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
        </div>
        <div class="pagination">{{ $products->links() }}</div>
        @endif
    </div>
@endsection
