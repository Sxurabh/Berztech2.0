import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TaskModalChat from '@/components/admin/TaskModalChat';

vi.mock('react-icons/fi', () => ({
    FiMessageSquare: () => <span data-testid="icon" />,
    FiSend: () => <span data-testid="send-icon" />,
}));

const mockTask = { id: 'task-1', client_id: 'client-1' };

const mockComments = [
    { id: 'c1', user_id: 'user-1', content: 'Hello', created_at: '2024-01-15T10:00:00Z' },
    { id: 'c2', user_id: 'client-1', content: 'Hi there', created_at: '2024-01-15T11:00:00Z' },
];

describe('TaskModalChat Component', () => {
    it('renders empty state when no comments', () => {
        render(
            <TaskModalChat
                task={mockTask}
                comments={[]}
                newComment=""
                setNewComment={() => {}}
                postComment={() => {}}
                sending={false}
                handleCommentKeyDown={() => {}}
                chatContainerRef={{ current: null }}
                chatEndRef={{ current: null }}
            />
        );
        
        expect(screen.getByText('No messages yet')).toBeInTheDocument();
    });

    it('renders comments', () => {
        render(
            <TaskModalChat
                task={mockTask}
                comments={mockComments}
                newComment=""
                setNewComment={() => {}}
                postComment={() => {}}
                sending={false}
                handleCommentKeyDown={() => {}}
                chatContainerRef={{ current: null }}
                chatEndRef={{ current: null }}
            />
        );
        
        expect(screen.getByText('Hello')).toBeInTheDocument();
        expect(screen.getByText('Hi there')).toBeInTheDocument();
    });

    it('renders input field', () => {
        render(
            <TaskModalChat
                task={mockTask}
                comments={[]}
                newComment="Test message"
                setNewComment={() => {}}
                postComment={() => {}}
                sending={false}
                handleCommentKeyDown={() => {}}
                chatContainerRef={{ current: null }}
                chatEndRef={{ current: null }}
            />
        );
        
        expect(screen.getByDisplayValue('Test message')).toBeInTheDocument();
    });

    it('renders send button', () => {
        render(
            <TaskModalChat
                task={mockTask}
                comments={[]}
                newComment=""
                setNewComment={() => {}}
                postComment={() => {}}
                sending={false}
                handleCommentKeyDown={() => {}}
                chatContainerRef={{ current: null }}
                chatEndRef={{ current: null }}
            />
        );
        
        expect(screen.getByTestId('send-icon')).toBeInTheDocument();
    });
});
