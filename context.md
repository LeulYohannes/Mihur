# Project Context: Mihur (Full Specification)

## 1. Project Overview
[cite_start]**Mihur** is a web-based platform designed to centralize and personalize the discovery of free online courses[cite: 2, 30]. [cite_start]It targets high school and early college learners, helping them navigate information overload by providing structured learning paths[cite: 39, 52].

## 2. Core Features
* [cite_start]**Questionnaire-Based Recommendations:** A user-friendly questionnaire to identify interests, skill levels, and goals[cite: 55, 98].
* [cite_start]**Searchable Catalog:** A filtered course library aggregating data from Coursera, edX, Udemy, and Khan Academy[cite: 46, 53].
* [cite_start]**External Redirection:** Users are redirected to original providers for enrollment; no internal hosting[cite: 47, 57].
* [cite_start]**User Management:** Profiles to save preferred courses and manage learning preferences[cite: 48, 102].

## 3. Technical Stack (The "Source of Truth")
* [cite_start]**Frontend:** ReactJS with Tailwind CSS for responsive design[cite: 69, 79, 80].
* [cite_start]**State Management:** Redux Toolkit[cite: 70].
* [cite_start]**Backend:** Node.js and ExpressJS handling API requests and recommendation logic[cite: 71, 82].
* [cite_start]**Database:** MongoDB for storing user metadata, preferences, and course interaction history[cite: 72, 83].
* [cite_start]**Authentication:** Firebase Authentication[cite: 74, 94].
* [cite_start]**Deployment:** Netlify (Frontend) and Render (Backend)[cite: 76, 94].

## 4. System Logic & Architecture
* [cite_start]**Recommendation Engine:** * *Current Phase:* Rule-based filtering (Topic + Level + Goal) using structured JSON[cite: 92].
    * [cite_start]*Future Phase:* Python Flask microservice or ML-based scoring for higher accuracy[cite: 92, 107].
* [cite_start]**Data Integration:** Consumes external APIs (Coursera, edX, etc.) to keep course metadata updated[cite: 85, 86, 87, 88, 89].

## 5. Development Constraints (MVP)
* [cite_start]**No Internal Content:** Strictly a discovery and redirection engine[cite: 57].
* [cite_start]**Free-Only:** The platform exclusively focuses on free resources and courses offering free certificates[cite: 49, 52, 57].
* [cite_start]**Focus Areas:** High school and early college educational content[cite: 52].

## 6. Implementation Roadmap
1.  [cite_start]**Requirement Analysis:** Define functional specs (Done)[cite: 66].
2.  [cite_start]**UI/UX Design:** Mockups in Figma (In Progress)[cite: 66, 68].
3.  [cite_start]**Frontend Development:** React components and Tailwind styling[cite: 66].
4.  [cite_start]**Backend & API Integration:** Node.js/Express setup and MongoDB connection[cite: 66].