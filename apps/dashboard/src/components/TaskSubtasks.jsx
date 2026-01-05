
import React, { useState } from 'react';
import { Plus, Check, Square, Trash2 } from 'lucide-react';

const TaskSubtasks = ({ taskId, subtasks, onUpdate }) => {
    const [newSubtask, setNewSubtask] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const colors = {
        border: 'rgba(255,255,255,0.08)',
        textMain: '#ffffff',
        textMuted: '#8A8A8A',
        primary: '#2B81FF',
        danger: '#ef4444'
    };

    const handleAddSubtask = async (e) => {
        if (e) e.preventDefault();
        if (!newSubtask.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:3001/api/tasks/${taskId}/subtasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newSubtask })
            });

            if (response.ok) {
                setNewSubtask('');
                if (onUpdate) onUpdate();
            }
        } catch (error) {
            console.error('Error adding subtask:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleSubtask = async (subtask) => {
        try {
            const response = await fetch(`http://localhost:3001/api/tasks/${taskId}/subtasks/${subtask.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: !subtask.completed })
            });

            if (response.ok) {
                if (onUpdate) onUpdate();
            }
        } catch (error) {
            console.error('Error updating subtask:', error);
        }
    };

    return (
        <div className="mt-6 border-t pt-6" style={{ borderColor: colors.border }}>
            <h4 className="text-sm font-semibold mb-4" style={{ color: colors.textMain }}>
                Subtasks ({subtasks.filter(s => s.completed).length}/{subtasks.length})
            </h4>

            <form onSubmit={handleAddSubtask} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    placeholder="Add a new subtask..."
                    className="flex-1 bg-transparent border rounded px-3 py-1.5 text-sm"
                    style={{
                        borderColor: colors.border,
                        color: colors.textMain
                    }}
                />
                <button
                    type="submit"
                    disabled={isLoading || !newSubtask.trim()}
                    className="p-1.5 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    style={{ backgroundColor: colors.primary }}
                >
                    <Plus size={18} color="white" />
                </button>
            </form>

            <div className="space-y-2">
                {subtasks.length === 0 ? (
                    <p className="text-xs italic" style={{ color: colors.textMuted }}>No subtasks yet.</p>
                ) : (
                    subtasks.map((subtask) => (
                        <div
                            key={subtask.id}
                            className="flex items-center gap-3 p-2 rounded hover:bg-white/5 group transition-colors"
                        >
                            <button
                                onClick={() => handleToggleSubtask(subtask)}
                                className="transition-colors"
                                style={{ color: subtask.completed ? colors.primary : colors.textMuted }}
                            >
                                {subtask.completed ? <Check size={18} /> : <Square size={18} />}
                            </button>
                            <span
                                className="text-sm flex-1"
                                style={{
                                    color: subtask.completed ? colors.textMuted : colors.textMain,
                                    textDecoration: subtask.completed ? 'line-through' : 'none'
                                }}
                            >
                                {subtask.title}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TaskSubtasks;
