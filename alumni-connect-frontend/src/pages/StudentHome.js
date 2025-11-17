import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Chatbox from "../components/Chatbox";

const StudentHome = () => {
  const [alumni, setAlumni] = useState([]);
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/alumni");
        setAlumni(res.data);
      } catch (error) {
        console.error("Error fetching alumni:", error);
      }
    };

    const fetchJobs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/jobs");
        setJobs(res.data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };

    fetchAlumni();
    fetchJobs();
  }, []);

  const filteredAlumni = alumni.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <h2 className="text-3xl font-bold mb-6">Alumni Directory</h2>
      <button 
            onClick={handleLogout} 
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
          >
            Logout
          </button>
      <input
        type="text"
        placeholder="Search alumni..."
        className="w-1/2 px-4 py-2 mb-4 border rounded shadow-md focus:outline-none"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="w-full max-w-4xl">
        <h3 className="text-2xl font-semibold mb-4">Alumni List</h3>
        {filteredAlumni.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAlumni.map((alum) => (
              <div key={alum._id} className="bg-white shadow-md rounded-lg p-4 hover:shadow-xl transition">
                <h3 className="text-xl font-bold">{alum.name}</h3>
                <p className="text-gray-600">{alum.bio}</p>
                <Link to={`/alumni/${alum._id}`} className="text-blue-500 hover:underline">
                  View Profile
                </Link>
                {alum.cvPath && (
      <a 
        href={`http://localhost:5000/${alum.cvPath}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block mt-2 text-green-600 underline"
      >
        View CV
      </a>
    )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No alumni found</p>
        )}
      </div>

      <div className="w-full max-w-4xl mt-8">
        <h3 className="text-2xl font-semibold mb-4">Latest Jobs</h3>
        {jobs.length === 0 ? (
          <p className="text-gray-500">No jobs available</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <div key={job._id} className="p-4 border rounded-lg bg-white shadow-md hover:shadow-lg transition">
                <h3 className="text-xl font-semibold">{job.title} at {job.company}</h3>
                <p className="text-gray-600">{job.location}</p>
                <p className="text-gray-700">{job.description}</p>
                <p><strong>Contact:</strong> {job.contactNumber}</p>
                <p className="text-sm text-gray-500">Posted by: {job.postedBy.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <Chatbox currentUser={{ _id: localStorage.getItem("userId"), name: "Student" }} />
    </div>

  );
};

export default StudentHome;
