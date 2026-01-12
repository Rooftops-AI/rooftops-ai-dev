"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
    // Reload the page to reset state
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <IconAlertTriangle
                size={32}
                className="text-red-600 dark:text-red-400"
              />
            </div>

            <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              Something went wrong
            </h1>

            <p className="mb-6 text-gray-600 dark:text-gray-400">
              We encountered an unexpected error. Please try refreshing the
              page.
            </p>

            {this.state.error && (
              <div className="mb-6 rounded-lg bg-gray-100 p-4 text-left dark:bg-gray-800">
                <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Error Details:
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={this.handleReset} className="gap-2">
                <IconRefresh size={16} />
                Refresh Page
              </Button>

              <Button
                variant="outline"
                onClick={() => (window.location.href = "/")}
              >
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
