import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [education, setEducation] = useState([{ degree: "", university: "", year: "" }]);
  const [workExperience, setWorkExperience] = useState([{ company: "", position: "", years: "" }]);
  const [socialLinks, setSocialLinks] = useState({ linkedin: "", github: "", website: "" });
  const [role, setRole] = useState(""); // Add this line
  const [cv, setCv] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("role", role);
    formData.append("bio", bio);
    formData.append("education", JSON.stringify(education));
    formData.append("workExperience", JSON.stringify(workExperience));
    formData.append("socialLinks", JSON.stringify(socialLinks));
    if (cv) formData.append("cv", cv);
    if (profilePicture) formData.append("profilePicture", profilePicture);
    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      console.log("Signup Successful:", response.data);
      navigate("/");
    } catch (error) {
      console.error("Signup Error:", error.response ? error.response.data : error.message);
      alert("Error signing up: " + (error.response ? error.response.data.message : error.message));
    }
  };
  

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 p-6">
      <div className="w-full max-w-2xl bg-white p-10 rounded-xl shadow-xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Create Your Account</h2>
        <form onSubmit={handleSignup} className="space-y-5">
  
          {/* Basic Info */}
          <div className="grid grid-cols-1 gap-4">
            <input type="text" placeholder="Full Name" className="input" 
              value={name} onChange={(e) => setName(e.target.value)} required />
            <input type="email" placeholder="Email Address" className="input" 
              value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" className="input" 
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
  
          {/* Bio */}
          <textarea placeholder="Write a short bio about yourself..." className="input" 
            value={bio} onChange={(e) => setBio(e.target.value)} />
  
          {/* Education Section */}
          <div>
            <h3 className="section-title">Education</h3>
            <div className="grid grid-cols-1 gap-4">
              <input type="text" placeholder="Degree" className="input"
                value={education[0].degree} onChange={(e) => setEducation([{ ...education[0], degree: e.target.value }])} />
              <input type="text" placeholder="University" className="input"
                value={education[0].university} onChange={(e) => setEducation([{ ...education[0], university: e.target.value }])} />
              <input type="number" placeholder="Graduation Year" className="input"
                value={education[0].year} onChange={(e) => setEducation([{ ...education[0], year: e.target.value }])} />
            </div>
          </div>
  
          {/* Work Experience Section */}
          <div>
            <h3 className="section-title">Work Experience</h3>
            <div className="grid grid-cols-1 gap-4">
              <input type="text" placeholder="Company Name" className="input"
                value={workExperience[0].company} onChange={(e) => setWorkExperience([{ ...workExperience[0], company: e.target.value }])} />
              <input type="text" placeholder="Position Title" className="input"
                value={workExperience[0].position} onChange={(e) => setWorkExperience([{ ...workExperience[0], position: e.target.value }])} />
              <input type="number" placeholder="Years of Experience" className="input"
                value={workExperience[0].years} onChange={(e) => setWorkExperience([{ ...workExperience[0], years: e.target.value }])} />
                <label>Upload Cv</label>
                <input
  type="file"
  accept=".pdf,.doc,.docx"
  onChange={(e) => setCv(e.target.files[0])}
  className="input"
/>
<label>Profile Pic</label>
<input
  type="file"
  accept="image/*"
  onChange={(e) => setProfilePicture(e.target.files[0])}
  className="input"
/>

            </div>
          </div>
  
          {/* Social Links */}
          <div>
            <h3 className="section-title">Social Profiles</h3>
            <div className="grid grid-cols-1 gap-4">
              <input type="text" placeholder="LinkedIn URL" className="input"
                value={socialLinks.linkedin} onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })} />
              <input type="text" placeholder="GitHub URL" className="input"
                value={socialLinks.github} onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })} />
              <input type="text" placeholder="Personal Website (optional)" className="input"
                value={socialLinks.website} onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })} />
            </div>
          </div>
  
          {/* Role Selection */}
          <div>
            <select className="input" value={role} onChange={(e) => setRole(e.target.value)} required>
              <option value="">Select Role</option>
              <option value="alumni">Alumni</option>
              <option value="student">Student</option>
            </select>
          </div>
  
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 text-white bg-blue-600 hover:bg-blue-700 font-semibold rounded-lg transition"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
  
};

export default Signup;
