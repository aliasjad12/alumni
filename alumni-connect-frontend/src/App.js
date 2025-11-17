import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AlumniDashboard from "./pages/AlumniDashboard";
import StudentHome from "./pages/StudentHome";
import JobBoard from "./pages/JobBoard";
import AlumniProfile from "./pages/AlumniProfile";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/alumni-dashboard" element={<AlumniDashboard />} />
        <Route path="/alumni/:id" element={<AlumniProfile />} />
        <Route path="/student-home" element={<StudentHome />} />
        <Route path="/job-board" element={<JobBoard />} /> 
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
