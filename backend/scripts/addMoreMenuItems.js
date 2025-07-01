const mongoose = require('mongoose');
const Menu = require('../Models/Menu');
require('dotenv').config();

// Additional menu items to reach 24+ total
const additionalMenuItems = [
  {
    name: "Chicken Seekh Kebab",
    description: "Spiced ground chicken grilled on skewers with aromatic herbs",
    price: 380,
    category: "Appetizers",
    availability: true,
    image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&h=400&fit=crop",
    ingredients: ["ground chicken", "onions", "green chilies", "mint", "spices"],
    cuisine: "Pakistani",
    spiceLevel: "medium",
    dietaryTags: ["halal"],
    preparationTime: 25,
    nutritionalInfo: { calories: 280, protein: 22, carbs: 5, fat: 18 },
    averageRating: 4.4,
    totalRatings: 89,
    popularityScore: 78,
    isRecommended: true
  },
  {
    name: "Beef Chapli Kebab",
    description: "Traditional Peshawari flat kebab with tomatoes and green chilies",
    price: 420,
    category: "Main Course",
    availability: true,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&h=400&fit=crop",
    ingredients: ["ground beef", "tomatoes", "green chilies", "coriander", "spices"],
    cuisine: "Pakistani",
    spiceLevel: "hot",
    dietaryTags: ["halal"],
    preparationTime: 30,
    nutritionalInfo: { calories: 350, protein: 25, carbs: 8, fat: 24 },
    averageRating: 4.6,
    totalRatings: 67,
    popularityScore: 82,
    isRecommended: true
  },
  {
    name: "Chicken Malai Boti",
    description: "Creamy marinated chicken pieces grilled in tandoor",
    price: 450,
    category: "Main Course",
    availability: true,
    image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&h=400&fit=crop",
    ingredients: ["chicken", "cream", "yogurt", "cashews", "mild spices"],
    cuisine: "Pakistani",
    spiceLevel: "mild",
    dietaryTags: ["halal"],
    preparationTime: 35,
    nutritionalInfo: { calories: 320, protein: 28, carbs: 6, fat: 20 },
    averageRating: 4.7,
    totalRatings: 94,
    popularityScore: 85,
    isRecommended: true
  },
  {
    name: "Mutton Pulao",
    description: "Fragrant rice cooked with tender mutton pieces and whole spices",
    price: 550,
    category: "Main Course",
    availability: true,
    image: "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=500&h=400&fit=crop",
    ingredients: ["basmati rice", "mutton", "whole spices", "yogurt", "fried onions"],
    cuisine: "Pakistani",
    spiceLevel: "medium",
    dietaryTags: ["halal"],
    preparationTime: 60,
    nutritionalInfo: { calories: 480, protein: 32, carbs: 58, fat: 16 },
    averageRating: 4.5,
    totalRatings: 78,
    popularityScore: 80,
    isRecommended: true
  },
  {
    name: "Fish Tikka",
    description: "Marinated fish pieces grilled with lemon and herbs",
    price: 480,
    category: "Main Course",
    availability: true,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&h=400&fit=crop",
    ingredients: ["fish", "yogurt", "lemon", "ginger-garlic", "spices"],
    cuisine: "Pakistani",
    spiceLevel: "medium",
    dietaryTags: ["halal"],
    preparationTime: 25,
    nutritionalInfo: { calories: 260, protein: 35, carbs: 4, fat: 12 },
    averageRating: 4.3,
    totalRatings: 56,
    popularityScore: 72,
    isRecommended: false
  },
  {
    name: "Aloo Keema",
    description: "Spiced ground meat cooked with potatoes in traditional style",
    price: 320,
    category: "Main Course",
    availability: true,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&h=400&fit=crop",
    ingredients: ["ground meat", "potatoes", "onions", "tomatoes", "spices"],
    cuisine: "Pakistani",
    spiceLevel: "medium",
    dietaryTags: ["halal"],
    preparationTime: 40,
    nutritionalInfo: { calories: 380, protein: 22, carbs: 25, fat: 22 },
    averageRating: 4.2,
    totalRatings: 89,
    popularityScore: 68,
    isRecommended: false
  },
  {
    name: "Chicken Corn Soup",
    description: "Hearty soup with chicken pieces and sweet corn",
    price: 180,
    category: "Appetizers",
    availability: true,
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&h=400&fit=crop",
    ingredients: ["chicken", "sweet corn", "vegetables", "chicken stock"],
    cuisine: "Pakistani",
    spiceLevel: "mild",
    dietaryTags: ["halal"],
    preparationTime: 20,
    nutritionalInfo: { calories: 120, protein: 12, carbs: 15, fat: 3 },
    averageRating: 4.1,
    totalRatings: 45,
    popularityScore: 60,
    isRecommended: false
  },
  {
    name: "Gajar Halwa",
    description: "Traditional carrot dessert with milk, nuts and cardamom",
    price: 200,
    category: "Desserts",
    availability: true,
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=400&fit=crop",
    ingredients: ["carrots", "milk", "sugar", "ghee", "almonds", "cardamom"],
    cuisine: "Pakistani",
    spiceLevel: "mild",
    dietaryTags: ["vegetarian", "halal"],
    preparationTime: 45,
    nutritionalInfo: { calories: 280, protein: 6, carbs: 42, fat: 12 },
    averageRating: 4.4,
    totalRatings: 67,
    popularityScore: 75,
    isRecommended: true
  },
  {
    name: "Sheer Khurma",
    description: "Festive vermicelli pudding with dates and nuts",
    price: 220,
    category: "Desserts",
    availability: true,
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=400&fit=crop",
    ingredients: ["vermicelli", "milk", "dates", "almonds", "pistachios"],
    cuisine: "Pakistani",
    spiceLevel: "mild",
    dietaryTags: ["vegetarian", "halal"],
    preparationTime: 30,
    nutritionalInfo: { calories: 320, protein: 8, carbs: 48, fat: 12 },
    averageRating: 4.3,
    totalRatings: 52,
    popularityScore: 70,
    isRecommended: false
  }
];

async function addMoreMenuItems() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.Mongo_Conn || 'mongodb://localhost:27017/hrms');
    console.log('🔗 Connected to MongoDB');

    console.log('\n=== ADDING MORE MENU ITEMS ===\n');

    // Check current count
    const currentCount = await Menu.countDocuments();
    console.log(`📊 Current menu items: ${currentCount}`);

    // Add new items
    const insertedItems = await Menu.insertMany(additionalMenuItems);
    console.log(`✅ Added ${insertedItems.length} new menu items`);

    // Final count
    const finalCount = await Menu.countDocuments();
    console.log(`📊 Total menu items now: ${finalCount}`);

    console.log('\n🎉 Menu items added successfully!');

  } catch (error) {
    console.error('❌ Error adding menu items:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

if (require.main === module) {
  addMoreMenuItems();
}

module.exports = { addMoreMenuItems };
