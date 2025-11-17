import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchJobs();
    fetchUsers();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/admin/jobs");
      setJobs(data);
    } catch (error) {
      console.error("Error fetching jobs", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/admin/users");
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  const deleteJob = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/jobs/${id}`);
      setJobs(jobs.filter((job) => job._id !== id));
    } catch (error) {
      console.error("Error deleting job", error);
    }
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`);
      setUsers(users.filter((user) => user._id !== id));
    } catch (error) {
      console.error("Error deleting user", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-6">Admin Dashboard</h1>

      {/* Jobs Management */}
      <div className="bg-white shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Manage Job Posts</h2>
        {jobs.map((job) => (
          <div key={job._id} className="p-4 border-b">
            <p className="font-bold">{job.title} at {job.company}</p>
            <p>{job.description}</p>
            <button
              onClick={() => deleteJob(job._id)}
              className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
            >
              Delete Job
            </button>
          </div>
        ))}
      </div>

      {/* Users Management */}
      <div className="bg-white shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Manage Users</h2>
        {users.map((user) => (
          <div key={user._id} className="p-4 border-b">
            <p className="font-bold">{user.name} ({user.role})</p>
            <p>Email: {user.email}</p>
            <button
              onClick={() => deleteUser(user._id)}
              className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
            >
              Delete User
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
