import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Authentication
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';

// Customer
import Home from './pages/Home/Home';
import Marketplace from './pages/Marketplace/Marketplace';
import CompanyProfile from './pages/CompanyProfile/CompanyProfile';
import QuoteReview from './pages/QuoteReview/QuoteReview';
import ApplicationSent from './pages/ApplicationSent/ApplicationSent';
import CustomerJobs from './pages/CustomerJobs/CustomerJob';
import CreateJob from './pages/CreateJob/CreateJob';
import CustomerJobDetails from './pages/CustomerJobDetail/CustomerJobDetail';

// Company
import CompanyJobs from './pages/CompanyJobs/CompanyJobs';
import CompanyJobManagement from './pages/CompanyJobManagement/CompanyJobManagement';
import CompanyApplications from './pages/CompanyApplications/CompanyApplication';
import CompanyWorkforce from './pages/CompanyWorkforce/CompanyWorkforce';

// Admin
import AdminPortal from './pages/AdminPortal/AdminPortal';

// Context
import { WorkforceProvider } from './context/WorkforceContext';
import { CustomerJobsProvider } from './context/CustomerJobsContext';

// Global styles
import './theme/theme.css';

function App() {
  return (
    <WorkforceProvider>
      <CustomerJobsProvider>
        <BrowserRouter>
          <Routes>
            {/* =========================
                AUTHENTICATION
            ========================== */}

            <Route
              path="/"
              element={<Login />}
            />

            <Route
              path="/signup"
              element={<SignUp />}
            />

            {/* =========================
                CUSTOMER
            ========================== */}

            <Route
              path="/home"
              element={<Home />}
            />

            <Route
              path="/marketplace"
              element={<Marketplace />}
            />

            <Route
              path="/companies/:id"
              element={<CompanyProfile />}
            />

            <Route
              path="/quotes/:id"
              element={<QuoteReview />}
            />

            <Route
              path="/applications/:reference/sent"
              element={<ApplicationSent />}
            />

            <Route
              path="/my-jobs"
              element={<CustomerJobs />}
            />

            <Route
              path="/my-jobs/new"
              element={<CreateJob />}
            />

            <Route
              path="/my-jobs/:jobId"
              element={<CustomerJobDetails />}
            />

            {/* =========================
                COMPANY
            ========================== */}

            <Route
              path="/company/jobs"
              element={<CompanyJobs />}
            />

            <Route
              path="/company/jobs/:jobId"
              element={<CompanyJobManagement />}
            />

            <Route
              path="/company/applications"
              element={<CompanyApplications />}
            />

            <Route
              path="/company/workforce"
              element={<CompanyWorkforce />}
            />

            {/* =========================
                ADMIN
            ========================== */}

            <Route
              path="/admin"
              element={<AdminPortal />}
            />
          </Routes>
        </BrowserRouter>
      </CustomerJobsProvider>
    </WorkforceProvider>
  );
}

export default App;