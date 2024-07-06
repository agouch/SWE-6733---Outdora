# SWE-6733---Outdora
# Social Media application for matching adventure enthusiasts 

## Team Name 
Explorers 

## Team Roster 
- **Scrum Master**: Cesar Villarreal 
- **Product Owner**: Alaina Magee 
- **Development Team**: Nishik Patel, Parker Goins, Aliyah Gouch 

## Product Vision

### Far Vision:
Outdora aims to revolutionize the way adventure enthusiasts connect, explore, and share their passion for the outdoors. Our goal is to create a global community where individuals can find like-minded partners for any outdoor activity, fostering meaningful connections based on shared interests and skill levels. 

### Near Vision:
In the near term, Outdora will provide a robust and user-friendly mobile application that matches users based on their specific adventure preferences, skill levels, and geographic proximity. Our immediate focus is to develop key features such as user profiles, adventure preferences, in-app messaging, and a swipe-based matching system, laying a strong foundation for future growth and enhancements.
 
### Backlog Rationale 

Link to backlog: https://outdora-project.atlassian.net/jira/software/projects/SCRUM/boards/1/backlog

The backlog is ordered starting with the login page and ending with the messaging page and functionality. The UI, backend and database can be done simultaneously so there is no order for which is done first. However, login should be handled first since it’s the first thing the user will interact with and single sign on should be developed after. Next the user will create a profile and choose preferences (matching criteria) so these features come next including the profile photo upload functionality. Next is the matching algorithm and the UI for the users to match with each other. Lastly, once the user is matched they will need to message each other, so messaging functionality and UI will come last.  

### Tools 

Repository: GitHub 
Project Management: Jira

### Tech stack 
React 
Language: Java 
DB: Firebase 


 
## Definiton of Ready

### Login Page

#### Design Login Page UI
**User Story:**
As a returning user, I want to see a visually appealing and intuitive login page so that I can easily log into my account.

**Details:**
- **Requirements:**
  - Fields for email and password
  - Option for single sign-on (SSO)
  - Error message for invalid login information
  - Responsive design
- **Dependencies:** N/A
- **Acceptance Criteria:**
  - Approval from the Product Owner
  - Feedback from team members
- **Estimated in Story Points:** 5

#### Develop Backend for Login
**User Story:**
As a user, I want a secure and reliable backend for login so that my personal information stays protected during the authentication process.

**Details:**
- **Requirements:**
  - Validation of user login information
  - Return error message for invalid login information
  - Integration with database to fetch user data
  - Endpoint for user login
- **Dependencies:**
  - Database design for users
- **Acceptance Criteria:**
  - Successful login with valid user login information
  - Error message for failed login with invalid user login information
  - Secure user information handling
- **Estimated in Story Points:** 21

#### Implement Single Sign-On
**User Story:**
As a user, I want to log in using my social media accounts so that I can access the application without having to create a new account.

**Details:**
- **Requirements:**
  - SSO integration
  - Backend support for SSO
  - Secure handling of tokens and user data
- **Dependencies:**
  - Design login page UI
  - Develop backend for login
- **Acceptance Criteria:**
  - Successful login with the user's existing account
  - Error handling for failed SSO
- **Estimated in Story Points:** 21

### Profile Creation

#### Design Profile Creation UI
**User Story:**
As a new user, I want a simple, straightforward and user-friendly profile creation interface so that I can set up my profile quickly and efficiently.

**Details:**
- **Requirements:**
  - Fields for personal information and preferences
  - Photo upload option
  - Clear instructions
  - Account creation progress
  - Responsive design
- **Dependencies:** N/A
- **Acceptance Criteria:**
  - Approval of the Product Owner
  - Feedback from team members
- **Estimated in Story Points:** 5

#### Develop Backend for Profile Creation
**User Story:**
As a user, I want the backend to be able to handle my profile data securely so that my personal information is stored safely and can be updated when needed.

**Details:**
- **Requirements:**
  - Validation of user input
  - Integration with database to store user profile data
  - Option to link social media accounts
  - Profile creation endpoint
- **Dependencies:**
  - Design DB table for users
  - Design DB table for profile
  - Design profile creation UI
  - Design social media UI
- **Acceptance Criteria:**
  - Successful creation of user profile with valid data
  - Error handling for invalid data
- **Estimated in Story Points:** 21

#### Implement Profile Photo Upload
**User Story:**
As a user, I want to be able to upload a profile photo so that my account feels more personalized and identifiable.

**Details:**
- **Requirements:**
  - Frontend support for photo upload
  - Backend support to handle photo uploads
  - Secure photo data
