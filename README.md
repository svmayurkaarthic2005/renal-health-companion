# Renal Health Companion 🏥

A comprehensive health management platform designed specifically for kidney disease patients. Real-time health tracking, AI-powered meal planning, and personalized wellness recommendations.

**Live Demo**: https://renalcare-cpdngse0cubahfb3.eastus-01.azurewebsites.net

---

## ✨ Features

### 🩺 **Your Vitals Tracker**
- Real-time blood pressure monitoring with visual charts
- Syncs data from lab reports via webhook integration
- Historical trend analysis with Systolic/Diastolic tracking
- Last reading display and appointment scheduling

### 📋 **Diagnostic Hub**
- **Blood Lab Analysis**: Upload blood test reports (PDF/images), AI extracts GFR, Potassium, Sodium levels
- **Kitchen Helper**: Upload food photos, get kidney-friendly recipe suggestions with confidence scores
- File validation with 100KB size limit for security
- Safe cooking recommendations from AI chef

### 📅 **Health Plan Generator**
- Generate personalized 7-14 day meal and activity plans
- Voice input with Web Speech API for hands-free planning
- AI-powered recommendations based on kidney stage (Prevention/Stage 3/Stage 5)
- Shopping list generation for kidney-friendly ingredients
- Journey sidebar tracking all health plans

### 💬 **Smart Chat Assistant**
- Real-time AI chat for health questions
- Voice input with microphone button
- Context-aware responses about kidney-friendly foods, medications, and wellness
- Chat history with scroll support

### 🎯 **Prevention Mode**
- Early kidney disease prevention strategies
- Risk factor monitoring
- Wellness recommendations

### 🔐 **User Management**
- Guest mode (no registration required)
- Kidney stage selection (Prevention, Stage 3 Moderate, Stage 5 Dialysis)
- Personalized content based on health stage

---

## 🛠️ Built With

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - 35+ pre-built components
- **React Router v6** - Client-side routing

### APIs & Services
- **OpenAI API** - Chat and health recommendations
- **Web Speech API** - Voice recognition
- **n8n Workflows** - Backend automation and data processing
- **Azure Web Services** - Cloud hosting

### Libraries
- **Lucide React** - 400+ icons
- **Sonner** - Toast notifications
- **Recharts** - Data visualization
- **React Hook Form** - Form management

