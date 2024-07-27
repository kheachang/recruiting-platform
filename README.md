# Recruiting Platform

A webapp with two entry points: Recruiter and Candidate. Candidates are able to track their job applications and submit an application when invited by a recruiter. Recruiters are able to view their active roles and candidates' recruitment progresses.

Candidate view: Recruiter invites a candidate to submit an application. In this application, the candidate already exists in Greenhouse and has submitted applications for the job before (previously rejected). The application allows a previously rejected candidate to resubmit for a job. Once a job has been submitted, this is the end of the candidate journey.

Recruiter view: Recruiter can view the active roles they're currently recruiting for. They're able to view a tracker of candidates' progress for each job. They're able to move the candidate between 'Application Review' and 'Offer' stages, which then updates in Greenhouse. 

## Dependencies

- T3 stack
- DaisyUI for premade components for easy styling. 

## Areas for improvements:
- Improve page transition latency (prefetching and preloading). 
- Refactor items router.
- Remove hardcoding of job and candidate. Then will need to create a new candidate in entry point. 
- Implement read only tracker for candidate view. 
- Ran into type errors in recruitmentDashboard component. need to go back and fix root issues when there's more time. 

