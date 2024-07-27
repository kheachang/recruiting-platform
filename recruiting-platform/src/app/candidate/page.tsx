"use client";

import { CandidateDashboard } from "../_components/candidateDashboard";
import { NavBar } from "../_components/navbar";

export default function CandidatePage() {
  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <NavBar></NavBar>
      <CandidateDashboard candidateId="8044241007"/>
      </div>
  )
}
