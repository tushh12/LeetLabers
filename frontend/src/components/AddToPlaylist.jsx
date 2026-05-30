import  { useEffect } from "react";
import { usePlaylistStore } from "../store/usePlaylistStore";
import { X, FolderHeart, Plus } from "lucide-react";

const AddToPlaylistModal = ({ isOpen, onClose, problemId }) => {
  const { playlists, isLoading, getAllPlaylists, addProblemToPlaylist } = usePlaylistStore();

  // Load user playlists whenever the modal wakes up
  useEffect(() => {
    if (isOpen) {
      getAllPlaylists();
    }
  }, [isOpen, getAllPlaylists]);

  if (!isOpen) return null;

  const handleSelectPlaylist = async (playlistId) => {
    // Expected args by your store: playlistId, problemIds array
    await addProblemToPlaylist(playlistId, [problemId]);
    onClose();
  };

  return (
    <div className="modal modal-open backdrop-blur-sm bg-gray-950/40 z-50">
      <div className="modal-box bg-gray-900 border border-gray-800 text-gray-100 rounded-2xl max-w-md shadow-2xl relative">
        
        {/* Close Toggle */}
        <button 
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title Group */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
            <FolderHeart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-wide">Save to Playlist</h3>
            <p className="text-xs text-gray-500 mt-0.5">Select target collection to index challenge.</p>
          </div>
        </div>

        {/* Main Selection Area */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-2">
              <span className="loading loading-spinner text-primary loading-sm"></span>
              <p className="text-gray-500 text-xs font-mono">Syncing playlists...</p>
            </div>
          ) : playlists && playlists.length > 0 ? (
            playlists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => handleSelectPlaylist(playlist.id)}
                className="w-full text-left p-3.5 rounded-xl bg-gray-950/40 hover:bg-gray-950 border border-gray-800 hover:border-gray-700 transition-all duration-150 flex items-center justify-between group"
              >
                <div>
                  <span className="text-sm font-bold text-gray-200 group-hover:text-primary transition-colors">
                    {playlist.name}
                  </span>
                  <span className="block text-[11px] text-gray-500 mt-0.5">
                    {playlist.problems?.length || 0} Target Targets Indexed
                  </span>
                </div>
                <div className="p-1 bg-gray-900 border border-gray-800 rounded-lg group-hover:bg-primary group-hover:text-white group-hover:border-transparent transition-all">
                  <Plus className="w-3.5 h-3.5" />
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-8 border border-dashed border-gray-800 rounded-xl bg-gray-950/20">
              <p className="text-sm text-gray-500">No active playlists discovered.</p>
              <p className="text-xs text-gray-600 mt-1">Create an entry group collection card first.</p>
            </div>
          )}
        </div>

        <div className="modal-action pt-4 border-t border-gray-800/40 mt-6">
          <button 
            type="button" 
            onClick={onClose}
            className="btn btn-sm btn-ghost text-gray-400 rounded-xl text-xs font-bold"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;