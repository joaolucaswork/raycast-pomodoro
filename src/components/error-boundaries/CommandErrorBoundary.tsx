import React, { Component, ReactNode } from "react";
import { List, Icon, Color, Action, ActionPanel } from "@raycast/api";
import { useTimerStore } from "../../store/timer-store";

interface CommandErrorBoundaryProps {
  children: ReactNode;
  commandName: string;
  onRestart?: () => void;
}

interface CommandErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  retryCount: number;
}

/**
 * Error boundary specifically designed for Raycast command components
 * Provides command-specific error handling and recovery options
 */
export class CommandErrorBoundary extends Component<
  CommandErrorBoundaryProps,
  CommandErrorBoundaryState
> {
  private maxRetries = 3;

  constructor(props: CommandErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<CommandErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Command error in ${this.props.commandName}:`, error, errorInfo);
    
    this.setState({ error, errorInfo });

    // Log error details for debugging
    this.logErrorDetails(error, errorInfo);
  }

  private logErrorDetails(error: Error, errorInfo: React.ErrorInfo) {
    const errorDetails = {
      command: this.props.commandName,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      timestamp: new Date().toISOString(),
      retryCount: this.state.retryCount,
    };

    console.error("Detailed error report:", JSON.stringify(errorDetails, null, 2));
  }

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: this.state.retryCount + 1,
      });
    }
  };

  private handleRestart = () => {
    // Reset error state
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0,
    });

    // Call custom restart handler if provided
    if (this.props.onRestart) {
      this.props.onRestart();
    }
  };

  private handleResetStore = () => {
    try {
      // Reset the timer store to default state
      const { resetStats, clearAllHistory, clearAllMoodEntries } = useTimerStore.getState();
      
      resetStats();
      clearAllHistory();
      clearAllMoodEntries();

      // Reset error state
      this.handleRestart();
    } catch (resetError) {
      console.error("Failed to reset store:", resetError);
    }
  };

  render() {
    if (this.state.hasError) {
      const canRetry = this.state.retryCount < this.maxRetries;
      const errorMessage = this.state.error?.message || "Unknown error occurred";

      return (
        <List
          navigationTitle={`Error in ${this.props.commandName}`}
          actions={
            <ActionPanel>
              <ActionPanel.Section title="Recovery Options">
                {canRetry && (
                  <Action
                    title="Retry"
                    icon={Icon.ArrowClockwise}
                    onAction={this.handleRetry}
                    shortcut={{ modifiers: ["cmd"], key: "r" }}
                  />
                )}
                <Action
                  title="Restart Command"
                  icon={Icon.RotateClockwise}
                  onAction={this.handleRestart}
                  shortcut={{ modifiers: ["cmd", "shift"], key: "r" }}
                />
              </ActionPanel.Section>
              
              <ActionPanel.Section title="Advanced Recovery">
                <Action
                  title="Reset Extension Data"
                  icon={Icon.Trash}
                  style={Action.Style.Destructive}
                  onAction={this.handleResetStore}
                  shortcut={{ modifiers: ["cmd", "shift"], key: "delete" }}
                />
              </ActionPanel.Section>
            </ActionPanel>
          }
        >
          <List.EmptyView
            title={`${this.props.commandName} Error`}
            description={`An error occurred: ${errorMessage}\n\nTry using the retry option or restart the command.`}
            icon={{
              source: Icon.ExclamationMark,
              tintColor: Color.Red,
            }}
          />
          
          {/* Error details for debugging */}
          <List.Item
            title="Error Details"
            subtitle={`Retry count: ${this.state.retryCount}/${this.maxRetries}`}
            accessories={[
              {
                text: this.state.error?.name || "Unknown Error",
                icon: Icon.Bug,
              },
            ]}
          />
          
          {this.state.error?.stack && (
            <List.Item
              title="Stack Trace"
              subtitle="Check console for full details"
              accessories={[
                {
                  text: "Available in console",
                  icon: Icon.Terminal,
                },
              ]}
            />
          )}
        </List>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component for wrapping command components with error boundary
 */
export function withCommandErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  commandName: string,
  onRestart?: () => void
) {
  const WithCommandErrorBoundaryComponent = (props: P) => (
    <CommandErrorBoundary commandName={commandName} onRestart={onRestart}>
      <WrappedComponent {...props} />
    </CommandErrorBoundary>
  );

  WithCommandErrorBoundaryComponent.displayName = `withCommandErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithCommandErrorBoundaryComponent;
}

/**
 * Specialized error boundary for the main timer command
 */
export function TimerCommandErrorBoundary({ children }: { children: ReactNode }) {
  const handleTimerRestart = () => {
    try {
      const { stopTimer, resetCurrentSession } = useTimerStore.getState();
      stopTimer();
      resetCurrentSession();
    } catch (error) {
      console.error("Failed to restart timer:", error);
    }
  };

  return (
    <CommandErrorBoundary 
      commandName="Focus Timer" 
      onRestart={handleTimerRestart}
    >
      {children}
    </CommandErrorBoundary>
  );
}

/**
 * Specialized error boundary for the history command
 */
export function HistoryCommandErrorBoundary({ children }: { children: ReactNode }) {
  const handleHistoryRestart = () => {
    try {
      const { refreshConfigFromPreferences } = useTimerStore.getState();
      refreshConfigFromPreferences();
    } catch (error) {
      console.error("Failed to restart history:", error);
    }
  };

  return (
    <CommandErrorBoundary 
      commandName="Focus History" 
      onRestart={handleHistoryRestart}
    >
      {children}
    </CommandErrorBoundary>
  );
}

/**
 * Specialized error boundary for mood tracking command
 */
export function MoodCommandErrorBoundary({ children }: { children: ReactNode }) {
  const handleMoodRestart = () => {
    try {
      const { refreshConfigFromPreferences } = useTimerStore.getState();
      refreshConfigFromPreferences();
    } catch (error) {
      console.error("Failed to restart mood tracking:", error);
    }
  };

  return (
    <CommandErrorBoundary 
      commandName="Mood Tracking" 
      onRestart={handleMoodRestart}
    >
      {children}
    </CommandErrorBoundary>
  );
}

/**
 * Specialized error boundary for tag management command
 */
export function TagCommandErrorBoundary({ children }: { children: ReactNode }) {
  const handleTagRestart = () => {
    try {
      const { refreshConfigFromPreferences } = useTimerStore.getState();
      refreshConfigFromPreferences();
    } catch (error) {
      console.error("Failed to restart tag management:", error);
    }
  };

  return (
    <CommandErrorBoundary 
      commandName="Tag Management" 
      onRestart={handleTagRestart}
    >
      {children}
    </CommandErrorBoundary>
  );
}

/**
 * Error boundary for analytics and statistics
 */
export function AnalyticsCommandErrorBoundary({ children }: { children: ReactNode }) {
  const handleAnalyticsRestart = () => {
    try {
      const { recalculateStats, refreshConfigFromPreferences } = useTimerStore.getState();
      refreshConfigFromPreferences();
      recalculateStats();
    } catch (error) {
      console.error("Failed to restart analytics:", error);
    }
  };

  return (
    <CommandErrorBoundary 
      commandName="Analytics" 
      onRestart={handleAnalyticsRestart}
    >
      {children}
    </CommandErrorBoundary>
  );
}
