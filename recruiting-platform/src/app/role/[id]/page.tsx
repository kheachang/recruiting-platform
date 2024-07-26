"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export default function ApplicationForm({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resume, setResume] = useState<File | null>(null);

  const submitApplication = api.application.submit.useMutation({
    onSuccess: () => {
      router.push("/application-submitted");
    },
    onError: (error) => {
      console.error("Error submitting application:", error.message);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResume(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitApplication.mutate({
      name,
      phone,
      email,
      message,
      // Include resume in the form data (if using FormData in API)
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Apply for Role</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Name</span>
          </div>
          <input
            type="text"
            placeholder="Type here"
            className="input input-bordered w-full max-w-xs"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Phone</span>
          </div>
          <input
            type="text"
            placeholder="Type here"
            className="input input-bordered w-full max-w-xs"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </label>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Email</span>
          </div>
          <input
            type="text"
            placeholder="Type here"
            className="input input-bordered w-full max-w-xs"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Message to Recruiter</span>
          </div>
          <input
            type="text"
            placeholder="Type here"
            className="input input-bordered w-full max-w-xs"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </label>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Upload Resume</span>
          </div>
          <input
            type="file"
            className="file-input file-input-bordered w-full max-w-xs"
            onChange={handleFileChange}
          />
        </label>
        <button className="btn">Submit</button>
      </form>
    </div>
  );
}
