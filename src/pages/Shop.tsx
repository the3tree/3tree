/**
 * Shop Page - Physical & Digital Wellness Products
 */

import { Helmet } from 'react-helmet-async';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ShoppingCart, Star, Filter, Grid3X3, List, Tag, Truck, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import { getMotionPreference } from '@/lib/gsap/presets';

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// Types
// ==========================================

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    image: string;
    category: 'physical' | 'digital';
    subcategory: string;
    rating: number;
    reviewCount: number;
    inStock: boolean;
    featured?: boolean;
    badge?: string;
}

// ==========================================
// Mock Data
// ==========================================

const products: Product[] = [
    {
        id: 'p1',
        name: 'Mindfulness Journal - 90 Day',
        description: 'Guided daily journal with prompts for gratitude, reflection, and mindfulness practice.',
        price: 24.99,
        originalPrice: 34.99,
        image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=400&fit=crop',
        category: 'physical',
        subcategory: 'Journals',
        rating: 4.8,
        reviewCount: 234,
        inStock: true,
        featured: true,
        badge: 'Best Seller'
    },
    {
        id: 'p2',
        name: 'Calm Aromatherapy Candle Set',
        description: 'Set of 3 soy candles with lavender, chamomile, and eucalyptus essential oils.',
        price: 39.99,
        image: 'https://images.unsplash.com/photo-1602607120632-92b87287d5a5?w=400&h=400&fit=crop',
        category: 'physical',
        subcategory: 'Wellness',
        rating: 4.7,
        reviewCount: 156,
        inStock: true,
        featured: true
    },
    {
        id: 'p3',
        name: 'Anxiety Relief Toolkit (Digital)',
        description: 'Downloadable PDF workbook with 50+ exercises, worksheets, and coping strategies.',
        price: 14.99,
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=400&fit=crop',
        category: 'digital',
        subcategory: 'Workbooks',
        rating: 4.9,
        reviewCount: 89,
        inStock: true,
        featured: true,
        badge: 'Instant Download'
    },
    {
        id: 'p4',
        name: 'Meditation Cushion - Organic Cotton',
        description: 'Comfortable zafu meditation cushion made with organic materials.',
        price: 49.99,
        image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&h=400&fit=crop',
        category: 'physical',
        subcategory: 'Meditation',
        rating: 4.6,
        reviewCount: 78,
        inStock: true
    },
    {
        id: 'p5',
        name: 'Sleep Improvement Audio Course',
        description: 'Complete audio program with guided relaxation and sleep meditation sessions.',
        price: 29.99,
        originalPrice: 49.99,
        image: 'https://images.unsplash.com/photo-1531353826977-0941b4779a1c?w=400&h=400&fit=crop',
        category: 'digital',
        subcategory: 'Audio',
        rating: 4.8,
        reviewCount: 112,
        inStock: true,
        badge: '40% Off'
    },
    {
        id: 'p6',
        name: 'Stress Relief Tea Blend',
        description: 'Organic herbal tea blend with chamomile, passionflower, and lemon balm.',
        price: 18.99,
        image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=400&fit=crop',
        category: 'physical',
        subcategory: 'Wellness',
        rating: 4.5,
        reviewCount: 201,
        inStock: true
    },
    {
        id: 'p7',
        name: 'CBT Workbook for Depression',
        description: 'Evidence-based cognitive behavioral therapy exercises in digital format.',
        price: 19.99,
        image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=400&fit=crop',
        category: 'digital',
        subcategory: 'Workbooks',
        rating: 4.7,
        reviewCount: 67,
        inStock: true
    },
    {
        id: 'p8',
        name: 'Weighted Blanket - 15lbs',
        description: 'Premium weighted blanket for anxiety relief and improved sleep quality.',
        price: 79.99,
        originalPrice: 99.99,
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop',
        category: 'physical',
        subcategory: 'Sleep',
        rating: 4.9,
        reviewCount: 345,
        inStock: false
    }
];

const categories = ['All', 'Physical', 'Digital'];
const subcategories = ['All', 'Journals', 'Wellness', 'Workbooks', 'Meditation', 'Audio', 'Sleep'];

// ==========================================
// Component
// ==========================================

