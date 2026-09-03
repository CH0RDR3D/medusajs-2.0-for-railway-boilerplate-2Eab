"use client"

import React, { ReactNode } from "react"
import { Heading, Text, Button } from "@medusajs/ui"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
  /** When any value in this array changes, a previously caught error is cleared automatically. */
  resetKeys?: unknown[]
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary for Checkout Components
 * Prevents "Something went wrong!" page crashes and provides graceful fallback UI.
 * Wraps critical checkout sections to isolate failures.
 */
export default class CheckoutErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[Checkout Error]", error, errorInfo)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (!this.state.hasError || !this.props.resetKeys) {
      return
    }

    const prevKeys = prevProps.resetKeys || []
    const changed = this.props.resetKeys.some((key, i) => key !== prevKeys[i])
    if (changed) {
      this.handleReset()
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <Heading level="h3" className="text-red-800 mb-2">
              Unable to Load
            </Heading>
            <Text className="text-red-700 mb-4">
              {this.state.error?.message || "An error occurred. Please try again."}
            </Text>
            <Button onClick={this.handleReset} variant="primary">
              Try Again
            </Button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
