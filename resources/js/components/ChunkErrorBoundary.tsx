import { Component, type ReactNode } from 'react';

interface ChunkErrorBoundaryProps {
  children: ReactNode;
}

interface ChunkErrorBoundaryState {
  failed: boolean;
}

/** Catches a lazy-loaded page that could not be fetched (offline, or an old tab after a new deploy) and offers a reload. */
export default class ChunkErrorBoundary extends Component<ChunkErrorBoundaryProps, ChunkErrorBoundaryState> {
  state: ChunkErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ChunkErrorBoundaryState {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div role="alert" style={{ maxWidth: 480, margin: '0 auto', padding: '80px 16px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
          This page could not load
        </p>
        <p style={{ color: '#80808C', fontFamily: 'Inter, sans-serif', fontSize: 14, marginBottom: 28 }}>
          Check your connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: '#FF2D78',
            color: '#fff',
            fontFamily: 'Outfit, sans-serif',
            fontSize: 14,
            fontWeight: 700,
            border: 'none',
            borderRadius: 9999,
            padding: '12px 32px',
            cursor: 'pointer',
          }}
        >
          Reload
        </button>
      </div>
    );
  }
}
