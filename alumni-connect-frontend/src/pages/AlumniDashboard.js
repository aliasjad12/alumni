import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Chatbox from "../components/Chatbox";  // Import Chatbox

const AlumniDashboard = () => {
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [jobForm, setJobForm] = useState({ title: "", company: "", location: "", description: "", contactNumber: "" });
  const [editJob, setEditJob] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editProfile, setEditProfile] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/");

      try {
        const res = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setEditProfile(res.data);

        const jobsRes = await axios.get("http://localhost:5000/api/jobs", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setJobs(jobsRes.data.filter(job => job.postedBy.email === res.data.email));
      } catch (error) {
        navigate("/");
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put("http://localhost:5000/api/users/profile", editProfile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setEditProfile(res.data);
      setShowProfileModal(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to update profile.");
    }
  };

  const handlePostJob = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/jobs/post", jobForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setJobs([...jobs, res.data.job]);
      setJobForm({ title: "", company: "", location: "", description: "", contactNumber: "" });

      alert("Job posted successfully!");
    } catch (error) {
      console.error("Error posting job:", error.response ? error.response.data : error.message);
      alert("Failed to post job. Check console for details.");
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setJobs(jobs.filter(job => job._id !== jobId));
      alert("Job deleted!");
    } catch (error) {
      alert("Failed to delete job.");
    }
  };

  const handleEditJob = (job) => {
    setEditJob(job);
    setShowEditModal(true);
  };

  const handleUpdateJob = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/jobs/${editJob._id}`, editJob, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setJobs(jobs.map(job => (job._id === editJob._id ? editJob : job)));
      setShowEditModal(false);
      alert("Job updated successfully!");
    } catch (error) {
      alert("Failed to update job.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Alumni Dashboard</h2>
          <button 
            onClick={handleLogout} 
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* Profile Section */}
        <div className="p-4 bg-gray-50 rounded-lg mb-4">
          {user && (
            <>
              <h3 className="text-xl font-semibold">Profile</h3>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Bio:</strong> {user.bio || "No bio available"}</p>
              <button
                className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md"
                onClick={() => setShowProfileModal(true)}
              >
                Edit Profile
              </button>
            </>
          )}
        </div>

        {/* Job Posting Section */}
        <div className="p-4 bg-gray-50 rounded-lg mb-4">
          <h3 className="text-xl font-semibold">Post a Job</h3>
          <input type="text" placeholder="Job Title" className="w-full p-2 border rounded mt-2"
            value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} />
          <input type="text" placeholder="Company" className="w-full p-2 border rounded mt-2"
            value={jobForm.company} onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })} />
          <input type="text" placeholder="Location" className="w-full p-2 border rounded mt-2"
            value={jobForm.location} onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} />
          <input type="text" placeholder="Contact Number" className="w-full p-2 border rounded mt-2"
            value={jobForm.contactNumber} onChange={(e) => setJobForm({ ...jobForm, contactNumber: e.target.value })} />
          <textarea placeholder="Job Description" className="w-full p-2 border rounded mt-2"
            value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}></textarea>
          <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md" onClick={handlePostJob}>
            Post Job
          </button>
        </div>

        {/* Jobs List */}
        <h3 className="text-xl font-semibold">Your Posted Jobs</h3>
        {jobs.map(job => (
          <div key={job._id} className="p-3 border rounded-lg mt-2 bg-white">
            <h4 className="text-lg font-semibold">{job.title} at {job.company}</h4>
            <p>{job.location}</p>
            <p>{job.description}</p>
            <button className="bg-yellow-500 px-3 py-1 text-white rounded mr-2" onClick={() => handleEditJob(job)}>
              Edit
            </button>
            <button className="bg-red-500 px-3 py-1 text-white rounded" onClick={() => handleDeleteJob(job._id)}>
              Delete
            </button>
          </div>
        ))}

        {/* Edit Job Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-xl font-bold mb-4">Edit Job</h2>
              <input type="text" className="w-full p-2 border rounded mb-2"
                value={editJob.title} onChange={(e) => setEditJob({ ...editJob, title: e.target.value })} />
              <textarea className="w-full p-2 border rounded mb-2"
                value={editJob.description} onChange={(e) => setEditJob({ ...editJob, description: e.target.value })}></textarea>
              <button className="bg-green-500 text-white px-4 py-2 rounded-md" onClick={handleUpdateJob}>Update</button>
            </div>
          </div>
        )}

        {/* Edit Profile Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
              <input type="text" placeholder="Name" className="w-full p-2 border rounded mb-2"
                value={editProfile.name} onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })} />
              <input type="text" placeholder="Bio" className="w-full p-2 border rounded mb-2"
                value={editProfile.bio} onChange={(e) => setEditProfile({ ...editProfile, bio: e.target.value })} />
              <div className="flex justify-end gap-2">
                <button className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500" onClick={() => setShowProfileModal(false)}>Cancel</button>
                <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600" onClick={handleUpdateProfile}>Save</button>
              </div>
            </div>
          </div>
        )}
            
            <Chatbox currentUser={{ _id: localStorage.getItem("userId"), name: "alumni" }} />
      </div>
      
    </div>
  );
};

export default AlumniDashboard;
