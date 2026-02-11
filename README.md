<p align="center">
  <img src="./banner.png" alt="KinConnect Banner"/>
</p>


# **KinConnect: AI-Powered Assistive Communication 🧠💬**

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge)](https://kinconnect.vercel.app/)
![React](https://img.shields.io/badge/Built%20with-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![AI](https://img.shields.io/badge/Powered%20by-Gemini%202.0-blue?style=for-the-badge)

**Woxsen University | B.Tech CSE (AI/ML)**

KinConnect is an AI-powered assistive communication system designed to restore independence, dignity, and ease of interaction for post-stroke aphasia survivors. The platform minimizes cognitive effort by combining **Agentic AI** with **Computer Vision**, enabling intuitive, hands-free communication for users with speech and motor impairments.

---

## 🚩 **Problem Statement**

Stroke survivors frequently experience:

- **Aphasia** → Impaired ability to communicate verbally  
- **Motor Impairment** → Reduced ability to use touch-based interfaces  

Existing communication solutions present major limitations:

- **High Cognitive Load**  
  Users must search through large icon sets to express simple intents.

- **Static Interfaces**  
  Communication boards fail to adapt to context, routine, or time.

- **Expensive Hardware Dependency**  
  Professional assistive systems often require costly eye-tracking equipment.

These barriers reduce usability, increase frustration, and limit user independence.

---

## 🚀 **Solution Philosophy — "Dignity Through Passive AI"**

KinConnect shifts complexity away from the user by enabling the system to intelligently adapt.

The platform introduces:

- **Semantic Time-Sensing**  
  AI dynamically prioritizes relevant communication tiles based on contextual cues.

- **Head-Motion Navigation**  
  Standard webcams replace specialized hardware, enabling hands-free interaction.

- **Autonomous Image Labeling**  
  Caregiver-uploaded images are automatically classified and integrated.

- **Discrete Snap Interaction Model**  
  Focus elements magnetically snap to targets, reducing precision requirements.

The system is designed to feel assistive rather than demanding.

---

## 🛠️ **Core Capabilities**

- **Context-Aware Communication Ranking**  
- **Hands-Free Navigation Engine**  
- **Adaptive Cognitive Load Reduction**  
- **AI-Based Object Recognition & Labeling**  
- **Offline-First Data Persistence**  
- **Voice Output & Alerts**

---

## ⚙️ **Technical Architecture**

| Layer | Technology | Purpose |
|------|-------------|----------|
| **Frontend** | React + Vite | Low-latency, high-performance UI |
| **AI Intelligence** | Gemini 2.0 Flash | Semantic ranking & labeling |
| **Computer Vision** | MediaPipe Face Landmarker | Head-pose tracking |
| **Storage** | IndexedDB (Dexie.js) | Offline-first survivor data |
| **Accessibility** | Web Speech API | Voice feedback & alerts |

---

## 🔧 **Key Engineering Challenges**

### **1️⃣ Head-Tracking Stability ("Jitter Problem")**

**Challenge:**  
Raw head-pose data produced unstable cursor movement.

**Solution:**  
Implemented a **Spatial Low-Pass Filter (Moving Average)** to smooth motion and improve selection accuracy.

---

### **2️⃣ API Rate Limitation (429 Quota Error)**

**Challenge:**  
Frequent quota exhaustion during AI interactions.

**Solution:**  

- Migrated to **Gemini 2.0 Flash**  
- Implemented **Local Caching Layer**  
- Reduced redundant API requests

---

### **3️⃣ Precision vs Accessibility Tradeoff**

**Challenge:**  
Free-moving cursors require high motor precision.

**Solution:**  
Designed a **Discrete Snap Engine** enabling magnetized focus behavior.

---

## 🎯 **Design Principles**

KinConnect prioritizes:

- Cognitive load minimization  
- Frictionless interaction  
- Hardware accessibility  
- User dignity & autonomy  
- Error-tolerant navigation  

---

## 📂 **Project Structure**

- `/src/hooks/useGemini.js` → AI ranking & labeling logic  
- `/src/hooks/useHeadTracker.js` → Head-tracking engine  
- `/src/components/Dashboard.jsx` → Survivor board  
- `/src/components/Portal.jsx` → Caregiver interface  

---

## 🚧 **Project Status**

✅ Functional Prototype  
🚧 Research & Iteration Phase  

KinConnect is developed as an experimental academic system exploring AI-driven accessibility and assistive interaction design.

---

## 🎓 **Key Learnings**

KinConnect provided deep insights into AI, usability, and accessibility engineering:

- **Cognitive Load is a Primary Constraint**  
- **Stability > Sensitivity in Assistive Interaction**  
- **Contextual Intelligence Improves Usability**  
- **Error-Tolerant Design is Critical**  
- **Assistive Systems Require Multidisciplinary Thinking**

---

## 👥 **Team — Team Quack 🦆**

KinConnect was developed collaboratively as part of an experimental academic initiative.

- **Nirmaan Vijay Vargi** 
- **Nakshatra Vijay Vargi** 
- **Prabheesh Singh** 
- **Ronak Kadyan** 
- **Pawani Dwivedi** 

---

## 🌍 **Vision**

KinConnect explores how **passive intelligence and low-cost sensing technologies** can transform assistive communication systems — making them adaptive, accessible, and human-centered.


## ✨ Why KinConnect Matters

KinConnect is designed around a simple principle:

> Assistive systems should reduce effort, not introduce complexity.

By combining AI-driven contextual intelligence with low-cost sensing technologies, KinConnect explores how accessibility tools can become adaptive, intuitive, and widely deployable.

---
