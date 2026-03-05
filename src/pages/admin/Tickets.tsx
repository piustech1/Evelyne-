import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTicketAlt, faEye, faReply, faCheckCircle, faClock, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'motion/react';
import { db } from '../../lib/firebase';
import { ref, onValue, update } from 'firebase/database';

export default function AdminTickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [reply, setReply] = useState('');

  useEffect(() => {
    const ticketsRef = ref(db, 'tickets');
    onValue(ticketsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTickets(Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } else {
        setTickets([]);
      }
      setIsLoading(false);
    });
  }, []);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    
    try {
      const updatedMessages = [...(selectedTicket.messages || []), {
        sender: 'Admin',
        text: reply,
        createdAt: new Date().toISOString()
      }];
      
      await update(ref(db, `tickets/${selectedTicket.id}`), {
        messages: updatedMessages,
        status: 'Answered',
        updatedAt: new Date().toISOString()
      });
      
      setReply('');
      setSelectedTicket((prev: any) => ({ ...prev, messages: updatedMessages, status: 'Answered' }));
    } catch (err) {
      console.error('Failed to send reply', err);
    }
  };

  const closeTicket = async (ticketId: string) => {
    try {
      await update(ref(db, `tickets/${ticketId}`), { status: 'Closed' });
    } catch (err) {
      console.error('Failed to close ticket', err);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-gray-900 tracking-tighter mb-2">Tickets</h1>
          <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">Support your customers and resolve their issues</p>
        </div>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                <th className="pb-6 px-4">Ticket ID</th>
                <th className="pb-6 px-4">User</th>
                <th className="pb-6 px-4">Subject</th>
                <th className="pb-6 px-4">Status</th>
                <th className="pb-6 px-4">Date</th>
                <th className="pb-6 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tickets.map((ticket, idx) => (
                <motion.tr
                  key={ticket.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group hover:bg-gray-50 transition-colors"
                >
                  <td className="py-6 px-4 text-xs font-black text-gray-900 group-hover:text-brand-purple transition-colors">#{ticket.id.slice(-6).toUpperCase()}</td>
                  <td className="py-6 px-4 text-xs font-bold text-gray-500">{ticket.userEmail}</td>
                  <td className="py-6 px-4 text-xs font-bold text-gray-400">{ticket.subject}</td>
                  <td className="py-6 px-4">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      ticket.status === 'Open' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                      ticket.status === 'Answered' ? 'bg-brand-blue/10 text-brand-blue border-brand-blue/20' : 'bg-gray-100 text-gray-400 border-gray-200'
                    }`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="py-6 px-4 text-[10px] font-bold text-gray-400">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                  <td className="py-6 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => setSelectedTicket(ticket)}
                        className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:text-brand-purple hover:bg-brand-purple/10 transition-all flex items-center justify-center border border-gray-100"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button 
                        onClick={() => closeTicket(ticket.id)}
                        className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all flex items-center justify-center border border-gray-100"
                      >
                        <FontAwesomeIcon icon={faCheckCircle} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {tickets.length === 0 && !isLoading && (
            <div className="py-32 text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 text-3xl mx-auto">
                <FontAwesomeIcon icon={faTicketAlt} />
              </div>
              <div className="text-gray-400 font-black uppercase tracking-widest text-xs">No support tickets found</div>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedTicket(null)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-3xl rounded-[3rem] p-8 md:p-12 shadow-2xl border border-gray-100 relative z-10 overflow-y-auto max-h-[90vh] custom-scrollbar"
          >
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-display font-black text-gray-900 tracking-tighter mb-2">{selectedTicket.subject}</h2>
                <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">From: {selectedTicket.userEmail}</p>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <FontAwesomeIcon icon={faTimesCircle} className="text-2xl" />
              </button>
            </div>

            <div className="space-y-6 mb-10 max-h-80 overflow-y-auto pr-4 custom-scrollbar">
              {(selectedTicket.messages || []).map((msg: any, idx: number) => (
                <div key={idx} className={`flex flex-col ${msg.sender === 'Admin' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] p-5 rounded-3xl text-sm font-bold ${
                    msg.sender === 'Admin' ? 'bg-brand-purple text-white rounded-tr-none' : 'bg-gray-50 text-gray-600 rounded-tl-none border border-gray-100'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2">
                    {msg.sender} • {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>

            {selectedTicket.status !== 'Closed' && (
              <form onSubmit={handleReply} className="space-y-6">
                <textarea
                  required
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  className="w-full p-6 bg-gray-50 border border-gray-100 rounded-3xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-brand-purple/5 focus:border-brand-purple transition-all font-bold h-32 placeholder-gray-400"
                  placeholder="Type your reply here..."
                />
                <button 
                  type="submit"
                  className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3"
                >
                  <FontAwesomeIcon icon={faReply} />
                  <span>Send Reply</span>
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
