import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Search, Tag, ArrowRight } from "lucide-react";
import { useState } from "react";

const categories = [
    "All", "Mental Health", "Wellness", "Relationships", "Anxiety", "Depression", "Self-Care"
];

const blogPosts = [
    {
        id: 1,
        title: "Understanding Anxiety: Signs, Symptoms, and Coping Strategies",
        excerpt: "Learn to recognize anxiety symptoms and discover effective techniques to manage stress in your daily life.",
        category: "Anxiety",
        date: "Jan 3, 2026",
        readTime: "5 min read",
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=250&fit=crop",
    },
    {
        id: 2,
        title: "The Power of Mindfulness in Modern Life",
        excerpt: "Discover how mindfulness practices can transform your mental health and bring peace to your busy life.",
        category: "Wellness",
        date: "Jan 2, 2026",
        readTime: "7 min read",
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=250&fit=crop",
    },
    {
        id: 3,
        title: "Building Healthy Relationships: A Therapist's Guide",
        excerpt: "Expert advice on communication, boundaries, and nurturing meaningful connections with others.",
        category: "Relationships",
        date: "Dec 30, 2025",
        readTime: "6 min read",
        image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=250&fit=crop",
    },
];

export default function BlogsPage() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredPosts = blogPosts.filter(post => {
        const matchesCategory = activeCategory === "All" || post.category === activeCategory;
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <>
            <Helmet>
                <title>Blog | 3-3.com Counseling</title>
            </Helmet>
            <Layout>
                <section className="min-h-screen bg-gradient-subtle py-20 pt-28">
                    <div className="container mx-auto px-4 lg:px-8">
                        {/* Header */}
                        <div className="text-center max-w-3xl mx-auto mb-12">
                            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
                                Our Blog
                            </span>
                            <h1 className="font-serif text-4xl md:text-5xl text-gray-900 mb-4">
                                Mental Health Insights
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Expert articles, tips, and resources for your mental wellness journey.
                            </p>
                        </div>

                        {/* Search & Filters */}
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-10">
                            <div className="flex gap-2 flex-wrap justify-center">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat
                                                ? "bg-primary text-white"
                                                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search articles..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                />
                            </div>
                        </div>

                        {/* Blog Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredPosts.map((post) => (
                                <article
                                    key={post.id}
                                    className="card-elevated overflow-hidden group hover:shadow-lg transition-all"
                                >
                                    <div className="aspect-video overflow-hidden">
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                                                {post.category}
                                            </span>
                                            <span className="text-gray-400 text-xs">{post.date}</span>
                                        </div>
                                        <h2 className="font-serif text-xl text-gray-900 mb-2 group-hover:text-primary transition-colors">
                                            {post.title}
                                        </h2>
                                        <p className="text-gray-500 text-sm mb-4">{post.excerpt}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-400">{post.readTime}</span>
                                            <Link
                                                to={`/blogs/${post.id}`}
                                                className="inline-flex items-center text-primary font-medium text-sm group-hover:gap-2 transition-all"
                                            >
                                                Read More
                                                <ArrowRight className="w-4 h-4 ml-1" />
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            </Layout>
        </>
    );
}
