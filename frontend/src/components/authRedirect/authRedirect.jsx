import { useEffect } from "react";
import { useNavigate,} from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const AuthRedirect = () => {
  const navigate = useNavigate();
  const { currentUser, login } = useAuth();

  useEffect(() => {
    const authenticateUser = async () => {
      setIsLoading(true);
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");
        const user = urlParams.get("user");

        if (!token) {
          throw new Error("No token found in URL.");
        }

        localStorage.setItem("token", token);
        login(token, user);
        navigate("/");
      } catch (error) {
        console.error("Error in google callback:", error);
      } finally {
        setIsLoading(false);
      }
    };
    authenticateUser();
  }, [currentUser, navigate, token, user]);
};

export default AuthRedirect;
