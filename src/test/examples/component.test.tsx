/**
 * Component Test Examples
 *
 * Demonstrates how to write React component tests using
 * React Testing Library and Vitest.
 *
 * Key patterns covered:
 * - Rendering components
 * - Querying elements
 * - User interactions
 * - Mocking hooks and context
 * - Testing async behavior
 *
 * @module test/examples/component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fixtures } from '../fixtures';

// ==================== Simple Component Tests ====================

/**
 * Example: Simple presentational component
 */
describe('Simple Component', () => {
  // Example component
  function UserCard({ name, email }: { name: string; email: string }) {
    return (
      <div className="user-card" data-testid="user-card">
        <h3>{name}</h3>
        <p>{email}</p>
      </div>
    );
  }

  it('should render user name and email', () => {
    render(<UserCard name="John Doe" email="john@example.com" />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('should have correct test id', () => {
    render(<UserCard name="John" email="john@example.com" />);

    expect(screen.getByTestId('user-card')).toBeInTheDocument();
  });
});

// ==================== Interactive Component Tests ====================

/**
 * Example: Component with user interactions
 */
describe('Interactive Component', () => {
  // Example counter component
  function Counter({ initialCount = 0 }: { initialCount?: number }) {
    const [count, setCount] = vi.importActual<typeof import('react')>('react')
      ? require('react').useState(initialCount)
      : [initialCount, vi.fn()];

    return (
      <div>
        <span data-testid="count">{count}</span>
        <button onClick={() => setCount((c: number) => c + 1)}>Increment</button>
        <button onClick={() => setCount((c: number) => c - 1)}>Decrement</button>
        <button onClick={() => setCount(0)}>Reset</button>
      </div>
    );
  }

  it('should increment count on button click', async () => {
    const user = userEvent.setup();
    render(<Counter initialCount={0} />);

    const incrementButton = screen.getByRole('button', { name: /increment/i });
    await user.click(incrementButton);

    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });

  it('should decrement count on button click', async () => {
    const user = userEvent.setup();
    render(<Counter initialCount={5} />);

    const decrementButton = screen.getByRole('button', { name: /decrement/i });
    await user.click(decrementButton);

    expect(screen.getByTestId('count')).toHaveTextContent('4');
  });

  it('should reset count to zero', async () => {
    const user = userEvent.setup();
    render(<Counter initialCount={10} />);

    const resetButton = screen.getByRole('button', { name: /reset/i });
    await user.click(resetButton);

    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });
});

// ==================== Form Component Tests ====================

/**
 * Example: Form component with validation
 */
describe('Form Component', () => {
  // Example login form
  function LoginForm({ onSubmit }: { onSubmit: (data: { email: string; password: string }) => void }) {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      onSubmit({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
      });
    };

    return (
      <form onSubmit={handleSubmit} data-testid="login-form">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          required
        />

        <button type="submit">Sign In</button>
      </form>
    );
  }

  it('should call onSubmit with form data', async () => {
    const user = userEvent.setup();
    const mockSubmit = vi.fn();
    render(<LoginForm onSubmit={mockSubmit} />);

    // Fill in the form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(mockSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should have required fields', () => {
    render(<LoginForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/email/i)).toBeRequired();
    expect(screen.getByLabelText(/password/i)).toBeRequired();
  });
});

// ==================== Async Component Tests ====================

/**
 * Example: Component with async data loading
 */
describe('Async Component', () => {
  // Example component that loads data
  function UserProfile({ userId }: { userId: string }) {
    const [user, setUser] = require('react').useState<typeof fixtures.user | null>(null);
    const [loading, setLoading] = require('react').useState(true);
    const [error, setError] = require('react').useState<string | null>(null);

    require('react').useEffect(() => {
      async function loadUser() {
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 100));
          if (userId === 'error') {
            throw new Error('Failed to load user');
          }
          setUser(fixtures.user);
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setLoading(false);
        }
      }
      loadUser();
    }, [userId]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div role="alert">Error: {error}</div>;
    if (!user) return <div>No user found</div>;

    return (
      <div data-testid="user-profile">
        <h1>{user.name}</h1>
        <p>{user.email}</p>
      </div>
    );
  }

  it('should show loading state initially', () => {
    render(<UserProfile userId="123" />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should show user data after loading', async () => {
    render(<UserProfile userId="123" />);

    await waitFor(() => {
      expect(screen.getByTestId('user-profile')).toBeInTheDocument();
    });

    expect(screen.getByText(fixtures.user.name!)).toBeInTheDocument();
    expect(screen.getByText(fixtures.user.email)).toBeInTheDocument();
  });

  it('should show error message on failure', async () => {
    render(<UserProfile userId="error" />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByText(/failed to load user/i)).toBeInTheDocument();
  });
});

// ==================== Query Methods Reference ====================

/**
 * Example: Different query methods
 *
 * getBy* - Throws if not found (use when element should exist)
 * queryBy* - Returns null if not found (use for asserting absence)
 * findBy* - Returns Promise, waits for element (use for async)
 */
describe('Query Methods', () => {
  function ConditionalComponent({ show }: { show: boolean }) {
    return (
      <div>
        <span>Always visible</span>
        {show && <span data-testid="conditional">Conditional content</span>}
      </div>
    );
  }

  it('should find element with getBy (element exists)', () => {
    render(<ConditionalComponent show={true} />);

    // getBy throws if not found - use when element MUST exist
    const element = screen.getByTestId('conditional');
    expect(element).toBeInTheDocument();
  });

  it('should return null with queryBy (element does not exist)', () => {
    render(<ConditionalComponent show={false} />);

    // queryBy returns null if not found - use for asserting absence
    const element = screen.queryByTestId('conditional');
    expect(element).not.toBeInTheDocument();
  });
});

// ==================== Accessibility Tests ====================

/**
 * Example: Testing accessibility
 */
describe('Accessibility', () => {
  function AccessibleButton({ onClick, disabled = false }: { onClick: () => void; disabled?: boolean }) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        aria-label="Submit form"
        aria-disabled={disabled}
      >
        Submit
      </button>
    );
  }

  it('should have accessible name', () => {
    render(<AccessibleButton onClick={vi.fn()} />);

    expect(screen.getByRole('button', { name: /submit form/i })).toBeInTheDocument();
  });

  it('should indicate disabled state', () => {
    render(<AccessibleButton onClick={vi.fn()} disabled />);

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
  });
});

// ==================== Testing with Context ====================

/**
 * Example: Testing components with context
 */
describe('Context Provider', () => {
  const React = require('react');
  const ThemeContext = React.createContext({ theme: 'light', toggleTheme: () => {} });

  function ThemeToggle() {
    const { theme, toggleTheme } = React.useContext(ThemeContext);
    return (
      <button onClick={toggleTheme}>
        Current theme: {theme}
      </button>
    );
  }

  it('should display theme from context', () => {
    render(
      <ThemeContext.Provider value={{ theme: 'dark', toggleTheme: vi.fn() }}>
        <ThemeToggle />
      </ThemeContext.Provider>
    );

    expect(screen.getByText(/current theme: dark/i)).toBeInTheDocument();
  });

  it('should call toggleTheme when clicked', async () => {
    const user = userEvent.setup();
    const toggleTheme = vi.fn();

    render(
      <ThemeContext.Provider value={{ theme: 'light', toggleTheme }}>
        <ThemeToggle />
      </ThemeContext.Provider>
    );

    await user.click(screen.getByRole('button'));

    expect(toggleTheme).toHaveBeenCalled();
  });
});