export default function Shop() {
    const pageRef = useRef<HTMLDivElement>(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [cart, setCart] = useState<string[]>([]);

    const filteredProducts = products.filter(p =>
        selectedCategory === 'All' ||
        p.category === selectedCategory.toLowerCase()
    );

    const addToCart = (productId: string) => {
        setCart(prev => [...prev, productId]);
    };

    useEffect(() => {
        if (getMotionPreference()) return;

        const ctx = gsap.context(() => {
            // Header animation
            gsap.fromTo(
                '.shop-header',
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
            );

            // Products animation
            ScrollTrigger.batch('.product-card', {
                start: 'top 85%',
                onEnter: (elements) => {
                    gsap.fromTo(elements,
                        { opacity: 0, y: 30, scale: 0.98 },
                        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
                    );
                }
            });
        }, pageRef);

        return () => ctx.revert();
    }, []);

    return (
        <Layout>
            <Helmet>
                <title>Wellness Shop | 3-3.com</title>
                <meta name="description" content="Shop our curated collection of wellness products, journals, meditation supplies, and digital resources for mental health and self-care." />
            </Helmet>

            <div ref={pageRef} className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-24 pb-16 px-4">
                    <div className="container mx-auto max-w-6xl">
                        <div className="shop-header text-center max-w-2xl mx-auto">
                            <h1 className="font-serif text-4xl md:text-5xl mb-4">
                                Wellness Shop
                            </h1>
                            <p className="text-lg text-gray-300 mb-8">
                                Curated products to support your mental health journey.
                                From journals to meditation tools, find what nurtures your well-being.
                            </p>

                            {/* Trust Badges */}
                            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                    <Truck className="w-4 h-4" />
                                    Free shipping over $50
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    Secure checkout
                                </div>
                                <div className="flex items-center gap-2">
                                    <Tag className="w-4 h-4" />
                                    30-day returns
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Shop Content */}
                <section className="py-12 px-4">
                    <div className="container mx-auto max-w-6xl">
                        {/* Filters Bar */}
                        <div className="bg-white rounded-xl p-4 mb-8 shadow-sm flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-400" />
                                <div className="flex gap-2">
                                    {categories.map(category => (
                                        <button
                                            key={category}
                                            onClick={() => setSelectedCategory(category)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                                ${selectedCategory === category
                                                    ? 'bg-gray-900 text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-500">
                                    {filteredProducts.length} products
                                </span>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                                    >
                                        <Grid3X3 className="w-4 h-4 text-gray-600" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
                                    >
                                        <List className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Featured Products */}
                        {selectedCategory === 'All' && (
                            <div className="mb-12">
                                <h2 className="text-2xl font-serif text-gray-900 mb-6">Featured Products</h2>
                                <div className="grid md:grid-cols-3 gap-6">
                                    {products.filter(p => p.featured).map(product => (
                                        <div key={product.id} className="product-card bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group">
                                            <div className="relative aspect-square overflow-hidden">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                {product.badge && (
                                                    <span className="absolute top-3 left-3 px-3 py-1 bg-primary text-white text-xs font-medium rounded-full">
                                                        {product.badge}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="p-5">
                                                <span className="text-xs text-primary font-medium uppercase tracking-wide">
                                                    {product.subcategory}
                                                </span>
                                                <h3 className="font-medium text-gray-900 mt-1 mb-2">{product.name}</h3>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="flex items-center">
                                                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                                        <span className="text-sm font-medium ml-1">{product.rating}</span>
                                                    </div>
                                                    <span className="text-xs text-gray-400">({product.reviewCount})</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="text-lg font-semibold text-gray-900">
                                                            ${product.price}
                                                        </span>
                                                        {product.originalPrice && (
                                                            <span className="text-sm text-gray-400 line-through ml-2">
                                                                ${product.originalPrice}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => addToCart(product.id)}
                                                        className="btn-icy"
                                                    >
                                                        <ShoppingCart className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* All Products */}
                        <h2 className="text-2xl font-serif text-gray-900 mb-6">
                            {selectedCategory === 'All' ? 'All Products' : `${selectedCategory} Products`}
                        </h2>
                        <div className={`grid gap-6 ${viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'}`}>
                            {filteredProducts.map(product => (
                                <div
                                    key={product.id}
                                    className={`product-card bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow
                                        ${viewMode === 'list' ? 'flex' : ''}`}
                                >
                                    <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-40 flex-shrink-0' : 'aspect-square'}`}>
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                        {!product.inStock && (
                                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                <span className="px-3 py-1 bg-gray-800 text-white text-sm rounded">
                                                    Out of Stock
                                                </span>
                                            </div>
                                        )}
                                        {product.badge && product.inStock && (
                                            <span className="absolute top-2 left-2 px-2 py-1 bg-primary text-white text-xs rounded">
                                                {product.badge}
                                            </span>
                                        )}
                                    </div>
                                    <div className={`p-4 ${viewMode === 'list' ? 'flex-1 flex flex-col' : ''}`}>
                                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                                            {product.subcategory}
                                        </span>
                                        <h3 className="font-medium text-gray-900 mt-1">{product.name}</h3>
                                        {viewMode === 'list' && (
                                            <p className="text-sm text-gray-500 mt-2">{product.description}</p>
                                        )}
                                        <div className="flex items-center gap-1 mt-2">
                                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                            <span className="text-xs font-medium">{product.rating}</span>
                                            <span className="text-xs text-gray-400">({product.reviewCount})</span>
                                        </div>
                                        <div className={`flex items-center justify-between mt-3 ${viewMode === 'list' ? 'mt-auto' : ''}`}>
                                            <div>
                                                <span className="font-semibold text-gray-900">${product.price}</span>
                                                {product.originalPrice && (
                                                    <span className="text-xs text-gray-400 line-through ml-1">
                                                        ${product.originalPrice}
                                                    </span>
                                                )}
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => addToCart(product.id)}
                                                disabled={!product.inStock}
                                            >
                                                Add to Cart
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
}
