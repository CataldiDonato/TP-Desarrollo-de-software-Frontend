import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRouter from './routes/AppRouter';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AppRouter />
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
    </BrowserRouter>
  );
}

export default App;
