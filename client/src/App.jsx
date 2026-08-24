import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './routes/index.jsx';
import { DownloadQueueProvider } from './context/DownloadQueueContext.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DownloadQueueProvider>
        <RouterProvider router={router} />
      </DownloadQueueProvider>
    </QueryClientProvider>
  );
}

export default App;
