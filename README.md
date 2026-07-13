# Application and Problem Space:

## Development Setup

Install dependencies from the repo root:

```bash
npm install
```

Start PostgreSQL (leave it running):

```bash
docker compose up db
```

Then run the backend and backend:

```bash
npm run dev:backend
npm run dev:frontend
```

The frontend runs at `http://localhost:5173` and the backend at
`http://localhost:4100`.

Build both apps:

```bash
npm run build
```

Run everything with Docker Compose:

```bash
docker compose up --build
```

The frontend lives in `frontend/src`. The backend API lives in `backend/src` and includes a starter health endpoint at `/api/health`.

Our group plans to develop a web application called Research Connect, a centralized platform designed to streamline the recruitment of participants for academic research studies. Currently, many researchers rely on physical posters distributed across university campuses to advertise their studies. Interested students must then contact researchers directly via email to obtain additional information, determine their eligibility, and schedule participation times. This process can be time-consuming and inefficient for both researchers and participants.

Research Connect aims to simplify this workflow by providing a single platform where researchers can post study opportunities, manage participant applications, and communicate with prospective participants. Students can browse available studies, review eligibility requirements, sign up for participation, and track their upcoming commitments through the platform. Additionally, the platform would incorporate participant history and attendance tracking features, enabling researchers to assess participant reliability based on past sign-up and participation records.

# Target Audience:

The primary target audience for this platform consists of two distinct groups within the academic environment: Academic researchers (such as faculty and graduate students) and research participants (undergraduate and graduate students). 

For academic researchers, the issue we noticed is that they spend hours on manual recruitment tasks. Our platform will automate this process by handling scheduling and eligibility checks, alleviating some of the administrative work for the researcher, all while ensuring they get the right participants for their studies.

For research participants who want to participate in research to build experience and earn some income but find it difficult to track down opportunities. Our platform will make the process easier for them by creating a personalized dashboard that shows them studies they are actually eligible for. It makes the booking process a stress-free experience, replacing the frustrating email chains with an easier scheduling system.

# Features: 

Research Connect will consist of five primary features. First, researchers will be able to create and manage study listings, including eligibility requirements and screening questionnaires that automatically determine whether participants qualify for a study. Second, participants will have access to a study dashboard where they can browse available opportunities, apply filters such as location, institution, and compensation, and sign up for studies if they meet the eligibility criteria. Third, the platform will provide a calendar view that allows both participants and researchers to track upcoming study sessions, appointments, and commitments. Fourth, each user will have a profile page containing relevant information such as contact details, participation history, ratings, reviews, and attendance records, helping to build trust and accountability within the platform. Finally, researchers will have access to an analytics dashboard that provides insights into their recruitment efforts, including the number of studies posted, participant enrollment statistics, posting views, and other engagement metrics. Together, these features create a centralized platform that simplifies participant recruitment and study management for academic research.

# Team Justification and Task Delegation:

This team is well suited for the development of Research Connect because all five members have experience with web development and are familiar with modern technologies including React. In addition, all of our team members have worked on a variety of software projects involving user interfaces, data management, and full-stack development, providing a strong foundation for building a platform of this scope. Finally, we have all had experience signing up for or running studies at school, so this is a problem space we are excited to work on!

While responsibilities may evolve throughout development, each member of our group will take ownership of a primary feature. Firstly, Clement will focus on the study creation and questionnaire system, ensuring researchers can easily create and manage study postings. Isabelle will be responsible for the participant-facing dashboard, including study browsing, filtering, and registration workflows. Pratham will concentrate on the calendar and scheduling functionality, while Ruben will develop user profiles, ratings, and participation tracking features. Jie will focus on the analytics dashboard and reporting tools for researchers. All members will collaborate on system design, testing, and integration to ensure a consistent and reliable user experience across the platform.

# High-level Architecture:

High level architecture for this application includes a React frontend and Express backend deployed on a Google Cloud Compute Engine virtual machine running Ubuntu Linux. The backend will communicate with a PostgreSQL database server hosted on the same VM, which acts as the internal service responsible for persistent data storage and management of users and studies. External Services are integrated to enhance functionality and user experience, including using OAuth for authentication, Resend as email notification service to provide study updates and alerts, and the Google Calendar API for scheduling study sessions and managing participant availability. This architecture provides a clear separation between frontend, backend, internal data storage and external third party service integration, ensuring scalability and maintainability.

# Entities and Key Relationships:

Entities:
User: Represents participants and researchers
Study: Research Study posted by the researcher
Review: Ratings after participation
Chat Message: For global study chat.
Screening Question: Questionnaire created by researchers to determine eligibility for their study.
Ledger Entry: Tracking credits / remuneration amounts
Booking: The transaction connecting a specific user to a specific slot
Time Slot: Time slots created by Researchers for their study.

Key Relationships:
User -> Study: A user with the role “Researcher” can create multiple studies. A user with the role “Participant” can apply for multiple studies.
User -> Review: A user can write many reviews for many people
User -> Chat Message: A user can write a (or many) chat message(s) in association to a study posting. For a researcher this might be an announcement or update on the study and for a participant, this might be a clarifying question for a researcher to respond to.
Study -> Screening Question: Each study can have multiple screening questions that automatically allow or disallow participants to sign up for them. These are created by the study’s associated researcher.
Study -> Time Slot: Each study can have multiple time slots that are set by the researcher and allow participants to add to their calendars.
User -> Booking / Time Slot -> Booking: Each time slot created through study sign ups corresponds back to the respective participant and can be tracked through their joining table, “booking”.
 User->Ledger_Entry / Booking->Ledger Entry: Ledger entry connects users to the correct credits/remuneration amounts according to their bookings.
	
![ER Diagram](Researcher_Signup_Flow_for-2026-06-22-042020.png)

# Framework Justification:

Chosen Stack: Stack A (Express + React)

Why two apps over one: 
The application uses a separate architecture of React and Express to ensure clear division of responsibilities between UI and business logic. This separation is beneficial because the application is primarily data-driven, involving study creation, eligibility checks, and analytics processing. Additionally, it is also development friendly as backend and frontend can be worked on in parallel with minimal disruption. 
Also, Next.js’s main advantage relies on vercel’s serverless and edge compute infrastructure. Since we are hosting it on a standard GCP compute engine VM this runs as a plain node js server and provides no meaningful performance benefit. It just adds additional workload on the team members to learn a new framework.
Repo structure: 
A monorepo structure will be used to manage both the frontend and backend. This approach is preferred over separate repositories because it promotes better coordination between frontend and backend features. It simplifies the development process by allowing shared configuration and easier collaboration.
How do the two apps talk: 
Both frontend and backend applications will be deployed on the same GCP compute engine instance. We will configure nginx as a reverse proxy in front of the route traffic. The requests to the base domain will serve the React bundle, and any request to /api will be routed to the Express server.
API style: 
Our Express backend will use standard RESTful API architecture. All client-server communication will rely on standard HTTP methods (GET, POST, PUT, DELETE) to execute CRUD operations. We will use JSON payloads for lightweight, consistent, and reliable data transfer.
5.  Team Experience:
 We have chosen Stack A (Express + React) for this project because our team has prior experience with this stack, which reduces the onboarding time, ensuring rapid development and prototyping. 
