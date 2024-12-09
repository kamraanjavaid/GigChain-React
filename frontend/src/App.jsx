import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import HomePage from "./pages/HomePage/home";
import SignInPage from "./pages/Authentication/SignIn/signInForm";
import CurrentUserProfile from "./pages/Profile/currentUserProfile";
import UserProfile from "./pages/UserProfile/userProfile";
import Inbox from "./pages/Inbox/inboxChatProvider";
import CategoryGigResults from "./pages/CategoryGigResults/categoryGigResults";
import CUGigDetails from "./pages/cuGigDetails/cuGigDetails";
import RegisterationPage from "./pages/Authentication/Register/registerationForm";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import PublicRoute from "./auth/PublicRoute";
import ListServices from "./pages/Service/ListServices/listServices";
import EditService from "./pages/Service/EditService/editService";
import ViewServiceDetails from "./pages/Service/ViewServiceDetails/viewServiceDetailsChatProvider";
import CreateService from "./pages/Service/CreateNewService/createNewService";
import Navigation from "../src/components/navigation/navigation";
import Footer from "../src/components/footer/footer";
import "./App.css";
import { ChatProvider } from "./contexts/ChatContext";
import EnhancedProposalPage from "./components/enhancedProposalPage/enhancedProposalPage";
import Projects from "./pages/Projects/projects";
import ProjectDetails from "./pages/ProjectDetails/projectDetails";
import AuthRedirect from "./components/authRedirect/authRedirect";
import { useAuth } from "./contexts/AuthContext";
import ViewFreelancerService from "./pages/Service/ViewFreelancerService/viewFreelancerService";
import FreelancerProfile from "./pages/Profile/freelancer/freelancer_profile";

function AppContent() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const showNavigation = ["/signIn", "/register"].includes(location.pathname);

  const showFooter = ["/inbox", "/signIn", "/register"].includes(
    location.pathname
  );

  return (
    <>
      {!showNavigation && <Navigation key={currentUser?.userType} />}
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={["employer"]} element={HomePage} />
          }
        />
        <Route path="/signIn" element={<PublicRoute element={SignInPage} />} />
        <Route path="/auth/success/:token/:user" element={<AuthRedirect />} />
        <Route
          path="/register"
          element={<PublicRoute element={RegisterationPage} />}
        />
        <Route
          path="/employer-profile"
          element={
            <ProtectedRoute
              allowedRoles={["employer"]}
              element={CurrentUserProfile}
            />
          }
        />
        <Route
          path="/freelancer-profile"
          element={
            <ProtectedRoute
              allowedRoles={["freelancer"]}
              element={FreelancerProfile}
            />
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute
              allowedRoles={["freelancer", "employer"]}
              element={Projects}
            />
          }
        />
        <Route
          path="/projects/:projectId"
          element={<ProtectedRoute element={ProjectDetails} />}
        />
        <Route path="/inbox" element={<ProtectedRoute element={Inbox} />} />
        <Route
          path="/create-service"
          element={
            <ProtectedRoute
              allowedRoles={["freelancer"]}
              element={CreateService}
            />
          }
        />

        {/* <Route
          path="/freelancer-service/:serviceId"
          element={
            <ProtectedRoute
              allowedRoles={["freelancer"]}
              element={ViewFreelancerService}
            />
          }
        /> */}

        <Route
          path="/enhancedProposalPage"
          element={<ProtectedRoute element={EnhancedProposalPage} />}
        />
        <Route
          path="/category/:mainCategory/:subCategory"
          element={
            <ProtectedRoute
              allowedRoles={["employer"]}
              element={CategoryGigResults}
            />
          }
        />
        <Route
          path="/service/:serviceId/edit"
          element={
            <ProtectedRoute
              allowedRoles={["freelancer"]}
              element={EditService}
            />
          }
        />
        <Route
          path="/services"
          element={
            <ProtectedRoute
              allowedRoles={["freelancer"]}
              element={ListServices}
            />
          }
        />
        <Route
          path="/service/:serviceId/chat"
          element={<ProtectedRoute element={CUGigDetails} />}
        />
        <Route
          path="/service/:serviceId"
          element={
            <ProtectedRoute
              allowedRoles={["employer"]}
              element={ViewServiceDetails}
            />
          }
        />
        <Route
          path="/freelancer/service/:serviceId"
          element={
            <ProtectedRoute
              allowedRoles={["freelancer"]}
              element={ViewFreelancerService}
            />
          }
        />

        <Route
          path="/user/:userId"
          element={<ProtectedRoute element={UserProfile} />}
        />
      </Routes>
      {!showFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ChatProvider>
          <AppContent />
        </ChatProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
