import { COLUMNS } from "./KanbanBoard";

export default function TaskModalDetails({
    title,
    setTitle,
    description,
    setDescription,
    status,
    setStatus,
    priority,
    setPriority,
}) {
    return (
        <div className="space-y-6">
            <div>
                <label className="block text-[10px] font-jetbrains-mono font-medium text-neutral-500 uppercase tracking-widest mb-1.5">
                    Title
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 outline-none transition-all font-space-grotesk font-medium rounded-sm shadow-sm"
                    placeholder="Task Title"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                    <label className="block text-[10px] font-jetbrains-mono font-medium text-neutral-500 uppercase tracking-widest mb-1.5">
                        Status
                    </label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-neutral-200 focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 outline-none transition-all font-space-grotesk rounded-sm shadow-sm"
                    >
                        {COLUMNS.map(col => (
                            <option key={col.id} value={col.id}>{col.title}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-jetbrains-mono font-medium text-neutral-500 uppercase tracking-widest mb-1.5">
                        Priority
                    </label>
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-neutral-200 focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 outline-none transition-all font-space-grotesk rounded-sm shadow-sm"
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-jetbrains-mono font-medium text-neutral-500 uppercase tracking-widest mb-1.5">
                    Description
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 outline-none transition-all font-space-grotesk resize-y min-h-[100px] rounded-sm shadow-sm"
                    placeholder="Add more details about this task..."
                />
            </div>
        </div>
    );
}
