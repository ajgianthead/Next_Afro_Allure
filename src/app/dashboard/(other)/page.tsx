import { Joyride } from 'react-joyride';
import Dashboard from './dashboard';


export const dynamic = 'force-dynamic';

const steps = [
    { content: 'This is my awesome feature!', target: '.my-first-step' },
    { content: 'This is another awesome feature!', target: '.my-other-step' },
];

export default function App() {
    return (
        <div>
            <Joyride continuous run={true} steps={steps} />
            <Dashboard />
        </div>

    );
}
