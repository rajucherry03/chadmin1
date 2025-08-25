# Transport Management System

A comprehensive, fully automated transport management system built with React, Firebase, and modern web technologies. This system provides complete control over student transportation, route management, vehicle tracking, and automated optimization.

## 🚀 Features

### Core Management Modules

#### 1. **Route Management**
- **Dynamic Route Creation**: Create and manage transport routes with multiple stops
- **Route Optimization**: Automated route planning based on student locations
- **Capacity Management**: Real-time seat availability tracking
- **Fare Management**: Dynamic pricing based on distance and route complexity
- **Status Tracking**: Active, inactive, and maintenance status monitoring

#### 2. **Vehicle Management**
- **Fleet Management**: Complete vehicle inventory with detailed specifications
- **Maintenance Tracking**: Automated maintenance schedules and alerts
- **Fuel Management**: Track fuel consumption and efficiency
- **Insurance & Permits**: Expiry date monitoring with automated notifications
- **Performance Analytics**: Vehicle utilization and performance metrics

#### 3. **Driver Management**
- **Driver Profiles**: Comprehensive driver information and documentation
- **License Management**: License expiry tracking with automated alerts
- **Assignment System**: Automated driver-vehicle-route assignments
- **Performance Monitoring**: Driver efficiency and safety metrics
- **Emergency Contacts**: Quick access to driver emergency information

#### 4. **Allocation Management**
- **Smart Allocation**: Automated student-route assignments based on location
- **Real-time Tracking**: Live allocation status and updates
- **Payment Integration**: Integrated payment status tracking
- **Conflict Resolution**: Automated handling of allocation conflicts
- **Bulk Operations**: Mass allocation and deallocation capabilities

#### 5. **Schedule Management**
- **Multi-view Calendar**: Daily, weekly, and monthly schedule views
- **Automated Scheduling**: Intelligent schedule generation
- **Conflict Detection**: Automatic detection of scheduling conflicts
- **Real-time Updates**: Live schedule modifications and notifications
- **Optimization Engine**: Automated schedule optimization for efficiency

#### 6. **Analytics & Reporting**
- **Performance Metrics**: Comprehensive analytics dashboard
- **Revenue Analysis**: Detailed financial reporting and insights
- **Utilization Reports**: Route and vehicle utilization statistics
- **Predictive Analytics**: AI-powered insights and recommendations
- **Export Capabilities**: PDF and Excel report generation

## 🔧 Automation Features

### Smart Automation
- **Auto Route Assignment**: Intelligent route allocation based on student proximity
- **Capacity Optimization**: Automatic load balancing across routes
- **Maintenance Alerts**: Proactive maintenance scheduling and notifications
- **Payment Reminders**: Automated payment due date notifications
- **Conflict Resolution**: Automatic handling of scheduling conflicts

### Real-time Features
- **Live Updates**: Real-time data synchronization across all modules
- **Instant Notifications**: Immediate alerts for critical events
- **Dynamic Scheduling**: Real-time schedule adjustments
- **Live Tracking**: Real-time vehicle and allocation status
- **Performance Monitoring**: Live performance metrics and alerts

## 🛠 Technical Architecture

### Frontend
- **React 18**: Modern React with hooks and functional components
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **FontAwesome**: Comprehensive icon library
- **React Router**: Client-side routing and navigation
- **React Query**: Server state management and caching

### Backend
- **Firebase Firestore**: Real-time NoSQL database
- **Firebase Authentication**: Secure user authentication
- **Firebase Storage**: File storage and management
- **Real-time Listeners**: Live data synchronization

### Key Technologies
- **JavaScript ES6+**: Modern JavaScript features
- **CSS Grid & Flexbox**: Advanced layout techniques
- **Responsive Design**: Mobile-first approach
- **Progressive Web App**: PWA capabilities
- **Service Workers**: Offline functionality

## 📊 Database Schema

### Collections

