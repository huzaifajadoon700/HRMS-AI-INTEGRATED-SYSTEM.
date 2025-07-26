const Order = require('../Models/Order');
const Booking = require('../Models/Booking');
const Reservation = require('../Models/Reservations'); // File is Reservations.js but exports Reservation
const Room = require('../Models/Room');
const Table = require('../Models/Table');
const Menu = require('../Models/Menu');
const User = require('../Models/User');
const Feedback = require('../Models/Feedback');

// Get comprehensive dashboard analytics
const getDashboardAnalytics = async (req, res) => {
  try {
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const thisYear = new Date(today.getFullYear(), 0, 1);

    // Parallel data fetching for better performance
    const [
      // Counts
      totalRooms,
      totalTables,
      totalMenuItems,
      totalUsers,
      totalOrders,
      totalBookings,
      totalReservations,

      // Orders data
      ordersData,
      ordersThisMonth,
      ordersLastMonth,

      // Bookings data
      bookingsData,
      bookingsThisMonth,
      bookingsLastMonth,

      // Reservations data
      reservationsData,
      reservationsThisMonth,
      reservationsLastMonth,
      
      // Room status
      availableRooms,
      occupiedRooms,
      maintenanceRooms,
      
      // Today's data
      todayOrders,
      todayBookings,
      todayReservations,
      
      // Feedback data
      totalFeedbacks,
      positiveFeedbacks,
      negativeFeedbacks
    ] = await Promise.all([
      // Basic counts
      Room.countDocuments(),
      Table.countDocuments(),
      Menu.countDocuments(),
      User.countDocuments(),
      Order.countDocuments(),
      Booking.countDocuments(),
      Reservation.countDocuments(),
      
      // Orders with revenue AND items for trending analysis
      Order.find().select('totalPrice status createdAt items'),
      Order.find({ createdAt: { $gte: thisMonth } }).select('totalPrice status createdAt items'),
      Order.find({
        createdAt: { $gte: lastMonth, $lt: thisMonth }
      }).select('totalPrice status createdAt items'),
      
      // Bookings with revenue - using correct field names from Booking model
      Booking.find().select('totalPrice status createdAt checkInDate checkOutDate roomType roomNumber roomId userId fullName email phone'),
      Booking.find({
        $or: [
          { createdAt: { $gte: thisMonth } },
          { checkInDate: { $gte: thisMonth } }
        ]
      }).select('totalPrice status createdAt checkInDate checkOutDate roomType roomNumber roomId userId fullName email phone'),
      Booking.find({
        $or: [
          { createdAt: { $gte: lastMonth, $lt: thisMonth } },
          { checkInDate: { $gte: lastMonth, $lt: thisMonth } }
        ]
      }).select('totalPrice status createdAt checkInDate checkOutDate roomType roomNumber roomId userId fullName email phone'),
      
      // Reservations with revenue
      Reservation.find().select('totalPrice amount price status createdAt reservationDate'),
      Reservation.find({
        $or: [
          { createdAt: { $gte: thisMonth } },
          { reservationDate: { $gte: thisMonth } }
        ]
      }).select('totalPrice amount price status createdAt reservationDate'),
      Reservation.find({
        $or: [
          { createdAt: { $gte: lastMonth, $lt: thisMonth } },
          { reservationDate: { $gte: lastMonth, $lt: thisMonth } }
        ]
      }).select('totalPrice amount price status createdAt reservationDate'),
      
      // Room status
      Room.countDocuments({ status: { $in: ['available', 'Available'] } }),
      Room.countDocuments({ status: { $in: ['occupied', 'Occupied'] } }),
      Room.countDocuments({ status: { $in: ['maintenance', 'Maintenance'] } }),
      
      // Today's activity
      Order.countDocuments({ 
        createdAt: { 
          $gte: new Date(today.setHours(0, 0, 0, 0)),
          $lt: new Date(today.setHours(23, 59, 59, 999))
        }
      }),
      Booking.countDocuments({ 
        $or: [
          { createdAt: { 
            $gte: new Date(today.setHours(0, 0, 0, 0)),
            $lt: new Date(today.setHours(23, 59, 59, 999))
          }},
          { checkInDate: { 
            $gte: new Date(today.setHours(0, 0, 0, 0)),
            $lt: new Date(today.setHours(23, 59, 59, 999))
          }}
        ]
      }),
      Reservation.countDocuments({
        $or: [
          { createdAt: {
            $gte: new Date(today.setHours(0, 0, 0, 0)),
            $lt: new Date(today.setHours(23, 59, 59, 999))
          }},
          { reservationDate: {
            $gte: new Date(today.setHours(0, 0, 0, 0)),
            $lt: new Date(today.setHours(23, 59, 59, 999))
          }}
        ]
      }),
      
      // Feedback counts
      Feedback.countDocuments(),
      Feedback.countDocuments({ rating: { $gte: 4 } }),
      Feedback.countDocuments({ rating: { $lt: 3 } })
    ]);

    // Calculate revenue with detailed logging
    console.log('📊 Calculating revenue...');
    console.log('📦 Orders data count:', ordersData.length);
    console.log('🏨 Bookings data count:', bookingsData.length);
    console.log('🪑 Reservations data count:', reservationsData.length);

    const foodRevenue = ordersData.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const foodRevenueThisMonth = ordersThisMonth.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const foodRevenueLastMonth = ordersLastMonth.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    console.log('🍽️ Food Revenue:', { total: foodRevenue, thisMonth: foodRevenueThisMonth, lastMonth: foodRevenueLastMonth });

    const roomRevenue = bookingsData.reduce((sum, booking) => {
      // Calculate nights between check-in and check-out
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      const nights = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));

      // Use totalPrice from booking model
      const price = booking.totalPrice || 0;
      console.log(`🏨 Booking ${booking._id}: Room ${booking.roomNumber} (${booking.roomType}) - Rs.${price} for ${nights} nights`);
      return sum + price;
    }, 0);

    const roomRevenueThisMonth = bookingsThisMonth.reduce((sum, booking) => {
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      const nights = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
      const price = booking.totalPrice || 0;
      console.log(`🏨 This Month Booking ${booking._id}: Rs.${price}`);
      return sum + price;
    }, 0);

    const roomRevenueLastMonth = bookingsLastMonth.reduce((sum, booking) => {
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      const nights = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
      const price = booking.totalPrice || 0;
      console.log(`🏨 Last Month Booking ${booking._id}: Rs.${price}`);
      return sum + price;
    }, 0);

    console.log('🏨 Total Room Revenue:', roomRevenue);
    console.log('🏨 Room Revenue This Month:', roomRevenueThisMonth);
    console.log('🏨 Room Revenue Last Month:', roomRevenueLastMonth);

    const tableRevenue = reservationsData.reduce((sum, reservation) => {
      return sum + (reservation.totalPrice || reservation.amount || reservation.price || 0);
    }, 0);
    const tableRevenueThisMonth = reservationsThisMonth.reduce((sum, reservation) => {
      return sum + (reservation.totalPrice || reservation.amount || reservation.price || 0);
    }, 0);
    const tableRevenueLastMonth = reservationsLastMonth.reduce((sum, reservation) => {
      return sum + (reservation.totalPrice || reservation.amount || reservation.price || 0);
    }, 0);

    const totalRevenue = foodRevenue + roomRevenue + tableRevenue;
    const totalRevenueThisMonth = foodRevenueThisMonth + roomRevenueThisMonth + tableRevenueThisMonth;
    const totalRevenueLastMonth = foodRevenueLastMonth + roomRevenueLastMonth + tableRevenueLastMonth;

    // Calculate growth
    const revenueGrowth = totalRevenueLastMonth > 0 
      ? (((totalRevenueThisMonth - totalRevenueLastMonth) / totalRevenueLastMonth) * 100).toFixed(1)
      : totalRevenueThisMonth > 0 ? 100 : 0;

    // Calculate success rates
    const deliveredOrders = ordersData.filter(order => order.status === 'delivered' || order.status === 'Delivered').length;
    const pendingOrders = ordersData.filter(order => order.status === 'pending' || order.status === 'Pending').length;
    const cancelledOrders = ordersData.filter(order => order.status === 'cancelled' || order.status === 'Cancelled').length;

    const activeBookings = bookingsData.filter(booking => {
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      const now = new Date();
      return checkIn <= now && checkOut >= now;
    }).length;

    const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0;
    const successRate = totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      analytics: {
        overview: {
          totalRevenue,
          totalRevenueThisMonth,
          revenueGrowth: parseFloat(revenueGrowth),
          isGrowthPositive: parseFloat(revenueGrowth) >= 0,
          totalItems: totalMenuItems + totalRooms + totalTables,
          totalUsers,
          totalTransactions: totalOrders + totalBookings + totalReservations
        },
        revenue: {
          total: totalRevenue,
          thisMonth: totalRevenueThisMonth,
          lastMonth: totalRevenueLastMonth,
          food: foodRevenue,
          rooms: roomRevenue,
          tables: tableRevenue,
          breakdown: {
            foodPercentage: totalRevenue > 0 ? ((foodRevenue / totalRevenue) * 100).toFixed(1) : 0,
            roomsPercentage: totalRevenue > 0 ? ((roomRevenue / totalRevenue) * 100).toFixed(1) : 0,
            tablesPercentage: totalRevenue > 0 ? ((tableRevenue / totalRevenue) * 100).toFixed(1) : 0
          }
        },
        rooms: {
          total: totalRooms,
          available: availableRooms,
          occupied: occupiedRooms,
          maintenance: maintenanceRooms,
          occupancyRate: parseFloat(occupancyRate),
          revenue: roomRevenue,
          bookings: totalBookings,
          activeBookings
        },
        food: {
          totalMenuItems,
          totalOrders,
          delivered: deliveredOrders,
          pending: pendingOrders,
          cancelled: cancelledOrders,
          successRate: parseFloat(successRate),
          revenue: foodRevenue,
          avgOrderValue: totalOrders > 0 ? (foodRevenue / totalOrders).toFixed(0) : 0
        },
        tables: {
          total: totalTables,
          reservations: totalReservations,
          todayReservations,
          revenue: tableRevenue,
          avgReservationValue: totalReservations > 0 ? (tableRevenue / totalReservations).toFixed(0) : 0
        },
        activity: {
          today: {
            orders: todayOrders,
            bookings: todayBookings,
            reservations: todayReservations,
            total: todayOrders + todayBookings + todayReservations
          },
          thisMonth: {
            orders: ordersThisMonth.length,
            bookings: bookingsThisMonth.length,
            reservations: reservationsThisMonth.length
          }
        },
        feedback: {
          total: totalFeedbacks,
          positive: positiveFeedbacks,
          negative: negativeFeedbacks,
          satisfaction: totalFeedbacks > 0 ? ((positiveFeedbacks / totalFeedbacks) * 100).toFixed(1) : 0
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard analytics',
      error: error.message
    });
  }
};

