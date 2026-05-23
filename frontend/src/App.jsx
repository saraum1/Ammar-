import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import RoleSelection from './pages/RoleSelection';
import RegisterClient from './pages/RegisterClient';
import RegisterCompany from './pages/RegisterCompany';
import UploadCRDoc from './pages/UploadCRDoc';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ChangePassword from './pages/ChangePassword';
import EngineeringCompanies from './pages/EngineeringCompanies';
import ContractingCompanies from './pages/ContractingCompanies';
import BuildingMaterials from './pages/BuildingMaterials';
import MyProjects from './pages/MyProjects';
import ProjectDetail from './pages/ProjectDetail';
import CompanyDetail from './pages/CompanyDetail';
import Notes from './pages/Notes';
import AdminPanel from './pages/AdminPanel';
import CompanyDashboard from './pages/CompanyDashboard';
import ClientProfile from './pages/ClientProfile';
import Favorites from './pages/Favorites';
import Meetings from './pages/Meetings';
import MyOrders from './pages/MyOrders';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/"               element={<Home />} />
          <Route path="/login"          element={<Login />} />
          <Route path="/register/role"  element={<RoleSelection />} />
          <Route path="/register/client"  element={<RegisterClient />} />
          <Route path="/register/company" element={<RegisterCompany />} />
          <Route path="/upload-cr-doc"     element={<UploadCRDoc />} />
          <Route path="/forgot-password"  element={<ForgotPassword />} />
          <Route path="/reset-password"   element={<ResetPassword />} />
          <Route path="/change-password"  element={<ChangePassword />} />
          <Route path="/engineering"  element={<EngineeringCompanies />} />
          <Route path="/contracting"  element={<ContractingCompanies />} />
          <Route path="/materials"    element={<BuildingMaterials />} />
          <Route path="/my-projects"           element={<MyProjects />} />
          <Route path="/my-projects/:id"       element={<ProjectDetail />} />
          <Route path="/companies/:id"         element={<CompanyDetail />} />
          <Route path="/notes"                 element={<Notes />} />
          <Route path="/admin"                 element={<AdminPanel />} />
          <Route path="/company/dashboard"     element={<CompanyDashboard />} />
          <Route path="/profile"               element={<ClientProfile />} />
          <Route path="/favorites"             element={<Favorites />} />
          <Route path="/meetings"              element={<Meetings />} />
          <Route path="/my-orders"             element={<MyOrders />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;