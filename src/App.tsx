import { BrowserRouter, Routes, Route } from "react-router-dom";
import ApplicationLayout from "./layouts/application-layout";
import Diagnostico from "./pages/diagnostico";
import NotFound from "./pages/not-found";
import { ScrollToTop } from "./components/scroll-to-top";

// Una sola pantalla: el diagnóstico financiero en `/`. Público, sin auth —
// esta landing de campaña vive en diagnostico.axisconsultoresmx.com y es
// el destino de los anuncios de Google/LinkedIn/Meta.
const App = () => (
  <BrowserRouter>
    <ScrollToTop />
    <Routes>
      <Route element={<ApplicationLayout />}>
        <Route path="/" element={<Diagnostico />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
