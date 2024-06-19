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
As a user, I want a visually appealing and user-friendly login page so that I can easily access my account.

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
- **Estimated in Story Points:** 3

#### Develop Backend for Login
**User Story:**
As a developer, I want to create the backend functionality for user login so that users can securely access their accounts.

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
- **Estimated in Story Points:** 5

#### Implement Single Sign-On
**User Story:**
As a user, I want to log in using my existing accounts so that I can access the app without creating a new account.

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
- **Estimated in Story Points:** 8

### Profile Creation

#### Design Profile Creation UI
**User Story:**
As a user, I want an intuitive and user-friendly profile creation interface so that I can easily set up my account and preferences.

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
- **Estimated in Story Points:** 3

#### Develop Backend for Profile Creation
**User Story:**
As a developer, I want to create the backend functionality for profile creation so that users can store their personal information and preferences.

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
- **Estimated in Story Points:** 5

#### Implement Profile Photo Upload
**User Story:**
As a user, I want to upload my profile photo so that my profile is complete and personalized.

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
- **Estimated in Story Points:** 5

### Messaging

#### Design Messaging UI
**User Story:**
As a user, I want an intuitive and easy-to-use messaging interface so that I can easily communicate with other users.

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
- **Estimated in Story Points:** 8

#### Design Messaging Backend
**User Story:**
As a developer, I want to design the backend for messaging so that users can communicate with each other within the app.

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
- **Estimated in Story Points:** 8

### Matching

#### Design Matching UI
**User Story:**
As a user, I want an engaging matching interface so that I can find adventure partners easily.

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
- **Estimated in Story Points:** 8

#### Creating Matching Algorithm
**User Story:**
As a developer, I want to develop an algorithm to match users based on their adventure, skills, and behaviors within their selected mile range so that they can find compatible adventure partners.

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
- **Estimated in Story Points:** 13

### Social Media

#### Design Social Media UI
**User Story:**
As a user, I want to connect my profile to my social media accounts so that I can share my adventures.

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
As a developer, I want to design a database table for storing user information so that user data is stored efficiently and securely.

**Details:**
- **Requirements:**
  - User information data is organized
  - User information data is secured
- **Dependencies:** N/A
- **Acceptance Criteria:**
  - Approval from team members
  - Data is secured and organized successfully
- **Estimated in Story Points:** 3

#### Design DB Table for Preferences
**User Story:**
As a developer, I want to design a database table for storing user preferences so that user preferences are stored efficiently and can be used for matching.

**Details:**
- **Requirements:**
  - Preference data is organized
  - Preference data is requested efficiently
- **Dependencies:** N/A
- **Acceptance Criteria:**
  - Approval from team members
  - Data is organized successfully
- **Estimated in Story Points:** 3

#### Design DB Table for Profile
**User Story:**
As a developer, I want to design a database table for storing user profiles so that profile data is stored efficiently and securely.

**Details:**
- **Requirements:**
  - Profile information data is organized
  - Profile information data is secured
- **Dependencies:** N/A
- **Acceptance Criteria:**
  - Approval from team members
  - Data is secured and organized successfully
- **Estimated in Story Points:** 3

### Preferences

#### Design UI Submit Form for Preferences
**User Story:**
As a user, I want a simple and intuitive form to submit my preferences so that the app can match me with suitable adventure partners.

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
- **Estimated in Story Points:** 3
