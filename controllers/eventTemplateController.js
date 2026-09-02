const EventTemplate = require("../models/EventTemplate");
const CategoryTemplate = require("../models/CategoryTemplate");
const TaskTemplate = require("../models/TaskTemplate");

const getEventTemplates = async (req, res) => {
  try {
    const templates = await EventTemplate.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.json({
      data: templates,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch event templates",
    });
  }
};

const getEventTemplate = async (req, res) => {
  try {
    const template = await EventTemplate.findByPk(req.params.id, {
      include: [
        {
          model: CategoryTemplate,
          as: "categories",
          include: [
            {
              model: TaskTemplate,
              as: "tasks",
            },
          ],
        },
      ],
    });

    if (!template) {
      return res.status(404).json({
        message: "Event template not found",
      });
    }

    res.json(template);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch event template",
    });
  }
};

const createEventTemplate = async (req, res) => {
  try {
    const { name } = req.body;

    const template = await EventTemplate.create({
      name,
    });

    res.status(201).json(template);
  } catch (error) {
    console.error(error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "Event template already exists",
      });
    }

    res.status(500).json({
      message: "Failed to create event template",
    });
  }
};

const updateEventTemplate = async (req, res) => {
  try {
    const { name } = req.body;

    const template = await EventTemplate.findByPk(req.params.id);

    if (!template) {
      return res.status(404).json({
        message: "Event template not found",
      });
    }

    template.name = name;

    await template.save();

    res.json(template);
  } catch (error) {
    console.error(error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "Event template already exists",
      });
    }

    res.status(500).json({
      message: "Failed to update event template",
    });
  }
};

const deleteEventTemplate = async (req, res) => {
  try {
    const template = await EventTemplate.findByPk(req.params.id);

    if (!template) {
      return res.status(404).json({
        message: "Event template not found",
      });
    }

    await template.destroy();

    res.json({
      message: "Event template deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete event template",
    });
  }
};


// ==================== CATEGORY TEMPLATE ====================

const createCategoryTemplate = async (req, res) => {
  try {
    const { name } = req.body;
    const { eventTemplateId } = req.params;

    const eventTemplate = await EventTemplate.findByPk(eventTemplateId);

    if (!eventTemplate) {
      return res.status(404).json({
        message: "Event template not found",
      });
    }

    const category = await CategoryTemplate.create({
      name,
      eventTemplateId,
    });

    res.status(201).json(category);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create category template",
    });
  }
};

const updateCategoryTemplate = async (req, res) => {
  try {
    const { name } = req.body;

    const category = await CategoryTemplate.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category template not found",
      });
    }

    category.name = name;

    await category.save();

    res.json(category);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update category template",
    });
  }
};

const deleteCategoryTemplate = async (req, res) => {
  try {
    const category = await CategoryTemplate.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category template not found",
      });
    }

    await category.destroy();

    res.json({
      message: "Category template deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete category template",
    });
  }
};


// ==================== TASK TEMPLATE ====================

const createTaskTemplate = async (req, res) => {
  try {
    const { title, staffId } = req.body;
    const { categoryTemplateId } = req.params;

    const category = await CategoryTemplate.findByPk(categoryTemplateId);

    if (!category) {
      return res.status(404).json({
        message: "Category template not found",
      });
    }

    const task = await TaskTemplate.create({
      title,
      staffId,
      categoryTemplateId,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create task template",
    });
  }
};

const updateTaskTemplate = async (req, res) => {
  try {
    const { title, staffId } = req.body;

    const task = await TaskTemplate.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task template not found",
      });
    }

    task.title = title;
    task.staffId = staffId;

    await task.save();

    res.json(task);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update task template",
    });
  }
};

const deleteTaskTemplate = async (req, res) => {
  try {
    const task = await TaskTemplate.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task template not found",
      });
    }

    await task.destroy();

    res.json({
      message: "Task template deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete task template",
    });
  }
};


module.exports = {
  getEventTemplates,
  getEventTemplate,
  createEventTemplate,
  updateEventTemplate,
  deleteEventTemplate,

  createCategoryTemplate,
  updateCategoryTemplate,
  deleteCategoryTemplate,

  createTaskTemplate,
  updateTaskTemplate,
  deleteTaskTemplate,
};