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
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitApplication.mutate({
      roleId: Number(id),
      name,
      phone,
      email,
      message,
      // TODO: handle file upload separately
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
          <input type="text" placeholder="Type here" className="input input-bordered w-full max-w-xs"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Phone</span>
          </div>
          <input type="text" placeholder="Type here" className="input input-bordered w-full max-w-xs"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required />
        </label>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Email</span>
          </div>
          <input type="text" placeholder="Type here" className="input input-bordered w-full max-w-xs"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required />
        </label>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Message to Recruiter</span>
          </div>
          <input type="text" placeholder="Type here" className="input input-bordered w-full max-w-xs"
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required />
        </label>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Upload Resume</span>
          </div>
          <input type="file" className="file-input file-input-bordered w-full max-w-xs" />
        </label>
        <button className="btn">Submit</button>
      </form>
    </div>
  );
}