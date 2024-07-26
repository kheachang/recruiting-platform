"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const handleNavigate = (path: string) => {
    router.push(path);
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Welcome to your recruiting platform!</h1>
      <p className="mb-7">Whether you are here to explore job opportunities or manage recruitment processes, select your role below to get started:</p>
      <div className="flex justify-center gap-4 mb-6">
        <button
          className="btn w-64 rounded-full"
          onClick={() => handleNavigate('/candidate')}
        >
          Candidate Dashboard
        </button>
        <button
          className="btn w-64 rounded-full"
          onClick={() => handleNavigate('/recruiter')}
        >
          Recruiter Dashboard
        </button>
      </div>
      <div className="mt-6">
        <p>If you have received an invitation from a recruiter to fill out an application, please click on <strong>"Candidate Dashboard"</strong> to complete the application process.</p><br />
        <p>If you are a recruiter looking to manage job postings and applications, click on <strong>"Recruiter Dashboard"</strong> to access your tools and resources.</p>
      </div>

    </div>
  )
}