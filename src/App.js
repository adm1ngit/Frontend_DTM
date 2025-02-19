// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Register from './pages/auth/Register';
// import Login from './pages/auth/Login';
// import Dashboard from './pages/dashboard';
// import Calendar from './pages/calendar/Calendar';

// const App = () => {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/register" element={<Register />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/" element={<Dashboard />} />
//         <Route path="/calendar" element={<Calendar/>} />
//       </Routes>
//     </Router>
//   );
// };

// export default App;
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Result from "./pages/Result";
import CalendarComponent from "./pages/CalendarComponent.jsx";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/result" element={<Result />} />
            <Route path="/dashboard" element={<CalendarComponent />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
