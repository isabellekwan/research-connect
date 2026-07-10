import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import CreateStudy from './features/study_creator/CreateStudy';

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: '12px' }}>
        <Link to="/">Home</Link> | <Link to="/studies/new">Create Study</Link>
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
        <Route path="/studies/new" element={<CreateStudy />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;