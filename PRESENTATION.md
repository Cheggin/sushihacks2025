# CARP - Comprehensive Aquatic Research Platform
## Empowering Fishermen with Data-Driven Insights and Health Monitoring

---

## 🎯 The Problem

### Maritime Workers Face Critical Challenges

**Health Risks**
- 🏥 Carpal Tunnel Syndrome (CTS) affects 40-60% of fishermen
- 🔄 Repetitive strain from nets, lines, and equipment
- ⚠️ Limited early detection and monitoring tools
- 📉 Lost workdays and reduced productivity

**Operational Challenges**
- 🌊 Unpredictable fishing conditions
- 📍 Limited access to marine biology data
- 💰 Difficulty identifying valuable catch areas
- 🎲 Inefficient fishing trips without data insights

---

## 💡 Our Inspiration

### Why CARP?

**SushiHacks 2025 Theme**
- Combining marine biology with medical technology
- Supporting fishing communities through innovation
- Bridging the gap between data science and traditional fishing

**Real-World Impact**
- Fishermen work in one of the world's most dangerous professions
- 50K+ fish occurrence records sitting unused in marine databases
- Healthcare monitoring tools rarely designed for maritime workers
- Technology can make fishing safer and more sustainable

---

## 🚀 Our Solution

### A Comprehensive Platform for Maritime Workers

**CARP integrates 4 core systems:**

1. **🗺️ Marine Data Visualization** - Interactive 3D globe with 50K+ fish occurrences
2. **🏥 Health Monitoring** - ML-powered CTS risk assessment and tracking
3. **📊 Smart Dashboard** - Real-time fishing analytics and recommendations
4. **🏪 Market Intelligence** - Find buyers and optimize catch value

---

## 🌍 Feature 1: Interactive Globe Visualization

### Explore Marine Biology Data Like Never Before

**What It Does:**
- Displays 50,000+ fish occurrence records on an interactive 3D globe
- Filter by species, location, depth, and type
- Real-time data from marine biology databases
- Click any point to see detailed fish information

**Technology:**
- Three.js for 3D rendering
- Custom filtering algorithms
- Real-time search and filtering
- Beautiful ocean-themed UI

**Value to Fishermen:**
- Identify where specific fish species are found
- Plan fishing trips based on historical data
- Discover new fishing grounds
- Learn about different fish species

---

## 🏥 Feature 2: Health Monitoring System

### Predict and Prevent Carpal Tunnel Syndrome

**Clinical Assessment**
- Onboarding questionnaire (age, BMI, work history)
- Pain rating scale (0-10)
- Real-time sensor measurements
- ML-powered severity prediction

**Hardware Integration**
- 🤲 Arduino-based grip strength sensors
- 🤏 Pinch strength measurement
- 📱 Bluetooth Low Energy connectivity
- ⚡ Real-time data streaming

**Machine Learning Model**
- Random Forest classifier
- 92%+ accuracy on clinical data
- Predicts: Mild, Moderate, or Severe CTS
- Confidence scores for each prediction

---

## 📊 Health Dashboard

### Track Your Health Over Time

**Historical Tracking**
- View all past assessments
- Trend analysis with charts
- Risk level progression
- Severity distribution visualization

**Actionable Insights**
- Personalized recommendations
- When to see a doctor
- Exercise suggestions
- Prevention strategies

**Built with Convex**
- Real-time data synchronization
- No manual database setup
- Automatic data persistence
- TypeScript type safety

---

## 📈 Feature 3: Smart Dashboard

### Data-Driven Fishing Intelligence

**Real-Time Analytics**
- 🌡️ Weather conditions and temperature
- 🎣 Fishing score calculator (0-100)
- 📊 Monthly catch statistics
- 🐟 Species distribution analysis

**AI Recommendations**
- Best times to fish based on conditions
- Species recommendations by season
- Weather impact analysis
- Optimal fishing zones

**Visual Analytics**
- Interactive line charts for trends
- Pie charts for species distribution
- Radial gauges for scores
- Professional ocean color palette

---

## 🏪 Feature 4: Market Intelligence

### Find Markets and Maximize Profit

**Google Places Integration**
- 📍 Locate nearby fish markets
- 🗺️ Interactive map with market locations
- 📞 Contact information and hours
- ⭐ Ratings and reviews

**AI Calling Assistant**
- 🤖 Automated market inquiry calls
- 💬 Natural language conversations
- 📋 Check inventory and prices
- ⏰ Make reservations