#### `transportRoutes`
```javascript
{
  id: "string",
  name: "string",
  description: "string",
  startLocation: "string",
  endLocation: "string",
  stops: ["string"],
  capacity: "number",
  fare: "number",
  distance: "number",
  status: "active|inactive|maintenance",
  departureTime: "string",
  arrivalTime: "string",
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

#### `transportVehicles`
```javascript
{
  id: "string",
  vehicleNumber: "string",
  vehicleType: "bus|minibus|van|car",
  model: "string",
  manufacturer: "string",
  year: "number",
  capacity: "number",
  fuelType: "diesel|petrol|electric|hybrid",
  status: "active|maintenance|inactive",
  mileage: "number",
  nextMaintenance: "date",
  insuranceExpiry: "date",
  permitExpiry: "date",
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

#### `transportDrivers`
```javascript
{
  id: "string",
  name: "string",
  employeeId: "string",
  phone: "string",
  email: "string",
  address: "string",
  licenseNumber: "string",
  licenseType: "light|heavy|commercial",
  licenseExpiry: "date",
  experience: "number",
  status: "active|on_leave|inactive",
  emergencyContact: "string",
  emergencyPhone: "string",
  joiningDate: "date",
  salary: "number",
  workingHours: "number",
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

#### `transportAllocations`
```javascript
{
  id: "string",
  studentId: "string",
  routeId: "string",
  vehicleId: "string",
  driverId: "string",
  pickupLocation: "string",
  dropLocation: "string",
  pickupTime: "string",
  dropTime: "string",
  status: "pending|active|completed|cancelled",
  startDate: "date",
  endDate: "date",
  fare: "number",
  paymentStatus: "pending|paid|overdue",
  notes: "string",
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

#### `transportSchedules`
```javascript
{
  id: "string",
  routeId: "string",
  vehicleId: "string",
  driverId: "string",
  date: "date",
  departureTime: "string",
  arrivalTime: "string",
  status: "scheduled|in_progress|completed|cancelled",
  capacity: "number",
  occupied: "number",
  notes: "string",
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase project setup

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd CH360-D-Admin
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Firebase**
   - Create a Firebase project
   - Enable Firestore, Authentication, and Storage
   - Update `src/firebase.js` with your Firebase config

4. **Start the development server**
```bash
npm run dev
```

5. **Access the application**
   - Navigate to `http://localhost:5173`
   - Login with admin credentials
   - Access Transport Management from the navigation menu

## 📱 Usage Guide

### Adding Routes
1. Navigate to Transport Management → Routes
2. Click "Add Route"
3. Fill in route details (name, stops, capacity, fare)
4. Set departure and arrival times
5. Save the route

### Managing Vehicles
1. Go to Transport Management → Vehicles
2. Click "Add Vehicle"
3. Enter vehicle specifications
4. Set maintenance schedules
5. Configure insurance and permit details

### Allocating Students
1. Navigate to Transport Management → Allocations
2. Click "New Allocation"
3. Select student and route
4. System auto-assigns optimal vehicle and driver
5. Review and confirm allocation

### Viewing Analytics
1. Go to Transport Management → Analytics
2. View performance metrics
3. Analyze route utilization
4. Monitor revenue and payments
5. Export reports as needed

## 🔒 Security Features

- **Authentication**: Firebase Authentication with role-based access
- **Data Validation**: Comprehensive input validation and sanitization
- **Real-time Security**: Firestore security rules
- **Audit Trail**: Complete activity logging
- **Backup & Recovery**: Automated data backup systems

## 📈 Performance Optimization

- **Lazy Loading**: Component-level code splitting
- **Virtual Scrolling**: Efficient handling of large datasets
- **Caching**: React Query for optimal data caching
- **Image Optimization**: Compressed and optimized images
- **Bundle Optimization**: Tree shaking and code splitting

## 🎯 Future Enhancements

### Planned Features
- **GPS Integration**: Real-time vehicle tracking
- **Mobile App**: Native mobile applications
- **AI Optimization**: Machine learning for route optimization
- **Payment Gateway**: Integrated payment processing
- **SMS Notifications**: Automated SMS alerts
- **Weather Integration**: Weather-based route adjustments

### Advanced Analytics
- **Predictive Maintenance**: AI-powered maintenance predictions
- **Demand Forecasting**: Predictive analytics for route planning
- **Cost Optimization**: Automated cost reduction strategies
- **Performance Benchmarking**: Industry-standard performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 📊 System Requirements

### Minimum Requirements
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+
- **RAM**: 4GB
- **Storage**: 2GB free space
- **Network**: Stable internet connection

### Recommended Requirements
- **Browser**: Latest Chrome or Firefox
- **RAM**: 8GB or higher
- **Storage**: 5GB free space
- **Network**: High-speed internet connection

---

**Transport Management System** - Empowering educational institutions with intelligent transportation solutions.
