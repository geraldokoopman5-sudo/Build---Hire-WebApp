import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import './theme/theme.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* <Route path="/signup" element={<SignUp />} /> — coming next */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;