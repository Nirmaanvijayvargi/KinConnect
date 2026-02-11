KinConnect: Agentic AI for Assistive Communication 🧠💬

Experimental Learning Project | Woxsen University | B.Tech CSE (AI/ML)

KinConnect is a zero-cognitive-load communication ecosystem designed for post-stroke survivors suffering from Aphasia and Hemiparesis. By integrating Gemini 2.0 Agentic AI with MediaPipe Computer Vision, the system enables hands-free communication through head-motion tracking and semantic UI adaptation.

🚩 The Problem: "The Interaction Barrier"

Stroke survivors often lose both the ability to speak and the manual dexterity required for touchscreens.

Precision Deficit: Standard UIs require pixel-perfect touch, impossible for users with motor tremors.

Cognitive Fatigue: Searching through static icons is exhausting.

Cost Barrier: Traditional eye-tracking hardware (e.g., Tobii) costs upwards of $5,000.

🚀 The Solution: "KinConnect"

KinConnect turns a standard laptop webcam and the power of LLMs into a life-changing accessibility tool:

Head-Motion "Magnet Snap": Translates 3D head pose into a magnetic cursor that "snaps" to the nearest button.

Blink-to-Select: A deliberate 400ms blink triggers selections, removing the need for physical clicking.

Gemini 2.0 Semantic Sorter: The AI re-ranks communication tiles in real-time based on the time of day and the user's medical context.

Real-Time Caregiver Portal: Powered by Supabase, allowing caregivers to upload and label photos that appear instantly on the survivor's board.

🛠️ Technical Stack

Intelligence: Gemini 2.0 Flash
Utilized for automated image labeling and contextual semantic ranking to reorganize the UI based on user needs.

Vision: MediaPipe Face Landmarker
Employs a 478-point facial mesh to provide high-precision head-pose estimation for hands-free navigation.

Backend: Supabase (PostgreSQL)
Facilitates real-time data synchronization and secure storage for communication assets and user logs.

Frontend: React 19 + Ant Design
A high-performance, accessibility-first framework designed for high-contrast and low-latency interaction.

Voice: Web Speech API
The primary text-to-speech engine responsible for verbalizing survivor intent and emergency alerts.

🔧 Engineering Hurdles & Milestones

1. Signal Processing: The "Jitter" Solution

Raw webcam data is inherently noisy. We implemented a Spatial Low-Pass Filter to smooth head-tracking coordinates.

The Math: $X_{smoothed} = \frac{1}{n} \sum_{i=0}^{n-1} X_{raw, i}$
By using a moving average of 15-25 frames, we achieved a "sticky" focus square that ignores minor tremors.

2. Backend Migration: Supabase over Firebase

To maintain a robust free tier and utilize relational data, we migrated to Supabase. We implemented Row Level Security (RLS) policies to allow public access to the communication-tiles bucket while maintaining database integrity.

💡 Key Learnings

Through the development of KinConnect, the team has mastered several critical domains:

Human-Computer Interaction (HCI): Designing interfaces specifically for users with limited motor control, prioritizing high-contrast visuals and "magnet-snap" navigation.

Signal Processing: Implementing low-pass filters to transform raw, noisy sensor data into stable UI inputs.

Agentic AI Orchestration: Learning to use LLMs (Gemini 2.0) not just for chat, but as a "logic engine" that autonomously reorganizes interfaces based on real-world time and context.

Full-Stack Data Integrity: Transitioning from local-first storage to a cloud-based SQL environment (Supabase) with real-time subscriptions.

Inclusive Engineering: Understanding that true accessibility requires making the app "learn the user," rather than forcing the user to learn the app.

📂 Project Structure

/src/hooks/useHeadTracker.js: MediaPipe tracking logic and blink detection algorithm.

/src/hooks/useGemini.js: Integration with Gemini 2.0 for semantic ranking and image recognition.

/src/services/supabase.js: Supabase client initialization and real-time data handlers.

/src/components/Survivor/CommunicationGrid.jsx: The main high-contrast, accessible board.

🎓 Academic Context

This project was developed during Tensor 2.0, a 24-hour hackathon organized by Woxsen University. It demonstrates the practical application of AI/ML in the field of Healthcare Accessibility within a high-pressure, rapid-development environment.

Team Members:

Prabheesh Singh

Nirmaan Vijay Vargi

Nakshatra Vijay Vargi

Ronak Kadyan

Pawani Dwivedi

Year: B.Tech CSE (AI/ML) 1st Year
Location: Woxsen University, Hyderabad