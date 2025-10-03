import React from 'react';
import Login from './Login';

interface AuthProps {
    onLogin: (user: string, pass: string) => void;
    error: string | null;
}

const Auth: React.FC<AuthProps> = ({ onLogin, error }) => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex flex-col p-4 font-sans">
             <main className="flex-grow flex flex-col items-center justify-center">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-amber-800 dark:text-amber-300">Abacus Simulator</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">Please sign in to continue</p>
                </div>
                <Login onLogin={onLogin} error={error} title="Sign In" />
                <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
                    <p>Please enter your provided credentials.</p>
                </div>
             </main>
             <footer className="text-center py-4 text-gray-500 dark:text-gray-400">
                <p>Designed By Bhuvana Mohan Chowdary</p>
            </footer>
        </div>
    );
};

export default Auth;