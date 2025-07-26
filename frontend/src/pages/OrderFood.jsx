import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiSearch, FiShoppingCart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import PersonalizedRecommendations from '../components/recommendations/PersonalizedRecommendations';
import { recommendationAPI, recommendationHelpers } from '../api/recommendations';
import Header from "../components/common/Header";
import '../styles/simple-theme.css';
import '../styles/OrderFood.css';

export default function OrderFood() {
    const navigate = useNavigate();
    const [menuItems, setMenuItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [categories, setCategories] = useState([]);
    const [activeTab] = useState('all');
    const [sortBy] = useState('name');
    const [priceRange] = useState([0, 1000]);
    const [favorites] = useState([]);

    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                const apiUrl = process.env.REACT_APP_API_BASE_URL || 'https://hrms-bace.vercel.app/api';
                const response = await axios.get(`${apiUrl}/menus`);
                setMenuItems(response.data);
                setFilteredItems(response.data);

                // Extract unique categories
                const uniqueCategories = [...new Set(response.data.map(item => item.category))];
                setCategories(uniqueCategories);

                setLoading(false);
            } catch (err) {
                setError('Failed to load menu items');
                setLoading(false);
                toast.error('Failed to load menu items');
                console.error('Error fetching menu items:', err);
            }
        };

        fetchMenuItems();
    }, []);

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCart(storedCart);
    }, []);

    useEffect(() => {
        let filtered = menuItems;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply category filter
        if (selectedCategory !== "all") {
            filtered = filtered.filter(item => item.category === selectedCategory);
        }

        // Apply price range filter
        filtered = filtered.filter(item =>
            item.price >= priceRange[0] && item.price <= priceRange[1]
        );

        // Apply tab filter
        if (activeTab === 'favorites') {
            filtered = filtered.filter(item => favorites.includes(item._id));
        } else if (activeTab === 'popular') {
            filtered = filtered.filter(item => item.rating >= 4.0);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                case 'name':
                default:
                    return a.name.localeCompare(b.name);
            }
        });

        setFilteredItems(filtered);
    }, [searchTerm, selectedCategory, menuItems, priceRange, activeTab, favorites, sortBy]);

    const handleAddToCart = (item) => {
        const existingCart = JSON.parse(localStorage.getItem("cart")) || [];

        const itemIndex = existingCart.findIndex(cartItem => cartItem._id === item._id);

        if (itemIndex !== -1) {
            existingCart[itemIndex].quantity += 1;
            toast.success(`${item.name} quantity updated! Click cart to checkout.`, {
                onClick: handleGoToCart,
                style: { cursor: 'pointer' }
            });
        } else {
            existingCart.push({ ...item, quantity: 1 });
            toast.success(`${item.name} added to cart! Click cart to checkout.`, {
                onClick: handleGoToCart,
                style: { cursor: 'pointer' }
            });
        }

        localStorage.setItem("cart", JSON.stringify(existingCart));
        setCart(existingCart);
        window.dispatchEvent(new Event("cartUpdated"));

        // Record interaction for recommendation system
        const userId = recommendationHelpers.getCurrentUserId();
        if (userId && recommendationHelpers.isUserLoggedIn()) {
            recommendationAPI.recordInteraction(userId, item._id, 'view')
                .catch(console.error);
        }
    };

    const handleRateItem = (menuItemId, rating) => {
        const userId = recommendationHelpers.getCurrentUserId();
        const token = localStorage.getItem('token');

        console.log('🔍 Rating Debug Info:', {
            userId,
            menuItemId,
            rating,
            hasToken: !!token,
            isLoggedIn: recommendationHelpers.isUserLoggedIn()
        });

        if (userId && recommendationHelpers.isUserLoggedIn()) {
            recommendationAPI.rateMenuItem(userId, menuItemId, rating)
                .then((response) => {
                    console.log('✅ Rating success:', response);
                    toast.success('Rating submitted successfully!');
                })
                .catch((error) => {
                    console.error('❌ Rating error details:', {
                        message: error.message,
                        status: error.response?.status,
                        data: error.response?.data,
                        config: error.config
                    });

                    if (error.response?.status === 401) {
                        toast.error('Please login again to rate items');
                    } else if (error.response?.status === 400) {
                        toast.error(error.response?.data?.message || 'Invalid rating data');
                    } else {
                        toast.error('Failed to submit rating. Please try again.');
                    }
                });
        } else {
            console.log('❌ User not logged in or missing data:', { userId, hasToken: !!token });
            toast.info('Please login to rate items');
        }
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handleGoToCart = () => {
        navigate('/cart');
    };



    if (loading) {
        return (
            <>
                <Header />
                <div style={{
                    background: '#ffffff',
                    minHeight: '100vh',
                    position: 'relative',
                    width: '100%',
                    margin: 0,
                    padding: 0,
                    paddingTop: '80px'
                }}>
                    {/* Main Content */}
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        margin: '0',
                        padding: '2rem 1.5rem 1.5rem'
                    }}>
                        {/* Hero Section */}
                        <div style={{
                            textAlign: 'center',
                            marginBottom: '3rem',
                            padding: '1rem 0'
                        }}>
                            <h1 style={{
                                fontSize: '2.5rem',
                                fontWeight: '700',
                                color: '#000000',
                                marginBottom: '1rem',
                                lineHeight: '1.2',
                                fontFamily: 'Inter, sans-serif'
                            }}>
                                Order Food
                            </h1>
                            <p style={{
                                fontSize: '1.125rem',
                                color: '#6b7280',
                                margin: '0',
                                lineHeight: '1.5',
                                maxWidth: '600px',
                                marginLeft: 'auto',
                                marginRight: 'auto'
                            }}>
                                Loading delicious menu items...
                            </p>
                        </div>

                        {/* Loading Grid */}
                        <div className="order-food-loading-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                            gap: '2rem',
                            marginBottom: '2rem'
                        }}>
                            {Array(6).fill().map((_, index) => (
                                <div
                                    key={index}
                                    style={{
                                        background: '#f3f4f6',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '1rem',
                                        overflow: 'hidden',
                                        height: '400px',
                                        animation: 'pulse 2s ease-in-out infinite'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div style={{
                    background: '#0A192F',
                    minHeight: '100vh',
                    paddingTop: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        background: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '1rem',
                        padding: '2rem',
                        textAlign: 'center',
                        color: '#000000',
                        maxWidth: '400px',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😞</div>
                        <h3 style={{ color: '#dc2626', marginBottom: '1rem', fontFamily: 'Inter, sans-serif' }}>Oops! Something went wrong</h3>
                        <p style={{ color: '#6b7280' }}>{error}</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div style={{
                background: '#ffffff',
                minHeight: '100vh',
                paddingTop: '80px',
                width: '100%',
                margin: 0,
                padding: 0
            }}>
                {/* Hero Section */}
                <div className="order-food-hero" style={{
                    textAlign: 'center',
                    marginBottom: '3rem',
                    padding: '2rem 1.5rem 1rem'
                }}>
                    <h1 className="order-food-title" style={{
                        fontSize: '2.5rem',
                        fontWeight: '700',
                        color: '#000000',
                        marginBottom: '1rem',
                        lineHeight: '1.2',
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        🍽️ Order Delicious Food
                    </h1>
                    <p className="order-food-subtitle" style={{
                        fontSize: '1.125rem',
                        color: '#6b7280',
                        margin: '0',
                        lineHeight: '1.5',
                        maxWidth: '600px',
                        marginLeft: 'auto',
                        marginRight: 'auto'
                    }}>
                        Discover amazing dishes crafted with love and passion
                    </p>
                </div>

                {/* Search and Filters Section */}
                <div className="order-food-filters" style={{
                    background: '#ffffff',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    margin: '0 1.5rem 2rem',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                }}>
                    <div className="order-food-filters-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '1rem',
                        alignItems: 'end'
                    }}>
                        <div>
                            <label style={{
                                display: 'block',
                                color: '#374151',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                marginBottom: '0.5rem',
                                fontFamily: 'Inter, sans-serif'
                            }}>
                                🔍 Search Menu
                            </label>
                            <div style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <FiSearch style={{
                                    position: 'absolute',
                                    left: '0.75rem',
                                    color: '#9ca3af',
                                    zIndex: 2,
                                    marginRight:"2 rem"
                                }} />
                                <input
                                    type="text"
                                    placeholder="Search delicious food..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                                        background: '#ffffff',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '0.5rem',
                                        color: '#000000',
                                        fontSize: '0.875rem',
                                        outline: 'none',
                                        fontFamily: 'Inter, sans-serif'
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{
                                display: 'block',
                                color: '#374151',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                marginBottom: '0.5rem',
                                fontFamily: 'Inter, sans-serif'
                            }}>
                                🏷️ Category
                            </label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: '#ffffff',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.5rem',
                                    color: '#000000',
                                    fontSize: '0.875rem',
                                    outline: 'none',
                                    fontFamily: 'Inter, sans-serif'
                                }}
                            >
                                <option value="">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: '#6b7280',
                            fontSize: '0.875rem',
                            fontFamily: 'Inter, sans-serif'
                        }}>
                            <span>📊 {filteredItems.length} items found</span>
                        </div>
                    </div>
                </div>

                {/* Three-Tab Recommendations Section */}
                <div style={{ margin: '0 1.5rem 2rem' }}>
                    <PersonalizedRecommendations
                        maxItems={50} // Increased for "For You" tab to show more menu items
                        onAddToCart={handleAddToCart}
                        onRate={handleRateItem}
                        className="mb-5"
                        filteredItems={filteredItems}
                        searchTerm={searchTerm}
                        selectedCategory={selectedCategory}
                    />
                </div>
                </div>

                {/* Floating Cart */}
                {cart.length > 0 && (
                    <div
                        className="order-food-floating-cart"
                        onClick={handleGoToCart}
                        style={{
                            position: 'fixed',
                            bottom: '2rem',
                            right: '2rem',
                            background: '#000000',
                            color: '#ffffff',
                            padding: '1rem 1.5rem',
                            borderRadius: '0.5rem',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            zIndex: 1000,
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            userSelect: 'none',
                            fontFamily: 'Inter, sans-serif'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                        }}
                        title="Click to view cart"
                    >
                        <FiShoppingCart size={18} />
                        <span>{cart.length} items</span>
                        <span>•</span>
                        <span>Rs. {getCartTotal().toFixed(0)}</span>
                    </div>
                )}
        </>
    );
}
