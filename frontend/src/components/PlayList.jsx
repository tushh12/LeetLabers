import { useEffect } from "react";
import { usePlaylistStore } from "../store/usePlaylistStore";
import { Folder, TrashIcon } from "lucide-react";

const PlaylistsList = () => {
  const { playlists, getAllPlaylists, deletePlaylist, isLoading } = usePlaylistStore();
    usePlaylistStore();

  useEffect(() => {
    getAllPlaylists();
  }, [getAllPlaylists]);
;
const handleDelete  = async(e, playlistIds) => {
          e.preventDefault();
          e.stopPropagation();

    if(window.confirm("Are you sure you want to delete this playlist?")) {
        await deletePlaylist(playlistIds);
    }
};
    if(isLoading && playlists.length === 0){
        return <div className="text-gray-500 text-sm italic animate-pulse">Loading playlists...</div>
    }
    return (
        <div className="w-full max-w-6xl mx-auto mt-6 px-2">
            <h3 className="text-xl font-bold text-white mb-4 tracking-wide">Your Playlists</h3>
            {playlists.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-gray-800 rounded-xl bg-gray-950/20 text-gray-500 text-sm">
                    No playlisy created yet . Click "Create Playlist" to start tracking.
                    </div>

            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {playlists.map((playlist) => (
                    <div 
                      key={playlist.id}
                      className="grooup relative flex items-center justify-between p-4 bg-gray-900/40 backdrop-blur-sm border border-gray-800/60 rounded-xl hover:border-gray-700/80 transition-all duration-200"
                      >
                        {/* Left side : folder icon and playlist info */}
                        <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 bg-primary/10 text-primary rounded-lg flex-shrink-0">
                        <Folder className="w-5 h-5"/>
                        </div>
                        <div className="min-w-0">
                            <h4 className="font-semibold text-white text-sm truncate">{playlist.name}</h4>
                            <p className="text-xs text-gray-400 mt-0.5 truncate">
                                {playlist.description || "No description provided"}
                            </p>
                        </div>
                        </div>
                        {/* Right Side : Action Delete Button (visible always on mobile , reveals smoothly on desktop hover) */}
                        <button 
                        onClick={(e) => handleDelete(e,playlist.id)}
                        className="p-2 text-gray-400 hover:text-red-400 bg-gray-950/40 hover:bg-red-600/10 border border-gray-800 hover:border-red-500/20 rounded-lg transition-all md:opacity-0 group-bover:opacity-100 flex-shrink-0"
                        title="Delete Playlist"
                        >
                        <TrashIcon className="w-4 h-4"/>
                        </button>
                        </div>
                ))}
                </div>
            )}      
        </div>
    );
}


export default PlaylistsList;