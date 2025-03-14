
import { SignIn } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const SignInPage = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isSignedIn) {
      navigate("/dashboard");
    } else {
      setIsLoading(false);
    }
  }, [isSignedIn, navigate]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center bg-slate-50 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-slate-900">Welcome Back</h1>
            <p className="text-slate-600 mt-2">Sign in to access your screenplays</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200">
            <SignIn routing="path" path="/sign-in" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SignInPage;
