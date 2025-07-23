import * as ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getQueryClientDefaultOptions } from './config';

import './index.css'

const queryClient = new QueryClient(getQueryClientDefaultOptions());

ReactDOM.createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
        <App />
    </QueryClientProvider>
)
