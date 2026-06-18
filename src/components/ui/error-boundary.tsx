"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center py-16">
            <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              An unexpected error occurred. Please try again.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Try again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
