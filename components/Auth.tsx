import React from 'react';
import Login from './Login';

interface AuthProps {
    onLogin: (user: string, pass: string) => void;
    error: string | null;
}

const Auth: React.FC<AuthProps> = ({ onLogin, error }) => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center p-4 font-sans">
             <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-amber-800 dark:text-amber-300">Abacus Simulator</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">Please sign in to continue</p>
             </div>
             <Login onLogin={onLogin} error={error} title="Sign In" />
             <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
                <p>Please enter your provided credentials.</p>
             </div>
        </div>
    );
};

export default Auth;