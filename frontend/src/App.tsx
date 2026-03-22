import './App.css'
import { BrowserRouter, Route, Routes } from "react-router";
import Dashboard from './components/Dashboard';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Dashboard />} />
       </Routes>
    </BrowserRouter>
  )
}

export default App
