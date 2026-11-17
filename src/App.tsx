import { BrowserRouter, Routes, Route } from "react-router-dom";
import ApplicationLayout from "./layouts/application-layout";
import Diagnostico from "./pages/diagnostico";
import Landing from "./pages/landing";
import NotFound from "./pages/not-found";
import { ScrollToTop } from "./components/scroll-to-top";

// www.axisconsultoresmx.com/ es la landing con el formulario (destino de los
// anuncios). El diagnóstico vive en /diagnostico y, en el subdominio
// diagnostico.axisconsultoresmx.com, sigue en la raíz.
const esSubdominioDiagnostico = typeof window !== "undefined" && window.location.hostname.startsWith("diagnostico.");
const App = () => (
  <BrowserRouter>
    <ScrollToTop />
    <Routes>
      <Route element={<ApplicationLayout />}>
        <Route path="/" element={esSubdominioDiagnostico ? <Diagnostico /> : <Landing />} />
        <Route path="/diagnostico" element={<Diagnostico />} />
        <Route path="/landing" element={<Landing />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