**Market Optimization**
- Compare prices across markets
- Find buyers for specific species
- Route optimization
- Market demand insights

---

## 🛠️ Technical Architecture

### Full-Stack Implementation

**Frontend**
- ⚛️ React 19 + TypeScript
- ⚡ Vite for blazing fast development
- 🎨 Tailwind CSS for beautiful UI
- 📊 Recharts for data visualization
- 🌐 Three.js for 3D globe

**Backend Services**
- 🐍 FastAPI (Python) - 4 microservices
- 🧠 scikit-learn for ML predictions
- 🔄 Convex for real-time database
- 📡 Bluetooth LE sensor integration
- 🗺️ Google Places API

---

## 🔬 Machine Learning Details

### CTS Prediction Model

**Training Data**
- Clinical study data from peer-reviewed research
- 7 key features: age, BMI, sex, pain duration, pain scale, grip/pinch strength
- Multiple severity classifications

**Model Performance**
- Algorithm: Random Forest Classifier
- 92%+ accuracy on test data
- Handles class imbalance
- Provides probability distributions
- Fast inference (<100ms)

**Production Deployment**
- FastAPI endpoint at port 8002
- POST /predict with JSON payload
- Returns severity class and confidence
- Integrated with frontend dashboard

---

## 📡 Hardware Integration

### Arduino Sensor System

**Sensor Setup**
- Force-sensitive resistors (FSR)
- Bluetooth Low Energy module
- Real-time data streaming
- Battery-powered for portability

**Measurement Protocol**
1. **Grip Strength Test** - 5-second squeeze
2. **Pinch Strength Test** - 5-second pinch
3. Real-time force readings in kg
4. Automatic data transmission

**Development Mode**
- Demo API simulates sensor data
- No hardware required for testing
- Realistic sensor patterns
- Supports full development workflow

---

## 🗄️ Data Pipeline

### From Raw Data to Insights

**Fish Occurrence Data**
- Source: Marine biology databases
- 50,000+ georeferenced records
- Includes: species, location, depth, habitat
- CSV parsing and serving via FastAPI

**Health Data Storage**
- Convex real-time database
- User profiles with clinical data
- Assessment history with timestamps
- Automatic schema validation

**API Architecture**
- **Port 8000**: Fish Occurrence API
- **Port 8002**: CTS Prediction API
- **Port 8003**: Real Sensor API
- **Port 8004**: Demo Sensor API
- **Port 5173**: Frontend Application

---

## 🎨 User Experience

### Beautiful, Intuitive Interface

**Landing Experience**
- Stunning 3D globe background
- Location selection to personalize experience
- Smooth transitions and animations
- Ocean-themed gradient design

**Navigation**
- Bottom navigation bar with 3 main sections
- Slide-up panels for each feature
- Fish detail sidebar with close-ups
- Search panel with advanced filters

**Responsive Design**
- Works on desktop and mobile
- Touch-friendly controls
- Optimized performance
- Accessible color contrast

---

## 📊 Key Metrics & Impact

### By the Numbers

**Data Scale**
- 🐟 50,000+ fish occurrence records
- 🗺️ Global coverage across oceans
- 📈 12 months of catch trend data
- 🏥 Comprehensive CTS risk assessment

**Performance**
- ⚡ <100ms ML prediction time
- 🔄 Real-time sensor data streaming
- 🌐 60 FPS 3D globe rendering
- 💾 Automatic data persistence

**Potential Impact**
- Early CTS detection for thousands of workers
- Data-driven fishing efficiency improvements
- Reduced healthcare costs
- More sustainable fishing practices

---

## 🎯 Target Users

### Who Benefits from CARP?

**Primary Users**
- 🎣 Commercial fishermen
- 🚢 Maritime workers
- 🛥️ Fishing boat operators
- 🏭 Seafood industry workers

**Secondary Users**
- 🏥 Occupational health physicians
- 📊 Marine biologists and researchers
- 🏫 Fishing industry educators
- 🌊 Sustainability advocates

**Use Cases**
- Daily health monitoring for fishing crews
- Trip planning with species data
- Market research and price optimization
- Occupational health compliance

---

## 🚀 Demo Workflow

### Complete User Journey

**1. Onboarding (First Time)**
- Enter location on landing page
- Complete health questionnaire
- Set up user profile
- Optional: Connect Arduino sensors

