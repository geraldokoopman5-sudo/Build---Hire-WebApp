import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';

import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';

import Home from './pages/Home/Home';
import Marketplace from './pages/Marketplace/Marketplace';
import CompanyProfile from './pages/CompanyProfile/CompanyProfile';
import QuoteReview from './pages/QuoteReview/QuoteReview';
import ApplicationSent from './pages/ApplicationSent/ApplicationSent';

import CustomerJobs from './pages/CustomerJobs/CustomerJob';
import CreateJob from './pages/CreateJob/CreateJob';
import CustomerJobDetails from './pages/CustomerJobDetail/CustomerJobDetail';

import CompanyJobs from './pages/CompanyJobs/CompanyJobs';
import CompanyJobManagement from './pages/CompanyJobManagement/CompanyJobManagement';
import CompanyApplications from './pages/CompanyApplications/CompanyApplication';
import CompanyWorkforce from './pages/CompanyWorkforce/CompanyWorkforce';

import AdminPortal from './pages/AdminPortal/AdminPortal';

import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

import {
  AccountType,
} from './types/enums';

import { WorkforceProvider } from './context/WorkforceContext';
import {
  CustomerJobsProvider,
} from './context/CustomerJobsContext';

import './theme/theme.css';

function App() {
  return (
    <WorkforceProvider>
      <CustomerJobsProvider>
        <BrowserRouter>
          <Routes>
            {/* =========================
                PUBLIC ROUTES
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
                CUSTOMER ROUTES
            ========================== */}

            <Route element={<ProtectedRoute allowedRoles={[AccountType.Customer]} />}>
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
            </Route>

            {/* =========================
                COMPANY ROUTES
            ========================== */}

            <Route element={<ProtectedRoute allowedRoles={[AccountType.Company]} />}>
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
            </Route>

            {/* =========================
                ADMIN ROUTES
            ========================== */}

            <Route element={<ProtectedRoute allowedRoles={[AccountType.Admin]} />}>
              <Route
                path="/admin"
                element={<AdminPortal />}
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </CustomerJobsProvider>
    </WorkforceProvider>
  );
}

export default App;