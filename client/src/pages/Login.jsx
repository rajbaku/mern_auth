import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const InputField = ({ name, value, onChange, placeholder, type, icon }) => (
  <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
    <img src={icon} alt={`${name} Icon`} />
    <input
      name={name}
      value={value}
      onChange={onChange}
      type={type}
      className="bg-transparent outline-none w-full"
      placeholder={placeholder}
      aria-label={name}
    />
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsloggedin, getUserData } = useContext(AppContext);

  const [state, setState] = useState("SignUp");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmission = async (e) => {
    e.preventDefault();

    const endpoint = state === "SignUp" ? "/api/auth/register" : "/api/auth/login";
    const payload =
      state === "SignUp"
        ? formData
        : { email: formData.email, password: formData.password };

    try {
      axios.defaults.withCredentials = true;
      const response = await axios.post(`${backendUrl}${endpoint}`, payload);

      if (response.data?.success) {
        setIsloggedin(true);
        getUserData();
        navigate("/");
        toast.success(response.data?.message);
      } else {
        toast.error(response.data?.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "Network error. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="Logo"
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
        aria-label="Home"
      />
      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
        <h2 className="text-3xl font-semibold text-white text-center mb-3">
          {state === "SignUp" ? "Create Account" : "Login"}
        </h2>
        <p className="text-center text-sm mb-6">
          {state === "SignUp" ? "Sign Up to Get Started" : "Login to Your Account"}
        </p>

        <form onSubmit={handleFormSubmission}>
          {state === "SignUp" && (
            <InputField
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter Your Name"
              type="text"
              icon={assets.person_icon}
            />
          )}
          <InputField
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter Your Email"
            type="email"
            icon={assets.mail_icon}
          />
          <InputField
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter Your Password"
            type="password"
            icon={assets.lock_icon}
          />
          <p
            className="mb-4 text-indigo-500 cursor-pointer"
            onClick={() => navigate("/reset-password")}
          >
            Forgot Password?
          </p>
          <button
            type="submit"
            className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium"
          >
            {state === "SignUp" ? "Sign Up" : "Login"}
          </button>
        </form>
        <p className="text-gray-400 text-center text-xs mt-4">
          {state === "SignUp" ? (
            <>
              Already have an account?{" "}
              <span
                onClick={() => setState("Login")}
                className="text-blue-400 cursor-pointer underline"
              >
                Login here
              </span>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <span
                onClick={() => setState("SignUp")}
                className="text-blue-400 cursor-pointer underline"
              >
                Sign Up here
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default Login;
