import { FiMessageSquare, FiSend } from "react-icons/fi";

export default function TaskModalChat({
    task,
    comments,
    newComment,
    setNewComment,
    postComment,
    sending,
    handleCommentKeyDown,
    chatContainerRef,
    chatEndRef,
}) {
    const getDateLabel = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === today.toDateString()) return "Today";
        if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="flex flex-col flex-1 min-h-0">
            {/* Scrollable chat area — fixed height */}
            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 space-y-3"
                style={{ maxHeight: 'clamp(200px, 50vh, 400px)', minHeight: '180px' }}
            >
                {comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-400 py-12">
                        <FiMessageSquare className="w-8 h-8 mb-3 opacity-30" />
                        <p className="font-jetbrains-mono text-xs uppercase tracking-widest">No messages yet</p>
                    </div>
                ) : (
                    <>
                        {comments.map((c, idx) => {
                            const isAdmin = c.user_id !== task?.client_id;
                            const showDateSep = idx === 0 ||
                                getDateLabel(c.created_at) !== getDateLabel(comments[idx - 1].created_at);

                            return (
                                <div key={c.id}>
                                    {showDateSep && (
                                        <div className="flex items-center gap-3 my-4">
                                            <div className="flex-1 h-px bg-neutral-200" />
                                            <span className="text-[10px] font-jetbrains-mono text-neutral-400 uppercase tracking-widest">
                                                {getDateLabel(c.created_at)}
                                            </span>
                                            <div className="flex-1 h-px bg-neutral-200" />
                                        </div>
                                    )}
                                    <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                        <div className="max-w-[80%]">
                                            <div className={`px-4 py-2.5 ${isAdmin
                                                ? 'bg-neutral-900 text-white rounded-t-lg rounded-bl-lg'
                                                : 'bg-neutral-100 text-neutral-900 border border-neutral-200 rounded-t-lg rounded-br-lg'
                                                }`}>
                                                <p className="text-sm font-space-grotesk whitespace-pre-wrap leading-relaxed">
                                                    {c.content}
                                                </p>
                                            </div>
                                            <div className={`flex items-center gap-2 mt-1 px-1 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                                <span className="text-[10px] font-jetbrains-mono font-bold text-neutral-400 uppercase tracking-widest">
                                                    {isAdmin ? 'You' : 'Client'}
                                                </span>
                                                <span className="text-[10px] font-jetbrains-mono text-neutral-300">
                                                    {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={chatEndRef} />
                    </>
                )}
            </div>

            {/* Chat Input */}
            <div className="border-t border-neutral-200 bg-neutral-50/80 p-3 sm:p-4">
                <div className="flex items-end gap-2">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Type a message..."
                        rows={1}
                        className="flex-1 px-4 py-2.5 bg-white border border-neutral-200 focus:border-neutral-900 focus:ring-0 outline-none transition-colors font-space-grotesk text-sm rounded-lg resize-none max-h-24 overflow-y-auto"
                        onKeyDown={handleCommentKeyDown}
                        style={{ minHeight: '42px' }}
                        onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
                        }}
                    />
                    <button
                        onClick={postComment}
                        disabled={!newComment.trim() || sending}
                        aria-label="Send message"
                        className="p-2.5 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0"
                    >
                        {sending ? (
                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin block" />
                        ) : (
                            <FiSend className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