### Backend Integration
- **ngrok** - Secure webhook tunneling
- **RESTful APIs** - Health data endpoints
- **FormData** - Multipart file uploads

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ ([install with nvm](https://github.com/nvm-sh/nvm))
- npm or Bun package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/renal-health-companion.git
cd renal-health-companion

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun dev
```

Development server runs at `http://localhost:8080`

### Build for Production
```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
renal-health-companion/
├── src/
│   ├── components/
│   │   ├── ChatWindow.tsx           # AI chat interface
│   │   ├── DiagnosticHub.tsx        # Lab & kitchen helpers
│   │   ├── DayCard.tsx              # Daily plan display
│   │   ├── EditDayModal.tsx         # Plan editing
│   │   ├── HealthPlanInput.tsx      # Plan generator
│   │   ├── JourneySidebar.tsx       # Health journey tracking
│   │   ├── Navbar.tsx               # Navigation
│   │   ├── RoadmapCard.tsx          # Plan roadmap
│   │   └── ui/                      # 35+ shadcn components
│   ├── pages/
│   │   ├── Dashboard.tsx            # Main dashboard
│   │   ├── Index.tsx                # Home page
│   │   ├── Login.tsx                # Onboarding
│   │   └── NotFound.tsx             # 404 page
│   ├── context/
│   │   └── AppContext.tsx           # Global state management
│   ├── hooks/
│   │   ├── use-toast.ts             # Toast notifications
│   │   └── use-mobile.tsx           # Mobile detection
│   ├── lib/
│   │   ├── mockData.ts              # Sample health data
│   │   └── utils.ts                 # Utilities
│   ├── types/
│   │   └── health.ts                # TypeScript types
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
└── README.md
```

---

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# OpenAI API
VITE_OPENAI_API_KEY=your_api_key_here

# Webhook URLs
VITE_WEBHOOK_MAIN=https://your-webhook-url/webhook-test/main
VITE_WEBHOOK_LAB=https://your-webhook-url/webhook-test/lab
VITE_WEBHOOK_KITCHEN=https://your-webhook-url/webhook-test/kitchen
VITE_WEBHOOK_CHAT=https://your-webhook-url/webhook-test/renaiaichat
```

### Build Configuration
- **Port**: 8080 (configurable in `vite.config.ts`)
- **CSS**: Tailwind CSS with custom theme
- **Aliases**: `@` maps to `src/`

---

## 🎯 Core Features Deep Dive

### Blood Lab Analysis
1. Upload blood test report (max 100KB)
2. AI extracts key metrics:
   - GFR (Glomerular Filtration Rate)
   - Potassium levels
   - Sodium levels
   - Blood pressure readings
3. Visual analysis with health status indicators
4. Dietary recommendations based on results

### Kitchen Helper
1. Upload photo of food/ingredients
2. AI identifies items and ripeness
3. Provides kidney-safe recipe suggestions
4. Confidence score for accuracy
5. Chef recommendations for safe preparation

### Health Plan Generator
- **Input**: Natural language or voice prompt (e.g., "7 day meal plan for stage 3 kidney disease")
- **Processing**: AI analyzes kidney stage and health needs
- **Output**: 
  - 7-14 day meal plan with breakfast, lunch, dinner
  - Activity recommendations
  - Sleep tracking
  - Shopping list
- **Editing**: Manual edit individual days with AI enhancement option

### Chat Assistant
- Ask questions about kidney health, medications, foods
- Get context-aware responses
- Voice input for hands-free interaction
- Conversation history maintained during session

---

## 🔗 API Integration

### Webhook Endpoints

All webhooks return JSON responses with the following format:

```json
{
  "status": "success",
  "data": { /* response data */ }
}
```

#### `/webhook-test/main` - Health Plan Generation
**Request**:
```json
{
  "prompt": "7 day kidney-friendly meal plan"
}
```

#### `/webhook-test/lab` - Lab Analysis
**Request** (FormData):
- `file`: Blood report image/PDF
- `fileName`: Original filename
- `fileType`: MIME type

**Response**:
```json
{
  "patient_summary": { /* summary */ },
  "results": [ /* lab values */ ],
  "recommendations": { /* diet advice */ }
}
```

#### `/webhook-test/kitchen` - Food Analysis
**Request** (FormData):
- `file`: Food/ingredient photo

**Response**:
```json
{
  "item_name": "Apple",
  "condition": "Ripe",
  "confidence": 85.5,
  "chef_recommendation": "Safe to eat. Try slicing thin..."
}
```

#### `/webhook-test/renaiaichat` - Chat
**Request**:
```json
{
  "message": "Is banana safe for kidney disease?",
  "timestamp": "2025-12-31T01:56:34.946Z"
}
```

---

## 📱 Responsive Design

- **Mobile**: Full support for phones and tablets
- **Tablet**: Optimized layouts for medium screens
- **Desktop**: Enhanced experience with sidebars and multi-column layouts
- **Touch**: All buttons and interactive elements are touch-friendly

---

## 🔐 Security

- **File Validation**: Max 100KB file size to prevent abuse
- **Input Sanitization**: All user inputs are sanitized
- **HTTPS Only**: Secure webhook communication via ngrok
- **No Server Data**: All processing via secure webhooks
- **Privacy First**: No personal health data stored locally beyond session

---

## 🚧 Coming Soon

- [ ] User accounts with data persistence
- [ ] Multi-language support
- [ ] Medication tracking and alerts
- [ ] Doctor appointment reminders
- [ ] Integration with wearable devices
- [ ] Export health reports as PDF
- [ ] Offline mode support
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Support

For issues, questions, or suggestions:
- Open an [issue](https://github.com/yourusername/renal-health-companion/issues)
- Start a [discussion](https://github.com/yourusername/renal-health-companion/discussions)
- Contact: support@renalhealthcompanion.com

---

## 📚 Resources

- [Kidney Disease Info](https://www.kidney.org/)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)
- [n8n Documentation](https://docs.n8n.io/)

---

## 🎓 About Kidney Health

Chronic kidney disease (CKD) is a common condition affecting millions worldwide. This app helps patients:
- Track vital signs and lab results
- Make informed dietary choices
- Maintain wellness routines
- Communicate with healthcare providers

**⚠️ Disclaimer**: This app provides educational information and should not replace professional medical advice. Always consult with your healthcare provider before making health decisions.

---

**Made with ❤️ for kidney health awareness**

- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
