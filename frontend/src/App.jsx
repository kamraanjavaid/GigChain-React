import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage/home";
import SignInPage from "./pages/SignIn/signInForm";
import CurrentUserProfile from "./pages/Profile/currentUserProfile";
import UserProfile from "./pages/UserProfile/userProfile";
import Inbox from "./pages/Inbox/inbox";
import CreateGig from "./pages/CreateGig/createGig";
import ViewGig from "./pages/ShowGigs/showGigs";
import GigDetails from "./pages/GigDetails/gigDetails";
import CUGigDetails from "./pages/cuGigDetails/cuGigDetails";
import RegisterationPage from "./pages/Register/registerationForm";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import PublicRoute from "./auth/PublicRoute";
import EditGig from "./pages/EditGig/editGig";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<ProtectedRoute element={HomePage} />} />
          <Route path="/signIn" element={<PublicRoute element= {SignInPage} />} />
          <Route path="/register" element={<PublicRoute element={RegisterationPage} />} />
          <Route path="/profile" element={<ProtectedRoute element={CurrentUserProfile}/>}/>
          <Route path="/inbox" element={<ProtectedRoute element={Inbox}/>}/>
          <Route path="/create_gig" element={<ProtectedRoute element={CreateGig}/>}/>
          <Route path="/gig/:gigId/edit" element={<ProtectedRoute element={EditGig}/>}/> 
          <Route path="/gigs" element={<ProtectedRoute element={ViewGig}/>}/>
          <Route path='/gig/:gigId/cu' element={<ProtectedRoute element={CUGigDetails} />}/>
          <Route path="/gig/:gigId" element={<ProtectedRoute element={GigDetails} />}/>
          <Route path="/user/:userId" element={<ProtectedRoute element={UserProfile} />}/>

          {/* <Route path="/work" element={<ProtectedRoute element={ProjectsPage} />} /> */}
          {/* <Route path="/projectDetails" element={<ProjectDetailsPage />} /> */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
