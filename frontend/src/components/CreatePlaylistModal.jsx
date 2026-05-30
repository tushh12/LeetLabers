import  { useState } from "react";
import { X, FolderPlus } from "lucide-react";

const CreatePlaylistModal = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      await onSubmit({ name, description });
      setName("");
      setDescription("");
      onClose();
    } catch (error) {
      console.error("Failed to create playlist", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal modal-open backdrop-blur-sm bg-gray-950/40 z-50">
      <div className="modal-box bg-gray-900 border border-gray-800 text-gray-100 rounded-2xl max-w-md shadow-2xl relative">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <FolderPlus className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-wide">Create New Playlist</h3>
        </div>

        {/* Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-gray-400 text-xs uppercase tracking-wider">Playlist Title</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Top 50 Dynamic Programming"
              className="input input-bordered w-full bg-gray-950 border-gray-800 focus:border-primary text-white rounded-xl text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-gray-400 text-xs uppercase tracking-wider">Description (Optional)</span>
            </label>
            <textarea
              placeholder="Describe the objective or collection focus..."
              className="textarea textarea-bordered w-full bg-gray-950 border-gray-800 focus:border-primary text-white rounded-xl text-sm min-h-24 resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="modal-action pt-2 border-t border-gray-800/40">
            <button 
              type="button" 
              onClick={onClose}
              className="btn btn-sm btn-ghost text-gray-400 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="btn btn-sm btn-primary px-5 rounded-xl text-white font-bold text-xs"
            >
              {isSubmitting ? <span className="loading loading-spinner loading-xs"></span> : "Build Playlist"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlaylistModal;