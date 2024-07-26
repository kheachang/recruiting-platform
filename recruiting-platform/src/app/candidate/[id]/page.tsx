import { CandidateDashboard } from "../../_components/candidateDashboard";

export default function CandidatePage() {
  const candidateId = "1"; // hard coding this for now

  return <CandidateDashboard candidateId={candidateId}/>
}