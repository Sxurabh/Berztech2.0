import { FiX } from "react-icons/fi";

export default function TaskModalHeader({ isNew, onClose }) {
    return (
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-100 bg-neutral-50/50">
            <h2 className="text-lg sm:text-xl font-space-grotesk font-medium text-neutral-900 tracking-tight">
                {isNew ? "New Task" : "Edit Task"}
            </h2>
            <button
                onClick={onClose}
                className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors rounded-sm"
            >
                <FiX className="w-5 h-5" />
            </button>
        </div>
    );
}
