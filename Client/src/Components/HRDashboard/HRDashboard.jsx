// components/HRDashboard/HRDashboard.jsx
import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./HRDashboard.css";
import Sidebar from "./Sidebar.jsx";
import TopNavigation from "./TopNavigation.jsx";
import HRDashboardHome from "./HRDashboardHome.jsx";
import Analytics from "./modules/Analytics.jsx";
import BusinessAssociates from "./modules/BusinessAssociates.jsx";
import Internship from "./modules/Internship.jsx";
import CandidateDetail from "./modules/CandidateDetail.jsx";
import RecruitmentPipeline from "./modules/RecruitmentPipeline.jsx";
import VacancyManagement from "./modules/VacancyManagement.jsx";

// Employee Recruitment submodules
import InternshipData from "./modules/EmployeeRecruitment/InternshipData.jsx";
import EmployeeTraining from "./modules/EmployeeRecruitment/EmployeeTraining.jsx";
import RulesRegulations from "./modules/EmployeeRecruitment/RulesRegulations.jsx";
import VacancyNotice from "./modules/EmployeeRecruitment/VacancyNotice.jsx";
import ShortlistedResumes from "./modules/EmployeeRecruitment/ShortlistedResumes.jsx";
import InterviewProcess from "./modules/EmployeeRecruitment/InterviewProcess.jsx";
import JoiningData from "./modules/EmployeeRecruitment/JoiningData.jsx";
import JobProfileTarget from "./modules/EmployeeRecruitment/JobProfileTarget.jsx";

const HRDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="hr-dashboard d-flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="hr-main-content d-flex flex-column">
        {/* Top Navigation Bar */}
        <TopNavigation setSidebarOpen={setSidebarOpen} />

        {/* Main content area */}
        <main
          className="grow overflow-auto"
          style={{ backgroundColor: "#ffffff", padding: "20px 24px" }}
        >
          <Routes>
            {/* Default routes */}
            <Route path="/" element={<HRDashboardHome />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/business-associates" element={<BusinessAssociates />} />
            <Route path="/internship" element={<Internship />} />
            <Route path="/candidate/:id" element={<CandidateDetail />} />
            <Route path="/recruitment" element={<RecruitmentPipeline />} />
            <Route path="/vacancies" element={<VacancyManagement />} />

            {/*Employee Recruitment routes */}
            <Route path="/internship-data" element={<InternshipData />} />
            <Route path="/employee-training" element={<EmployeeTraining />} />
            <Route path="/rules-regulations" element={<RulesRegulations />} />
            <Route path="/vacancy-notice" element={<VacancyNotice />} />
            <Route path="/resume-shortlist" element={<ShortlistedResumes />} />
            <Route path="/interview-process" element={<InterviewProcess />} />
            <Route path="/joining-data" element={<JoiningData />} />
            <Route path="/job-profile-target" element={<JobProfileTarget />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default HRDashboard;