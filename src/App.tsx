import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ListView from './pages/ListView';
import GalleryView from './pages/GalleryView';
import DetailView from './pages/DetailView';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<ListView />} />
        <Route path="gallery" element={<GalleryView />} />
        <Route path="pokemon/:id" element={<DetailView />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
