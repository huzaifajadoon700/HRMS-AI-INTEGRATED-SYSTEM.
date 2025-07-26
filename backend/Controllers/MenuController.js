const Menu = require("../Models/Menu");

// Get all menu items
exports.getMenus = async (req, res) => {
  try {
    const menus = await Menu.find();
    res.status(200).json(menus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get menu items by category
exports.getMenusByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const menus = await Menu.find({ category });
    res.status(200).json(menus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a new menu item
exports.addMenu = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      availability,
      image,
      imageUrl,
    } = req.body;

    // Handle image upload - priority order: file upload, base64 image, image URL
    let finalImage = null;

    if (req.file) {
      if (req.file.filename) {
        // Disk storage (development)
        finalImage = `/uploads/${req.file.filename}`;
        console.log("Development menu upload - saved to disk:", finalImage);
      } else {
        // Memory storage (production) - file exists but can't be saved to disk
        console.log(
          "Production environment detected - file upload not supported on serverless"
        );
        finalImage = null;
      }
    } else if (image && image.startsWith("data:image/")) {
      // Handle base64 image data
      finalImage = image;
      console.log("Menu base64 image provided");
    } else if (
      imageUrl &&
      (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))
    ) {
      // Handle image URL
      finalImage = imageUrl;
      console.log("Menu image URL provided:", finalImage);
    } else if (
      image &&
      (image.startsWith("http://") || image.startsWith("https://"))
    ) {
      // Handle image URL in image field
      finalImage = image;
      console.log("Menu image URL provided in image field:", finalImage);
    }

    const newMenu = new Menu({
      name,
      description,
      price,
      category,
      availability,
      image: finalImage,
    });

    const savedMenu = await newMenu.save();
    console.log("Menu saved with image:", finalImage ? "Yes" : "No");
    res.status(201).json(savedMenu);
  } catch (error) {
    console.error("Error adding menu:", error);
    res.status(400).json({ error: error.message });
  }
};

// Update a menu item
exports.updateMenu = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      availability,
      image,
      imageUrl,
    } = req.body;
    const updateData = { name, description, price, category, availability };

    // Handle image update - priority order: file upload, base64 image, image URL
    if (req.file) {
      if (req.file.filename) {
        // Disk storage (development)
        updateData.image = `/uploads/${req.file.filename}`;
        console.log(
          "Development menu update - saved to disk:",
          updateData.image
        );
      } else {
        console.log(
          "Production environment detected - file upload not supported on serverless"
        );
      }
    } else if (image && image.startsWith("data:image/")) {
      // Handle base64 image data
      updateData.image = image;
      console.log("Menu update base64 image provided");
    } else if (
      imageUrl &&
      (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))
    ) {
      // Handle image URL
      updateData.image = imageUrl;
      console.log("Menu update image URL provided:", imageUrl);
    } else if (
      image &&
      (image.startsWith("http://") || image.startsWith("https://"))
    ) {
      // Handle image URL in image field
      updateData.image = image;
      console.log("Menu update image URL provided in image field:", image);
    }

    const updatedMenu = await Menu.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedMenu) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    console.log("Menu updated with image:", updateData.image ? "Yes" : "No");
    res.status(200).json(updatedMenu);
  } catch (error) {
    console.error("Error updating menu:", error);
    res.status(400).json({ error: error.message });
  }
};

// Delete a menu item
exports.deleteMenu = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) {
      return res.status(404).json({ error: "Menu item not found" });
    }
    await Menu.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Menu item deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Toggle menu item availability
exports.toggleAvailability = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) {
      return res.status(404).json({ error: "Menu item not found" });
    }
    menu.availability = !menu.availability;
    const updatedMenu = await menu.save();
    res.status(200).json(updatedMenu);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