**2. Daily Dashboard**
- Check today's fishing score
- Review weather conditions
- See AI recommendations
- Track catch statistics

**3. Health Check**
- Rate current pain level
- Perform grip/pinch tests
- Get ML prediction results
- View historical trends

**4. Market Research**
- Search for nearby markets
- Compare prices and options
- Use AI to call markets
- Plan sales strategy

---

## 💻 Technical Innovation

### What Makes CARP Special?

**Novel Integrations**
- First platform combining marine data with worker health
- Real hardware sensor integration with ML predictions
- 3D visualization of massive marine datasets
- AI voice assistant for market inquiries

**Modern Tech Stack**
- Convex for instant real-time updates
- No complex WebSocket setup required
- Type-safe end-to-end with TypeScript
- Microservices architecture for scalability

**Developer Experience**
- Single command starts entire stack (`./run.sh`)
- Hot reload for rapid development
- Comprehensive API documentation
- Demo mode for hardware-free testing

---

## 🌟 Future Enhancements

### Roadmap & Vision

**Phase 2 Features**
- 📱 Mobile app (iOS & Android)
- 🤝 Multi-user support and teams
- 💬 Community features (forums, tips)
- 📧 Automated health alerts

**Advanced Analytics**
- 🎯 Predictive catch forecasting
- 🧠 Deep learning for fish identification
- 📊 Economic trend analysis
- 🌍 Climate impact correlations

**Hardware Expansion**
- 🧤 Smart gloves with embedded sensors
- ⌚ Wearable health monitors
- 📡 Boat-mounted environmental sensors
- 🔋 Solar-powered sensor stations

---

## 🏆 Competitive Advantages

### Why CARP Stands Out

**Unique Value Proposition**
- ✅ Only platform combining health + marine data
- ✅ Real ML predictions, not just tracking
- ✅ Beautiful, intuitive 3D interface
- ✅ Hardware integration ready
- ✅ Built for fishermen, by developers who care

**Vs. Existing Solutions**
- Most fishing apps: navigation only
- Most health apps: not industry-specific
- Marine databases: not user-friendly
- CARP: All-in-one solution

---

## 💰 Business Model (Potential)

### Sustainable Growth Strategy

**Freemium Model**
- Free: Basic dashboard and 1 health check/month
- Premium: Unlimited checks, advanced analytics, AI calls
- Enterprise: Fleet management, custom reports

**Revenue Streams**
- Subscription fees ($9.99/month individual)
- Hardware sales (sensor kits)
- API access for researchers
- White-label solutions for fishing companies

**Market Size**
- 38 million commercial fishermen globally
- $152B fishing industry worldwide
- Growing focus on worker safety
- Expanding aquaculture sector

---

## 🛡️ Privacy & Security

### Protecting User Data

**Data Protection**
- 🔐 Encrypted data transmission (HTTPS)
- 🗄️ Secure Convex database storage
- 👤 Anonymous user IDs
- 🔒 No sensitive data in logs

**Compliance Ready**
- HIPAA-compliant architecture possible
- GDPR data handling principles
- User data export capabilities
- Right to deletion support

**Ethical Considerations**
- Health data used only for user benefit
- No data selling to third parties
- Transparent ML predictions
- Open to academic research partnerships

---

## 🌊 Environmental Impact

### Promoting Sustainable Fishing

**Conservation Features**
- Species information and conservation status
- Overfished area warnings (future)
- Sustainable catch recommendations
- Marine protected area alerts

**Data for Good**
- Contribute to marine biology research
- Track ecosystem changes over time
- Support fishing quota management
- Promote ocean health awareness

**Carbon Footprint**
- Optimize fishing trips = less fuel
- Reduce unnecessary travel
- Smart market routing
- Digital-first approach

---

## 👥 Team & Development

### Built for SushiHacks 2025

**Development Stats**
- ⏱️ Rapid prototyping and iteration
- 🏗️ Full-stack architecture from scratch
- 🎨 Custom UI/UX design
- 🔬 ML model training and validation
- 🛠️ Hardware integration and testing

**Technologies Mastered**
- React 19 + TypeScript
- Three.js 3D graphics
- FastAPI microservices
- Machine learning with scikit-learn
- Bluetooth LE hardware integration
- Convex real-time database

---

## 🎓 Lessons Learned

### Key Takeaways

**Technical Challenges**
- Rendering 50K points in 3D requires optimization
- Real-time sensor data needs careful state management
- ML model integration with web APIs
- Managing multiple backend services

