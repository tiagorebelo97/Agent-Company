
import React, { useState } from 'react';
import { Send, User } from 'lucide-react';

const TaskComments = ({ taskId, comments, onUpdate }) => {
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const colors = {
        border: 'rgba(255,255,255,0.08)',
        textMain: '#ffffff',
        textMuted: '#8A8A8A',
        primary: '#2B81FF',
        bgSubtle: 'rgba(255,255,255,0.03)'
    };

    const handleAddComment = async (e) => {
        if (e) e.preventDefault();
        if (!newComment.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:3001/api/tasks/${taskId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newComment,
                    authorId: 'user', // Default for now
                    authorName: 'You'
                })
            });

            if (response.ok) {
                setNewComment('');
                if (onUpdate) onUpdate();
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleString();
    };

    return (
        <div className="mt-8 border-t pt-6" style={{ borderColor: colors.border }}>
            <h4 className="text-sm font-semibold mb-4" style={{ color: colors.textMain }}>
                Discussion
            </h4>

            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {comments.length === 0 ? (
                    <p className="text-xs italic" style={{ color: colors.textMuted }}>No comments yet. Start the conversation!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                style={{ backgroundColor: colors.bgSubtle, border: `1px solid ${colors.border}` }}
                            >
                                <User size={14} style={{ color: colors.textMuted }} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-medium" style={{ color: colors.textMain }}>
                                        {comment.authorName || 'Agent'}
                                    </span>
                                    <span className="text-[10px]" style={{ color: colors.textMuted }}>
                                        {formatDate(comment.createdAt)}
                                    </span>
                                </div>
                                <div
                                    className="p-3 rounded-lg text-sm"
                                    style={{ backgroundColor: colors.bgSubtle, color: colors.textMain, border: `1px solid ${colors.border}` }}
                                >
                                    {comment.content}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2 relative">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 bg-transparent border rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-1"
                    style={{
                        borderColor: colors.border,
                        color: colors.textMain,
                        minHeight: '80px',
                        '--tw-ring-color': colors.primary
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddComment();
                        }
                    }}
                />
                <button
                    type="submit"
                    disabled={isLoading || !newComment.trim()}
                    className="absolute right-3 bottom-3 p-2 rounded-full hover:opacity-80 disabled:opacity-30 transition-all"
                    style={{ backgroundColor: colors.primary }}
                >
                    <Send size={16} color="white" />
                </button>
            </form>
        </div>
    );
};

export default TaskComments;
