import {db} from "../libs/db.js"

export const createPlayList = async (req,res) => {
    try {
        const {name,description} = req.body;
        const userId = req.user.id;
        const playList = await db.playList.create({
            data:{
                name,
                description,
                userId,
            },
        });
        res.status(200).json({
            success:true,
            message:"Playlist created successfully",
            playList
        })
    } catch (error){
        console.error("errror creating playlist ",error);
        res.status(500).json({error:"failed to create playlist"});
    }
};

export const getPlayAllListDetails = async (req,res) => {
    try {
        const playList = await db.playList.findMany({
            where:{
                userId:req.user.id,
            },
            include:{
                problems:{
                    include:{
                        problem:true,
                    }
                }
            }
        });
        res.status(200).json({
            success:true,
            message:"Playlist fetched successfully",
            playList,
        })
    } catch (error) {
        console.error("Error fetching playlist",error);
        res.status(500).json({error:"failed to fetch playlist "});
    }
}
export const getPlayListDetails =  async(req,res) => {
    const {playListId} = req.params;

    try {
        const playList = await db.playList.findUnique({
            where:{id:playListId,userId:req.user.id},
            include:{
                problems:{
                    include:{
                        problem:true,
                    },
                },
            },
        });
        if (!playList){
            return res.status(404).json({error:"Playlist not found"});
        }
        res.status(200).json({
            success:true,
            message:"Playlist fetched sucessfully",
            playList,
        })
    } catch(error){
        console.error("error fetching playlist",error);
        res.status(500).json({error:"failed to fetch playlist"});
    }
} 
export const addProblemToPlaylist = async(req,res) => {
    const {playListId} = req.params;
    const {problemIds} = req.body;
    try {
        if(!Array.isArray(problemIds) || problemIds.length == 0){
            return res.status(400).json({error:"Invalid or missing problemIds"})
        }
        console.log(
            problemIds.map((problemId) => ({
                playListId,
                problemId,
            }))
        );
        const problemInPlaylist = await db.problemInPlaylist.createMany({
            data: problemIds.map((problemId) => ({
                playListId:playListId,
                problemId,
            })),
        });
        res.status(201).json({
            success:true,
            message:"Problems added to playlist successfully",
            problemInPlaylist,
        });
    } catch (error) {
        console.error("error adding problem to playlist",error.message);
        res.status(500).json({error:"failder to add problem to playlist"});
    }
}
export const deletePlaylist = async(req,res) => {
    const {playListId} = req.params;
    try {
        const deletedplaylist = await db.playlist.delete({
            where:{
                id:playListId,
            },
        });
        res.status(200).json({
            success:true,
            message:"Playlist deleted sucessfully",
            deletedplaylist
        });
    } catch (error) {
        console.error("error deleting playlist",error.message);
        res.status(500).json({error:"Failed to delete playlist"});
    }
};
export  const removeProblemFromPlaylist = async(req,res) => {
    const {playListId} = req.params;
    const {problemIds} =  req.body;
    try{
        if(!Array.isArray(problemIds) || problemIds.length === 0){
            return res.status(400).json({error:"Invalid or missing problemId"})

        }
        const deletedProblem = await db.problemInPlaylist.deleteMany({
            where:{
                playlistId,
                problemId:{
                    in:problemIds,
                },
            },
        });
        res.status(200).json({
            success:true,
            message:"Problem removed from playlist successfully",
            deletedProblem
        });
    } catch(error){
        console.error("error removing problem form the playlist ",error.message);
        res.status(500).json({error:"failed to remove probem from playlist"});
    }
}