// Get recent activities for dashboard
const getRecentActivities = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit);

    // Get recent activities from last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Fetch recent orders
    const recentOrders = await Order.find({
      createdAt: { $gte: yesterday }
    })
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(limitNum)
    .lean();

    // Fetch recent bookings
    const recentBookings = await Booking.find({
      createdAt: { $gte: yesterday }
    })
    .populate('userId', 'name email')
    .populate('roomId', 'roomNumber roomType')
    .sort({ createdAt: -1 })
    .limit(limitNum)
    .lean();

    // Fetch recent reservations
    const recentReservations = await Reservation.find({
      createdAt: { $gte: yesterday }
    })
    .populate('userId', 'name email')
    .populate('tableId', 'tableName')
    .sort({ createdAt: -1 })
    .limit(limitNum)
    .lean();

    // Format activities
    const activities = [];

    // Add orders
    recentOrders.forEach(order => {
      activities.push({
        type: 'order',
        customer: order.user?.name || order.fullName || 'Guest Customer',
        reference: `Order #${order._id.toString().slice(-6)}`,
        activity: `Placed food order - Rs.${order.totalPrice?.toLocaleString() || 0}`,
        status: order.status || 'pending',
        timestamp: order.createdAt,
        time: getTimeAgo(order.createdAt)
      });
    });

    // Add bookings
    recentBookings.forEach(booking => {
      activities.push({
        type: 'booking',
        customer: booking.userId?.name || booking.fullName || 'Guest Customer',
        reference: `Room ${booking.roomNumber || booking.roomId?.roomNumber || 'N/A'}`,
        activity: `Booked ${booking.roomType || 'room'} - Rs.${booking.totalPrice?.toLocaleString() || 0}`,
        status: booking.paymentStatus || 'confirmed',
        timestamp: booking.createdAt,
        time: getTimeAgo(booking.createdAt)
      });
    });

    // Add reservations
    recentReservations.forEach(reservation => {
      activities.push({
        type: 'reservation',
        customer: reservation.userId?.name || reservation.fullName || 'Guest Customer',
        reference: `Table ${reservation.tableNumber || reservation.tableId?.tableName || 'N/A'}`,
        activity: `Reserved table for ${reservation.guests} guests - Rs.${reservation.totalPrice?.toLocaleString() || 0}`,
        status: reservation.paymentStatus || 'confirmed',
        timestamp: reservation.createdAt,
        time: getTimeAgo(reservation.createdAt)
      });
    });

    // Sort all activities by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const limitedActivities = activities.slice(0, limitNum);

    res.status(200).json({
      success: true,
      data: {
        activities: limitedActivities,
        total: activities.length,
        summary: {
          orders: recentOrders.length,
          bookings: recentBookings.length,
          reservations: recentReservations.length
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activities',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Helper function to calculate time ago
const getTimeAgo = (date) => {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return new Date(date).toLocaleDateString();
};

module.exports = {
  getDashboardAnalytics,
  getRecentActivities
};
