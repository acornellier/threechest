import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react'
import { ErrorPage } from './ErrorPage.tsx'

interface Props {
  children?: ReactNode
}

interface State {
  errors: Array<{ error: Error; info: ErrorInfo }>
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    errors: [],
  }

  public componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState((state) => ({
      errors: [...state.errors, { error, info }],
    }))
  }

  public render() {
    return this.state.errors.length ? <ErrorPage errors={this.state.errors} /> : this.props.children
  }
}
