import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';
import Home from './pages/Home/Home';
import Marketplace from './pages/Marketplace/Marketplace';
import CompanyProfile from './pages/CompanyProfile/CompanyProfile';
import QuoteReview from './pages/QuoteReview/QuoteReview';
import CompanyJobs from './pages/CompanyJobs/CompanyJobs';
import CompanyWorkforce from './pages/CompanyWorkforce/CompanyWorkforce';
import ApplicationSent from './pages/ApplicationSent/ApplicationSent';
import AdminPortal from './pages/AdminPortal/AdminPortal';
import CompanyJobManagement from './pages/CompanyJobManagement/CompanyJobManagement';
import './theme/theme.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/companies/:id" element={<CompanyProfile />} />
        <Route path="/quotes/:id" element={<QuoteReview />} />
        <Route path="/company/jobs" element={<CompanyJobs />} />
        <Route path="/company/jobs/:jobId" element={<CompanyJobManagement />}
        />
        <Route path="/company/workforce" element={<CompanyWorkforce />} />
        <Route
          path="/applications/:reference/sent"
          element={<ApplicationSent />}
        />
        <Route path="/admin" element={<AdminPortal />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;