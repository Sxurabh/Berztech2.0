import { FiArchive, FiTrash2, FiCheck } from "react-icons/fi";

export default function TaskModalFooter({
    isNew,
    loading,
    onClose,
    handleSave,
    handleArchive,
    handleDelete
}) {
    return (
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between p-4 sm:p-5 border-t border-neutral-100 bg-neutral-50/50 gap-3 sm:gap-0">
            {!isNew ? (
                <div className="flex items-center justify-between sm:justify-start gap-2">
                    <button
                        onClick={handleArchive}
                        disabled={loading}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200 hover:border-neutral-400 rounded-sm transition-all shadow-sm"
                        title="Move task out of board"
                    >
                        <FiArchive className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                        <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest font-medium">Archive</span>
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-rose-600 hover:text-white hover:bg-rose-600 border border-transparent hover:border-rose-600 rounded-sm transition-colors"
                    >
                        <FiTrash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                        <span className="text-[10px] sm:hidden font-jetbrains-mono uppercase tracking-widest font-medium">Del</span>
                        <span className="hidden sm:inline text-[10px] font-jetbrains-mono uppercase tracking-widest font-medium">Delete</span>
                    </button>
                </div>
            ) : <div className="hidden sm:block" />}

            <div className="flex items-center gap-2 sm:gap-4">
                <button
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 border border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-neutral-900 hover:bg-white rounded-sm transition-colors text-[10px] font-jetbrains-mono uppercase tracking-widest font-medium bg-white sm:bg-transparent"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-[2] sm:flex-none justify-center px-4 sm:px-6 py-2 sm:py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 rounded-sm shadow-sm transition-colors text-[10px] font-jetbrains-mono uppercase tracking-widest font-medium flex items-center gap-2"
                >
                    {loading ? (
                        <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
                    ) : (
                        <FiCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    )}
                    <span className="truncate">{isNew ? "Create Task" : "Save Changes"}</span>
                </button>
            </div>
        </div>
    );
}
