import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './Dashboard';
import DetailView from './DetailView';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Persistent Sidebar */}
        <div className="sidebar">
          <h2>🌸 Kitsu Dash</h2>
          <nav>
            <Link to="/">Dashboard</Link>
            <Link to="/">Search</Link>
            <Link to="/">About</Link>
          </nav>
        </div>

        {/* Dynamic Main Content */}
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/anime/:id" element={<DetailView />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;