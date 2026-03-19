import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import TaskModalChat from '@/components/admin/TaskModalChat';

vi.mock('react-icons/fi', () => ({
    FiMessageSquare: () => <span data-testid="icon-message" />,
    FiSend: () => <span data-testid="icon-send" />,
}));

describe('TaskModalChat', () => {
    beforeEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    const mockTask = {
        id: 'task-123',
        client_id: 'client-user-id',
    };

    const mockComments = [
        {
            id: 'c1',
            task_id: 'task-123',
            content: 'First comment from client',
            user_id: 'client-user-id',
            created_at: new Date().toISOString(),
        },
        {
            id: 'c2',
            task_id: 'task-123',
            content: 'Admin response here',
            user_id: 'admin-user-id',
            created_at: new Date().toISOString(),
        },
    ];

    it('renders empty state when no comments', () => {
        render(
            <TaskModalChat
                task={mockTask}
                comments={[]}
                newComment=""
                setNewComment={vi.fn()}
                postComment={vi.fn()}
                sending={false}
                handleCommentKeyDown={vi.fn()}
                chatContainerRef={{ current: null }}
                chatEndRef={{ current: null }}
            />
        );

        expect(screen.getByText('No messages yet')).toBeInTheDocument();
        expect(screen.getByTestId('icon-message')).toBeInTheDocument();
    });

    it('renders comments list with date separators', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const commentsWithDate = [
            {
                id: 'c1',
                task_id: 'task-123',
                content: 'Comment from yesterday',
                user_id: 'client-user-id',
                created_at: yesterday.toISOString(),
            },
            {
                id: 'c2',
                task_id: 'task-123',
                content: 'Comment from today',
                user_id: 'admin-user-id',
                created_at: new Date().toISOString(),
            },
        ];

        render(
            <TaskModalChat
                task={mockTask}
                comments={commentsWithDate}
                newComment=""
                setNewComment={vi.fn()}
                postComment={vi.fn()}
                sending={false}
                handleCommentKeyDown={vi.fn()}
                chatContainerRef={{ current: null }}
                chatEndRef={{ current: null }}
            />
        );

        expect(screen.getByText('Comment from yesterday')).toBeInTheDocument();
        expect(screen.getByText('Comment from today')).toBeInTheDocument();
    });

    it('renders admin message right-aligned with You label', () => {
        render(
            <TaskModalChat
                task={mockTask}
                comments={[mockComments[1]]}
                newComment=""
                setNewComment={vi.fn()}
                postComment={vi.fn()}
                sending={false}
                handleCommentKeyDown={vi.fn()}
                chatContainerRef={{ current: null }}
                chatEndRef={{ current: null }}
            />
        );

        expect(screen.getByText('Admin response here')).toBeInTheDocument();
        expect(screen.getByText('You')).toBeInTheDocument();
    });

    it('renders client message left-aligned with Client label', () => {
        render(
            <TaskModalChat
                task={mockTask}
                comments={[mockComments[0]]}
                newComment=""
                setNewComment={vi.fn()}
                postComment={vi.fn()}
                sending={false}
                handleCommentKeyDown={vi.fn()}
                chatContainerRef={{ current: null }}
                chatEndRef={{ current: null }}
            />
        );

        expect(screen.getByText('First comment from client')).toBeInTheDocument();
        expect(screen.getByText('Client')).toBeInTheDocument();
    });

    it('input field updates newComment on change', () => {
        const mockSetNewComment = vi.fn();
        
        render(
            <TaskModalChat
                task={mockTask}
                comments={[]}
                newComment=""
                setNewComment={mockSetNewComment}
                postComment={vi.fn()}
                sending={false}
                handleCommentKeyDown={vi.fn()}
                chatContainerRef={{ current: null }}
                chatEndRef={{ current: null }}
            />
        );

        const textarea = screen.getByPlaceholderText('Type a message...');
        fireEvent.change(textarea, { target: { value: 'Hello world' } });

        expect(mockSetNewComment).toHaveBeenCalledWith('Hello world');
    });

    it('send button is disabled when newComment is empty', () => {
        render(
            <TaskModalChat
                task={mockTask}
                comments={[]}
                newComment=""
                setNewComment={vi.fn()}
                postComment={vi.fn()}
                sending={false}
                handleCommentKeyDown={vi.fn()}
                chatContainerRef={{ current: null }}
                chatEndRef={{ current: null }}
            />
        );

        const button = screen.getByRole('button', { name: 'Send message' });
        expect(button).toBeDisabled();
    });

    it('send button is disabled when sending is true', () => {
        render(
            <TaskModalChat
                task={mockTask}
                comments={[]}
                newComment="Test message"
                setNewComment={vi.fn()}
                postComment={vi.fn()}
                sending={true}
                handleCommentKeyDown={vi.fn()}
                chatContainerRef={{ current: null }}
                chatEndRef={{ current: null }}
            />
        );

        const button = screen.getByRole('button', { name: 'Send message' });
        expect(button).toBeDisabled();
    });

    it('send button shows spinner when sending is true', () => {
        render(
            <TaskModalChat
                task={mockTask}
                comments={[]}
                newComment="Test message"
                setNewComment={vi.fn()}
                postComment={vi.fn()}
                sending={true}
                handleCommentKeyDown={vi.fn()}
                chatContainerRef={{ current: null }}
                chatEndRef={{ current: null }}
            />
        );

        const button = screen.getByRole('button', { name: 'Send message' });
        const spinner = button.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
    });

    it('calls handleCommentKeyDown on Enter key press', () => {
        const mockKeyDown = vi.fn();
        
        render(
            <TaskModalChat
                task={mockTask}
                comments={[]}
                newComment="Test"
                setNewComment={vi.fn()}
                postComment={vi.fn()}
                sending={false}
                handleCommentKeyDown={mockKeyDown}
                chatContainerRef={{ current: null }}
                chatEndRef={{ current: null }}
            />
        );

        const textarea = screen.getByPlaceholderText('Type a message...');
        fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

        expect(mockKeyDown).toHaveBeenCalled();
    });

    it('calls postComment when send button is clicked', () => {
        const mockPostComment = vi.fn();
        
        render(
            <TaskModalChat
                task={mockTask}
                comments={[]}
                newComment="Test message"
                setNewComment={vi.fn()}
                postComment={mockPostComment}
                sending={false}
                handleCommentKeyDown={vi.fn()}
                chatContainerRef={{ current: null }}
                chatEndRef={{ current: null }}
            />
        );

        const button = screen.getByRole('button', { name: 'Send message' });
        fireEvent.click(button);

        expect(mockPostComment).toHaveBeenCalled();
    });
});
