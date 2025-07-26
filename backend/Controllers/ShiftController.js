const Shift = require('../Models/shift');
const Staff = require('../Models/staff');

exports.addShift = async (req, res) => {
  try {
    const { staffId, date, startTime, endTime, duration, notes } = req.body;

    console.log("Received shift data:", req.body);

    // Validate required fields
    if (!staffId || !date || !startTime || !endTime || !duration) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Check if staff member exists
    const staffMember = await Staff.findById(staffId);
    if (!staffMember) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Check for overlapping shifts
    const existingShift = await Shift.findOne({
      staffId,
      date,
      $or: [
        {
          startTime: { $lte: endTime },
          endTime: { $gte: startTime }
        }
      ]
    });

    if (existingShift) {
      return res.status(400).json({ 
        message: 'This staff member already has a shift scheduled for this time period' 
      });
    }

    const shift = new Shift({
      staffId,
      date,
      startTime,
      endTime,
      duration,
      notes,
      status: 'scheduled'
    });

    await shift.save();
    const populatedShift = await Shift.findById(shift._id)
      .populate('staffId', 'name role department');
    
    console.log("Shift created successfully:", populatedShift);
    res.status(201).json(populatedShift);
  } catch (error) {
    console.error("Error creating shift:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllShifts = async (req, res) => {
  try {
    const { date, staffId, status } = req.query;
    let query = {};

    console.log("Fetching shifts with query params:", { date, staffId, status });

    // Apply filters if provided
    if (date) {
      // Handle date filtering more reliably
      const startOfDay = new Date(date + 'T00:00:00.000Z');
      const endOfDay = new Date(date + 'T23:59:59.999Z');
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }
    if (staffId) query.staffId = staffId;
    if (status) query.status = status;

    console.log("Database query:", query);

    const shifts = await Shift.find(query)
      .populate('staffId', 'name role department')
      .sort({ date: 1, startTime: 1 });

    console.log("Shifts found:", shifts.length);
    if (shifts.length > 0) {
      console.log("Sample shift with populated staff:", JSON.stringify(shifts[0], null, 2));
    }
    res.status(200).json(shifts);
  } catch (error) {
    console.error("Error fetching shifts:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateShiftStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    console.log(`Updating shift ${id} to status: ${status}`);

    // Validate status
    const validStatuses = ['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const shift = await Shift.findById(id);
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    // Update status and notes
    shift.status = status;
    if (notes) shift.notes = notes;

    // Update attended status based on new status
    if (status === 'completed') {
      shift.attended = true;
    } else if (status === 'no-show') {
      shift.attended = false;
    }

    await shift.save();
    const updatedShift = await Shift.findById(id)
      .populate('staffId', 'name role department');

    console.log("Shift updated successfully:", updatedShift);
    res.status(200).json(updatedShift);
  } catch (error) {
    console.error("Error updating shift:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteShift = async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    // Only allow deletion of future shifts
    const shiftDate = new Date(shift.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (shiftDate < today) {
      return res.status(400).json({ 
        message: 'Cannot delete past shifts' 
      });
    }

    await Shift.findByIdAndDelete(req.params.id);
    console.log("Shift deleted successfully:", req.params.id);
    res.status(200).json({ message: 'Shift deleted successfully' });
  } catch (error) {
    console.error("Error deleting shift:", error);
    res.status(500).json({ message: error.message });
  }
};
