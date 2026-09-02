const express = require("express");

const {
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
} = require("../controllers/eventTemplateController");

const router = express.Router();


// Event Template
router.get("/", getEventTemplates);
router.get("/:id", getEventTemplate);
router.post("/", createEventTemplate);
router.put("/:id", updateEventTemplate);
router.delete("/:id", deleteEventTemplate);


// Category Template
router.post(
  "/:eventTemplateId/categories",
  createCategoryTemplate
);

router.put(
  "/categories/:id",
  updateCategoryTemplate
);

router.delete(
  "/categories/:id",
  deleteCategoryTemplate
);


// Task Template
router.post(
  "/categories/:categoryTemplateId/tasks",
  createTaskTemplate
);

router.put(
  "/tasks/:id",
  updateTaskTemplate
);

router.delete(
  "/tasks/:id",
  deleteTaskTemplate
);

module.exports = router;