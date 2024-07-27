export interface Application {
    id: string;
    jobs: { id: string; name: string }[];
    status: string;
    applied_at: string;
    current_stage: { id: string; name: string };
    candidate_id: string;
  }
  
  export interface Candidate {
    id: string;
    first_name: string;
    last_name: string;
    company: string;
    title: string | null;
    created_at: string;
    updated_at: string;
    last_activity: string;
    is_private: boolean;
    photo_url: string | null;
    attachments: any[];
    phone_numbers: { value: string; type: string }[];
    addresses: { value: string; type: string }[];
    email_addresses: { value: string; type: string }[];
    website_addresses: { value: string; type: string }[];
    social_media_addresses: { value: string }[];
    recruiter: any;
    coordinator: any;
    can_email: boolean;
    tags: string[];
    applications: Application[];
    educations: any[];
    employments: any[];
    linked_user_ids: any[];
  }
  
  export interface Job {
    id: string;
    name: string;
    requisition_id: string;
    status: string;
    departments: { id: string; name: string }[];
    offices: { id: string; name: string; location?: { name: string } }[];
    hiring_team: {
      hiring_managers: any[];
      recruiters: any[];
      coordinators: any[];
      sourcers: any[];
    };
    openings: { id: string; opening_id: string; status: string; opened_at: string; closed_at: string | null; application_id: string | null; close_reason: string | null }[];
    custom_fields: {
      employment_type: string | null;
      salary_range: { min_value: string; max_value: string; unit: string };
    };
    keyed_custom_fields: {
      employment_type: { name: string; type: string; value: string | null };
      salary_range: { name: string; type: string; value: { min_value: string; max_value: string; unit: string } };
    };
    created_at: string;
    opened_at: string;
    closed_at: string | null;
    updated_at: string;
    notes: string | null;
    confidential: boolean;
    is_template: boolean;
    copied_from_id: string | null;
  }
  