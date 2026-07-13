import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AnalyticsDashboard } from './features/analytics/AnalyticsDashboard';

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: '12px' }}>
        <Link to="/">Home</Link> | <Link to="/analytics">Analytics</Link>
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            <main className="flex min-h-screen justify-center items-center">
              Hello World!
            </main>
          }
        />
        
        <Route path="/analytics" element={<AnalyticsDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
