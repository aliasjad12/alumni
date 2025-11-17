import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Chatbox from "../components/Chatbox";

const AlumniProfile = () => {
  const { id } = useParams();
  const [alumni, setAlumni] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlumniProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/alumni/${id}`);
        setAlumni(res.data);
      } catch (error) {
        console.error("Error fetching alumni profile:", error);
      }
      setLoading(false);
    };

    fetchAlumniProfile();
  }, [id]);

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (!alumni) return <p className="text-center text-red-500">No alumni found</p>;

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-xl p-8 space-y-8">
        {/* Profile Header */}
        <div className="flex items-center space-x-6">
          <img
  src={
    alumni.profilePicture
      ? `http://localhost:5000/uploads/profilePics/${alumni.profilePicture}`
      : "https://via.placeholder.com/100"
  }
  alt={alumni.name}
  className="w-24 h-24 rounded-full border object-cover"
/>

          <div>
            <h2 className="text-3xl font-semibold">{alumni.name}</h2>
            <p className="text-gray-600 mt-1">{alumni.bio || "No bio available."}</p>
          </div>
        </div>

        {/* Education */}
        <div>
          <h3 className="text-xl font-bold border-b pb-1 mb-2">🎓 Education</h3>
          {alumni.education.length > 0 ? (
            <ul className="space-y-1">
              {alumni.education.map((edu) => (
                <li key={edu._id} className="text-gray-700">
                  <span className="font-medium">{edu.degree}</span> at {edu.university} ({edu.year})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No education details available.</p>
          )}
        </div>

        {/* Work Experience */}
        <div>
          <h3 className="text-xl font-bold border-b pb-1 mb-2">💼 Work Experience</h3>
          {alumni.workExperience.length > 0 ? (
            <ul className="space-y-1">
              {alumni.workExperience.map((work) => (
                <li key={work._id} className="text-gray-700">
                  <span className="font-medium">{work.position}</span> at {work.company} ({work.years} years)
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No work experience details available.</p>
          )}
        </div>

        {/* Social Links */}
        <div>
          <h3 className="text-xl font-bold border-b pb-1 mb-2">🔗 Social Links</h3>
          <div className="flex flex-wrap gap-4">
            {alumni.socialLinks && Object.entries(alumni.socialLinks).length > 0 ? (
              Object.entries(alumni.socialLinks).map(([platform, link]) => (
                <a
                  key={platform}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline capitalize"
                >
                  {platform}
                </a>
              ))
            ) : (
              <p className="text-gray-500">No social links provided.</p>
            )}
          </div>
        </div>

        {/* CV Link */}
        {alumni.cv && (
          <div>
            <h3 className="text-xl font-bold border-b pb-1 mb-2">📄 CV</h3>
            <a
              href={`http://localhost:5000/uploads/cvs/${alumni.cv}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:underline"
            >
              View CV
            </a>
          </div>
        )}

        {/* Chatbox (Optional Section) */}
        
      </div>
    </div>
  );
};

export default AlumniProfile;
