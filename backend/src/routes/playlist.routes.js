import express from "express";
import { authMiddleware } from "../middleware/auth.middeware.js";
import { addProblemToPlaylist, createPlayList, deletePlaylist, getPlayAllListDetails, getPlayListDetails, removeProblemFromPlaylist } from "../controllers/playlist.controllers.js";

const router = express.Router();

router.get("/" , authMiddleware , getPlayAllListDetails)

router.get("/:playlistId" , authMiddleware , getPlayListDetails)

router.post("/create-playlist" ,authMiddleware ,  createPlayList)



router.post('/:playlistId/add-problem' , authMiddleware , addProblemToPlaylist)

router.delete("/:playlistId" , authMiddleware , deletePlaylist)

router.delete("/:playlistId/remove-problem" , authMiddleware , removeProblemFromPlaylist)


export default router;