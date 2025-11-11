import { HashRouter, Route, Routes } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import TemplatePicker from "./test/TemplatePicker";
import CameraCapture from "./presentational/CameraCapture";
import PaymentOption from "./pages/PaymentOption";
import FinalTemplate from "./test/FinalTemplate";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/payment-option" element={<PaymentOption />} />
        <Route path="/camera" element={<CameraCapture />} />
        <Route path="/template-picker" element={<TemplatePicker />} />
        <Route path="/finaltemplate" element={<FinalTemplate />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
