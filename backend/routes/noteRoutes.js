import express from "express";
import {
  createNote,
  deleteNote,
  getNotes,
  updateNote,
  toggleFavorite,
} from "../controllers/noteController.js";
import { protect } from "../middleware/auth.js";  // Changed to named import

const router = express.Router();

router.use(protect);

router.post("/", createNote);
router.get("/", getNotes);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);
router.patch("/:id/favorite", toggleFavorite);

export default router;
