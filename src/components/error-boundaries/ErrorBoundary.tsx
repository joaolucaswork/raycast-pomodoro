import React, { Component, ReactNode } from "react";
import { List, Icon, Color } from "@raycast/api";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

/**
 * Generic Error Boundary component for catching and handling React errors
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // Update state with error info
    this.setState({ error, errorInfo });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <List>
          <List.EmptyView
            title="Something went wrong"
            description="An unexpected error occurred. Please try again or restart the extension."
            icon={{
              source: Icon.ExclamationMark,
              tintColor: Color.Red,
            }}
          />
        </List>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
) {
  const WithErrorBoundaryComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithErrorBoundaryComponent;
}

/**
 * Hook for error reporting within components
 */
export function useErrorReporting() {
  const reportError = (error: Error, context?: string) => {
    console.error(`Error in ${context || "component"}:`, error);
    
    // In a real implementation, this could send errors to a logging service
    // For now, we'll just log to console
  };

  return { reportError };
}

/**
 * Error boundary specifically for timer operations
 */
interface TimerErrorBoundaryProps {
  children: ReactNode;
  onTimerError?: (error: Error) => void;
}

export class TimerErrorBoundary extends Component<TimerErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: TimerErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Timer operation error:", error, errorInfo);
    
    this.setState({ error, errorInfo });

    if (this.props.onTimerError) {
      this.props.onTimerError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <List>
          <List.EmptyView
            title="Timer Error"
            description="There was an issue with the timer. Please restart the timer or try again."
            icon={{
              source: Icon.Clock,
              tintColor: Color.Red,
            }}
          />
        </List>
      );
    }

    return this.props.children;
  }
}

/**
 * Error boundary for form components
 */
interface FormErrorBoundaryProps {
  children: ReactNode;
  onFormError?: (error: Error) => void;
}

export class FormErrorBoundary extends Component<FormErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: FormErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Form error:", error, errorInfo);
    
    this.setState({ error, errorInfo });

    if (this.props.onFormError) {
      this.props.onFormError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <List>
          <List.EmptyView
            title="Form Error"
            description="There was an issue with the form. Please try refreshing or restarting the extension."
            icon={{
              source: Icon.Document,
              tintColor: Color.Red,
            }}
          />
        </List>
      );
    }

    return this.props.children;
  }
}

/**
 * Error boundary for data loading operations
 */
interface DataErrorBoundaryProps {
  children: ReactNode;
  onDataError?: (error: Error) => void;
}

export class DataErrorBoundary extends Component<DataErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: DataErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Data loading error:", error, errorInfo);
    
    this.setState({ error, errorInfo });

    if (this.props.onDataError) {
      this.props.onDataError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <List>
          <List.EmptyView
            title="Data Loading Error"
            description="Unable to load data. Please check your connection and try again."
            icon={{
              source: Icon.WiFiDisabled,
              tintColor: Color.Red,
            }}
          />
        </List>
      );
    }

    return this.props.children;
  }
}

/**
 * Utility function to create custom error boundaries
 */
export function createErrorBoundary(
  errorTitle: string,
  errorDescription: string,
  errorIcon: Icon = Icon.ExclamationMark,
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
) {
  return class CustomErrorBoundary extends Component<
    { children: ReactNode },
    ErrorBoundaryState
  > {
    constructor(props: { children: ReactNode }) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      console.error(`Custom error boundary (${errorTitle}):`, error, errorInfo);
      
      this.setState({ error, errorInfo });

      if (onError) {
        onError(error, errorInfo);
      }
    }

    render() {
      if (this.state.hasError) {
        return (
          <List>
            <List.EmptyView
              title={errorTitle}
              description={errorDescription}
              icon={{
                source: errorIcon,
                tintColor: Color.Red,
              }}
            />
          </List>
        );
      }

      return this.props.children;
    }
  };
}
