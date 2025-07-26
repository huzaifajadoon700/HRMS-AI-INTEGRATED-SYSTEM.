const Staff = require("../Models/staff");
const Shift = require("../Models/shift");

exports.addStaff = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      role,
      position,
      department,
      status,
      salary,
      hireDate,
    } = req.body;

    console.log("Received staff data:", req.body);
    console.log("Salary value:", salary, "Type:", typeof salary);
    console.log("HireDate value:", hireDate, "Type:", typeof hireDate);

    // Use role or position (frontend sends position)
    const staffRole = role || position;

    // Validate required fields
    if (!name || !email || !phone || !staffRole || !department) {
      return res.status(400).json({
        message: "All required fields must be provided",
        required: ["name", "email", "phone", "role/position", "department"],
        received: { name, email, phone, role: staffRole, department },
      });
    }

    // Check if email already exists
    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const staff = new Staff({
      name,
      email,
      phone,
      role: staffRole,
      department,
      status: status || "active",
      salary: salary ? parseFloat(salary) : undefined,
      hireDate: hireDate ? new Date(hireDate) : undefined,
    });

    await staff.save();
    console.log("Staff created successfully:", staff);
    res.status(201).json(staff);
  } catch (error) {
    console.error("Error creating staff:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find().select("-__v");
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const { name, email, phone, role, department, status, salary, hireDate } =
      req.body;
    const staffId = req.params.id;

    // Check if staff exists
    const existingStaff = await Staff.findById(staffId);
    if (!existingStaff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    // If email is being updated, check if it's already taken
    if (email && email !== existingStaff.email) {
      const emailExists = await Staff.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    const updateData = { name, email, phone, role, department, status };
    if (salary !== undefined) updateData.salary = parseFloat(salary);
    if (hireDate !== undefined) updateData.hireDate = new Date(hireDate);

    const updatedStaff = await Staff.findByIdAndUpdate(staffId, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedStaff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const staffId = req.params.id;

    // Check if staff exists
    const existingStaff = await Staff.findById(staffId);
    if (!existingStaff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    // Delete all shifts associated with the staff member
    await Shift.deleteMany({ staffId });

    // Delete the staff member
    await Staff.findByIdAndDelete(staffId);

    res
      .status(200)
      .json({ message: "Staff and associated shifts deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
