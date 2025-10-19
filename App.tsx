import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { FormData, BankingOperator, User, Transaction } from './types';
import { AGENT_PHONE_NUMBER, BANKING_OPERATORS } from './constants';
import { sendTelegramMessage } from './services/telegramService';

// --- Icon Components ---
const ClipboardIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a2.25 2.25 0 01-2.25 2.25h-3a2.25 2.25 0 01-2.25-2.25V5.25c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V7.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>);
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>);
const TelegramIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.58c-.2 1.03-.73 1.28-1.5  .81L12.9 16.4l-2.82 2.75c-.31.3-.59.42-.93.15z" /></svg>);
const ShieldCheckIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" /></svg>);
const UserIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);

// --- Local Storage Service ---
const db = {
  getUsers: (): User[] => JSON.parse(localStorage.getItem('dmp_users') || '[]'),
  saveUsers: (users: User[]) => localStorage.setItem('dmp_users', JSON.stringify(users)),
};

// --- Sub-Components ---
const DisclaimerModal: React.FC<{ onClose: () => void }> = ({ onClose }) => ( <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"><div className="bg-gray-800 border border-cyan-500/30 rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl shadow-cyan-500/20"><h2 className="text-2xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">Important Notice</h2><div className="space-y-4 text-gray-300"><p>Welcome to the Digital Money Portal. Please read the following points carefully before proceeding:</p><ul className="list-disc list-inside space-y-2 pl-2"><li><span className="font-bold text-yellow-400">Double-Check All Information:</span> Ensure the recipient's number, amount, and transaction ID (TrxID) are 100% correct before submitting.</li><li><span className="font-bold text-red-500">No Reversals:</span> Transactions are final. We are not responsible for funds sent to the wrong number due to user error.</li><li><span className="font-bold text-cyan-300">Service Fee:</span> A standard service fee applies to all transactions. This will be deducted automatically.</li><li><span className="font-bold text-gray-300">Processing Time:</span> Transactions are typically processed within 5-15 minutes, but may take longer during peak hours.</li></ul><p>By clicking "I Understand & Agree", you acknowledge that you have read and accepted these terms.</p></div><button onClick={onClose} className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:shadow-cyan-500/40 transform hover:-translate-y-0.5 transition-all duration-300">I Understand & Agree</button></div></div>);
const TermsAndConditionsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => ( <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl shadow-cyan-500/10 p-6 md:p-8 space-y-4 text-gray-300"><button onClick={onBack} className="text-cyan-400 hover:text-cyan-300 mb-4">&larr; Back to Portal</button><h2 className="text-2xl font-bold text-center border-b border-gray-600 pb-2">Terms & Conditions</h2><h3 className="text-lg font-semibold text-cyan-300 pt-2">1. User Responsibility</h3><p>You, the user, are solely responsible for the accuracy of the information you provide, including the amount, sender number, receiver number, and transaction ID. Any financial loss resulting from incorrect information is the user's responsibility.</p><h3 className="text-lg font-semibold text-cyan-300 pt-2">2. No Liability</h3><p>Digital Money Portal acts as a facilitator for transactions. We are not liable for any delays, failures, or errors caused by mobile banking operators or for any losses incurred due to user error.</p><h3 className="text-lg font-semibold text-cyan-300 pt-2">3. Service Fees</h3><p>You agree that applicable service fees will be applied to your transaction. These fees are non-refundable.</p></div>);
const AuthModal: React.FC<{ onClose: () => void; onLoginSuccess: (user: User) => void; }> = ({ onClose, onLoginSuccess }) => {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const users = db.getUsers();
        
        if (mode === 'register') {
            if (users.find(u => u.identifier === identifier)) {
                setError('User with this email/phone already exists.');
                return;
            }
            const newUser: User = {
                uid: `DMP-${Date.now()}`,
                identifier,
                passwordHash: password, // In a real app, HASH THIS!
                transactions: [],
            };
            db.saveUsers([...users, newUser]);
            onLoginSuccess(newUser);
        } else { // login
            const user = users.find(u => u.identifier === identifier && u.passwordHash === password);
            if (!user) {
                setError('Invalid credentials. Please try again.');
                return;
            }
            onLoginSuccess(user);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 border border-cyan-500/30 rounded-2xl max-w-sm w-full p-6 shadow-2xl shadow-cyan-500/20 relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white">&times;</button>
                <div className="flex border-b border-gray-700 mb-4">
                    <button onClick={() => setMode('login')} className={`flex-1 p-2 font-bold ${mode === 'login' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400'}`}>Login</button>
                    <button onClick={() => setMode('register')} className={`flex-1 p-2 font-bold ${mode === 'register' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400'}`}>Register</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="Email or Phone Number" required className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-cyan-500"/>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-cyan-500"/>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button type="submit" className="w-full py-2 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:shadow-cyan-500/40 transition-all">{mode === 'login' ? 'Login' : 'Create Account'}</button>
                </form>
            </div>
        </div>
    );
};
const ProfilePage: React.FC<{ user: User; onBack: () => void; onLogout: () => void; }> = ({ user, onBack, onLogout }) => {
    const stats = useMemo(() => {
        const totalAmount = user.transactions.reduce((acc, tx) => acc + parseFloat(tx.amount || '0'), 0);
        return {
            totalAmount: totalAmount.toFixed(2),
            totalTransactions: user.transactions.length,
        };
    }, [user.transactions]);

    return (
        <div className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl shadow-cyan-500/10 p-6 space-y-6">
             <div className="flex justify-between items-center">
                <button onClick={onBack} className="text-cyan-400 hover:text-cyan-300">&larr; Back to Portal</button>
                <button onClick={onLogout} className="bg-red-500/20 text-red-400 px-3 py-1 rounded-md text-sm hover:bg-red-500/40">Logout</button>
             </div>
             <div className="text-center">
                <h2 className="text-2xl font-bold">{user.identifier}</h2>
                <p className="text-sm text-gray-400 font-mono">UID: {user.uid}</p>
             </div>
             <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-900/60 p-4 rounded-lg"><p className="text-gray-400">Total Transferred</p><p className="text-2xl font-bold text-cyan-300">{stats.totalAmount} <span className="text-lg">BDT</span></p></div>
                <div className="bg-gray-900/60 p-4 rounded-lg"><p className="text-gray-400">Total Transactions</p><p className="text-2xl font-bold text-cyan-300">{stats.totalTransactions}</p></div>
             </div>
             <div>
                <h3 className="text-lg font-semibold mb-2 border-b border-gray-600 pb-1">Transaction History</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {user.transactions.length > 0 ? (
                        user.transactions.slice().reverse().map(tx => (
                            <div key={tx.id} className="bg-gray-700/50 p-3 rounded-md text-sm">
                                <div className="flex justify-between font-bold"><span>{tx.amount} BDT &rarr; {tx.receiverNumber}</span><span className="text-gray-400">{tx.senderOperator}</span></div>
                                <div className="text-xs text-gray-400 mt-1"><span>{new Date(tx.date).toLocaleString()}</span> | <span>TrxID: {tx.transactionId}</span></div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-400 text-center py-4">No transactions yet.</p>
                    )}
                </div>
             </div>
        </div>
    )
};


// --- Main App Component ---
const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({ amount: '', senderNumber: '', transactionId: '', senderOperator: BankingOperator.BKASH, receiverNumber: '' });
  const [isCopied, setIsCopied] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [view, setView] = useState<'main' | 'terms' | 'profile'>('main');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('hasVisitedDigitalPortal')) {
      setShowDisclaimer(true);
    }
    const sessionUser = sessionStorage.getItem('dmp_session');
    if (sessionUser) {
        setCurrentUser(JSON.parse(sessionUser));
    }
  }, []);
  
  const handleUserUpdate = (updatedUser: User) => {
      setCurrentUser(updatedUser);
      sessionStorage.setItem('dmp_session', JSON.stringify(updatedUser));
      const users = db.getUsers();
      const userIndex = users.findIndex(u => u.uid === updatedUser.uid);
      if (userIndex !== -1) {
          users[userIndex] = updatedUser;
          db.saveUsers(users);
      }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    sessionStorage.setItem('dmp_session', JSON.stringify(user));
    setShowAuthModal(false);
    setView('main');
  };
  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('dmp_session');
    setView('main');
  };

  const handleDisclaimerClose = () => { localStorage.setItem('hasVisitedDigitalPortal', 'true'); setShowDisclaimer(false); };
  // FIX: Used e.target.name to get the name of the input and update the corresponding state.
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setFormData(prev => ({ ...prev, [e.target.name]: e.target.value })); };
  const copyToClipboard = useCallback(() => { navigator.clipboard.writeText(AGENT_PHONE_NUMBER).then(() => { setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.senderNumber || !formData.transactionId || !formData.receiverNumber) { setError("Please fill in all the required fields."); setStatus('error'); return; }
    setStatus('loading'); setError(null);
    
    try {
      await sendTelegramMessage(formData, AGENT_PHONE_NUMBER);
      if (currentUser) {
          const newTransaction: Transaction = {
              ...formData,
              id: `TX-${Date.now()}`,
              date: new Date().toISOString(),
          };
          const updatedUser = { ...currentUser, transactions: [...currentUser.transactions, newTransaction]};
          handleUserUpdate(updatedUser);
      }
      setStatus('success');
      setFormData({ amount: '', senderNumber: '', transactionId: '', senderOperator: BankingOperator.BKASH, receiverNumber: '' });
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Submission Failed: ${errorMessage}`);
      setStatus('error');
    }
  };

  const mainContent = (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl shadow-cyan-500/10 p-6 md:p-8 space-y-6">
      <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-700"><label className="block text-sm font-medium text-gray-400 mb-2">Send Money to this Agent Number</label><div className="flex items-center justify-between bg-gray-800 p-3 rounded-md"><span className="text-lg font-mono text-cyan-300 tracking-wider">{AGENT_PHONE_NUMBER}</span><button onClick={copyToClipboard} className="p-2 rounded-md bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/40 transition-all duration-200" aria-label="Copy phone number">{isCopied ? <CheckIcon className="w-5 h-5" /> : <ClipboardIcon className="w-5 h-5" />}</button></div>{isCopied && <p className="text-xs text-green-400 mt-2 text-right">Copied!</p>}</div>
      <form onSubmit={handleSubmit} className="space-y-4"><h2 className="text-xl font-semibold text-center text-gray-200 border-b border-gray-700 pb-2 mb-4">Submit Your Transaction</h2><div><label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">Amount Sent (BDT)</label><input type="number" id="amount" name="amount" value={formData.amount} onChange={handleInputChange} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-cyan-500" placeholder="e.g., 500" required /></div><div><label htmlFor="senderNumber" className="block text-sm font-medium text-gray-300 mb-1">Your Sender Number</label><input type="text" id="senderNumber" name="senderNumber" value={formData.senderNumber} onChange={handleInputChange} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-cyan-500" placeholder="e.g., 01712345678" required /></div><div><label htmlFor="transactionId" className="block text-sm font-medium text-gray-300 mb-1">Transaction ID (TrxID)</label><input type="text" id="transactionId" name="transactionId" value={formData.transactionId} onChange={handleInputChange} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-cyan-500" placeholder="e.g., 9K8B7C6D5E" required /></div><div><label htmlFor="senderOperator" className="block text-sm font-medium text-gray-300 mb-1">Your Mobile Banking</label><select id="senderOperator" name="senderOperator" value={formData.senderOperator} onChange={handleInputChange} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-cyan-500">{BANKING_OPERATORS.map(op => (<option key={op.value} value={op.value} className="bg-gray-800">{op.label}</option>))}</select></div><div><label htmlFor="receiverNumber" className="block text-sm font-medium text-gray-300 mb-1">Final Receiver's Number</label><input type="text" id="receiverNumber" name="receiverNumber" value={formData.receiverNumber} onChange={handleInputChange} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-cyan-500" placeholder="Enter the number to receive the money" required /></div><button type="submit" disabled={status === 'loading'} className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:shadow-cyan-500/40 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed">{status === 'loading' ? 'Submitting...' : 'Submit Transaction'}</button></form>
      <div className="h-6 text-center">{status === 'success' && (<p className="text-green-400">Request submitted successfully!</p>)}{status === 'error' && error && (<p className="text-red-400">{error}</p>)}</div>
    </div>
  );

  const renderContent = () => {
    switch (view) {
      case 'terms': return <TermsAndConditionsPage onBack={() => setView('main')} />;
      case 'profile': return currentUser ? <ProfilePage user={currentUser} onBack={() => setView('main')} onLogout={handleLogout} /> : mainContent;
      default: return mainContent;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-4 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 font-sans">
      {showDisclaimer && <DisclaimerModal onClose={handleDisclaimerClose} />}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onLoginSuccess={handleLoginSuccess} />}
      
      <a href="https://t.me/the_digital_portal" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200" aria-label="Telegram Support"><TelegramIcon className="w-7 h-7" /></a>

      <div className="w-full max-w-md mx-auto my-8">
        <header className="text-center mb-2 relative">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Digital Money Portal</h1>
          <p className="text-gray-400">Your Bridge Between Mobile Banking</p>
          <button onClick={() => currentUser ? setView('profile') : setShowAuthModal(true)} className={`absolute top-0 right-0 p-2 rounded-full ${currentUser ? 'text-cyan-400 bg-cyan-500/20' : 'text-gray-400 hover:text-white'}`} aria-label="User Profile"><UserIcon className="w-7 h-7" /></button>
        </header>

        <div className="bg-yellow-500/10 border border-yellow-400/30 text-yellow-300 text-sm rounded-lg overflow-hidden my-4"><div className="whitespace-nowrap py-2"><p className="animate-marquee"><span className="font-bold mx-4">ATTENTION:</span> Please verify all transaction details before submitting. Incorrect information may cause delays or loss of funds.</p></div></div>

        {renderContent()}
      </div>

      <footer className="w-full max-w-4xl mx-auto text-center text-gray-400 text-xs p-4 border-t border-gray-700/50 mt-8">
        <div className="flex justify-center items-center space-x-6 mb-4"><div className="font-bold text-lg text-red-500">bKash</div><div className="font-bold text-lg text-orange-500">Nagad</div><div className="font-bold text-lg text-purple-500">Rocket</div></div>
        <div className="flex justify-center items-center space-x-4 mb-4"><div className="flex items-center space-x-1"><ShieldCheckIcon className="w-4 h-4 text-green-400" /><span>Trusted Source</span></div><div className="flex items-center space-x-1"><CheckIcon className="w-4 h-4 text-blue-400" /><span>Verified Business</span></div></div>
        <div className="space-x-4"><button onClick={() => setView('main')} className="hover:text-white">Home</button><span>|</span><button onClick={() => setView('terms')} className="hover:text-white">Terms & Conditions</button></div>
        <p className="mt-2">&copy; {new Date().getFullYear()} Digital Money Portal BD. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default App;