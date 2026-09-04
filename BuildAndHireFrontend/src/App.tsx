import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';
import Marketplace from './pages/Marketplace/Marketplace';
import CompanyProfile from './pages/CompanyProfile/ComapanyProfile';
import QuoteReview from './pages/QuoteReview/QuoteReview';
import CompanyJobs from './pages/CompanyJobs/CompanyJobs';
import './theme/theme.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/companies/:id" element={<CompanyProfile />} />
        <Route path="/quotes/:id" element={<QuoteReview />} />
        <Route path="/company/jobs" element={<CompanyJobs />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;