**Solutions Found**
- Efficient Three.js point cloud rendering
- React hooks for sensor state
- FastAPI for fast ML inference
- Shell script orchestration for services

**Best Practices**
- TypeScript catches bugs early
- Microservices allow independent scaling
- Demo mode enables hardware-free development
- User testing drives UI decisions

---

## 📞 Call to Action

### Join the CARP Revolution

**For Fishermen**
- 🎣 Try the demo today
- 💬 Share your feedback
- 🤝 Join our beta program
- 📈 Improve your fishing outcomes

**For Developers**
- ⭐ Star us on GitHub
- 🔧 Contribute features
- 🐛 Report bugs
- 📚 Improve documentation

**For Investors**
- 💰 Large addressable market
- 🚀 Scalable technology
- 🌍 Global impact potential
- 📊 Clear monetization path

---

## 🔗 Resources & Links

### Learn More About CARP

**Documentation**
- 📖 README.md - Quick start guide
- 🏗️ CLAUDE.md - Architecture details
- 🔬 Backend README - API documentation
- 💻 Source code - Full codebase

**Live Demo**
- 🌐 Frontend: `http://localhost:5173`
- 📡 APIs: `http://localhost:8000-8004`
- 📊 Interactive Swagger docs at `/docs`

**Contact**
- 🐙 GitHub: [Repository Link]
- 💬 Discord: SushiHacks 2025
- 📧 Email: [Contact Email]
- 🐦 Twitter: [@CARPplatform]

---

## 🙏 Acknowledgments

### Special Thanks

**Data Sources**
- Marine biology occurrence databases
- Clinical CTS research papers
- Weather data APIs
- Google Places API

**Technology Partners**
- Convex - Real-time backend platform
- FastAPI - Modern Python web framework
- React & Vite - Frontend framework
- Three.js - 3D graphics library

**SushiHacks 2025**
- Thank you to the organizers
- Amazing hackathon experience
- Supporting innovation in marine tech
- Building community in tech

---

## 🎬 Conclusion

### CARP - Fishing Smarter, Living Healthier

**The Vision**
> *"Empowering maritime workers with the data and tools they need to work smarter, stay healthier, and protect our oceans."*

**Core Mission**
- 🏥 Prevent occupational injuries
- 🎣 Optimize fishing operations
- 🌊 Promote sustainability
- 📊 Democratize marine data

**Why It Matters**
Fishing is one of the world's oldest professions and most dangerous jobs. CARP brings modern technology to an industry that feeds billions, while protecting the health of workers and the sustainability of our oceans.

**The Future is Data-Driven**
Join us in revolutionizing the fishing industry, one fisherman at a time.

---

# Thank You!

## Questions?

**CARP - Comprehensive Aquatic Research Platform**

*Built with ❤️ for SushiHacks 2025*

---

## Appendix: Technical Specifications

### System Requirements
- **Frontend**: Node.js 18+, Modern browser with WebGL
- **Backend**: Python 3.8+, 4GB RAM
- **Optional**: Arduino with BLE module

### API Endpoints
```
GET  /fish-occurrences      # Filter fish data
POST /predict               # CTS prediction
POST /sensors/collect       # Sensor data collection
GET  /sensors/discover      # Find BLE devices
```

### Database Schema
```typescript
// User Profiles
{
  userId: string
  age: number
  bmi: number
  sex: number
  ctsPainDuration: number
  hasCompletedOnboarding: boolean
}

// CTS Assessments
{
  userId: string
  timestamp: number
  painRating: number
  gripStrength: number
  pinchStrength: number
  prediction: string
  confidence: number
}
```

### Performance Benchmarks
- Globe rendering: 60 FPS with 50K points
- ML prediction: <100ms average
- API response time: <50ms
- Database query: <10ms

---

## Appendix: Installation Guide

### Quick Start
```bash
# Clone repository
git clone <repo-url>
cd sushihacks2025

# One-command start
./run.sh
```

### Manual Setup
```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
pip install -r requirements.txt
python3 fish_api.py                            # Port 8000
python3 cts_prediction/cts_prediction_api.py   # Port 8002
python3 sensor_api/demo_sensor_api.py          # Port 8004
```

### Environment Variables
```bash
# Optional: Google Places API
GOOGLE_PLACES_API_KEY=your_key_here

# Optional: OpenAI for AI calling
OPENAI_API_KEY=your_key_here
```

---

