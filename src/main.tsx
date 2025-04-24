import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initApp } from './lib/supabase'

// Wrapper component that initializes the app
const AppInitializer = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const success = await initApp();
        if (success) {
          setIsInitialized(true);
        } else {
          setError('Failed to initialize app. Please check your connection and try again.');
        }
      } catch (err) {
        console.error('Initialization error:', err);
        setError('An unexpected error occurred during initialization.');
      }
    };

    initialize();
  }, []);

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        maxWidth: '500px', 
        margin: '100px auto',
        backgroundColor: '#f8d7da',
        color: '#721c24',
        borderRadius: '5px'
      }}>
        <h2>Initialization Error</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#721c24',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        maxWidth: '500px', 
        margin: '100px auto' 
      }}>
        <h2>Initializing Application...</h2>
        <p>Please wait while we set up the application.</p>
      </div>
    );
  }

  return <App />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppInitializer />
  </StrictMode>,
)
