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

function AppContent() {
  const location = useLocation();
  const showNavigation = ["/signIn", "/register"].includes(location.pathname);

  const showFooter = ["/inbox", "/signIn", "/register"].includes(
    location.pathname
  );

  return (
    <>
      {!showNavigation && <Navigation />}
      <Routes>
        <Route path="/" element={<ProtectedRoute element={HomePage} />} />
        <Route path="/signIn" element={<PublicRoute element={SignInPage} />} />
        <Route
          path="/register"
          element={<PublicRoute element={RegisterationPage} />}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute element={CurrentUserProfile} />}
        />
        <Route path="/inbox" element={<ProtectedRoute element={Inbox} />} />
        <Route
          path="/create_service"
          element={<ProtectedRoute element={CreateService} />}
        />
        <Route
          path="/enhancedProposalPage"
          element={<ProtectedRoute element={EnhancedProposalPage} />}
        />
        <Route
          path="/category/:mainCategory/:subCategory"
          element={<ProtectedRoute element={CategoryGigResults} />}
        />
        <Route
          path="/service/:serviceId/edit"
          element={<ProtectedRoute element={EditService} />}
        />
        <Route
          path="/services"
          element={<ProtectedRoute element={ListServices} />}
        />
        <Route
          path="/service/:serviceId/chat"
          element={<ProtectedRoute element={CUGigDetails} />}
        />
        <Route
          path="/service/:serviceId"
          element={<ProtectedRoute element={ViewServiceDetails} />}
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
