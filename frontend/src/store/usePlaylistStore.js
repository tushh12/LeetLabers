import {create} from "zustand";
import {axiosInstance} from "../lib/axios.js"
import toast from "react-hot-toast";

export const usePlaylistStore = create((set ,get) => ({
    playlists:[],
    currentPlaylist:null,
    isLoading:false,
    error:null,


    createPlaylist : async(playlistData) => {
        try {
            set({isLoading:true});
            const response = await axiosInstance.post("/playlist/create-playlist",
                playlistData
            );
        set((state) => ({
            playlists: [...state.playlists,response.data.playList],
        }))
        toast.success("Playlist created successfully");
        return response.data.playList;
        } catch(error){
            console.error("Error creating playlist",error);
            toast.error(error.response?.data?.error || " Failed to create playlist");
            throw error;
        } finally{
            set({isLoading:false});
        }
    },
    getAllPlaylists : async() => {
        try {
            set({isLoading:true});
            const response = await  axiosInstance.get("/playlist");
            set({playlists:response.data.playLists});
            } catch(error){
                console.error("Error fetching playlists:",error);
                toast.error("Failed to fetch playlists");
            } finally {
                set({isLoading:false});
            }
    },
    getPlaylistDetails : async(playListId) => {
        try {
            set({isLoading:true});
            const response = await axiosInstance.get(`/playlist/${playListId}`);
            set({currentPlaylist: response.data.playList});
        } catch(error){
            console.error("Error fetching playlist details",error);
            toast.error("Failed to fetch playlist details");
        } finally{
            set({isLoading:false});
        }
    },
    addProblemToPlaylist : async(playListId,problemIds) => {
        try {
            set({isLoading:true});
            await axiosInstance.post(`/playlist/${playListId}/add-problem`,{
                problemIds,
            });
            toast.success("Problem added to playlist");
            if(get().currentPlaylist?.id === playListId){
                await get().getPlaylistDetails(playListId);
            }
        } catch(error){
            console.error("Error adding problem to playlist",error);
            toast.error("Failed to add problem to playlist");
        } finally {
            set({isLoading:false})
        }
    },
    removeProblemFromPlaylist : async(playListId,problemIds) => {
        try {
            set({isLoading:true});
            await axiosInstance.post(`/playlist/${playListId}/remove-problems`,{
                problemIds,
            })
            toast.success("Problem removed from playlist");
            if(get().currentPlaylist?.id === playListId){
                await get().getPlaylistDetails(playListId);
            }
        } catch(error){
            console.error("Error removing problem from playlist",error);
            toast.error("Failed to remove problem from the playlist");
        } finally {
            set({isLoading:false});
        }
    },
    deletePlaylist: async(playListId) => {
        try {
            set({isLoading:true});
            await axiosInstance.delete(`/playlist/${playListId}`);
            set((state) => ({
                playlists: state.playlists.filter((p) => p.id !== playListId),
            }))
            toast.success("Playlist deleted sucessfully");
        } catch(error){
            console.error("Error deleting playlist",error);
            toast.error("Failed to delete playlist");
        } finally {
            set({isLoading:false})
        }
    },
}))