- **Dependencies:**
  - Develop backend for profile creation
- **Acceptance Criteria:**
  - Successful upload and display of profile photo
  - Error handling for unsupported file formats and sizes
- **Estimated in Story Points:** 21

### Messaging

#### Design Messaging UI
**User Story:**
As a user, I want an feasible messaging interface so that I can communicate effectively with other users.

**Details:**
- **Requirements:**
  - Chat interface with text input
  - Option for voice notes, audio, and video calls
  - Notifications for new messages
  - Responsive design
- **Dependencies:** N/A
- **Acceptance Criteria:**
  - Approval from the Product Owner
  - Feedback from team members
- **Estimated in Story Points:** 5

#### Design Messaging Backend
**User Story:**
As a user, I need the backend to securely and efficiently manage my messages, guaranteeing the privacy and reliability of my conversations. 

**Details:**
- **Requirements:**
  - Real-time updates for new messages
  - Storage of messages in database
  - Sending and receiving messages endpoint
- **Dependencies:**
  - Design DB table for users
  - Design messaging UI
- **Acceptance Criteria:**
  - Successful sending and receiving of messages
  - Secure message handling
- **Estimated in Story Points:** 21

### Matching

#### Design Matching UI
**User Story:**
As a user, I want an engaging and intuitive matching interface so that I can find and connect with other users who share my interests.

**Details:**
- **Requirements:**
  - Swipe left and right mechanism
  - Display of user profiles
  - Match feedback
  - Responsive design
- **Dependencies:** N/A
- **Acceptance Criteria:**
  - Approval from the Product Owner
  - Feedback from team members
- **Estimated in Story Points:** 5

#### Creating Matching Algorithm
**User Story:**
As a user, I want a matching algorithm that considers my preferences so that I can receive relevant and compatible match suggestions.

**Details:**
- **Requirements:**
  - Algorithm to consider adventure, skills, and behaviors within a selected mile range
  - Displays match feedback if users match each other
- **Dependencies:**
  - Design DB table for preferences
  - Design matching UI
- **Acceptance Criteria:**
  - Algorithm returns accurate matches
  - Successfully displays match feedback when the users match each other
- **Estimated in Story Points:** 8

### Social Media

#### Design Social Media UI
**User Story:**
As a user, I want an engaging and interactive social media interface so that I can share my thoughts, updates and interact with other users. 

**Details:**
- **Requirements:**
  - Interface for linking/unlinking social media accounts
  - Display connected social media accounts
  - Responsive design
- **Dependencies:** N/A
- **Acceptance Criteria:**
  - Approval from the Product Owner
  - Feedback from team members
- **Estimated in Story Points:** 5

### Database Design

#### Design DB Table for Users
**User Story:**
As a system user, I want my personal information to be stored securely so that my data is protected and easily retrievable.

**Details:**
- **Requirements:**
  - User information data is organized
  - User information data is secured
- **Dependencies:** N/A
- **Acceptance Criteria:**
  - Approval from team members
  - Data is secured and organized successfully
- **Estimated in Story Points:** 8

#### Design DB Table for Preferences
**User Story:**
As a user, I want my preferences to be stored efficiently so that the app can provide personalized recommendations based on my settings.

**Details:**
- **Requirements:**
  - Preference data is organized
  - Preference data is requested efficiently
- **Dependencies:** N/A
- **Acceptance Criteria:**
  - Approval from team members
  - Data is organized successfully
- **Estimated in Story Points:** 8

#### Design DB Table for Profile
**User Story:**
As a system user, I want my profile information to be stored efficiently so that my data is secure and accessible when needed.

**Details:**
- **Requirements:**
  - Profile information data is organized
  - Profile information data is secured
- **Dependencies:** N/A
- **Acceptance Criteria:**
  - Approval from team members
  - Data is secured and organized successfully
- **Estimated in Story Points:** 8

### Preferences

#### Design UI Submit Form for Preferences
**User Story:**
As a user, I want a simple and intuitive form to submit my preferences so that I can customize my experience on the platform.

**Details:**
- **Requirements:**
  - Fields for preferences
  - Responsive design
  - Clear instructions
  - Validation messages
- **Dependencies:** N/A
- **Acceptance Criteria:**
  - Approval from the Product Owner
  - Feedback from team members
- **Estimated in Story Points:** 8

- **Sprint 1 Burndown Chart:**
<img width="357" alt="Screenshot 2024-07-06 at 1 13 46 PM" src="https://github.com/agouch/SWE-6733---Outdora/assets/148926371/50bc24b2-5eb8-4440-ab36-4a3f6cff9ab0">
