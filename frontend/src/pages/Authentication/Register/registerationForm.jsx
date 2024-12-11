import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./styles/registerationForm.module.scss";
import { Link } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

export default function RegistrationForm() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { login, loginGoogle } = useAuth();
  const [emailVerified, setEmailVerified] = useState(false);
  const [notification, setNotification] = useState({
    message: "",
    type: "",
  });
  const [isEmailVerificationSent, setIsEmailVerificationSent] = useState(false);
  const [remainingTime, setRemainingTime] = useState(60);
  const [verificationCode, setVerificationCode] = useState("");
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  // const isResendDisabled = remainingTime > 0;  ]=[-0987654321]0

  const handleChangeEmail = () => {
    setEmailVerified(false);
    setIsEmailVerificationSent(false);
    setVerificationCode("");
    setNotification({ message: "", type: "" });
  };

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleGoogleSuccess = async (response) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/register-google`,
        { tokenId: response.credential, userType: userData.userType }
      );
      console.log("Response from Google registration:", res.data);
      alert("Registration with Google successful, redirecting to home page");
      const { token, user } = res.data;
      login({ token, user });
      // localStorage.setItem("token", token);
      navigate("/");
    } catch (error) {
      console.error("Error registering with Google", error);
      alert("Error registering with Google");
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();

    if (!userData.email) {
      alert("Email is required to verify the code.");
      return;
    }
    if (!userData.verificationCode) {
      alert("Verification code is required.");
      return;
    }

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/verify-code`,
        {
          params: {
            email: userData.email,
            verificationCode: userData.verificationCode,
          },
        }
      );

      if (res.data && res.data.success) {
        handleSignIn();
      } else {
        alert(res.data.message || "Verification failed. Please try again.");
      }
    } catch (error) {
      if (error.response) {
        console.error("Error verifying code:", error.response.data);
        alert(error.response.data.message || "Verification failed.");
      } else if (error.request) {
        console.error("No response received:", error.request);
        alert(
          "No response from server. Please check your network and try again."
        );
      } else {
        console.error("Error setting up request:", error.message);
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleSignIn = async () => {
    if (!userData.email) {
      alert("Email is required to sign in.");
      return;
    }
    if (!userData.password) {
      alert("Password is required to sign in.");
      return;
    }

    try {
      const signInData = {
        email: userData.email,
        password: userData.password,
      };
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/signin`,
        signInData
      );

      if (res.data && res.data.token && res.data.user) {
        const { token, user } = res.data;
        login({ token, user });
        // localStorage.setItem("token", token);
        // localStorage.setItem("user", JSON.stringify(user));
        navigate("/");
      } else {
        alert(res.data.message || "Sign in failed. Please try again.");
      }
    } catch (error) {
      if (error.response) {
        console.error("Error signing in:", error.response.data);
        alert(error.response.data.message || "Sign in failed.");
      } else if (error.request) {
        console.error("No response received:", error.request);
        alert(
          "No response from server. Please check your network and try again."
        );
      } else {
        console.error("Error setting up request:", error.message);
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!userData.firstName) newErrors.firstName = "First name is required";
    if (!userData.lastName) newErrors.lastName = "Last name is required";
    if (!userData.email) newErrors.email = "Email is required";
    if (!userData.password) newErrors.password = "Password is required";
    if (userData.password !== userData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/register`,
        userData
      );

      console.log(res.data);

      if (res.status === 200) {
        handleSignIn();
      }
    } catch (error) {
      console.error("Registration error:", error.response.data);
      alert(error.response.data.message);
    }
  };

  const checkAvailability = async (type, value) => {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/users/check-availability`,
      { params: { [type]: value } }
    );
    return res.data.available;
  };

  const [isResendDisabled, setIsResendDisabled] = useState(false);

  const sendVerificationCode = async (email) => {
    try {
      const available = await checkAvailability("email", email);
      if (!available) {
        setErrors({ email: "Email is already in use" });
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/send-verification`,
        { email }
      );
      if (response.status === 200) {
        setIsEmailVerificationSent(true);
        setNotification({
          message: "Verification code sent to your email",
          type: "success",
        });
        setErrors({});
        setRemainingTime(60);
        setIsResendDisabled(true);
      }
    } catch (error) {
      console.error("Error sending verification code:", error);
      setNotification({
        message: "Failed to send verification code",
        type: "error",
      });
    }
  };

  const verifyCode = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/verify-code`,
        {
          email: userData.email,
          verificationCode: verificationCode,
        }
      );
      if (response.status === 200) {
        setEmailVerified(true);
        setNotification({
          message: "Email verified successfully!",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      setNotification({
        message: "Invalid verification code",
        type: "error",
      });
    }
  };

  useEffect(() => {
    let timer;
    if (remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime <= 1) {
            setIsResendDisabled(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [remainingTime]);

  return (
    <React.Fragment>
      <div className={styles.signUp_wrapper}>
        <div className={styles.parent_cont_right}>
          <div>
            <h1 className={styles.h1}>GigChain</h1>
            <p className={styles.p}>Feel the Freedom & Control</p>
            <div className={styles.signIn_link_container}>
              <Link to="/signIn" className={styles.signIn_link}>
                Already a GigChain user? Sign In
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.parent_cont_left}>
          <div className={styles.main_content_container}>
            <div className={styles.input_container}>
              <GoogleOAuthProvider
                clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
              >
                <GoogleLogin
                  buttonText="Register with Google"
                  onSuccess={handleGoogleSuccess}
                  onFailure={(error) =>
                    console.error("Google Sign-In Error", error)
                  }
                  cookiePolicy={"single_host_origin"}
                />
              </GoogleOAuthProvider>

              <div className={styles.or_container}>
                <div className={styles.line}></div>
                <div className={styles.or_text}>or</div>
                <div className={styles.line}></div>
              </div>

              <input
                className={styles.input}
                type="text"
                placeholder="First Name"
                name="firstName"
                value={userData.firstName}
                onChange={handleChange}
              />
              {errors.firstName && (
                <p className={styles.error}>{errors.firstName}</p>
              )}
              <input
                className={styles.input}
                type="text"
                placeholder="Last Name"
                name="lastName"
                value={userData.lastName}
                onChange={handleChange}
              />
              {errors.lastName && (
                <p className={styles.error}>{errors.lastName}</p>
              )}

              <div className={styles.emailVerificationContainer}>
                <div className={styles.emailInputWrapper}>
                  <input
                    type="email"
                    name="email"
                    className={`${styles.input} ${
                      emailVerified ? styles.disabled : ""
                    }`}
                    placeholder="Email"
                    value={userData.email}
                    onChange={handleChange}
                    disabled={emailVerified || isEmailVerificationSent}
                  />
                  <button
                    type="button"
                    className={styles.verifyButton}
                    onClick={
                      emailVerified
                        ? handleChangeEmail
                        : () => sendVerificationCode(userData.email)
                    }
                    disabled={
                      !userData.email ||
                      errors.email ||
                      (isEmailVerificationSent && isResendDisabled)
                    }
                  >
                    {emailVerified
                      ? "Change Email"
                      : isEmailVerificationSent
                        ? remainingTime > 0
                          ? `Resend Code (${remainingTime}s)`
                          : "Resend Code"
                        : "Verify Email"}
                  </button>
                </div>
                {errors.email && (
                  <p
                    className={styles.verifiedBadge}
                    style={{ color: "#e74c3c" }}
                  >
                    ✗ {errors.email}
                  </p>
                )}

                {isEmailVerificationSent && !emailVerified && (
                  <div className={styles.verificationCodeWrapper}>
                    <input
                      type="text"
                      placeholder="Enter verification code"
                      className={styles.input}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                    />
                    <button
                      type="button"
                      className={styles.verifyButton}
                      onClick={verifyCode}
                    >
                      Submit Code
                    </button>
                  </div>
                )}

                {emailVerified && (
                  <p className={styles.verifiedBadge}>✓ Email Verified</p>
                )}

                {notification.message && (
                  <p
                    className={styles.verifiedBadge}
                    style={{
                      color:
                        notification.type === "error" ? "#e74c3c" : "#2ecc71",
                    }}
                  >
                    {notification.type === "error" ? "✗" : "✓"}{" "}
                    {notification.message}
                  </p>
                )}
              </div>

              {/* <input
                className={styles.input}
                type="email"
                placeholder="Email"
                name="email"
                value={userData.email}
                onChange={handleChange}
              />
              {errors.email && <p className={styles.error}>{errors.email}</p>} */}
              <input
                className={styles.input}
                type="password"
                placeholder="Password"
                name="password"
                value={userData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className={styles.error}>{errors.password}</p>
              )}
              <input
                className={styles.input}
                type="password"
                placeholder="Confirm Password"
                name="confirmPassword"
                value={userData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && (
                <p className={styles.error}>{errors.confirmPassword}</p>
              )}
            </div>
            <button onClick={handleSubmit} className={styles.button_primary}>
              Register
            </button>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
